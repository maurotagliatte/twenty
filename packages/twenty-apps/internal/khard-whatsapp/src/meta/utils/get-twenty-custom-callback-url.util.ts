import { isNonEmptyString } from '@sniptt/guards';

// Same URL Twenty hands the authorize function, minus the state query parameter.
export const getTwentyCustomCallbackUrl = (): string => {
  const serverUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(serverUrl)) {
    throw new Error('TWENTY_API_URL is not available to the logic function');
  }

  return new URL('/auth/apps/custom/callback', serverUrl).toString();
};
