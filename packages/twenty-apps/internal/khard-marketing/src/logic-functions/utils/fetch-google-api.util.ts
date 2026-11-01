type GoogleApiError = {
  error?: { message?: string; status?: string };
};

export const fetchGoogleApi = async <TResponse>({
  url,
  accessToken,
}: {
  url: string;
  accessToken: string;
}): Promise<TResponse> => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = (await response.json()) as TResponse & GoogleApiError;

  if (!response.ok) {
    throw new Error(body.error?.message ?? response.statusText);
  }

  return body;
};
