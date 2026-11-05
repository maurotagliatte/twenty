import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { metaAuthorizeHandler } from 'src/logic-functions/meta-authorize';
import { metaCallbackHandler } from 'src/logic-functions/meta-callback';

const CALLBACK_PAYLOAD = {
  connectionProviderId: 'provider-id',
  connectionProviderName: 'meta',
  httpMethod: 'GET' as const,
  headers: {},
  body: null,
  rawBody: null,
};

const jsonResponse = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe('Meta connection flow', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', 'https://app.khard.cloud');
    vi.stubEnv('META_APP_ID', 'meta-app-id');
    vi.stubEnv('META_APP_SECRET', 'meta-app-secret');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends the bare callback as redirect_uri and Twenty state apart', async () => {
    const { authorizationUrl } = await metaAuthorizeHandler({
      connectionProviderId: 'provider-id',
      connectionProviderName: 'meta',
      callbackUrl:
        'https://app.khard.cloud/auth/apps/custom/callback?state=signed-state',
    });

    const url = new URL(authorizationUrl);

    expect(url.origin + url.pathname).toBe(
      'https://www.facebook.com/v23.0/dialog/oauth',
    );
    expect(url.searchParams.get('client_id')).toBe('meta-app-id');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'https://app.khard.cloud/auth/apps/custom/callback',
    );
    expect(url.searchParams.get('state')).toBe('signed-state');
    expect(url.searchParams.get('scope')).toContain('instagram_basic');
  });

  it('trades the code for a long-lived token and identifies the account', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: 'short-token' }))
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'long-token', expires_in: 5183944 }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: '1234', name: 'Khard' }));

    await expect(
      metaCallbackHandler({
        ...CALLBACK_PAYLOAD,
        queryStringParameters: { code: 'auth-code' },
      }),
    ).resolves.toEqual({
      externalAccountId: '1234',
      handle: 'Khard',
      accessToken: 'long-token',
    });

    const codeExchangeUrl = new URL(fetchMock.mock.calls[0][0]);

    expect(codeExchangeUrl.searchParams.get('redirect_uri')).toBe(
      'https://app.khard.cloud/auth/apps/custom/callback',
    );
    expect(codeExchangeUrl.searchParams.get('code')).toBe('auth-code');

    const longLivedExchangeUrl = new URL(fetchMock.mock.calls[1][0]);

    expect(longLivedExchangeUrl.searchParams.get('grant_type')).toBe(
      'fb_exchange_token',
    );
    expect(longLivedExchangeUrl.searchParams.get('fb_exchange_token')).toBe(
      'short-token',
    );
  });

  it('surfaces the error Meta redirected back with', async () => {
    await expect(
      metaCallbackHandler({
        ...CALLBACK_PAYLOAD,
        queryStringParameters: {
          error: 'access_denied',
          error_description: 'Permissions error',
        },
      }),
    ).rejects.toThrow('access_denied: Permissions error');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails when the Graph API rejects the code', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: { message: 'Invalid verification code' } }, 400),
    );

    await expect(
      metaCallbackHandler({
        ...CALLBACK_PAYLOAD,
        queryStringParameters: { code: 'stale-code' },
      }),
    ).rejects.toThrow('Invalid verification code');
  });
});
