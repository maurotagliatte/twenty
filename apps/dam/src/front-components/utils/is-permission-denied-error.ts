import { isArray, isObject } from '@sniptt/guards';

export const isPermissionDeniedError = (error: unknown): boolean =>
  isObject(error) &&
  'errors' in error &&
  isArray(error.errors) &&
  error.errors.some(
    (graphqlError) =>
      isObject(graphqlError) &&
      'extensions' in graphqlError &&
      isObject(graphqlError.extensions) &&
      'code' in graphqlError.extensions &&
      graphqlError.extensions.code === 'FORBIDDEN',
  );
