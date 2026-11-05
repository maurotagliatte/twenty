# khard-edge

Cloudflare Worker that receives e-mail for customer domains managed in the Khard Cloudflare account, stores the raw `.eml` in the `khard-inbound` R2 bucket and (once configured) notifies Twenty with an HMAC-signed webhook.

The object key is `domain/<message-id>.eml`, so an Email Routing retry hits the same object and the same Twenty dedupe id. R2 metadata is percent-encoded: a subject with accents would otherwise be rejected. The webhook is awaited; a non-2xx response fails the delivery and Email Routing retries it. Leave `TWENTY_WEBHOOK_URL` and `WEBHOOK_SECRET` both unset until Twenty is ready — setting only one of them fails the delivery on purpose.

Architecture and phases: https://claude.ai/artifact/EVDgSshQohEP485dDaehFD

## Deploy

```bash
npx wrangler deploy
npx wrangler secret put WEBHOOK_SECRET      # only when Twenty has the endpoint
npx wrangler secret put TWENTY_WEBHOOK_URL
```

Twenty side: set `CLOUDFLARE_EMAIL_WEBHOOK_SECRET` (same value as `WEBHOOK_SECRET`) and `INBOUND_EMAIL_S3_BUCKET=khard-inbound`, and point `TWENTY_WEBHOOK_URL` at `https://<twenty>/webhooks/messaging/cloudflare/inbound`. The optional `ROUTES` KV maps a customer address (`contato@cliente.com.br`) to the forwarding address of its email group channel.

E-mail reaches the Worker through an Email Routing rule with action "Send to a Worker" (`khard-edge`). Proof of concept: `teste-saas@khard.cloud`.
