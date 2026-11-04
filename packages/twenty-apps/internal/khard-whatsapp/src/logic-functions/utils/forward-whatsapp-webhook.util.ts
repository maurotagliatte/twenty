import { getServerRouteUrl } from 'twenty-sdk/utils';

import { WHATSAPP_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappWebhookPayload } from 'src/meta/types/whatsapp-webhook-payload.type';
import { signMetaWebhookBody } from 'src/meta/utils/sign-meta-webhook-body.util';

// A resolver dispatches to a single workspace, so a delivery spanning several
// is re-posted to this same route once per extra workspace, signed with the
// app secret exactly like Meta signs it.
export const forwardWhatsappWebhook = async ({
  payload,
  appSecret,
}: {
  payload: WhatsappWebhookPayload;
  appSecret: string;
}): Promise<void> => {
  const rawBody = JSON.stringify(payload);

  const response = await fetch(
    getServerRouteUrl(WHATSAPP_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signMetaWebhookBody({ rawBody, appSecret }),
      },
      body: rawBody,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Forwarding a WhatsApp webhook slice failed: HTTP ${response.status}`,
    );
  }
};
