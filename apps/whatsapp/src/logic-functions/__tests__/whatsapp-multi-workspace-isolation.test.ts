import { createHmac } from 'node:crypto';

import { type RoutePayload } from 'twenty-sdk/define';
import {
  type AppConnection,
  type AppMessageChannel,
  type IngestMessage,
} from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappWebhookPayload } from 'src/meta/types/whatsapp-webhook-payload.type';

// An in-memory stand-in for the platform, scoped by the workspace a run
// executes in, with the SERVER key claim rules of the real store.
const platform = vi.hoisted(() => {
  type Scope = { scope?: 'WORKSPACE' | 'SERVER' };

  const state = {
    currentWorkspaceId: '',
    serverKeys: new Map<string, string>(),
    workspaceKeys: new Map<string, unknown>(),
    connections: [] as (AppConnection & { workspaceId: string })[],
    channels: [] as (AppMessageChannel & { workspaceId: string })[],
    ingested: [] as {
      workspaceId: string;
      channelId: string;
      messages: IngestMessage[];
    }[],
    authFailures: [] as { workspaceId: string; connectionId: string }[],
  };

  const workspaceKey = (key: string) => `${state.currentWorkspaceId}:${key}`;

  const kv = {
    get: async (key: string, options?: Scope) =>
      (options?.scope === 'SERVER'
        ? state.serverKeys.get(key)
        : state.workspaceKeys.get(workspaceKey(key))) ?? null,
    set: async (key: string, value: unknown, options?: Scope) => {
      if (options?.scope !== 'SERVER') {
        state.workspaceKeys.set(workspaceKey(key), value);

        return;
      }

      const owner = state.serverKeys.get(key);

      if (owner !== undefined && owner !== state.currentWorkspaceId) {
        throw new Error(
          `Server key "${key}" is already claimed by another workspace`,
        );
      }

      state.serverKeys.set(key, state.currentWorkspaceId);
    },
    delete: async (key: string, options?: Scope) => {
      if (options?.scope !== 'SERVER') {
        return state.workspaceKeys.delete(workspaceKey(key));
      }

      if (state.serverKeys.get(key) !== state.currentWorkspaceId) {
        return false;
      }

      return state.serverKeys.delete(key);
    },
  };

  const inCurrentWorkspace = <TItem extends { workspaceId: string }>(
    items: TItem[],
  ) =>
    items.filter(({ workspaceId }) => workspaceId === state.currentWorkspaceId);

  return {
    state,
    module: {
      kv,
      Response: class Response {
        constructor(
          readonly body: unknown,
          readonly init?: { status?: number },
        ) {}
      },
      getConnection: async (id: string) => {
        const connection = inCurrentWorkspace(state.connections).find(
          (candidate) => candidate.id === id,
        );

        if (connection === undefined) {
          throw new Error(`Connection ${id} not found`);
        }

        return connection;
      },
      listConnections: async () => inCurrentWorkspace(state.connections),
      listMessageChannels: async (filter?: { connectedAccountId?: string }) =>
        inCurrentWorkspace(state.channels).filter(
          ({ connectedAccountId }) =>
            filter?.connectedAccountId === undefined ||
            connectedAccountId === filter.connectedAccountId,
        ),
      createMessageChannel: async (input: {
        connectedAccountId: string;
        handle: string;
      }) => {
        const channel = {
          id: `channel-${state.currentWorkspaceId}-${state.channels.length}`,
          handle: input.handle,
          displayName: null,
          visibility: 'SHARE_EVERYTHING',
          connectedAccountId: input.connectedAccountId,
          isSyncEnabled: true,
          participantHandleFieldUniversalIdentifier: null,
          messagingProviderUniversalIdentifier: null,
          workspaceId: state.currentWorkspaceId,
        } as AppMessageChannel & { workspaceId: string };

        state.channels.push(channel);

        return channel;
      },
      updateMessageChannel: async () => undefined,
      deleteMessageChannel: async () => undefined,
      ingestMessages: async ({
        messageChannelId,
        messages,
      }: {
        messageChannelId: string;
        messages: IngestMessage[];
      }) => {
        const channel = inCurrentWorkspace(state.channels).find(
          ({ id }) => id === messageChannelId,
        );

        if (channel === undefined) {
          throw new Error('Channel belongs to another workspace');
        }

        state.ingested.push({
          workspaceId: state.currentWorkspaceId,
          channelId: messageChannelId,
          messages,
        });

        return messages.map((message) => ({
          externalId: message.externalId,
          messageId: `message-${message.externalId}`,
          messageThreadId: `thread-${message.threadExternalId}`,
        }));
      },
      reportConnectionAuthFailure: async ({
        connectionId,
      }: {
        connectionId: string;
      }) => {
        state.authFailures.push({
          workspaceId: state.currentWorkspaceId,
          connectionId,
        });
      },
    },
  };
});

