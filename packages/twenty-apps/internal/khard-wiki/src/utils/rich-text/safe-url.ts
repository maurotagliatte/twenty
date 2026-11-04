const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const ALLOWED_IMAGE_PROTOCOLS = new Set(['https:', 'http:']);

const parseAbsoluteUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    return new URL(value.trim());
  } catch {
    return undefined;
  }
};

export const toSafeLinkUrl = (value: unknown): string | undefined => {
  const url = parseAbsoluteUrl(value);

  return url !== undefined && ALLOWED_LINK_PROTOCOLS.has(url.protocol)
    ? url.href
    : undefined;
};

export const toSafeImageUrl = (value: unknown): string | undefined => {
  const url = parseAbsoluteUrl(value);

  return url !== undefined && ALLOWED_IMAGE_PROTOCOLS.has(url.protocol)
    ? url.href
    : undefined;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OBJECT_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9]{0,62}$/;

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value);

export const isObjectNameSingular = (value: unknown): value is string =>
  typeof value === 'string' && OBJECT_NAME_PATTERN.test(value);
