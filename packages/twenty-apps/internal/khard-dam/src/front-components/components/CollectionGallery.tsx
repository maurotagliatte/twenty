import { AssetGrid } from 'src/front-components/components/AssetGrid';
import { FilterSelect } from 'src/front-components/components/FilterSelect';
import { PageContainer } from 'src/front-components/components/PageContainer';
import { StateMessage } from 'src/front-components/components/StateMessage';
import { useNamedRecords } from 'src/front-components/hooks/use-named-records';
import { usePaginatedAssets } from 'src/front-components/hooks/use-paginated-assets';
import { usePickedRecordId } from 'src/front-components/hooks/use-picked-record-id';
import { fetchDamCollectionAssetPage } from 'src/front-components/utils/fetch-dam-records';

export const CollectionGallery = () => {
  const { records: collections, isLoading: areCollectionsLoading } =
    useNamedRecords('damCollections');
  const {
    recordId: collectionId,
    isRecordContext,
    pickRecordId,
  } = usePickedRecordId({
    storageKey: 'dam-bam:collection-gallery:collection-id',
    records: collections,
  });

  const { assets, isLoading, hasNextPage, errorMessage, loadMore, reload } =
    usePaginatedAssets(
      collectionId === null
        ? null
        : ({ client, after, includeBrand }) =>
            fetchDamCollectionAssetPage({
              client,
              collectionId,
              after,
              includeBrand,
            }),
      collectionId ?? '',
    );

  if (!areCollectionsLoading && collectionId === null) {
    return (
      <PageContainer>
        <StateMessage message="No collections yet. Create one from the Collections view to browse it here." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {!isRecordContext && (
        <div style={{ maxWidth: '320px' }}>
          <FilterSelect
            label="Collection"
            value={collectionId}
            options={collections.map((collection) => ({
              value: collection.id,
              label: collection.name,
            }))}
            allLabel={null}
            onChange={pickRecordId}
          />
        </div>
      )}
      {collectionId !== null && (
        <AssetGrid
          assets={assets}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          errorMessage={errorMessage}
          emptyMessage="This collection has no assets yet."
          onLoadMore={loadMore}
          onRetry={reload}
        />
      )}
    </PageContainer>
  );
};
