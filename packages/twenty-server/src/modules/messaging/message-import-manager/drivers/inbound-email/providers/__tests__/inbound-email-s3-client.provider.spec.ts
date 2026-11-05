import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InboundEmailS3ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/providers/inbound-email-s3-client.provider';

const createProvider = (values: Record<string, string | undefined>) =>
  new InboundEmailS3ClientProvider({
    get: (key: string) => values[key],
  } as unknown as TwentyConfigService);

const resolveBooleanOption = async (
  option: boolean | (() => Promise<boolean | undefined>),
): Promise<boolean | undefined> =>
  typeof option === 'function' ? option() : option;

const resolveEndpoint = async (
  option:
    | { protocol?: string; hostname?: string }
    | (() => Promise<{ protocol?: string; hostname?: string }>)
    | undefined,
) => (typeof option === 'function' ? option() : option);

describe('InboundEmailS3ClientProvider', () => {
  it('uses path-style requests when a custom S3 endpoint is configured', async () => {
    const provider = createProvider({
      STORAGE_S3_REGION: 'auto',
      STORAGE_S3_ENDPOINT: 'https://example.r2.cloudflarestorage.com',
      INBOUND_EMAIL_S3_BUCKET: 'khard-inbound',
    });

    const client = provider.getClient();

    await expect(
      resolveBooleanOption(
        client.config.forcePathStyle as
          | boolean
          | (() => Promise<boolean | undefined>),
      ),
    ).resolves.toBe(true);
    await expect(
      resolveEndpoint(
        client.config.endpoint as
          | { protocol?: string; hostname?: string }
          | (() => Promise<{ protocol?: string; hostname?: string }>)
          | undefined,
      ),
    ).resolves.toMatchObject({
      protocol: 'https:',
      hostname: 'example.r2.cloudflarestorage.com',
    });
  });

  it('keeps virtual-hosted style for AWS S3 when no endpoint is set', async () => {
    const provider = createProvider({
      STORAGE_S3_REGION: 'us-east-1',
      STORAGE_S3_NAME: 'twenty-inbound',
    });

    const client = provider.getClient();

    await expect(
      resolveBooleanOption(
        client.config.forcePathStyle as
          | boolean
          | (() => Promise<boolean | undefined>),
      ),
    ).resolves.toBe(false);
  });

  it('prefers the inbound bucket over the file-storage bucket', () => {
    const provider = createProvider({
      INBOUND_EMAIL_S3_BUCKET: 'khard-inbound',
      STORAGE_S3_NAME: 'twenty-files',
    });

    expect(provider.getBucket()).toBe('khard-inbound');
  });
});
