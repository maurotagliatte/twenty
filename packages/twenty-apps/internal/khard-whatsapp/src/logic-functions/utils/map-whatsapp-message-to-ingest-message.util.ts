import { isNonEmptyString } from '@sniptt/guards';
import { type IngestMessage } from 'twenty-sdk/logic-function';

import { getWhatsappMessageText } from 'src/logic-functions/utils/get-whatsapp-message-text.util';
import { toWhatsappPhoneHandle } from 'src/logic-functions/utils/to-whatsapp-phone-handle.util';
import {
  type WhatsappWebhookContact,
  type WhatsappWebhookMessage,
} from 'src/meta/types/whatsapp-webhook-payload.type';

// One thread per customer number: the thread id is the customer wa_id, which
// is also where replies are sent.
export const mapWhatsappMessageToIngestMessage = ({
  message,
  contacts,
  channelHandle,
}: {
  message: WhatsappWebhookMessage;
  contacts: WhatsappWebhookContact[];
  channelHandle: string;
}): IngestMessage | null => {
  const text = getWhatsappMessageText(message);
  const timestampInSeconds = Number(message.timestamp);

  if (
    text === null ||
    !isNonEmptyString(message.id) ||
    !isNonEmptyString(message.from) ||
    !Number.isFinite(timestampInSeconds)
  ) {
    return null;
  }

  const senderName = contacts.find((contact) => contact.wa_id === message.from)
    ?.profile?.name;

  return {
    externalId: message.id,
    threadExternalId: message.from,
    text,
    receivedAt: new Date(timestampInSeconds * 1000),
    participants: [
      {
        role: 'FROM',
        handle: toWhatsappPhoneHandle(message.from),
        ...(isNonEmptyString(senderName) ? { displayName: senderName } : {}),
      },
      { role: 'TO', handle: channelHandle },
    ],
  };
};
