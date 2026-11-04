import { useState } from 'react';
import {
  IconFile,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconPresentation,
  IconTypography,
  IconVideo,
  type IconComponent,
} from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import {
  type DamFilePreview,
  type FilePreviewKind,
} from 'src/front-components/types/dam-asset.types';

const ICON_BY_PREVIEW_KIND: Record<FilePreviewKind, IconComponent> = {
  IMAGE: IconPhoto,
  VIDEO: IconVideo,
  AUDIO: IconHeadphones,
  PDF: IconFileText,
  DOCUMENT: IconFileText,
  PRESENTATION: IconPresentation,
  FONT: IconTypography,
  ARCHIVE: IconFileZip,
  OTHER: IconFile,
};

type AssetThumbnailProps = {
  preview: DamFilePreview;
  alt: string;
  fit?: 'cover' | 'contain';
};

export const AssetThumbnail = ({
  preview,
  alt,
  fit = 'contain',
}: AssetThumbnailProps) => {
  const theme = useTheme();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const canRenderMedia = preview.url !== null && preview.url !== failedUrl;
  const mediaStyle = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    display: 'block',
  } as const;

  if (canRenderMedia && preview.kind === 'IMAGE') {
    return (
      <img
        src={preview.url ?? undefined}
        alt={alt}
        style={mediaStyle}
        onError={() => setFailedUrl(preview.url)}
      />
    );
  }

  if (canRenderMedia && preview.kind === 'VIDEO') {
    return (
      <video
        src={`${preview.url}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        style={mediaStyle}
        onError={() => setFailedUrl(preview.url)}
      />
    );
  }

  const Icon = ICON_BY_PREVIEW_KIND[preview.kind];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing[1],
        color: theme.font.color.tertiary,
      }}
    >
      <Icon size={32} stroke={1.5} />
      {preview.extension !== null && (
        <span
          style={{
            fontSize: theme.font.size.xs,
            fontWeight: theme.font.weight.medium,
            textTransform: 'uppercase',
          }}
        >
          {preview.extension}
        </span>
      )}
    </div>
  );
};
