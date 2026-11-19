import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AuthorizeConnectionPayload,
  type AuthorizeConnectionResult,
} from 'twenty-sdk/logic-function';
import { getServerRouteUrl } from 'twenty-sdk/utils';

import {
  WHATSAPP_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_SIGNUP_PAGE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { getRequiredServerVariable } from 'src/meta/utils/get-required-server-variable.util';

export const whatsappAuthorizeHandler = async ({
  callbackUrl,
}: AuthorizeConnectionPayload): Promise<AuthorizeConnectionResult> => {
  const state = new URL(callbackUrl).searchParams.get('state');

  if (!isNonEmptyString(state)) {
    throw new Error('Twenty callback URL carries no state');
  }

  // Fail here, before the member leaves Twenty, when the admin has not set up Meta.
  getRequiredServerVariable('META_APP_ID');
  getRequiredServerVariable('WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID');

  const signupPageUrl = new URL(
    getServerRouteUrl(WHATSAPP_SIGNUP_PAGE_UNIVERSAL_IDENTIFIER),
  );

  signupPageUrl.searchParams.set('state', state);

  return { authorizationUrl: signupPageUrl.toString() };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-authorize',
  description:
    'Sends the member to the Embedded Signup page where they pick or create their WhatsApp Business account and number.',
  timeoutSeconds: 10,
  handler: whatsappAuthorizeHandler,
});
