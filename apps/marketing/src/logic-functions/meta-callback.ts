import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type ConnectionCallbackPayload,
  type ConnectionCallbackResult,
} from 'twenty-sdk/logic-function';

import { META_CALLBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fetchMetaGraph } from 'src/logic-functions/utils/fetch-meta-graph.util';
import { getMetaRedirectUri } from 'src/logic-functions/utils/get-meta-redirect-uri.util';
import { getRequiredEnvVariable } from 'src/logic-functions/utils/get-required-env-variable.util';

type MetaAccessTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

type MetaUserResponse = {
  id: string;
  name?: string;
};

export const metaCallbackHandler = async ({
  queryStringParameters,
}: ConnectionCallbackPayload): Promise<ConnectionCallbackResult> => {
  const {
    code,
    error,
    error_description: errorDescription,
  } = queryStringParameters;

  if (isNonEmptyString(error)) {
    throw new Error(
      isNonEmptyString(errorDescription)
        ? `${error}: ${errorDescription}`
        : error,
    );
  }

  if (!isNonEmptyString(code)) {
    throw new Error('Meta sign-in returned no authorization code');
  }

  const clientId = getRequiredEnvVariable('META_APP_ID');
  const clientSecret = getRequiredEnvVariable('META_APP_SECRET');

  const shortLivedToken = await fetchMetaGraph<MetaAccessTokenResponse>(
    '/oauth/access_token',
    {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getMetaRedirectUri(),
      code,
    },
  );

  const longLivedToken = await fetchMetaGraph<MetaAccessTokenResponse>(
    '/oauth/access_token',
    {
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: shortLivedToken.access_token,
    },
  );

  const user = await fetchMetaGraph<MetaUserResponse>('/me', {
    fields: 'id,name',
    access_token: longLivedToken.access_token,
  });

  return {
    externalAccountId: user.id,
    handle: user.name ?? user.id,
    accessToken: longLivedToken.access_token,
  };
};

export default defineLogicFunction({
  universalIdentifier: META_CALLBACK_UNIVERSAL_IDENTIFIER,
  name: 'meta-callback',
  description:
    'Trades the Facebook Login code for a long-lived Meta token and identifies the account.',
  timeoutSeconds: 20,
  handler: metaCallbackHandler,
});
