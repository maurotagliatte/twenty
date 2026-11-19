import { isNonEmptyString } from '@sniptt/guards';
import { getConnection } from 'twenty-sdk/logic-function';

export type WhatsappConnectionCredentials = {
  connectionId: string;
  phoneNumberId: string;
  accessToken: string;
};

export const getWhatsappConnectionCredentials = async (
  connectedAccountId: string,
): Promise<WhatsappConnectionCredentials> => {
  const connection = await getConnection(connectedAccountId);

  if (
    !isNonEmptyString(connection.externalAccountId) ||
    !isNonEmptyString(connection.accessToken)
  ) {
    throw new Error(
      `WhatsApp connection ${connectedAccountId} has no phone number or token; reconnect it`,
    );
  }

  return {
    connectionId: connection.id,
    phoneNumberId: connection.externalAccountId,
    accessToken: connection.accessToken,
  };
};
