import { describe, expect, it } from 'vitest';

import { type DamAssetFilters } from 'src/front-components/types/dam-asset.types';
import {
  buildDamAssetFilter,
  buildDamAssetOrderBy,
  escapeLikePattern,
} from 'src/front-components/utils/build-dam-asset-filter';

const NO_FILTERS: DamAssetFilters = {
  brandId: null,
  status: null,
  category: null,
  kind: null,
  tag: null,
  searchText: '',
  sortDirection: 'DESC',
};

describe('buildDamAssetFilter', () => {
  it('returns an empty filter when nothing is selected', () => {
    expect(buildDamAssetFilter(NO_FILTERS)).toEqual({});
  });

  it('ignores whitespace-only search text', () => {
    expect(buildDamAssetFilter({ ...NO_FILTERS, searchText: '   ' })).toEqual(
      {},
    );
  });

  it('combines every selected filter with and', () => {
    expect(
      buildDamAssetFilter({
        ...NO_FILTERS,
        brandId: 'brand-1',
        status: 'APPROVED',
        category: 'LOGO',
        kind: 'VECTOR',
        tag: 'HERO',
      }),
    ).toEqual({
      and: [
        { brandId: { eq: 'brand-1' } },
        { status: { eq: 'APPROVED' } },
        { category: { eq: 'LOGO' } },
        { kind: { eq: 'VECTOR' } },
        { tags: { containsAny: ['HERO'] } },
      ],
    });
  });

  it('searches name, description and keywords case-insensitively', () => {
    expect(
      buildDamAssetFilter({ ...NO_FILTERS, searchText: ' summer ' }),
    ).toEqual({
      and: [
        {
          or: [
            { name: { ilike: '%summer%' } },
            { description: { ilike: '%summer%' } },
            { keywords: { containsIlike: '%summer%' } },
          ],
        },
      ],
    });
  });

  it('treats like wildcards in search text literally', () => {
    expect(escapeLikePattern('50%_off\\')).toBe('50\\%\\_off\\\\');
  });
});

describe('buildDamAssetOrderBy', () => {
  it('sorts by most recently updated by default', () => {
    expect(buildDamAssetOrderBy('DESC')).toEqual([
      { updatedAt: 'DescNullsLast' },
    ]);
  });

  it('can sort by least recently updated', () => {
    expect(buildDamAssetOrderBy('ASC')).toEqual([
      { updatedAt: 'AscNullsLast' },
    ]);
  });
});
