import { useState } from 'react';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { IconArrowLeft } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AssetGrid } from 'src/front-components/components/AssetGrid';
import { CollectionCard } from 'src/front-components/components/CollectionCard';
import { GhostButton } from 'src/front-components/components/GhostButton';
import { PageContainer } from 'src/front-components/components/PageContainer';
import { StateMessage } from 'src/front-components/components/StateMessage';
import { useCollectionCards } from 'src/front-components/hooks/use-collection-cards';
import { usePaginatedAssets } from 'src/front-components/hooks/use-paginated-assets';
import { type DamCollectionCard } from 'src/front-components/types/dam-asset.types';
import { fetchDamCollectionAssetPage } from 'src/front-components/utils/fetch-dam-records';

const CollectionAssets = ({ collectionId }: { collectionId: string }) => {
  const { assets, isLoading, hasNextPage, errorMessage, loadMore, reload } =
    usePaginatedAssets(
      ({ client, after, includeBrand }) =>
        fetchDamCollectionAssetPage({
          client,
          collectionId,
          after,
          includeBrand,
        }),
      collectionId,
    );

  return (
    <AssetGrid
      assets={assets}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      errorMessage={errorMessage}
      emptyMessage="This collection has no assets yet."
      onLoadMore={loadMore}
      onRetry={reload}
    />
  );
};

export const CollectionGallery = () => {
  const theme = useTheme();
  const [contextRecordId] = useSelectedRecordIds();
  const isRecordContext = contextRecordId !== undefined;
  const { collections, isLoading, errorMessage } =
    useCollectionCards(!isRecordContext);
  const [openCollection, setOpenCollection] =
    useState<DamCollectionCard | null>(null);

  if (isRecordContext) {
    return (
      <PageContainer>
        <CollectionAssets collectionId={contextRecordId} />
      </PageContainer>
    );
  }

  if (openCollection !== null) {
    return (
      <PageContainer>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
          <GhostButton onClick={() => setOpenCollection(null)}>
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconArrowLeft size={14} />
              All collections
            </span>
          </GhostButton>
          <span
            style={{
              fontSize: theme.font.size.lg,
              fontWeight: theme.font.weight.semiBold,
              color: theme.font.color.primary,
            }}
          >
            {openCollection.name}
          </span>
        </div>
        <CollectionAssets collectionId={openCollection.id} />
      </PageContainer>
    );
  }

  if (errorMessage !== null) {
    return (
      <PageContainer>
        <StateMessage message={`Could not load collections: ${errorMessage}`} />
      </PageContainer>
    );
  }

  if (!isLoading && collections.length === 0) {
    return (
      <PageContainer>
        <StateMessage message="No collections yet. Create one from the Collections view to browse it here." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: theme.spacing[4],
        }}
      >
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onOpen={() => setOpenCollection(collection)}
          />
        ))}
      </div>
    </PageContainer>
  );
};
