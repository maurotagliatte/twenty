import { isNonEmptyString } from '@sniptt/guards';
import { listConnections } from 'twenty-sdk/logic-function';

type DefaultConnection = {
  accessToken: string;
  label: string;
};

export const findDefaultConnection = async (
  providerName: string,
): Promise<DefaultConnection | undefined> => {
  const connections = await listConnections({ providerName });
  const connection =
    connections.find((candidate) => candidate.scope === 'WORKSPACE') ??
    connections[0];

  if (connection === undefined || !isNonEmptyString(connection.accessToken)) {
    return undefined;
  }

  return { accessToken: connection.accessToken, label: connection.name };
};