vi.mock('twenty-sdk/define', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => platform.module);

vi.mock('twenty-sdk/utils', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getServerRouteUrl: (universalIdentifier: string) =>
    `https://crm.example.com/webhooks/server/registration-id/${universalIdentifier}`,
}));

vi.mock('src/meta/utils/get-whatsapp-phone-number.util', () => ({
  getWhatsappPhoneNumber: async ({
    phoneNumberId,
  }: {
    phoneNumberId: string;
  }) => ({
    id: phoneNumberId,
    display_phone_number: PHONE_NUMBERS[phoneNumberId],
    verified_name: `Business ${phoneNumberId}`,
    platform_type: 'CLOUD_API',
  }),
}));

vi.mock('src/meta/utils/prepare-whatsapp-phone-number.util', () => ({
  prepareWhatsappPhoneNumber: async () => ({ hasRegistered: false }),
}));

const { whatsappOnConnectHandler } =
  await import('src/logic-functions/whatsapp-on-connect');
const { whatsappWebhookResolverHandler } =
  await import('src/logic-functions/whatsapp-webhook-resolver');
const { whatsappHandleWebhookEventHandler } =
  await import('src/logic-functions/whatsapp-handle-webhook-event');
const { whatsappSendMessageHandler } =
  await import('src/logic-functions/whatsapp-send-message');

const APP_SECRET = 'meta-app-secret';
const OWNER_WORKSPACE_ID = 'owner-workspace';
const WORKSPACE_A = 'workspace-a';
const WORKSPACE_B = 'workspace-b';

const PHONE_NUMBERS: Record<string, string> = {
  'phone-a': '+55 11 90000-0001',
  'phone-b': '+55 21 90000-0002',
};

const runIn = <TResult>(
  workspaceId: string,
  run: () => Promise<TResult>,
): Promise<TResult> => {
  platform.state.currentWorkspaceId = workspaceId;

  return run();
};

const addConnection = ({
  workspaceId,
  id,
  phoneNumberId,
  accessToken,
}: {
  workspaceId: string;
  id: string;
  phoneNumberId: string;
  accessToken: string;
}) => {
  platform.state.connections.push({
    id,
    workspaceId,
    externalAccountId: phoneNumberId,
    accessToken,
    providerType: 'custom',
  } as AppConnection & { workspaceId: string });
  platform.state.workspaceKeys.set(
    `${workspaceId}:whatsapp-phone-number-account:${phoneNumberId}`,
    { whatsappBusinessAccountId: `waba-of-${phoneNumberId}` },
  );
};

const inboundChange = (phoneNumberId: string, messageId: string) => ({
  field: 'messages',
  value: {
    messaging_product: 'whatsapp',
    metadata: {
      display_phone_number: PHONE_NUMBERS[phoneNumberId] ?? '+1 555 0100',
      phone_number_id: phoneNumberId,
    },
    contacts: [{ wa_id: '5511987654321', profile: { name: 'Ada' } }],
    messages: [
      {
        id: messageId,
        from: '5511987654321',
        timestamp: '1762243200',
        type: 'text',
        text: { body: `hello ${phoneNumberId}` },
      },
    ],
  },
});

