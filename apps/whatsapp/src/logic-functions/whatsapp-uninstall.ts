import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import { WHATSAPP_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';
import { removeWhatsappConnectionResources } from 'src/logic-functions/utils/remove-whatsapp-connection-resources.util';

export const whatsappUninstallHandler = async (): Promise<{
  removedConnectionCount: number;
}> => {
  const connections = await listConnections({
    providerName: WHATSAPP_PROVIDER_NAME,
  });

  const results = await Promise.allSettled(
    connections.map((connection) =>
      removeWhatsappConnectionResources({
        connectedAccountId: connection.id,
        phoneNumberId: connection.externalAccountId,
      }),
    ),
  );

  const failedConnectionIds = connections
    .filter((_, index) => results[index].status === 'rejected')
    .map(({ id }) => id);

  if (failedConnectionIds.length > 0) {
    throw new Error(
      `WhatsApp cleanup failed for connections ${failedConnectionIds.join(', ')}`,
    );
  }

  return { removedConnectionCount: connections.length };
};

export default defineUninstallLogicFunction({
  universalIdentifier: WHATSAPP_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-uninstall',
  description:
    'Removes the message channel and webhook routing of every WhatsApp connection when the app is uninstalled.',
  timeoutSeconds: 60,
  handler: whatsappUninstallHandler,
});
