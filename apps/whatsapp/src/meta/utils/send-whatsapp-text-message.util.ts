import { isNonEmptyString } from '@sniptt/guards';

import { requestMetaGraph } from 'src/meta/utils/request-meta-graph.util';

const WHATSAPP_TEXT_MAX_LENGTH = 4096;

export const sendWhatsappTextMessage = async ({
  phoneNumberId,
  accessToken,
  to,
  text,
}: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  text: string;
}): Promise<string> => {
  if (text.length > WHATSAPP_TEXT_MAX_LENGTH) {
    throw new Error(
      `WhatsApp text messages are limited to ${WHATSAPP_TEXT_MAX_LENGTH} characters`,
    );
  }

  const { messages } = await requestMetaGraph<{
    messages?: { id?: string }[];
  }>({
    path: `/${phoneNumberId}/messages`,
    method: 'POST',
    accessToken,
    body: {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text, preview_url: false },
    },
  });

  const messageId = messages?.[0]?.id;

  if (!isNonEmptyString(messageId)) {
    throw new Error('WhatsApp accepted the message but returned no id');
  }

  return messageId;
};
