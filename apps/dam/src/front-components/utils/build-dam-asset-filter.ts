import { isNonEmptyString } from '@sniptt/guards';

import { type DamAssetFilters } from 'src/front-components/types/dam-asset.types';

type GraphqlFilter = Record<string, unknown>;

export const escapeLikePattern = (value: string) =>
  value.replace(/[\\%_]/g, (character) => `\\${character}`);

export const buildDamAssetFilter = (
  filters: DamAssetFilters,
): GraphqlFilter => {
  const conditions: GraphqlFilter[] = [];

  if (isNonEmptyString(filters.brandId)) {
    conditions.push({ brandId: { eq: filters.brandId } });
  }

  if (isNonEmptyString(filters.status)) {
    conditions.push({ status: { eq: filters.status } });
  }

  if (isNonEmptyString(filters.category)) {
    conditions.push({ category: { eq: filters.category } });
  }

  if (isNonEmptyString(filters.kind)) {
    conditions.push({ kind: { eq: filters.kind } });
  }

  if (isNonEmptyString(filters.tag)) {
    conditions.push({ tags: { containsAny: [filters.tag] } });
  }

  const searchText = filters.searchText.trim();

  if (isNonEmptyString(searchText)) {
    const pattern = `%${escapeLikePattern(searchText)}%`;

    conditions.push({
      or: [
        { name: { ilike: pattern } },
        { description: { ilike: pattern } },
        { keywords: { containsIlike: pattern } },
      ],
    });
  }

  return conditions.length === 0 ? {} : { and: conditions };
};

export const buildDamAssetOrderBy = (
  sortDirection: DamAssetFilters['sortDirection'],
) => [
  {
    updatedAt: sortDirection === 'ASC' ? 'AscNullsLast' : 'DescNullsLast',
  },
];
