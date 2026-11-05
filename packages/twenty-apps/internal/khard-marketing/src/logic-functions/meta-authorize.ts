import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AuthorizeConnectionPayload,
  type AuthorizeConnectionResult,
} from 'twenty-sdk/logic-function';

import {
  META_OAUTH_DIALOG_URL,
  META_OAUTH_SCOPES,
} from 'src/constants/meta-graph-api.constant';
import { META_AUTHORIZE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getMetaRedirectUri } from 'src/logic-functions/utils/get-meta-redirect-uri.util';
import { getRequiredEnvVariable } from 'src/logic-functions/utils/get-required-env-variable.util';

export const metaAuthorizeHandler = async ({
  callbackUrl,
}: AuthorizeConnectionPayload): Promise<AuthorizeConnectionResult> => {
  const state = new URL(callbackUrl).searchParams.get('state');

  if (!isNonEmptyString(state)) {
    throw new Error('Twenty callback URL carries no state');
  }

  const authorizationUrl = new URL(META_OAUTH_DIALOG_URL);

  authorizationUrl.searchParams.set(
    'client_id',
    getRequiredEnvVariable('META_APP_ID'),
  );
  authorizationUrl.searchParams.set('redirect_uri', getMetaRedirectUri());
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', META_OAUTH_SCOPES.join(','));

  return { authorizationUrl: authorizationUrl.toString() };
};

export default defineLogicFunction({
  universalIdentifier: META_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  name: 'meta-authorize',
  description: 'Builds the Facebook Login URL the member grants access through.',
  timeoutSeconds: 10,
  handler: metaAuthorizeHandler,
});
