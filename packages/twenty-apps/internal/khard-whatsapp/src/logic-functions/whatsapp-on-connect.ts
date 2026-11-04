import { defineLogicFunction } from 'twenty-sdk/define';
import {
  createMessageChannel,
  kv,
  listMessageChannels,
  reportConnectionAuthFailure,
  updateMessageChannel,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { PERSON_PHONES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/person-phones-field-universal-identifier.constant';
import {
  WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  WHATSAPP_ON_CONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type WhatsappConnectionHookPayload } from 'src/logic-functions/types/whatsapp-connection-hook-payload.type';
import { getWhatsappConnectionCredentials } from 'src/logic-functions/utils/get-whatsapp-connection-credentials.util';
import { getWhatsappPhoneNumberClaimKey } from 'src/logic-functions/utils/get-whatsapp-phone-number-claim-key.util';
import { toWhatsappPhoneHandle } from 'src/logic-functions/utils/to-whatsapp-phone-handle.util';
import { getWhatsappPhoneNumberAccount } from 'src/logic-functions/utils/whatsapp-phone-number-account.util';
import { getWhatsappPhoneNumber } from 'src/meta/utils/get-whatsapp-phone-number.util';
import { prepareWhatsappPhoneNumber } from 'src/meta/utils/prepare-whatsapp-phone-number.util';

const reportAndThrow = async (
  connectionId: string,
  reason: string,
): Promise<never> => {
  await reportConnectionAuthFailure({ connectionId, reason });

  throw new Error(reason);
};

export const whatsappOnConnectHandler = async ({
  connectedAccountId,
}: WhatsappConnectionHookPayload): Promise<{ messageChannelId: string }> => {
  const { connectionId, phoneNumberId, accessToken } =
    await getWhatsappConnectionCredentials(connectedAccountId);

  const account = await getWhatsappPhoneNumberAccount(phoneNumberId);

  if (!isDefined(account)) {
    return reportAndThrow(
      connectionId,
      'The WhatsApp business account of this number is unknown. Reconnect to finish the setup.',
    );
  }

  // Claimed before anything else: a number another workspace routes must not
  // get a channel here, and kv.set refuses a claim held by someone else.
  try {
    await kv.set(getWhatsappPhoneNumberClaimKey(phoneNumberId), undefined, {
      scope: 'SERVER',
    });
  } catch (error) {
    if (!(error instanceof Error) || !/already claimed/i.test(error.message)) {
      throw error;
    }

    return reportAndThrow(
      connectionId,
      'This WhatsApp number is already connected to another Twenty workspace. Disconnect it there first.',
    );
  }

  const phoneNumber = await getWhatsappPhoneNumber({
    phoneNumberId,
    accessToken,
  });

  const [existingChannel] = await listMessageChannels({ connectedAccountId });

  if (
    isDefined(existingChannel) &&
    existingChannel.messagingProviderUniversalIdentifier !==
      WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER
  ) {
    await updateMessageChannel({
      id: existingChannel.id,
      messagingProvider: {
        universalIdentifier: WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
  }

  // A business number is shared by the team, so its conversations are too.
  const channel =
    existingChannel ??
    (await createMessageChannel({
      connectedAccountId,
      handle: toWhatsappPhoneHandle(phoneNumber.display_phone_number),
      displayName:
        phoneNumber.verified_name ?? phoneNumber.display_phone_number,
      visibility: 'SHARE_EVERYTHING',
      participantHandleFieldUniversalIdentifier:
        PERSON_PHONES_FIELD_UNIVERSAL_IDENTIFIER,
      messagingProvider: {
        universalIdentifier: WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    }));

  try {
    await prepareWhatsappPhoneNumber({
      whatsappBusinessAccountId: account.whatsappBusinessAccountId,
      phoneNumber,
      accessToken,
    });
  } catch (error) {
    return reportAndThrow(
      connectionId,
      `WhatsApp could not finish activating this number: ${error instanceof Error ? error.message : String(error)}`.slice(
        0,
        1000,
      ),
    );
  }

  return { messageChannelId: channel.id };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-on-connect',
  description:
    'Routes the new WhatsApp number webhooks to this workspace, creates its message channel, subscribes the app to its business account and registers the number for the Cloud API.',
  timeoutSeconds: 60,
  handler: whatsappOnConnectHandler,
});
