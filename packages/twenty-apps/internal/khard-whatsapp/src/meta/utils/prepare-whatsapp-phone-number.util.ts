import { randomInt } from 'node:crypto';

import { type WhatsappPhoneNumber } from 'src/meta/types/whatsapp-phone-number.type';
import { requestMetaGraph } from 'src/meta/utils/request-meta-graph.util';

// Subscribing is idempotent and per (app, WABA); it is what makes Meta deliver
// this WABA's messages to the app webhook.
export const prepareWhatsappPhoneNumber = async ({
  whatsappBusinessAccountId,
  phoneNumber,
  accessToken,
}: {
  whatsappBusinessAccountId: string;
  phoneNumber: WhatsappPhoneNumber;
  accessToken: string;
}): Promise<{ hasRegistered: boolean }> => {
  await requestMetaGraph({
    path: `/${whatsappBusinessAccountId}/subscribed_apps`,
    method: 'POST',
    accessToken,
  });

  if (phoneNumber.platform_type === 'CLOUD_API') {
    return { hasRegistered: false };
  }

  // A number fresh from Embedded Signup has no two-step PIN yet; the customer
  // can reset it in WhatsApp Manager, so it is not stored.
  await requestMetaGraph({
    path: `/${phoneNumber.id}/register`,
    method: 'POST',
    accessToken,
    body: {
      messaging_product: 'whatsapp',
      pin: String(randomInt(0, 1_000_000)).padStart(6, '0'),
    },
  });

  return { hasRegistered: true };
};
