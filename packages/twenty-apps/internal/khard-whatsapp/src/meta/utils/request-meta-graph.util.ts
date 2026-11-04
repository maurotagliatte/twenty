import { isDefined } from 'twenty-sdk/utils';

import { META_GRAPH_API_BASE_URL } from 'src/constants/meta-graph-api.constant';
import { MetaGraphApiError } from 'src/meta/utils/meta-graph-api.error';

type MetaGraphErrorBody = {
  error?: { message?: string; code?: number };
};

// Tokens travel in the Authorization header so they never land in URLs or logs.
export const requestMetaGraph = async <TResponse>({
  path,
  accessToken,
  method = 'GET',
  searchParams = {},
  body,
}: {
  path: string;
  accessToken?: string;
  method?: 'GET' | 'POST' | 'DELETE';
  searchParams?: Record<string, string>;
  body?: object;
}): Promise<TResponse> => {
  const url = new URL(`${META_GRAPH_API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method,
    headers: {
      ...(isDefined(accessToken)
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...(isDefined(body) ? { 'Content-Type': 'application/json' } : {}),
    },
    body: isDefined(body) ? JSON.stringify(body) : undefined,
  });

  const responseBody = (await response.json().catch(() => ({}))) as TResponse &
    MetaGraphErrorBody;

  if (!response.ok || isDefined(responseBody.error)) {
    throw new MetaGraphApiError(
      `Meta Graph API ${method} ${path} failed: ${responseBody.error?.message ?? response.statusText}`,
      responseBody.error?.code,
      response.status,
    );
  }

  return responseBody;
};
