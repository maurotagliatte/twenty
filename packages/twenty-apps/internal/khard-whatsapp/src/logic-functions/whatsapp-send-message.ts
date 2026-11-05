import { defineLogicFunction } from 'twenty-sdk/define';
import {
  reportConnectionAuthFailure,
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getWhatsappConnectionCredentials } from 'src/logic-functions/utils/get-whatsapp-connection-credentials.util';
import { MetaGraphApiError } from 'src/meta/utils/meta-graph-api.error';
import { sendWhatsappTextMessage } from 'src/meta/utils/send-whatsapp-text-message.util';

const META_INVALID_TOKEN_ERROR_CODE = 190;
const WHATSAPP_REENGAGEMENT_ERROR_CODE = 131047;

export const whatsappSendMessageHandler = async ({
  connectedAccountId,
  threadExternalId,
  text,
}: SendAppMessagePayload): Promise<SendAppMessageResult> => {
  const { connectionId, phoneNumberId, accessToken } =
    await getWhatsappConnectionCredentials(connectedAccountId);

  try {
    const externalId = await sendWhatsappTextMessage({
      phoneNumberId,
      accessToken,
      to: threadExternalId,
      text,
    });

    return { externalId, sentAt: new Date().toISOString() };
  } catch (error) {
    if (!(error instanceof MetaGraphApiError)) {
      throw error;
    }

    if (error.code === META_INVALID_TOKEN_ERROR_CODE) {
      await reportConnectionAuthFailure({
        connectionId,
        reason:
          'Meta rejected the WhatsApp token (the business removed the app or revoked access). Reconnect to restore sending.',
      });
    }

    if (error.code === WHATSAPP_REENGAGEMENT_ERROR_CODE) {
      throw new Error(
        'WhatsApp only allows free-form replies within 24 hours of the customer last message. Send an approved template instead.',
      );
    }

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-send-message',
  description:
    'Sends a reply written in Twenty to the WhatsApp customer of the thread through the Cloud API.',
  timeoutSeconds: 20,
  handler: whatsappSendMessageHandler,
});
