import { createHmac, timingSafeEqual } from 'crypto';

// The Worker signs `${timestamp}.${body}` with HMAC-SHA256 and sends it hex-encoded
export const verifyCloudflareEmailSignature = ({
  secret,
  timestamp,
  signature,
  rawBody,
}: {
  secret: string;
  timestamp: string;
  signature: string;
  rawBody: Buffer;
}): boolean => {
  const expectedSignature = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest();

  const candidateSignature = Buffer.from(signature, 'hex');

  return (
    candidateSignature.length === expectedSignature.length &&
    timingSafeEqual(candidateSignature, expectedSignature)
  );
};
