import { useState } from 'react';
import { IconSearch } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import {
  DAM_ASSET_CATEGORY_OPTIONS,
  DAM_ASSET_KIND_OPTIONS,
  DAM_ASSET_STATUS_OPTIONS,
  DAM_ASSET_TAG_OPTIONS,
} from 'src/constants/dam-asset-options';
import { AssetGrid } from 'src/front-components/components/AssetGrid';
import { FilterSelect } from 'src/front-components/components/FilterSelect';
import { PageContainer } from 'src/front-components/components/PageContainer';
import { useDebouncedValue } from 'src/front-components/hooks/use-debounced-value';
import { useNamedRecords } from 'src/front-components/hooks/use-named-records';
import { usePaginatedAssets } from 'src/front-components/hooks/use-paginated-assets';
import { type DamAssetFilters } from 'src/front-components/types/dam-asset.types';
import {
  buildDamAssetFilter,
  buildDamAssetOrderBy,
} from 'src/front-components/utils/build-dam-asset-filter';
import { fetchDamAssetPage } from 'src/front-components/utils/fetch-dam-records';

const SORT_OPTIONS = [
  { value: 'DESC', label: 'Recently updated' },
  { value: 'ASC', label: 'Least recently updated' },
] as const;

const INITIAL_FILTERS: DamAssetFilters = {
  brandId: null,
  status: null,
  category: null,
  kind: null,
  tag: null,
  searchText: '',
  sortDirection: 'DESC',
};

export const AssetGallery = () => {
  const theme = useTheme();
  const [filters, setFilters] = useState<DamAssetFilters>(INITIAL_FILTERS);
  const debouncedSearchText = useDebouncedValue(filters.searchText, 300);
  const { records: brands } = useNamedRecords('damBrands');

  const effectiveFilters = { ...filters, searchText: debouncedSearchText };
  const filter = buildDamAssetFilter(effectiveFilters);
  const orderBy = buildDamAssetOrderBy(effectiveFilters.sortDirection);

  const { assets, isLoading, hasNextPage, errorMessage, loadMore, reload } =
    usePaginatedAssets(
      ({ client, after, includeBrand }) =>
        fetchDamAssetPage({ client, filter, orderBy, after, includeBrand }),
      JSON.stringify({ filter, orderBy }),
    );

  const updateFilter = <TKey extends keyof DamAssetFilters>(
    key: TKey,
    value: DamAssetFilters[TKey],
  ) => setFilters((previous) => ({ ...previous, [key]: value }));

  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(INITIAL_FILTERS);

  return (
    <PageContainer>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: theme.spacing[2],
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            flex: '2 1 240px',
            height: '32px',
            padding: `0 ${theme.spacing[2]}`,
            background: theme.background.primary,
            border: `1px solid ${theme.border.color.medium}`,
            borderRadius: theme.border.radius.sm,
            color: theme.font.color.tertiary,
            boxSizing: 'border-box',
          }}
        >
          <IconSearch size={16} />
          <input
            type="search"
            value={filters.searchText}
            placeholder="Search name, description or keywords"
            onChange={(event) => updateFilter('searchText', event.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: theme.font.color.primary,
              fontFamily: theme.font.family,
              fontSize: theme.font.size.md,
            }}
          />
        </label>
        <FilterSelect
          label="Brand"
          value={filters.brandId}
          options={brands.map((brand) => ({
            value: brand.id,
            label: brand.name,
          }))}
          onChange={(value) => updateFilter('brandId', value)}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={DAM_ASSET_STATUS_OPTIONS}
          onChange={(value) => updateFilter('status', value)}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          options={DAM_ASSET_CATEGORY_OPTIONS}
          onChange={(value) => updateFilter('category', value)}
        />
        <FilterSelect
          label="Kind"
          value={filters.kind}
          options={DAM_ASSET_KIND_OPTIONS}
          onChange={(value) => updateFilter('kind', value)}
        />
        <FilterSelect
          label="Tag"
          value={filters.tag}
          options={DAM_ASSET_TAG_OPTIONS}
          onChange={(value) => updateFilter('tag', value)}
        />
        <FilterSelect
          label="Sort"
          value={filters.sortDirection}
          options={SORT_OPTIONS}
          allLabel={null}
          onChange={(value) =>
            updateFilter('sortDirection', value === 'ASC' ? 'ASC' : 'DESC')
          }
        />
      </div>
      <AssetGrid
        assets={assets}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        errorMessage={errorMessage}
        emptyMessage={
          hasActiveFilters
            ? 'No assets match these filters.'
            : 'No assets yet. Create one from the Assets view.'
        }
        onLoadMore={loadMore}
        onRetry={reload}
      />
    </PageContainer>
  );
};
