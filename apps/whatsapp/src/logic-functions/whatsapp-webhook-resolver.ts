import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { forwardWhatsappWebhook } from 'src/logic-functions/utils/forward-whatsapp-webhook.util';
import { getWhatsappPhoneNumberClaimKey } from 'src/logic-functions/utils/get-whatsapp-phone-number-claim-key.util';
import { groupWhatsappWebhookByWorkspace } from 'src/logic-functions/utils/group-whatsapp-webhook-by-workspace.util';
import { type WhatsappWebhookPayload } from 'src/meta/types/whatsapp-webhook-payload.type';
import { getMetaWebhookChallenge } from 'src/meta/utils/get-meta-webhook-challenge.util';
import { verifyMetaWebhookSignature } from 'src/meta/utils/verify-meta-webhook-signature.util';

const answerSubscriptionHandshake = (
  queryStringParameters: Record<string, string | undefined>,
): Response => {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (!isNonEmptyString(verifyToken)) {
    return new Response('WHATSAPP_WEBHOOK_VERIFY_TOKEN is not configured', {
      status: 500,
    });
  }

  const challenge = getMetaWebhookChallenge({
    queryStringParameters,
    verifyToken,
  });

  return challenge === null
    ? new Response('Forbidden', { status: 403 })
    : new Response(challenge);
};

export const whatsappWebhookResolverHandler = async (
  routePayload: RoutePayload<WhatsappWebhookPayload>,
): Promise<ServerRouteResolverResult> => {
  if (routePayload.requestContext.http.method === 'GET') {
    return answerSubscriptionHandshake(routePayload.queryStringParameters);
  }

  const appSecret = process.env.META_APP_SECRET;

  if (!isNonEmptyString(appSecret)) {
    return new Response(
      { error: 'META_APP_SECRET is not configured' },
      { status: 500 },
    );
  }

  if (
    !verifyMetaWebhookSignature({
      signatureHeader: routePayload.headers['x-hub-signature-256'],
      rawBody: routePayload.rawBody,
      appSecret,
    })
  ) {
    return new Response({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = routePayload.body;

  if (payload?.object !== 'whatsapp_business_account') {
    return new Response({ skipped: 'Not a WhatsApp Business event' });
  }

  const [firstWorkspaceWebhook, ...otherWorkspaceWebhooks] =
    await groupWhatsappWebhookByWorkspace({
      payload,
      findClaimedWorkspaceId: (phoneNumberId) =>
        kv.get<string>(getWhatsappPhoneNumberClaimKey(phoneNumberId), {
          scope: 'SERVER',
        }),
    });

  if (!isDefined(firstWorkspaceWebhook)) {
    return new Response({ skipped: 'No workspace claims these numbers' });
  }

  // A failed forward throws, so Meta redelivers the whole batch; ingestion is
  // idempotent on the message id, so the replay is harmless.
  await Promise.all(
    otherWorkspaceWebhooks.map(({ payload: workspacePayload }) =>
      forwardWhatsappWebhook({ payload: workspacePayload, appSecret }),
    ),
  );

  return {
    workspaceId: firstWorkspaceWebhook.workspaceId,
    targetLogicFunctionUniversalIdentifier:
      WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
    payload: firstWorkspaceWebhook.payload,
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-webhook-resolver',
  description:
    'Single Meta webhook for every workspace: answers the verify-token handshake, checks X-Hub-Signature-256 and routes each change to the workspace that connected its phone number.',
  timeoutSeconds: 15,
  handler: whatsappWebhookResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['GET', 'POST'],
    forwardedRequestHeaders: ['x-hub-signature-256'],
  },
});
