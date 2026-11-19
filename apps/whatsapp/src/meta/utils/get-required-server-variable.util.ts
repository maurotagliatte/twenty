import { isNonEmptyString } from '@sniptt/guards';

export const getRequiredServerVariable = (name: string): string => {
  const value = process.env[name];

  if (!isNonEmptyString(value)) {
    throw new Error(
      `${name} is not set. A server admin fills it in the WhatsApp app settings.`,
    );
  }

  return value;
};
