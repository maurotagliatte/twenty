import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import { WHATSAPP_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';
import { type WhatsappConnectionHookPayload } from 'src/logic-functions/types/whatsapp-connection-hook-payload.type';
import { removeWhatsappConnectionResources } from 'src/logic-functions/utils/remove-whatsapp-connection-resources.util';

// getConnection throws for auth-failed connections, which are the ones most
// often removed, so the phone number id is read from the list instead.
const findPhoneNumberId = async (
  connectedAccountId: string,
): Promise<string | null> => {
  const connections = await listConnections({
    providerName: WHATSAPP_PROVIDER_NAME,
  });

  return (
    connections.find((connection) => connection.id === connectedAccountId)
      ?.externalAccountId ?? null
  );
};

export const whatsappOnDisconnectHandler = async ({
  connectedAccountId,
}: WhatsappConnectionHookPayload): Promise<{ success: true }> => {
  await removeWhatsappConnectionResources({
    connectedAccountId,
    phoneNumberId: await findPhoneNumberId(connectedAccountId),
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-on-disconnect',
  description:
    'Deletes the message channel of a removed WhatsApp connection and releases its webhook routing.',
  timeoutSeconds: 30,
  handler: whatsappOnDisconnectHandler,
});
