import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappWebhookMessage } from 'src/meta/types/whatsapp-webhook-payload.type';

const MEDIA_TYPES = ['image', 'video', 'document', 'audio', 'sticker'] as const;

// Media bodies are not downloaded, so the thread shows what was sent instead.
export const getWhatsappMessageText = (
  message: WhatsappWebhookMessage,
): string | null => {
  switch (message.type) {
    case 'text':
      return isNonEmptyString(message.text?.body) ? message.text.body : null;
    case 'button':
      return message.button?.text ?? null;
    case 'interactive':
      return (
        message.interactive?.button_reply?.title ??
        message.interactive?.list_reply?.title ??
        null
      );
    case 'location': {
      const place = [message.location?.name, message.location?.address]
        .filter(isNonEmptyString)
        .join(', ');

      return isNonEmptyString(place) ? `[location] ${place}` : '[location]';
    }
    case 'contacts':
      return '[contact card]';
    default:
      break;
  }

  const mediaType = MEDIA_TYPES.find((type) => type === message.type);

  if (!isDefined(mediaType)) {
    return null;
  }

  const media = message[mediaType];
  const label = media?.caption ?? media?.filename;

  return isNonEmptyString(label) ? `[${mediaType}] ${label}` : `[${mediaType}]`;
};
