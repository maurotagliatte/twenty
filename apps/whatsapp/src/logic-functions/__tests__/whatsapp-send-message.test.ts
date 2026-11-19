import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MetaGraphApiError } from 'src/meta/utils/meta-graph-api.error';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  reportConnectionAuthFailure: vi.fn(),
  sendWhatsappTextMessage: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
  reportConnectionAuthFailure: mocks.reportConnectionAuthFailure,
}));

vi.mock('src/meta/utils/send-whatsapp-text-message.util', () => ({
  sendWhatsappTextMessage: mocks.sendWhatsappTextMessage,
}));

const { whatsappSendMessageHandler } =
  await import('src/logic-functions/whatsapp-send-message');

const PAYLOAD = {
  messagingProviderName: 'whatsapp-messaging',
  connectedAccountId: 'connection-a',
  messageChannelId: 'channel-a',
  threadExternalId: '5511987654321',
  text: 'Olá',
  idempotencyKey: 'key',
  recipients: [],
};

describe('whatsappSendMessageHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getConnection.mockResolvedValue({
      id: 'connection-a',
      externalAccountId: 'phone-a',
      accessToken: 'token-a',
    });
  });

  it('replies to the thread customer from the connected number', async () => {
    mocks.sendWhatsappTextMessage.mockResolvedValue('wamid.OUT');

    await expect(whatsappSendMessageHandler(PAYLOAD)).resolves.toMatchObject({
      externalId: 'wamid.OUT',
    });
    expect(mocks.sendWhatsappTextMessage).toHaveBeenCalledWith({
      phoneNumberId: 'phone-a',
      accessToken: 'token-a',
      to: '5511987654321',
      text: 'Olá',
    });
  });

  it('flags the connection when Meta rejects the token', async () => {
    mocks.sendWhatsappTextMessage.mockRejectedValue(
      new MetaGraphApiError('invalid token', 190, 401),
    );

    await expect(whatsappSendMessageHandler(PAYLOAD)).rejects.toThrow(
      'invalid token',
    );
    expect(mocks.reportConnectionAuthFailure).toHaveBeenCalledWith(
      expect.objectContaining({ connectionId: 'connection-a' }),
    );
  });

  it('explains the 24-hour window without flagging the connection', async () => {
    mocks.sendWhatsappTextMessage.mockRejectedValue(
      new MetaGraphApiError('Re-engagement message', 131047, 400),
    );

    await expect(whatsappSendMessageHandler(PAYLOAD)).rejects.toThrow(
      'within 24 hours',
    );
    expect(mocks.reportConnectionAuthFailure).not.toHaveBeenCalled();
  });

  it('refuses a connection that never finished signup', async () => {
    mocks.getConnection.mockResolvedValue({
      id: 'connection-a',
      externalAccountId: 'phone-a',
      accessToken: null,
    });

    await expect(whatsappSendMessageHandler(PAYLOAD)).rejects.toThrow(
      'has no phone number or token',
    );
    expect(mocks.sendWhatsappTextMessage).not.toHaveBeenCalled();
  });
});
