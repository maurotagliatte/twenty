import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  ingestMessages,
  listConnections,
  listMessageChannels,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INGEST_MESSAGES_MAX_BATCH_SIZE } from 'src/constants/ingest-messages-max-batch-size.constant';
import { WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';
import { mapWhatsappMessageToIngestMessage } from 'src/logic-functions/utils/map-whatsapp-message-to-ingest-message.util';
import {
  type WhatsappWebhookPayload,
  type WhatsappWebhookValue,
} from 'src/meta/types/whatsapp-webhook-payload.type';

type WhatsappWebhookEventResult = {
  ingestedMessageCount: number;
  skipped: string[];
};

const groupMessageValuesByPhoneNumberId = (
  payload: WhatsappWebhookPayload,
): Map<string, WhatsappWebhookValue[]> => {
  const valuesByPhoneNumberId = new Map<string, WhatsappWebhookValue[]>();

  for (const entry of payload.entry ?? []) {
    for (const { field, value } of entry.changes ?? []) {
      const phoneNumberId = value?.metadata?.phone_number_id;

      if (field !== 'messages' || !isNonEmptyString(phoneNumberId)) {
        continue;
      }

      valuesByPhoneNumberId.set(phoneNumberId, [
        ...(valuesByPhoneNumberId.get(phoneNumberId) ?? []),
        value,
      ]);
    }
  }

  return valuesByPhoneNumberId;
};

// Runs in the workspace the resolver picked, and still only ingests into a
// channel whose connection owns the phone number: a misrouted change finds
// no connection here and is skipped.
export const whatsappHandleWebhookEventHandler = async (
  payload: WhatsappWebhookPayload,
): Promise<WhatsappWebhookEventResult> => {
  const valuesByPhoneNumberId = groupMessageValuesByPhoneNumberId(payload);
  const result: WhatsappWebhookEventResult = {
    ingestedMessageCount: 0,
    skipped: [],
  };

  if (valuesByPhoneNumberId.size === 0) {
    return result;
  }

  const connections = await listConnections({
    providerName: WHATSAPP_PROVIDER_NAME,
  });

  for (const [phoneNumberId, values] of valuesByPhoneNumberId) {
    const connection = connections.find(
      ({ externalAccountId }) => externalAccountId === phoneNumberId,
    );

    if (!isDefined(connection)) {
      result.skipped.push(`No connection for phone number ${phoneNumberId}`);
      continue;
    }

    const [channel] = await listMessageChannels({
      connectedAccountId: connection.id,
    });

    if (!isDefined(channel) || !channel.isSyncEnabled) {
      result.skipped.push(
        `No active channel for phone number ${phoneNumberId}`,
      );
      continue;
    }

    const messagesById = new Map(
      values
        .flatMap(({ messages, contacts }) =>
          (messages ?? []).map((message) =>
            mapWhatsappMessageToIngestMessage({
              message,
              contacts: contacts ?? [],
              channelHandle: channel.handle,
            }),
          ),
        )
        .filter(isDefined)
        .map((message) => [message.externalId, message] as const),
    );
    const messages = [...messagesById.values()];

    for (
      let offset = 0;
      offset < messages.length;
      offset += INGEST_MESSAGES_MAX_BATCH_SIZE
    ) {
      const ingested = await ingestMessages({
        messageChannelId: channel.id,
        messages: messages.slice(
          offset,
          offset + INGEST_MESSAGES_MAX_BATCH_SIZE,
        ),
      });

      result.ingestedMessageCount += ingested.length;
    }
  }

  return result;
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-handle-webhook-event',
  description:
    'Imports inbound WhatsApp messages into the message channel of the connected number.',
  timeoutSeconds: 60,
  handler: whatsappHandleWebhookEventHandler,
});
