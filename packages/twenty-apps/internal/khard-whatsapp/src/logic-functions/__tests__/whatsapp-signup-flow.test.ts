import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  listConnections: vi.fn(),
  exchangeEmbeddedSignupCode: vi.fn(),
  listGrantedWhatsappBusinessAccountIds: vi.fn(),
  listWhatsappPhoneNumbers: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet, set: mocks.kvSet },
  listConnections: mocks.listConnections,
  Response: class Response {
    constructor(
      readonly body: unknown,
      readonly init?: { status?: number; headers?: Record<string, string> },
    ) {}
  },
}));

vi.mock('twenty-sdk/utils', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getServerRouteUrl: (universalIdentifier: string) =>
    `https://crm.example.com/webhooks/server/registration-id/${universalIdentifier}`,
}));

vi.mock('src/meta/utils/exchange-embedded-signup-code.util', () => ({
  exchangeEmbeddedSignupCode: mocks.exchangeEmbeddedSignupCode,
}));

vi.mock(
  'src/meta/utils/list-granted-whatsapp-business-account-ids.util',
  () => ({
    listGrantedWhatsappBusinessAccountIds:
      mocks.listGrantedWhatsappBusinessAccountIds,
  }),
);

vi.mock('src/meta/utils/list-whatsapp-phone-numbers.util', () => ({
  listWhatsappPhoneNumbers: mocks.listWhatsappPhoneNumbers,
}));

const { whatsappAuthorizeHandler } =
  await import('src/logic-functions/whatsapp-authorize');
const { whatsappCallbackHandler } =
  await import('src/logic-functions/whatsapp-callback');
const { whatsappSignupPageHandler } =
  await import('src/logic-functions/whatsapp-signup-page');
const { WHATSAPP_SIGNUP_PAGE_UNIVERSAL_IDENTIFIER } =
  await import('src/constants/universal-identifiers');

const CALLBACK_PAYLOAD = {
  connectionProviderId: 'provider',
  connectionProviderName: 'whatsapp',
  httpMethod: 'GET' as const,
  headers: {},
  body: null,
  rawBody: null,
};

const PHONE_1 = {
  id: 'phone-1',
  display_phone_number: '+55 11 90000-0001',
  verified_name: 'Loja Ada',
};
const PHONE_2 = { id: 'phone-2', display_phone_number: '+55 11 90000-0002' };

describe('WhatsApp Embedded Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TWENTY_API_URL = 'https://crm.example.com';
    process.env.META_APP_ID = '1234567890';
    process.env.META_APP_SECRET = 'meta-app-secret';
    process.env.WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID = 'config-1';
    mocks.listConnections.mockResolvedValue([]);
    mocks.exchangeEmbeddedSignupCode.mockResolvedValue('business-token');
    mocks.listGrantedWhatsappBusinessAccountIds.mockResolvedValue(['waba-1']);
    mocks.listWhatsappPhoneNumbers.mockResolvedValue([PHONE_1]);
    mocks.kvGet.mockResolvedValue(null);
  });

  it('sends the member to the signup page with only the Twenty state', async () => {
    const { authorizationUrl } = await whatsappAuthorizeHandler({
      connectionProviderId: 'provider',
      connectionProviderName: 'whatsapp',
      callbackUrl:
        'https://crm.example.com/auth/apps/custom/callback?state=signed-state',
    });

    const url = new URL(authorizationUrl);

    expect(url.origin + url.pathname).toBe(
      `https://crm.example.com/webhooks/server/registration-id/${WHATSAPP_SIGNUP_PAGE_UNIVERSAL_IDENTIFIER}`,
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      state: 'signed-state',
    });
  });

  it('refuses to start when the admin has not configured Meta', async () => {
    delete process.env.WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID;

    await expect(
      whatsappAuthorizeHandler({
        connectionProviderId: 'provider',
        connectionProviderName: 'whatsapp',
        callbackUrl:
          'https://crm.example.com/auth/apps/custom/callback?state=signed-state',
      }),
    ).rejects.toThrow('WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID is not set');
  });

  it('renders the signup page from instance configuration only', async () => {
    process.env.WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID = 'config-1</script>';

    const response = (await whatsappSignupPageHandler()) as unknown as {
      body: string;
      init: { headers: Record<string, string> };
    };

    expect(response.init.headers['content-type']).toBe(
      'text/html; charset=utf-8',
    );
    expect(response.body).toContain(
      '"callbackUrl":"https://crm.example.com/auth/apps/custom/callback"',
    );
    expect(response.body).toContain('config-1\\u003c/script>');
    expect(response.body).not.toContain('config-1</script>');
    expect(response.body).not.toContain('meta-app-secret');

    const inlineScript = response.body.match(
      /<script>([\s\S]*?)<\/script>/,
    )?.[1];

    expect(() => new Function(inlineScript ?? 'throw 1')).not.toThrow();
  });

  it('stores the business token on the connection and the WABA in workspace storage', async () => {
    await expect(
      whatsappCallbackHandler({
        ...CALLBACK_PAYLOAD,
        queryStringParameters: {
          code: 'signup-code',
          waba_id: 'waba-1',
          phone_number_id: 'phone-1',
        },
      }),
    ).resolves.toEqual({
      externalAccountId: 'phone-1',
      handle: 'Loja Ada (+55 11 90000-0001)',
      accessToken: 'business-token',
    });

    expect(mocks.exchangeEmbeddedSignupCode).toHaveBeenCalledWith({
      code: 'signup-code',
      appId: '1234567890',
      appSecret: 'meta-app-secret',
    });
    expect(mocks.kvSet).toHaveBeenCalledWith(
      'whatsapp-phone-number-account:phone-1',
      { whatsappBusinessAccountId: 'waba-1' },
    );
    expect(mocks.kvSet).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { scope: 'SERVER' },
    );
  });

  it('uses the session info to pick among several numbers of the WABA', async () => {
    mocks.listWhatsappPhoneNumbers.mockResolvedValue([PHONE_1, PHONE_2]);

    await expect(
      whatsappCallbackHandler({
        ...CALLBACK_PAYLOAD,
        queryStringParameters: {
          code: 'signup-code',
          waba_id: 'waba-1',
          phone_number_id: 'phone-2',
        },
      }),
    ).resolves.toMatchObject({ externalAccountId: 'phone-2' });
  });

  it('ignores browser session info the token was not granted', async () => {
    await expect(
      whatsappCallbackHandler({
        ...CALLBACK_PAYLOAD,
        queryStringParameters: {
          code: 'signup-code',
          waba_id: 'waba-of-someone-else',
          phone_number_id: 'phone-of-someone-else',
        },
      }),
    ).rejects.toThrow('Meta shared no WhatsApp number');
    expect(mocks.listWhatsappPhoneNumbers).not.toHaveBeenCalled();
    expect(mocks.kvSet).not.toHaveBeenCalled();
  });

  it('surfaces the error the signup page reported and skips the token exchange', async () => {
    await expect(
      whatsappCallbackHandler({
        ...CALLBACK_PAYLOAD,
        queryStringParameters: {
          error: 'access_denied',
          error_description: 'WhatsApp signup was not finished',
        },
      }),
    ).rejects.toThrow('access_denied: WhatsApp signup was not finished');
    expect(mocks.exchangeEmbeddedSignupCode).not.toHaveBeenCalled();
  });
});
