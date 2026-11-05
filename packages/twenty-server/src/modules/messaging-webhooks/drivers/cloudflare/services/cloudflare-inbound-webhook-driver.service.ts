import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray, parseJson } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type CloudflareInboundEmailPayload } from 'src/modules/messaging-webhooks/drivers/cloudflare/types/cloudflare-inbound-email-payload.type';
import { type CloudflareWebhookHeaders } from 'src/modules/messaging-webhooks/drivers/cloudflare/types/cloudflare-webhook-headers.type';
import { verifyCloudflareEmailSignature } from 'src/modules/messaging-webhooks/drivers/cloudflare/utils/verify-cloudflare-email-signature.util';
import { InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { INBOUND_EMAIL_MESSAGE_SOURCE } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email-message-source.constant';

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

@Injectable()
export class CloudflareInboundWebhookDriverService {
  private readonly logger = new Logger(
    CloudflareInboundWebhookDriverService.name,
  );

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly inboundMailHandlerService: InboundMailHandlerService,
  ) {}

  async handle(
    rawBody: Buffer,
    headers: CloudflareWebhookHeaders,
  ): Promise<void> {
    this.assertSigned(rawBody, headers);

    const payload = parseJson<CloudflareInboundEmailPayload>(
      rawBody.toString('utf8'),
    );

    if (
      !isDefined(payload) ||
      !isNonEmptyString(payload.key) ||
      !isNonEmptyArray(payload.recipients)
    ) {
      throw new MessagingWebhookException(
        'Invalid Cloudflare inbound email payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD,
      );
    }

    await this.inboundMailHandlerService.handle({
      recipients: payload.recipients,
      subject: payload.subject ?? null,
      // The Worker parks the raw MIME in the inbound S3-compatible bucket (R2), as SES does
      message: {
        source: INBOUND_EMAIL_MESSAGE_SOURCE.SES_S3,
        reference: payload.key,
      },
      dedupeKey: payload.key,
    });
  }

  private assertSigned(
    rawBody: Buffer,
    { timestamp, signature }: CloudflareWebhookHeaders,
  ): void {
    const secret = this.twentyConfigService.get(
      'CLOUDFLARE_EMAIL_WEBHOOK_SECRET',
    );

    if (!isNonEmptyString(secret)) {
      throw new MessagingWebhookException(
        'CLOUDFLARE_EMAIL_WEBHOOK_SECRET is not configured',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_NOT_CONFIGURED,
      );
    }

    if (!isNonEmptyString(timestamp) || !isNonEmptyString(signature)) {
      throw new MessagingWebhookException(
        'Missing Cloudflare signature headers',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }

    const timestampSeconds = Number.parseInt(timestamp, 10);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      !Number.isFinite(timestampSeconds) ||
      Math.abs(nowSeconds - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS
    ) {
      throw new MessagingWebhookException(
        'Cloudflare webhook timestamp outside tolerance',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }

    if (
      !verifyCloudflareEmailSignature({ secret, timestamp, signature, rawBody })
    ) {
      this.logger.warn('Cloudflare webhook signature verification failed');

      throw new MessagingWebhookException(
        'Cloudflare webhook signature invalid',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE,
      );
    }
  }
}
