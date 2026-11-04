const ALLOWED_IMAGE_PROTOCOLS = new Set(['https:', 'http:']);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value);

export const toSafeImageUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    const url = new URL(value.trim());

    return ALLOWED_IMAGE_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};
