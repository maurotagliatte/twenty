import { defineConnectionProvider } from 'twenty-sdk/define';

import { GOOGLE_PROVIDER_NAME } from 'src/constants/provider-names.constant';
import { GOOGLE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: GOOGLE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: GOOGLE_PROVIDER_NAME,
  displayName: 'Google Marketing',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    scopes: [
      'openid',
      'email',
      'https://www.googleapis.com/auth/tagmanager.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
    clientIdVariable: 'GOOGLE_CLIENT_ID',
    clientSecretVariable: 'GOOGLE_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    // Google only returns a refresh token on offline access with a fresh consent.
    authorizationParams: {
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
    },
  },
});
