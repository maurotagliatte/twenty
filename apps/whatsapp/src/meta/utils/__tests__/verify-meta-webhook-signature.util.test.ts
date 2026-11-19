import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { verifyMetaWebhookSignature } from 'src/meta/utils/verify-meta-webhook-signature.util';

const APP_SECRET = 'meta-app-secret';
const RAW_BODY = '{"object":"whatsapp_business_account","entry":[]}';

const sign = (rawBody: string, secret = APP_SECRET): string =>
  `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;

describe('verifyMetaWebhookSignature', () => {
  it('accepts the signature Meta computes over the raw body', () => {
    expect(
      verifyMetaWebhookSignature({
        signatureHeader: sign(RAW_BODY),
        rawBody: RAW_BODY,
        appSecret: APP_SECRET,
      }),
    ).toBe(true);
  });

  it('rejects a body changed after signing', () => {
    expect(
      verifyMetaWebhookSignature({
        signatureHeader: sign(RAW_BODY),
        rawBody: RAW_BODY.replace('[]', '[{}]'),
        appSecret: APP_SECRET,
      }),
    ).toBe(false);
  });

  it('rejects a signature made with another secret', () => {
    expect(
      verifyMetaWebhookSignature({
        signatureHeader: sign(RAW_BODY, 'another-app-secret'),
        rawBody: RAW_BODY,
        appSecret: APP_SECRET,
      }),
    ).toBe(false);
  });

  it('rejects a missing header, a missing raw body and a bare digest', () => {
    const digest = sign(RAW_BODY).slice('sha256='.length);

    expect(
      verifyMetaWebhookSignature({
        signatureHeader: undefined,
        rawBody: RAW_BODY,
        appSecret: APP_SECRET,
      }),
    ).toBe(false);
    expect(
      verifyMetaWebhookSignature({
        signatureHeader: sign(RAW_BODY),
        rawBody: undefined,
        appSecret: APP_SECRET,
      }),
    ).toBe(false);
    expect(
      verifyMetaWebhookSignature({
        signatureHeader: digest,
        rawBody: RAW_BODY,
        appSecret: APP_SECRET,
      }),
    ).toBe(false);
  });
});