const signedRoutePayload = (
  payload: WhatsappWebhookPayload,
): RoutePayload<WhatsappWebhookPayload> => {
  const rawBody = JSON.stringify(payload);

  return {
    headers: {
      'x-hub-signature-256': `sha256=${createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}`,
    },
    queryStringParameters: {},
    pathParameters: {},
    body: payload,
    rawBody,
    isBase64Encoded: false,
    requestContext: { http: { method: 'POST', path: '/' } },
    userWorkspaceId: null,
  } as RoutePayload<WhatsappWebhookPayload>;
};

const fetchMock = vi.fn();

describe('WhatsApp across two workspaces', () => {
  beforeEach(async () => {
    Object.assign(platform.state, {
      currentWorkspaceId: '',
      serverKeys: new Map(),
      workspaceKeys: new Map(),
      connections: [],
      channels: [],
      ingested: [],
      authFailures: [],
    });
    process.env.META_APP_SECRET = APP_SECRET;
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    addConnection({
      workspaceId: WORKSPACE_A,
      id: 'connection-a',
      phoneNumberId: 'phone-a',
      accessToken: 'token-a',
    });
    addConnection({
      workspaceId: WORKSPACE_B,
      id: 'connection-b',
      phoneNumberId: 'phone-b',
      accessToken: 'token-b',
    });

    await runIn(WORKSPACE_A, () =>
      whatsappOnConnectHandler({
        connectionProviderId: 'provider',
        connectionProviderName: 'whatsapp',
        connectedAccountId: 'connection-a',
      }),
    );
    await runIn(WORKSPACE_B, () =>
      whatsappOnConnectHandler({
        connectionProviderId: 'provider',
        connectionProviderName: 'whatsapp',
        connectedAccountId: 'connection-b',
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gives each workspace its own claim and channel', () => {
    expect(platform.state.serverKeys).toEqual(
      new Map([
        ['whatsapp-phone-number-claim:phone-a', WORKSPACE_A],
        ['whatsapp-phone-number-claim:phone-b', WORKSPACE_B],
      ]),
    );
    expect(
      platform.state.channels.map(({ workspaceId, handle }) => ({
        workspaceId,
        handle,
      })),
    ).toEqual([
      { workspaceId: WORKSPACE_A, handle: '+5511900000001' },
      { workspaceId: WORKSPACE_B, handle: '+5521900000002' },
    ]);
  });

  it('refuses to connect a number another workspace already routes', async () => {
    addConnection({
      workspaceId: WORKSPACE_B,
      id: 'connection-b-hijack',
      phoneNumberId: 'phone-a',
      accessToken: 'token-b',
    });

    await expect(
      runIn(WORKSPACE_B, () =>
        whatsappOnConnectHandler({
          connectionProviderId: 'provider',
          connectionProviderName: 'whatsapp',
          connectedAccountId: 'connection-b-hijack',
        }),
      ),
    ).rejects.toThrow('already connected to another Twenty workspace');

    expect(
      platform.state.serverKeys.get('whatsapp-phone-number-claim:phone-a'),
    ).toBe(WORKSPACE_A);
    expect(
      platform.state.channels.filter(
        ({ connectedAccountId }) =>
          connectedAccountId === 'connection-b-hijack',
      ),
    ).toEqual([]);
    expect(platform.state.authFailures).toEqual([
      { workspaceId: WORKSPACE_B, connectionId: 'connection-b-hijack' },
    ]);
  });

  it('splits one Meta delivery so each workspace only receives its own number', async () => {
    const result = await runIn(OWNER_WORKSPACE_ID, () =>
      whatsappWebhookResolverHandler(
        signedRoutePayload({
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'waba-of-phone-a',
              changes: [inboundChange('phone-a', 'wamid.A1')],
            },
            {
              id: 'waba-of-phone-b',
              changes: [
                inboundChange('phone-b', 'wamid.B1'),
                inboundChange('phone-unknown', 'wamid.X1'),
              ],
            },
          ],
        }),
      ),
    );

    expect(result).toEqual({
      workspaceId: WORKSPACE_A,
      targetLogicFunctionUniversalIdentifier:
        WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
      payload: {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'waba-of-phone-a',
            changes: [inboundChange('phone-a', 'wamid.A1')],
          },
        ],
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, forwardInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const forwardedPayload = JSON.parse(forwardInit.body as string);

    expect(forwardedPayload).toEqual({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba-of-phone-b',
          changes: [inboundChange('phone-b', 'wamid.B1')],
        },
      ],
    });

    // The platform lowercases forwarded header names.
    const forwardedHeaders = Object.fromEntries(
      Object.entries(forwardInit.headers as Record<string, string>).map(
        ([name, value]) => [name.toLowerCase(), value],
      ),
    );

    // The forwarded slice passes the same verification and now routes to B alone.
    const forwardedResult = await runIn(OWNER_WORKSPACE_ID, () =>
      whatsappWebhookResolverHandler({
        ...signedRoutePayload(forwardedPayload),
        headers: forwardedHeaders,
        rawBody: forwardInit.body as string,
      }),
    );

    expect(forwardedResult).toMatchObject({ workspaceId: WORKSPACE_B });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('ingests only into the channel of the workspace that owns the number', async () => {
    const payloadForA: WhatsappWebhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba-of-phone-a',
          changes: [inboundChange('phone-a', 'wamid.A1')],
        },
      ],
    };
    const misroutedPayloadForB: WhatsappWebhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba-of-phone-b',
          changes: [inboundChange('phone-b', 'wamid.B1')],
        },
      ],
    };

    await expect(
      runIn(WORKSPACE_A, () => whatsappHandleWebhookEventHandler(payloadForA)),
    ).resolves.toEqual({ ingestedMessageCount: 1, skipped: [] });

    await expect(
      runIn(WORKSPACE_A, () =>
        whatsappHandleWebhookEventHandler(misroutedPayloadForB),
      ),
    ).resolves.toEqual({
      ingestedMessageCount: 0,
      skipped: ['No connection for phone number phone-b'],
    });

    expect(
      platform.state.ingested.map(({ workspaceId, messages }) => ({
        workspaceId,
        externalIds: messages.map(({ externalId }) => externalId),
      })),
    ).toEqual([{ workspaceId: WORKSPACE_A, externalIds: ['wamid.A1'] }]);
  });

  it('sends with the token and number of the replying workspace only', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ messages: [{ id: 'wamid.OUT' }] })),
    );

    await expect(
      runIn(WORKSPACE_B, () =>
        whatsappSendMessageHandler({
          messagingProviderName: 'whatsapp-messaging',
          connectedAccountId: 'connection-b',
          messageChannelId: 'channel-workspace-b-1',
          threadExternalId: '5511987654321',
          text: 'Olá',
          idempotencyKey: 'idempotency-key',
          recipients: [],
        }),
      ),
    ).resolves.toMatchObject({ externalId: 'wamid.OUT' });

    const [url, init] = fetchMock.mock.calls[
      fetchMock.mock.calls.length - 1
    ] as [URL, RequestInit];

    expect(url.pathname).toMatch(/\/phone-b\/messages$/);
    expect(init.headers).toMatchObject({ Authorization: 'Bearer token-b' });

    await expect(
      runIn(WORKSPACE_B, () =>
        whatsappSendMessageHandler({
          messagingProviderName: 'whatsapp-messaging',
          connectedAccountId: 'connection-a',
          messageChannelId: 'channel-workspace-a-0',
          threadExternalId: '5511987654321',
          text: 'Olá',
          idempotencyKey: 'idempotency-key',
          recipients: [],
        }),
      ),
    ).rejects.toThrow('Connection connection-a not found');
  });
});
