# Khard Marketing

Twenty app that connects Google (Tag Manager, GA4, Search Console, YouTube) and
Meta (Instagram, WhatsApp Business) accounts. Tokens are stored by Twenty as
connected accounts; this app only declares the providers and reads the assets.

| Provider | Type | Redirect URI to register |
| --- | --- | --- |
| `google-marketing` | OAuth 2.0, refreshed by Twenty | `https://app.khard.cloud/auth/apps/callback` |
| `meta` | Custom flow, 60-day long-lived token | `https://app.khard.cloud/auth/apps/custom/callback` |

Logic functions (also exposed as AI tools and workflow actions):

- `list-google-assets`: Tag Manager accounts, GA4 properties, Search Console sites, YouTube channels.
- `list-meta-assets`: Facebook Pages, Instagram professional accounts, WhatsApp Business accounts.

## Setup

1. The server needs `LOGIC_FUNCTION_TYPE=LOCAL` (set in `packages/twenty-docker/docker-compose.coolify.yml`).
2. Google Cloud: enable Tag Manager API, Google Analytics Admin API, Google Analytics Data API,
   Google Search Console API, YouTube Data API v3 and YouTube Analytics API; create an OAuth
   client of type Web application with the redirect URI above.
3. Meta for Developers: create a Business app with Facebook Login for Business, Instagram and
   WhatsApp, and add the redirect URI above to Valid OAuth Redirect URIs.
4. Publish and install:

   ```bash
   yarn install
   npx twenty@2.54.3 auth login --url https://app.khard.cloud --name khard --use
   npx twenty@2.54.3 app publish --private
   npx twenty@2.54.3 app install
   ```

5. In Twenty, open Settings > Apps > Khard Marketing as a server admin and fill
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `META_APP_ID`, `META_APP_SECRET`
   (and optionally `WHATSAPP_SYSTEM_USER_TOKEN`). Members can then add connections.

## Development

```bash
yarn install
yarn typecheck
yarn lint
yarn test
npx twenty@2.54.3 app build
```
