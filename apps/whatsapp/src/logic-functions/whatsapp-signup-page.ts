import { defineLogicFunction } from 'twenty-sdk/define';
import {
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_SIGNUP_PAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsappSignupPageHtml } from 'src/logic-functions/utils/build-whatsapp-signup-page-html.util';
import { getRequiredServerVariable } from 'src/meta/utils/get-required-server-variable.util';
import { getTwentyCustomCallbackUrl } from 'src/meta/utils/get-twenty-custom-callback-url.util';

// Everything rendered is instance configuration; nothing from the request is.
export const whatsappSignupPageHandler =
  async (): Promise<ServerRouteResolverResult> =>
    new Response(
      buildWhatsappSignupPageHtml({
        appId: getRequiredServerVariable('META_APP_ID'),
        configId: getRequiredServerVariable(
          'WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID',
        ),
        callbackUrl: getTwentyCustomCallbackUrl(),
      }),
      {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        },
      },
    );

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_SIGNUP_PAGE_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-signup-page',
  description:
    'Serves the page that runs WhatsApp Embedded Signup with the Facebook JavaScript SDK and hands the result to the Twenty connection callback.',
  timeoutSeconds: 10,
  handler: whatsappSignupPageHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['GET'],
  },
});
