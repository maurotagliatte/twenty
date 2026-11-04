import { createHmac } from 'node:crypto';

import { type RoutePayload } from 'twenty-sdk/define';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type WhatsappWebhookPayload } from 'src/meta/types/whatsapp-webhook-payload.type';

const mocks = vi.hoisted(() => ({ kvGet: vi.fn() }));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet },
  Response: class Response {
    constructor(
      readonly body: unknown,
      readonly init?: { status?: number },
    ) {}
  },
}));

const { whatsappWebhookResolverHandler } =
  await import('src/logic-functions/whatsapp-webhook-resolver');

const APP_SECRET = 'meta-app-secret';
const VERIFY_TOKEN = 'verify-token';

const routePayload = ({
  method = 'POST',
  body = null,
  signature,
  queryStringParameters = {},
}: {
  method?: 'GET' | 'POST';
  body?: WhatsappWebhookPayload | null;
  signature?: string;
  queryStringParameters?: Record<string, string>;
}): RoutePayload<WhatsappWebhookPayload> => {
  const rawBody = body === null ? undefined : JSON.stringify(body);

  return {
    headers: {
      'x-hub-signature-256':
        signature ??
        (rawBody === undefined
          ? undefined
          : `sha256=${createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}`),
    },
    queryStringParameters,
    pathParameters: {},
    body,
    rawBody,
    isBase64Encoded: false,
    requestContext: { http: { method, path: '/' } },
    userWorkspaceId: null,
  } as RoutePayload<WhatsappWebhookPayload>;
};

describe('whatsappWebhookResolverHandler', () => {
  beforeEach(() => {
    process.env.META_APP_SECRET = APP_SECRET;
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = VERIFY_TOKEN;
    mocks.kvGet.mockReset();
  });

  it('echoes the challenge of the verify-token handshake', async () => {
    await expect(
      whatsappWebhookResolverHandler(
        routePayload({
          method: 'GET',
          queryStringParameters: {
            'hub.mode': 'subscribe',
            'hub.verify_token': VERIFY_TOKEN,
            'hub.challenge': '42',
          },
        }),
      ),
    ).resolves.toMatchObject({ body: '42' });

    await expect(
      whatsappWebhookResolverHandler(
        routePayload({
          method: 'GET',
          queryStringParameters: {
            'hub.mode': 'subscribe',
            'hub.verify_token': 'wrong',
            'hub.challenge': '42',
          },
        }),
      ),
    ).resolves.toMatchObject({ init: { status: 403 } });
  });

  it('rejects an unsigned or forged delivery before reading the routing table', async () => {
    const body: WhatsappWebhookPayload = {
      object: 'whatsapp_business_account',
      entry: [],
    };

    await expect(
      whatsappWebhookResolverHandler(
        routePayload({ body, signature: 'sha256=00' }),
      ),
    ).resolves.toMatchObject({ init: { status: 401 } });
    expect(mocks.kvGet).not.toHaveBeenCalled();
  });

  it('fails closed when the app secret is not configured', async () => {
    delete process.env.META_APP_SECRET;

    await expect(
      whatsappWebhookResolverHandler(
        routePayload({
          body: { object: 'whatsapp_business_account', entry: [] },
        }),
      ),
    ).resolves.toMatchObject({ init: { status: 500 } });
  });

  it('acknowledges deliveries for numbers no workspace claims without dispatching', async () => {
    mocks.kvGet.mockResolvedValue(null);

    await expect(
      whatsappWebhookResolverHandler(
        routePayload({
          body: {
            object: 'whatsapp_business_account',
            entry: [
              {
                id: 'waba-1',
                changes: [
                  {
                    field: 'messages',
                    value: { metadata: { phone_number_id: 'phone-x' } },
                  },
                ],
              },
            ],
          },
        }),
      ),
    ).resolves.toMatchObject({
      body: { skipped: 'No workspace claims these numbers' },
    });
    expect(mocks.kvGet).toHaveBeenCalledWith(
      'whatsapp-phone-number-claim:phone-x',
      { scope: 'SERVER' },
    );
  });
});
