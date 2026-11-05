import { AppPath, navigate } from 'twenty-sdk/front-component';
import { IconColorSwatch } from 'twenty-ui/icon';
import { type ThemeColor, useTheme } from 'twenty-ui/theme';

import {
  AssetThumbnail,
  ICON_BY_PREVIEW_KIND,
} from 'src/front-components/components/AssetThumbnail';
import { PreviewCard } from 'src/front-components/components/PreviewCard';
import { SheetSkeleton } from 'src/front-components/components/SheetSkeleton';
import { type DamAssetCard } from 'src/front-components/types/dam-asset.types';
import { formatRelativeDate } from 'src/front-components/utils/format-relative-date';
import {
  getAssetPreviewTone,
  getEffectivePreviewKind,
} from 'src/front-components/utils/get-preview-tone';

type AssetCardProps = {
  asset: DamAssetCard;
};

const GRAPHIC_SHEET_BACKGROUND = '#ffffff';

export const AssetCard = ({ asset }: AssetCardProps) => {
  const theme = useTheme();
  const tone = getAssetPreviewTone(asset);
  const previewKind = getEffectivePreviewKind(asset);
  const isGraphic = tone === 'violet';
  const hasMedia =
    asset.preview.url !== null &&
    (asset.preview.kind === 'IMAGE' || asset.preview.kind === 'VIDEO');

  const handleOpen = () => {
    void navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'damAsset',
      objectRecordId: asset.id,
    });
  };

  const sheet = hasMedia ? (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: isGraphic ? '10% 12% 18%' : 0,
      }}
    >
      <AssetThumbnail
        preview={asset.preview}
        alt={asset.name}
        fit={isGraphic ? 'contain' : 'cover'}
      />
    </div>
  ) : previewKind === 'PDF' || previewKind === 'DOCUMENT' ? (
    <SheetSkeleton variant="document" caption={asset.preview.extension} />
  ) : previewKind === 'PRESENTATION' ? (
    <SheetSkeleton variant="slide" caption={asset.preview.extension} />
  ) : (
    <div style={{ height: '82%' }}>
      <AssetThumbnail preview={{ ...asset.preview, kind: previewKind }} alt={asset.name} />
    </div>
  );

  const details = [
    asset.brandName,
    asset.updatedAt === null ? null : formatRelativeDate(asset.updatedAt),
  ].filter((part) => part !== null && part !== '');

  return (
    <PreviewCard
      tone={tone}
      icon={isGraphic ? IconColorSwatch : ICON_BY_PREVIEW_KIND[previewKind]}
      title={asset.name}
      sheet={sheet}
      sheetBackground={isGraphic && hasMedia ? GRAPHIC_SHEET_BACKGROUND : undefined}
      isStacked={!hasMedia}
      onOpen={handleOpen}
      subtitle={
        <>
          {asset.statusLabel !== null && (
            <>
              <span
                aria-hidden="true"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background:
                    theme.color[(asset.statusColor ?? 'gray') as ThemeColor],
                }}
              />
              <span>{asset.statusLabel}</span>
            </>
          )}
          {details.length > 0 && (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {asset.statusLabel !== null ? '· ' : ''}
              {details.join(' · ')}
            </span>
          )}
        </>
      }
    />
  );
};
