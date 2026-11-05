const MESSAGE_ID_UNSAFE_PATTERN = /[^A-Za-z0-9._@+-]/g;
const METADATA_MAX_LENGTH = 512;
const OBJECT_ID_MAX_LENGTH = 180;

// R2 custom metadata is sent as HTTP headers and rejects non-ASCII values.
export const toAsciiObjectMetadata = (value: string): string =>
  encodeURIComponent(value).slice(0, METADATA_MAX_LENGTH);

// The key is the Twenty dedupe id. A stable Message-ID keeps an Email Routing
// retry on the same object instead of importing the message twice.
export const buildInboundObjectKey = ({
  recipient,
  messageId,
  randomId,
}: {
  recipient: string;
  messageId: string | null;
  randomId: string;
}): string => {
  const domain = recipient.split('@')[1] ?? 'unknown';
  const sanitizedMessageId = messageId
    ?.replace(MESSAGE_ID_UNSAFE_PATTERN, '')
    .slice(0, OBJECT_ID_MAX_LENGTH);
  const objectId =
    sanitizedMessageId !== undefined && sanitizedMessageId.length > 0
      ? sanitizedMessageId
      : randomId;

  return `${domain}/${objectId}.eml`;
};

export const buildWebhookRecipients = ({
  recipient,
  channelAddress,
}: {
  recipient: string;
  channelAddress: string;
}): string[] =>
  channelAddress.toLowerCase() === recipient
    ? [recipient]
    : [channelAddress, recipient];
