# khard-edge

Cloudflare Worker that receives e-mail for customer domains managed in the Khard Cloudflare account, stores the raw `.eml` in the `khard-inbound` R2 bucket and (once configured) notifies Twenty with an HMAC-signed webhook.

Architecture and phases: https://claude.ai/artifact/EVDgSshQohEP485dDaehFD

## Deploy

```bash
npx wrangler deploy
npx wrangler secret put WEBHOOK_SECRET      # only when Twenty has the endpoint
npx wrangler secret put TWENTY_WEBHOOK_URL
```

Twenty side: set `CLOUDFLARE_EMAIL_WEBHOOK_SECRET` (same value as `WEBHOOK_SECRET`) and `INBOUND_EMAIL_S3_BUCKET=khard-inbound`, and point `TWENTY_WEBHOOK_URL` at `https://<twenty>/webhooks/messaging/cloudflare/inbound`. The optional `ROUTES` KV maps a customer address (`contato@cliente.com.br`) to the forwarding address of its email group channel.

E-mail reaches the Worker through an Email Routing rule with action "Send to a Worker" (`khard-edge`). Proof of concept: `teste-saas@khard.cloud`.
