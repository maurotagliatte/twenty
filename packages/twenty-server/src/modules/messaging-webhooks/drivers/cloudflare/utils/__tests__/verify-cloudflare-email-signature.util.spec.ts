import { createHmac } from 'crypto';

import { verifyCloudflareEmailSignature } from 'src/modules/messaging-webhooks/drivers/cloudflare/utils/verify-cloudflare-email-signature.util';

const SECRET = 'cloudflare-email-secret';

const sign = (timestamp: string, rawBody: Buffer, secret = SECRET) =>
  createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');

describe('verifyCloudflareEmailSignature', () => {
  const timestamp = '1700000000';
  const rawBody = Buffer.from('{"key":"cliente.com.br/2026-11-02/a.eml"}');

  it('should accept a signature computed with the shared secret', () => {
    expect(
      verifyCloudflareEmailSignature({
        secret: SECRET,
        timestamp,
        signature: sign(timestamp, rawBody),
        rawBody,
      }),
    ).toBe(true);
  });

  it('should reject a signature computed with another secret', () => {
    expect(
      verifyCloudflareEmailSignature({
        secret: SECRET,
        timestamp,
        signature: sign(timestamp, rawBody, 'other-secret'),
        rawBody,
      }),
    ).toBe(false);
  });

  it('should reject a signature replayed with another timestamp', () => {
    expect(
      verifyCloudflareEmailSignature({
        secret: SECRET,
        timestamp: '1700000001',
        signature: sign(timestamp, rawBody),
        rawBody,
      }),
    ).toBe(false);
  });

  it('should reject a malformed signature', () => {
    expect(
      verifyCloudflareEmailSignature({
        secret: SECRET,
        timestamp,
        signature: 'not-hex',
        rawBody,
      }),
    ).toBe(false);
  });
});
