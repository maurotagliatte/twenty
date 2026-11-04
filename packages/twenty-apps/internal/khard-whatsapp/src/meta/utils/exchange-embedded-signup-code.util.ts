import { isNonEmptyString } from '@sniptt/guards';

import { requestMetaGraph } from 'src/meta/utils/request-meta-graph.util';

// Embedded Signup codes live 30 seconds and trade for a business integration
// system user token scoped to the assets the customer shared. Codes from the
// JavaScript SDK take no redirect_uri.
export const exchangeEmbeddedSignupCode = async ({
  code,
  appId,
  appSecret,
}: {
  code: string;
  appId: string;
  appSecret: string;
}): Promise<string> => {
  const { access_token: accessToken } = await requestMetaGraph<{
    access_token?: string;
  }>({
    path: '/oauth/access_token',
    searchParams: { client_id: appId, client_secret: appSecret, code },
  });

  if (!isNonEmptyString(accessToken)) {
    throw new Error('Meta returned no access token for the signup code');
  }

  return accessToken;
};
