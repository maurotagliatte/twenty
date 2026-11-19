import { isNonEmptyString } from '@sniptt/guards';

// Meta matches redirect URIs strictly, so the one sent on authorize and on the
// token exchange must be the bare callback, with Twenty's state passed apart.
export const getMetaRedirectUri = (): string => {
  const serverUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(serverUrl)) {
    throw new Error('TWENTY_API_URL is not available to the logic function');
  }

  return new URL('/auth/apps/custom/callback', serverUrl).toString();
};
