import { RestApiClientError } from 'twenty-client-sdk/rest';

export const describeApiError = (error: unknown, action: string) => {
  if (error instanceof RestApiClientError && error.status === 403) {
    return `You do not have permission to ${action}.`;
  }

  return `Could not ${action}. Please try again.`;
};
