type Env = {
  INBOUND: R2Bucket;
  TWENTY_WEBHOOK_URL?: string;
  WEBHOOK_SECRET?: string;
};

const encoder = new TextEncoder();

const sign = async (secret: string, body: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export default {
  async email(message, env, ctx) {
    const recipient = message.to.toLowerCase();
    const domain = recipient.split('@')[1];
    const key = `${domain}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.eml`;
    const raw = await new Response(message.raw).arrayBuffer();

    await env.INBOUND.put(key, raw, {
      customMetadata: {
        from: message.from,
        to: recipient,
        subject: message.headers.get('subject') ?? '',
      },
    });

    // Webhook stays off until Twenty has the CLOUDFLARE_R2 inbound source
    if (!env.TWENTY_WEBHOOK_URL || !env.WEBHOOK_SECRET) {
      return;
    }

    const body = JSON.stringify({ key, domain, recipient, from: message.from });

    ctx.waitUntil(
      fetch(env.TWENTY_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-khard-signature': await sign(env.WEBHOOK_SECRET, body),
        },
        body,
      }),
    );
  },

  async fetch() {
    return new Response('khard-edge ok');
  },
} satisfies ExportedHandler<Env>;
