import { timingSafeEqual } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

// Returns the challenge to echo when Meta verifies the callback URL, or null
// when the request does not carry our verify token.
export const getMetaWebhookChallenge = ({
  queryStringParameters,
  verifyToken,
}: {
  queryStringParameters: Record<string, string | undefined>;
  verifyToken: string;
}): string | null => {
  const mode = queryStringParameters['hub.mode'];
  const token = queryStringParameters['hub.verify_token'];
  const challenge = queryStringParameters['hub.challenge'];

  if (
    mode !== 'subscribe' ||
    !isNonEmptyString(token) ||
    !isNonEmptyString(challenge)
  ) {
    return null;
  }

  const expected = Buffer.from(verifyToken);
  const received = Buffer.from(token);

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  return challenge;
};
