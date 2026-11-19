import { type FilePreviewKind } from 'src/front-components/types/dam-asset.types';

export type PreviewTone =
  | 'gray'
  | 'violet'
  | 'blue'
  | 'tomato'
  | 'orange'
  | 'amber'
  | 'jade'
  | 'brown'
  | 'iris';

const TONE_BY_PREVIEW_KIND: Record<FilePreviewKind, PreviewTone> = {
  IMAGE: 'gray',
  VIDEO: 'tomato',
  AUDIO: 'amber',
  PDF: 'blue',
  DOCUMENT: 'blue',
  PRESENTATION: 'orange',
  FONT: 'jade',
  ARCHIVE: 'brown',
  OTHER: 'gray',
};

const GRAPHIC_CATEGORIES = new Set(['LOGO', 'ICON', 'ILLUSTRATION']);

// Logos and vectors sit on a light sheet, so they are framed apart from photos.
export const isGraphicAsset = ({
  kind,
  category,
  extension,
}: {
  kind: string | null;
  category: string | null;
  extension: string | null;
}) =>
  kind === 'VECTOR' ||
  extension === 'svg' ||
  (category !== null && GRAPHIC_CATEGORIES.has(category));

const isFilePreviewKind = (value: string): value is FilePreviewKind =>
  value in TONE_BY_PREVIEW_KIND;

type ToneInput = {
  kind: string | null;
  category: string | null;
  preview: { kind: FilePreviewKind; extension: string | null };
};

// Without a file the asset's declared kind is the only hint of what it will be.
export const getEffectivePreviewKind = ({
  kind,
  preview,
}: ToneInput): FilePreviewKind =>
  preview.extension === null && kind !== null && isFilePreviewKind(kind)
    ? kind
    : preview.kind;

export const getAssetPreviewTone = (asset: ToneInput): PreviewTone => {
  if (
    asset.kind === 'VECTOR' ||
    (asset.preview.kind === 'IMAGE' &&
      isGraphicAsset({ ...asset, extension: asset.preview.extension }))
  ) {
    return 'violet';
  }

  return TONE_BY_PREVIEW_KIND[getEffectivePreviewKind(asset)];
};
