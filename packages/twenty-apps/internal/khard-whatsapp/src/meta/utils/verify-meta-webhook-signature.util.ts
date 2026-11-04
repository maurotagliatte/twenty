import { timingSafeEqual } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { signMetaWebhookBody } from 'src/meta/utils/sign-meta-webhook-body.util';

export const verifyMetaWebhookSignature = ({
  signatureHeader,
  rawBody,
  appSecret,
}: {
  signatureHeader: string | undefined;
  rawBody: string | undefined;
  appSecret: string;
}): boolean => {
  if (!isNonEmptyString(signatureHeader) || !isDefined(rawBody)) {
    return false;
  }

  const expected = Buffer.from(signMetaWebhookBody({ rawBody, appSecret }));
  const received = Buffer.from(signatureHeader.trim().toLowerCase());

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
};
