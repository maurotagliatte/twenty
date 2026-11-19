import { describe, expect, it } from 'vitest';

import { mapWhatsappMessageToIngestMessage } from 'src/logic-functions/utils/map-whatsapp-message-to-ingest-message.util';

const CHANNEL_HANDLE = '+5511900000001';
const CONTACTS = [{ wa_id: '5511987654321', profile: { name: 'Ada' } }];

describe('mapWhatsappMessageToIngestMessage', () => {
  it('maps an inbound text to a message from the customer in their thread', () => {
    expect(
      mapWhatsappMessageToIngestMessage({
        message: {
          id: 'wamid.IN1',
          from: '5511987654321',
          timestamp: '1762243200',
          type: 'text',
          text: { body: 'Oi, quero um orçamento' },
        },
        contacts: CONTACTS,
        channelHandle: CHANNEL_HANDLE,
      }),
    ).toEqual({
      externalId: 'wamid.IN1',
      threadExternalId: '5511987654321',
      text: 'Oi, quero um orçamento',
      receivedAt: new Date(1762243200 * 1000),
      participants: [
        { role: 'FROM', handle: '+5511987654321', displayName: 'Ada' },
        { role: 'TO', handle: CHANNEL_HANDLE },
      ],
    });
  });

  it('describes media and replies it cannot store verbatim', () => {
    const map = (message: Record<string, unknown>) =>
      mapWhatsappMessageToIngestMessage({
        message: {
          id: 'wamid.X',
          from: '5511987654321',
          timestamp: '1762243200',
          ...message,
        } as Parameters<typeof mapWhatsappMessageToIngestMessage>[0]['message'],
        contacts: [],
        channelHandle: CHANNEL_HANDLE,
      })?.text;

    expect(map({ type: 'image', image: { caption: 'fachada' } })).toBe(
      '[image] fachada',
    );
    expect(map({ type: 'audio', audio: {} })).toBe('[audio]');
    expect(
      map({
        type: 'interactive',
        interactive: { button_reply: { title: 'Sim' } },
      }),
    ).toBe('Sim');
    expect(map({ type: 'location', location: { name: 'Loja' } })).toBe(
      '[location] Loja',
    );
  });

  it('skips reactions, unsupported types and malformed messages', () => {
    const base = {
      id: 'wamid.X',
      from: '5511987654321',
      timestamp: '1762243200',
    };

    expect(
      mapWhatsappMessageToIngestMessage({
        message: { ...base, type: 'reaction' },
        contacts: [],
        channelHandle: CHANNEL_HANDLE,
      }),
    ).toBeNull();
    expect(
      mapWhatsappMessageToIngestMessage({
        message: { ...base, type: 'text', text: { body: '' } },
        contacts: [],
        channelHandle: CHANNEL_HANDLE,
      }),
    ).toBeNull();
    expect(
      mapWhatsappMessageToIngestMessage({
        message: {
          ...base,
          timestamp: 'not-a-number',
          type: 'text',
          text: { body: 'x' },
        },
        contacts: [],
        channelHandle: CHANNEL_HANDLE,
      }),
    ).toBeNull();
  });
});
