import { IconBoxMultiple } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AssetThumbnail } from 'src/front-components/components/AssetThumbnail';
import { PreviewCard } from 'src/front-components/components/PreviewCard';
import { type DamCollectionCard } from 'src/front-components/types/dam-asset.types';
import { formatRelativeDate } from 'src/front-components/utils/format-relative-date';

type CollectionCardProps = {
  collection: DamCollectionCard;
  onOpen: () => void;
};

export const CollectionCard = ({ collection, onOpen }: CollectionCardProps) => {
  const theme = useTheme();
  const hasCover =
    collection.cover.kind === 'IMAGE' && collection.cover.url !== null;
  const mosaic = collection.samplePreviews.slice(0, 4);

  const sheet = hasCover ? (
    <AssetThumbnail preview={collection.cover} alt={collection.name} fit="cover" />
  ) : mosaic.length > 0 ? (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mosaic.length === 1 ? '1fr' : '1fr 1fr',
        gap: '2px',
        width: '100%',
        height: '100%',
      }}
    >
      {mosaic.map((preview, index) => (
        <AssetThumbnail
          key={`${preview.url}-${index}`}
          preview={preview}
          alt=""
          fit="cover"
        />
      ))}
    </div>
  ) : (
    <div
      style={{
        height: '82%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.font.color.tertiary,
      }}
    >
      <IconBoxMultiple size={32} stroke={1.5} />
    </div>
  );

  const details = [
    `${collection.assetCount} ${collection.assetCount === 1 ? 'asset' : 'assets'}`,
    collection.brandName,
    collection.updatedAt === null
      ? null
      : formatRelativeDate(collection.updatedAt),
  ].filter((part) => part !== null && part !== '');

  return (
    <PreviewCard
      tone={hasCover || mosaic.length > 0 ? 'gray' : 'iris'}
      icon={IconBoxMultiple}
      title={collection.name}
      subtitle={
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {details.join(' · ')}
        </span>
      }
      sheet={sheet}
      isStacked
      onOpen={onOpen}
    />
  );
};
