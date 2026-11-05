import { createHmac } from 'node:crypto';

export const signMetaWebhookBody = ({
  rawBody,
  appSecret,
}: {
  rawBody: string;
  appSecret: string;
}): string =>
  `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
