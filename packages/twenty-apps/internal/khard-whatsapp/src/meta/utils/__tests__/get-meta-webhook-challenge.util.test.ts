import { describe, expect, it } from 'vitest';

import { getMetaWebhookChallenge } from 'src/meta/utils/get-meta-webhook-challenge.util';

const VERIFY_TOKEN = 'verify-token';

describe('getMetaWebhookChallenge', () => {
  it('returns the challenge when Meta presents our verify token', () => {
    expect(
      getMetaWebhookChallenge({
        queryStringParameters: {
          'hub.mode': 'subscribe',
          'hub.verify_token': VERIFY_TOKEN,
          'hub.challenge': '1158201444',
        },
        verifyToken: VERIFY_TOKEN,
      }),
    ).toBe('1158201444');
  });

  it('refuses a wrong token, another mode or a missing challenge', () => {
    for (const queryStringParameters of [
      {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'guess',
        'hub.challenge': '1',
      },
      {
        'hub.mode': 'unsubscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': '1',
      },
      { 'hub.mode': 'subscribe', 'hub.verify_token': VERIFY_TOKEN },
      {},
    ]) {
      expect(
        getMetaWebhookChallenge({
          queryStringParameters,
          verifyToken: VERIFY_TOKEN,
        }),
      ).toBeNull();
    }
  });
});
