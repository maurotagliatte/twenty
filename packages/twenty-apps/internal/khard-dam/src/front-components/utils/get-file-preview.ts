import { isNonEmptyString } from '@sniptt/guards';

import {
  type DamFilePreview,
  type DamFileValue,
  type FilePreviewKind,
} from 'src/front-components/types/dam-asset.types';

const PREVIEW_KIND_BY_EXTENSION: Record<string, FilePreviewKind> = {
  png: 'IMAGE',
  jpg: 'IMAGE',
  jpeg: 'IMAGE',
  gif: 'IMAGE',
  webp: 'IMAGE',
  avif: 'IMAGE',
  svg: 'IMAGE',
  bmp: 'IMAGE',
  ico: 'IMAGE',
  mp4: 'VIDEO',
  webm: 'VIDEO',
  mov: 'VIDEO',
  m4v: 'VIDEO',
  ogv: 'VIDEO',
  mp3: 'AUDIO',
  wav: 'AUDIO',
  ogg: 'AUDIO',
  m4a: 'AUDIO',
  aac: 'AUDIO',
  flac: 'AUDIO',
  pdf: 'PDF',
  doc: 'DOCUMENT',
  docx: 'DOCUMENT',
  odt: 'DOCUMENT',
  rtf: 'DOCUMENT',
  txt: 'DOCUMENT',
  md: 'DOCUMENT',
  ppt: 'PRESENTATION',
  pptx: 'PRESENTATION',
  key: 'PRESENTATION',
  odp: 'PRESENTATION',
  ttf: 'FONT',
  otf: 'FONT',
  woff: 'FONT',
  woff2: 'FONT',
  zip: 'ARCHIVE',
  rar: 'ARCHIVE',
  '7z': 'ARCHIVE',
  tar: 'ARCHIVE',
  gz: 'ARCHIVE',
};

const normalizeExtension = (value: string | null | undefined) => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const normalized = value.trim().replace(/^\./, '').toLowerCase();

  return isNonEmptyString(normalized) ? normalized : null;
};

export const getFileExtension = (file: DamFileValue): string | null => {
  const fromExtension = normalizeExtension(file.extension);

  if (fromExtension !== null) {
    return fromExtension;
  }

  const label = file.label ?? '';
  const dotIndex = label.lastIndexOf('.');

  return dotIndex > 0 ? normalizeExtension(label.slice(dotIndex + 1)) : null;
};

export const getFilePreviewKind = (
  extension: string | null,
): FilePreviewKind =>
  extension === null
    ? 'OTHER'
    : (PREVIEW_KIND_BY_EXTENSION[extension] ?? 'OTHER');

export const getFilePreview = (
  files: DamFileValue[] | null | undefined,
): DamFilePreview => {
  const firstFile = files?.[0];

  if (firstFile === undefined) {
    return { kind: 'OTHER', url: null, label: null, extension: null };
  }

  const extension = getFileExtension(firstFile);

  return {
    kind: getFilePreviewKind(extension),
    url: isNonEmptyString(firstFile.url) ? firstFile.url : null,
    label: isNonEmptyString(firstFile.label) ? firstFile.label : null,
    extension,
  };
};
