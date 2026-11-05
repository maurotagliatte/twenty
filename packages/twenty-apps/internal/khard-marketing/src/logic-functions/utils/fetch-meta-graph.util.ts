import { META_GRAPH_API_BASE_URL } from 'src/constants/meta-graph-api.constant';

type MetaGraphError = {
  error?: { message?: string; type?: string; code?: number };
};

export const fetchMetaGraph = async <TResponse>(
  path: string,
  searchParams: Record<string, string>,
): Promise<TResponse> => {
  const url = new URL(`${META_GRAPH_API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  const body = (await response.json()) as TResponse & MetaGraphError;

  if (!response.ok || body.error !== undefined) {
    throw new Error(
      `Meta Graph API ${path} failed: ${body.error?.message ?? response.statusText}`,
    );
  }

  return body;
};
