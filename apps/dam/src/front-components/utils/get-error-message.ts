import { isNonEmptyString } from '@sniptt/guards';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && isNonEmptyString(error.message)) {
    return error.message;
  }

  return 'Something went wrong while loading assets.';
};
