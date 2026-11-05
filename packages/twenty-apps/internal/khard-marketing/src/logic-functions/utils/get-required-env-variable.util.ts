import { isNonEmptyString } from '@sniptt/guards';

export const getRequiredEnvVariable = (name: string): string => {
  const value = process.env[name];

  if (!isNonEmptyString(value)) {
    throw new Error(
      `${name} is not set. Fill it in the Khard Marketing app settings as a server admin.`,
    );
  }

  return value;
};
