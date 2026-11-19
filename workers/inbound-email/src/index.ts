import {
  buildInboundObjectKey,
  buildWebhookRecipients,
  toAsciiObjectMetadata,
} from './inbound-mail';

type Env = {
  INBOUND: R2Bucket;
  // Customer address -> Twenty email group forwarding address (ch_xxx@INBOUND_EMAIL_DOMAIN)
  ROUTES?: KVNamespace;
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

const notifyTwenty = async ({
  env,
  key,
  recipient,
  subject,
}: {
  env: Env;
  key: string;
  recipient: string;
  subject: string | null;
}) => {
  const webhookUrl = env.TWENTY_WEBHOOK_URL;
  const webhookSecret = env.WEBHOOK_SECRET;
  const webhookConfigured = Boolean(webhookUrl) || Boolean(webhookSecret);

  // Store-only until both are set. A half-configured webhook must fail the
  // delivery so Email Routing retries instead of dropping the mail.
  if (!webhookConfigured) {
    return;
  }

  if (!webhookUrl || !webhookSecret) {
    throw new Error(
      'TWENTY_WEBHOOK_URL and WEBHOOK_SECRET must be set together',
    );
  }

  const channelAddress = (await env.ROUTES?.get(recipient)) ?? recipient;
  const body = JSON.stringify({
    key,
    recipients: buildWebhookRecipients({ recipient, channelAddress }),
    subject,
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-twenty-timestamp': timestamp,
      'x-twenty-signature': await sign(webhookSecret, `${timestamp}.${body}`),
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Twenty inbound webhook rejected the message: HTTP ${response.status}`,
    );
  }
};

export default {
  async email(message, env) {
    const recipient = message.to.toLowerCase();
    const subject = message.headers.get('subject');
    const key = buildInboundObjectKey({
      recipient,
      messageId: message.headers.get('message-id'),
      randomId: crypto.randomUUID(),
    });
    const raw = await new Response(message.raw).arrayBuffer();

    await env.INBOUND.put(key, raw, {
      customMetadata: {
        from: toAsciiObjectMetadata(message.from),
        to: toAsciiObjectMetadata(recipient),
        subject: toAsciiObjectMetadata(subject ?? ''),
      },
    });

    // Awaited on purpose: waitUntil would already have accepted the message,
    // so a failed webhook would never be retried.
    await notifyTwenty({ env, key, recipient, subject });
  },

  async fetch() {
    return new Response('khard-edge ok');
  },
} satisfies ExportedHandler<Env>;
