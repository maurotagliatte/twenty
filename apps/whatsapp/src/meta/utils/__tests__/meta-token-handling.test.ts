import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { exchangeEmbeddedSignupCode } from 'src/meta/utils/exchange-embedded-signup-code.util';
import { listGrantedWhatsappBusinessAccountIds } from 'src/meta/utils/list-granted-whatsapp-business-account-ids.util';
import { MetaGraphApiError } from 'src/meta/utils/meta-graph-api.error';
import { sendWhatsappTextMessage } from 'src/meta/utils/send-whatsapp-text-message.util';

const APP_ID = '1234567890';
const APP_SECRET = 'meta-app-secret';
const BUSINESS_TOKEN = 'business-token-of-workspace-a';

const fetchMock = vi.fn();

const respondWith = (body: unknown, status = 200) =>
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  );

const lastRequest = (): { url: URL; init: RequestInit } => {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [
    URL,
    RequestInit,
  ];

  return { url, init };
};

describe('Meta token handling', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('trades the JavaScript SDK signup code without a redirect URI', async () => {
    respondWith({ access_token: BUSINESS_TOKEN, token_type: 'bearer' });

    await expect(
      exchangeEmbeddedSignupCode({
        code: 'signup-code',
        appId: APP_ID,
        appSecret: APP_SECRET,
      }),
    ).resolves.toBe(BUSINESS_TOKEN);

    const { url, init } = lastRequest();

    expect(url.pathname).toMatch(/\/oauth\/access_token$/);
    expect(url.searchParams.has('redirect_uri')).toBe(false);
    expect(url.searchParams.get('code')).toBe('signup-code');
    expect(init.headers).toEqual({});
  });

  it('rejects an exchange that returns no token', async () => {
    respondWith({ token_type: 'bearer' });

    await expect(
      exchangeEmbeddedSignupCode({
        code: 'expired-code',
        appId: APP_ID,
        appSecret: APP_SECRET,
      }),
    ).rejects.toThrow('Meta returned no access token');
  });

  it('lists the WABAs the token was granted, once each', async () => {
    respondWith({
      data: {
        app_id: APP_ID,
        is_valid: true,
        granular_scopes: [
          { scope: 'whatsapp_business_management', target_ids: ['waba-1'] },
          {
            scope: 'whatsapp_business_messaging',
            target_ids: ['waba-1', 'waba-2'],
          },
          { scope: 'whatsapp_business_management', target_ids: ['waba-1'] },
        ],
      },
    });

    await expect(
      listGrantedWhatsappBusinessAccountIds({
        accessToken: BUSINESS_TOKEN,
        appId: APP_ID,
        appSecret: APP_SECRET,
      }),
    ).resolves.toEqual(['waba-1']);

    const { url, init } = lastRequest();

    expect(url.searchParams.get('input_token')).toBe(BUSINESS_TOKEN);
    expect(url.searchParams.has('access_token')).toBe(false);
    expect(init.headers).toEqual({
      Authorization: `Bearer ${APP_ID}|${APP_SECRET}`,
    });
  });

  it('refuses a token issued to another Meta app or no longer valid', async () => {
    respondWith({ data: { app_id: '999', is_valid: true } });

    await expect(
      listGrantedWhatsappBusinessAccountIds({
        accessToken: BUSINESS_TOKEN,
        appId: APP_ID,
        appSecret: APP_SECRET,
      }),
    ).rejects.toThrow('Meta did not confirm the signup token for this app');

    respondWith({ data: { app_id: APP_ID, is_valid: false } });

    await expect(
      listGrantedWhatsappBusinessAccountIds({
        accessToken: BUSINESS_TOKEN,
        appId: APP_ID,
        appSecret: APP_SECRET,
      }),
    ).rejects.toThrow('Meta did not confirm the signup token for this app');
  });

  it('sends with the connection token in the header and surfaces Meta error codes without the token', async () => {
    respondWith({ messages: [{ id: 'wamid.OUT' }] });

    await expect(
      sendWhatsappTextMessage({
        phoneNumberId: 'phone-a',
        accessToken: BUSINESS_TOKEN,
        to: '5511987654321',
        text: 'Olá',
      }),
    ).resolves.toBe('wamid.OUT');

    const { url, init } = lastRequest();

    expect(url.pathname).toMatch(/\/phone-a\/messages$/);
    expect(url.search).toBe('');
    expect(init.headers).toMatchObject({
      Authorization: `Bearer ${BUSINESS_TOKEN}`,
    });
    expect(JSON.parse(init.body as string)).toEqual({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '5511987654321',
      type: 'text',
      text: { body: 'Olá', preview_url: false },
    });

    respondWith(
      { error: { message: 'Error validating access token', code: 190 } },
      401,
    );

    const error = await sendWhatsappTextMessage({
      phoneNumberId: 'phone-a',
      accessToken: BUSINESS_TOKEN,
      to: '5511987654321',
      text: 'Olá',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(MetaGraphApiError);
    expect((error as MetaGraphApiError).code).toBe(190);
    expect((error as MetaGraphApiError).message).not.toContain(BUSINESS_TOKEN);
  });
});
