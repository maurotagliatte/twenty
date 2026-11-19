import { isNonEmptyString } from '@sniptt/guards';
import {
  deleteMessageChannel,
  kv,
  listMessageChannels,
} from 'twenty-sdk/logic-function';

import { getWhatsappPhoneNumberClaimKey } from 'src/logic-functions/utils/get-whatsapp-phone-number-claim-key.util';
import { deleteWhatsappPhoneNumberAccount } from 'src/logic-functions/utils/whatsapp-phone-number-account.util';

// The app stays subscribed to the WABA: another workspace may route a
// different number of the same account through it.
export const removeWhatsappConnectionResources = async ({
  connectedAccountId,
  phoneNumberId,
}: {
  connectedAccountId: string;
  phoneNumberId: string | null;
}): Promise<void> => {
  const channels = await listMessageChannels({ connectedAccountId });

  await Promise.all(
    channels.map((channel) => deleteMessageChannel(channel.id)),
  );

  if (!isNonEmptyString(phoneNumberId)) {
    return;
  }

  // A no-op when another workspace holds the claim: the server only deletes
  // claims whose value is the calling workspace.
  await kv.delete(getWhatsappPhoneNumberClaimKey(phoneNumberId), {
    scope: 'SERVER',
  });

  await deleteWhatsappPhoneNumberAccount(phoneNumberId);
};
