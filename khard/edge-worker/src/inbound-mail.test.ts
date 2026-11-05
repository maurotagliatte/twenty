import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildInboundObjectKey,
  buildWebhookRecipients,
  toAsciiObjectMetadata,
} from './inbound-mail.ts';

describe('toAsciiObjectMetadata', () => {
  it('percent-encodes a non-ASCII subject so R2 accepts it', () => {
    assert.equal(
      toAsciiObjectMetadata('Proposta com ação'),
      'Proposta%20com%20a%C3%A7%C3%A3o',
    );
  });
});

describe('buildInboundObjectKey', () => {
  it('keeps the same key when Email Routing retries the same message', () => {
    const input = {
      recipient: 'contato@cliente.com.br',
      messageId: '<abc+123@mail.example>',
      randomId: 'should-not-be-used',
    };

    assert.equal(buildInboundObjectKey(input), buildInboundObjectKey(input));
    assert.equal(
      buildInboundObjectKey(input),
      'cliente.com.br/abc+123@mail.example.eml',
    );
  });

  it('falls back to a random id when the message has no Message-ID', () => {
    assert.equal(
      buildInboundObjectKey({
        recipient: 'contato@cliente.com.br',
        messageId: null,
        randomId: '7b6c',
      }),
      'cliente.com.br/7b6c.eml',
    );
  });
});

describe('buildWebhookRecipients', () => {
  it('does not repeat the recipient when no route overrides it', () => {
    assert.deepEqual(
      buildWebhookRecipients({
        recipient: 'contato@cliente.com.br',
        channelAddress: 'contato@cliente.com.br',
      }),
      ['contato@cliente.com.br'],
    );
  });

  it('sends the channel address and the original recipient when they differ', () => {
    assert.deepEqual(
      buildWebhookRecipients({
        recipient: 'contato@cliente.com.br',
        channelAddress: 'ch_123@in.khard.cloud',
      }),
      ['ch_123@in.khard.cloud', 'contato@cliente.com.br'],
    );
  });
});
