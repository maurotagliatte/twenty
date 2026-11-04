import { isNonEmptyString } from '@sniptt/guards';

export type BrandColor = { hex: string | null; label: string };

export type BrandFont = { family: string; role: string | null };

const HEX_COLOR_PATTERN = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/i;

export const parseBrandColor = (value: string): BrandColor | null => {
  const trimmed = value.trim();

  if (!isNonEmptyString(trimmed)) {
    return null;
  }

  const match = trimmed.match(HEX_COLOR_PATTERN);

  if (match === null) {
    return { hex: null, label: trimmed };
  }

  const hex = match[0].toUpperCase();
  const label = trimmed
    .replace(match[0], '')
    .replace(/\(\s*\)/g, '')
    .replace(/^[\s:,\-|]+|[\s:,\-|]+$/g, '');

  return { hex, label: isNonEmptyString(label) ? label : hex };
};

export const parseBrandColors = (values: string[] | null | undefined) =>
  (values ?? [])
    .map(parseBrandColor)
    .filter((color): color is BrandColor => color !== null);

export const parseBrandFont = (value: string): BrandFont | null => {
  const trimmed = value.trim();

  if (!isNonEmptyString(trimmed)) {
    return null;
  }

  const match = trimmed.match(/^(.*?)\s*\(([^)]*)\)\s*$/);

  if (match === null || !isNonEmptyString(match[1].trim())) {
    return { family: trimmed, role: null };
  }

  const role = match[2].trim();

  return {
    family: match[1].trim(),
    role: isNonEmptyString(role) ? role : null,
  };
};

export const parseBrandFonts = (values: string[] | null | undefined) =>
  (values ?? [])
    .map(parseBrandFont)
    .filter((font): font is BrandFont => font !== null);
