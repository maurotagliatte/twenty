export type WhatsappWebhookContact = {
  wa_id: string;
  profile?: { name?: string };
};

type WhatsappWebhookMedia = {
  caption?: string;
  filename?: string;
};

export type WhatsappWebhookMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body?: string };
  image?: WhatsappWebhookMedia;
  video?: WhatsappWebhookMedia;
  document?: WhatsappWebhookMedia;
  audio?: WhatsappWebhookMedia;
  sticker?: WhatsappWebhookMedia;
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
  location?: { name?: string; address?: string };
};

export type WhatsappWebhookValue = {
  messaging_product?: string;
  metadata?: { display_phone_number?: string; phone_number_id?: string };
  contacts?: WhatsappWebhookContact[];
  messages?: WhatsappWebhookMessage[];
  statuses?: unknown[];
};

export type WhatsappWebhookChange = {
  field: string;
  value: WhatsappWebhookValue;
};

export type WhatsappWebhookEntry = {
  // WhatsApp Business Account id
  id: string;
  changes: WhatsappWebhookChange[];
};

export type WhatsappWebhookPayload = {
  object: string;
  entry: WhatsappWebhookEntry[];
};
