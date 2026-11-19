# Khard WhatsApp

Twenty app that turns a WhatsApp Business number into a native message channel.
Each workspace connects its own number through Meta Embedded Signup; inbound
messages land in Message Threads on the matching People, and members reply from
Twenty through the Cloud API.

## Where each secret lives

| Value | Scope | Stored in |
| --- | --- | --- |
| `META_APP_ID`, `META_APP_SECRET`, `WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Instance (our Meta Tech Provider app) | App `serverVariables`, filled once by a server admin |
| Business token (business integration system user) | Workspace | Connected account `accessToken`, encrypted by Twenty |
| Phone number id | Workspace | Connected account `externalAccountId` |
| WABA id of the number | Workspace | Key-value store, `WORKSPACE` scope |
| phone number id to workspace routing | Instance | Key-value store, `SERVER` scope claim (only the claiming workspace can change it) |

Nothing per customer is ever written to `serverVariables`.

## Flow

```
Member: Settings > Apps > WhatsApp > Add connection
  -> whatsapp-authorize          returns the signup page URL (server route) + Twenty state
  -> whatsapp-signup-page        FB JS SDK popup, Embedded Signup (config_id)
       customer logs in, picks/creates WABA + number, clicks Finish
  -> /auth/apps/custom/callback?state&code&waba_id&phone_number_id
  -> whatsapp-callback (10 s)    code -> business token, debug_token -> granted WABAs,
                                 keeps only the number the token really owns,
                                 refuses numbers claimed by another workspace
  -> Twenty saves the connection (token encrypted)
  -> whatsapp-on-connect (async) SERVER claim phone_number_id -> workspace,
                                 message channel (handle = +E.164, phones field matching),
                                 POST /{waba}/subscribed_apps, POST /{phone}/register

Customer sends a WhatsApp message
  -> Meta POST <SERVER_URL>/webhooks/server/<registrationId>/8eb050ab-12d6-4e4a-912a-d3bdfdffa8b4
  -> whatsapp-webhook-resolver (owner workspace)
       GET: hub.verify_token handshake
       POST: X-Hub-Signature-256 check, group changes by phone_number_id claim,
             extra workspaces re-posted to the same route, signed with the app secret
  -> whatsapp-handle-webhook-event (target workspace, queued)
       only ingests into the channel whose connection owns that phone_number_id

Member replies in a thread
  -> sendAppChannelMessage -> whatsapp-send-message
       POST /{phone_number_id}/messages with that workspace's token
```

## Server setup

- `LOGIC_FUNCTION_TYPE=LOCAL` on server and worker (production defaults to `DISABLED`).
- Raise `APPLICATION_API_RATE_LIMITING_LIMIT` (default 500 requests per 60 s, counted
  across all workspaces of the app). Each inbound delivery costs about four app API
  calls (claim lookup, connections, channel, ingest).
- Publish from the workspace that will own the app (it runs the shared webhook
  resolver and must keep the app installed):

  ```bash
  yarn install
  npx twenty app publish --private --remote production
  npx twenty app install --remote production
  ```

- Fill the four server variables in Settings > Apps > WhatsApp as a server admin.
- Share the install link (Settings > Developers > Apps > Distribution) with customer
  workspaces.

## Meta setup (once, for the instance)

1. Meta Business portfolio verified; app of type Business; become a Tech Provider
   (App Dashboard > WhatsApp > Quickstart).
2. Add the WhatsApp and Facebook Login for Business products.
3. Facebook Login for Business > Settings: enable Client OAuth login, Web OAuth
   login, Enforce HTTPS, Embedded Browser OAuth Login, Strict Mode and Login with
   the JavaScript SDK. Add the `SERVER_URL` host to Allowed domains and
   `<SERVER_URL>/` to Valid OAuth redirect URIs.
4. Facebook Login for Business > Configurations: create a WhatsApp Embedded Signup
   configuration (prefer token expiration "Never"; the 60-day template forces a
   reconnect every 60 days). Its id is `WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID`.
5. WhatsApp > Configuration > Webhook: callback URL from the flow above, verify
   token = `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, subscribe to the `messages` field.
6. App Review: advanced access for `whatsapp_business_management` and
   `whatsapp_business_messaging` (and `business_management` if requested), then
   switch the app to Live.

Customers add their own payment method in WhatsApp Manager after signup.

## Limits

- Free-form replies only within 24 hours of the customer's last message; outside
  it the send fails with an explanation (templates are not implemented).
- Media is shown as a placeholder (`[image] caption`), not downloaded.
- Starting a conversation from Twenty is not supported by app channels.
- Disconnecting does not unsubscribe the app from the WABA, since another
  workspace may route a different number of the same WABA.

## Development

```bash
yarn install
yarn typecheck
yarn lint
yarn test
npx twenty app build
```
