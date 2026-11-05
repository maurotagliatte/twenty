# Email and WhatsApp channels (Coolify, multi-workspace)

Instance-level configuration so each workspace can connect its own mailboxes and
WhatsApp number. Coolify injects every app variable into both `server` and
`worker`, so set these in the Coolify app, not in the compose file.

## Environment

```bash
# Apps (required for the WhatsApp app and any logic function)
LOGIC_FUNCTION_TYPE=LOCAL
APPLICATION_API_RATE_LIMITING_LIMIT=6000   # default 500/min shared by all workspaces of an app

# Gmail + Google Calendar
MESSAGING_PROVIDER_GMAIL_ENABLED=true
CALENDAR_PROVIDER_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=...
AUTH_GOOGLE_CLIENT_SECRET=...
AUTH_GOOGLE_APIS_CALLBACK_URL=${SERVER_URL}/auth/google-apis/get-access-token
# Optional Google sign-in
AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_CALLBACK_URL=${SERVER_URL}/auth/google/redirect

# Microsoft 365 / Outlook
MESSAGING_PROVIDER_MICROSOFT_ENABLED=true
CALENDAR_PROVIDER_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_CLIENT_ID=...
AUTH_MICROSOFT_CLIENT_SECRET=...
AUTH_MICROSOFT_APIS_CALLBACK_URL=${SERVER_URL}/auth/microsoft-apis/get-access-token
# Optional Microsoft sign-in
AUTH_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_CALLBACK_URL=${SERVER_URL}/auth/microsoft/redirect

# Optional: push sync instead of polling only
IS_CONNECTED_ACCOUNT_WEBHOOK_SUBSCRIPTION_ENABLED=true
MESSAGING_GMAIL_PUBSUB_TOPIC=projects/<project>/topics/<topic>
MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL=<push service account email>

# IMAP/SMTP/CalDAV is on by default (IS_IMAP_SMTP_CALDAV_ENABLED=true)
```

Use the literal `SERVER_URL` value (for example `https://app.khard.cloud`). Every
callback is on `SERVER_URL`, never on a workspace subdomain: the workspace travels
in the signed `state` (transient token) and Twenty redirects back to
`<workspace>.<domain>` afterwards, so one redirect URI per provider serves all
workspaces. Messaging crons are registered by the server at boot
(`DISABLE_CRON_JOBS_REGISTRATION=false`).

## Google Cloud

1. Enable Gmail API, Google Calendar API and People API.
2. OAuth consent screen: External, app name, logo, privacy policy and terms URLs on
   your domain, authorized domain = your root domain.
3. Scopes requested by Twenty: `email`, `profile`, `gmail.readonly` (restricted),
   `gmail.compose` (restricted), `gmail.send` (sensitive), `calendar.events`
   (sensitive), `profile.emails.read`.
4. OAuth client of type Web application, redirect URIs:
   `<SERVER_URL>/auth/google-apis/get-access-token` and, for sign-in,
   `<SERVER_URL>/auth/google/redirect`.
5. While in Testing: at most 100 test users, refresh tokens expire after 7 days.
   For production: brand verification, sensitive and restricted scope review with
   a demo video, and a yearly CASA security assessment (restricted Gmail scopes).
   Until approved, users see the "unverified app" warning and the 100-user cap applies.
6. Optional push: a Pub/Sub topic with `gmail-api-push@system.gserviceaccount.com`
   as publisher and a push subscription to `<SERVER_URL>/webhooks/google/messaging`
   authenticated with the service account set in
   `MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL`.

## Microsoft Entra (Azure)

1. App registration, supported account types "Accounts in any organizational
   directory and personal Microsoft accounts" (Twenty uses the `common` tenant).
2. Web redirect URIs: `<SERVER_URL>/auth/microsoft-apis/get-access-token` and
   `<SERVER_URL>/auth/microsoft/redirect`.
3. Delegated Microsoft Graph permissions: `openid`, `email`, `profile`,
   `offline_access`, `User.Read`, `Mail.ReadWrite`, `Mail.Send`,
   `Calendars.ReadWrite`.
4. Client secret (note its expiry, 24 months maximum) into
   `AUTH_MICROSOFT_CLIENT_SECRET`.
5. Publisher verification (Microsoft AI Cloud Partner Program id + verified
   domain): without it, most customer tenants block user consent for a
   multi-tenant app. Some tenants still require an admin to grant consent.
6. Mailboxes need an Exchange Online licence.

## WhatsApp

See `packages/twenty-apps/internal/khard-whatsapp/README.md`.
