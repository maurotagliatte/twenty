import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type ThemeColor, useTheme } from 'twenty-ui/theme';

import { AssetThumbnail } from 'src/front-components/components/AssetThumbnail';
import { type DamAssetCard } from 'src/front-components/types/dam-asset.types';

type AssetCardProps = {
  asset: DamAssetCard;
};

export const AssetCard = ({ asset }: AssetCardProps) => {
  const theme = useTheme();

  const handleOpen = () => {
    void navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'damAsset',
      objectRecordId: asset.id,
    });
  };

  const subtitle = [asset.brandName, asset.categoryLabel ?? asset.kindLabel]
    .filter((part) => part !== null)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={handleOpen}
      title={asset.name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        overflow: 'hidden',
        background: theme.background.primary,
        border: `1px solid ${theme.border.color.medium}`,
        borderRadius: theme.border.radius.md,
        color: theme.font.color.primary,
        fontFamily: theme.font.family,
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: theme.background.tertiary,
          borderBottom: `1px solid ${theme.border.color.light}`,
          overflow: 'hidden',
        }}
      >
        <AssetThumbnail preview={asset.preview} alt={asset.name} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[1],
          padding: theme.spacing[2],
          minWidth: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontSize: theme.font.size.md,
            fontWeight: theme.font.weight.medium,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {asset.name}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[1],
            minWidth: 0,
          }}
        >
          {asset.statusLabel !== null && (
            <Tag color={(asset.statusColor ?? 'gray') as ThemeColor}>
              {asset.statusLabel}
            </Tag>
          )}
          <span
            style={{
              fontSize: theme.font.size.sm,
              color: theme.font.color.tertiary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </button>
  );
};
