import { describe, expect, it } from 'vitest';

import { mapDamAssetNodeToCard } from 'src/front-components/utils/map-dam-asset-node-to-card';

describe('mapDamAssetNodeToCard', () => {
  it('resolves option labels, colors and the brand name', () => {
    expect(
      mapDamAssetNodeToCard({
        id: 'asset-1',
        name: '  Summer hero  ',
        status: 'APPROVED',
        kind: 'IMAGE',
        category: 'CAMPAIGN',
        brand: { id: 'brand-1', name: 'Acme' },
        files: [
          { fileId: 'f', label: 'hero.jpg', extension: '.jpg', url: 'u' },
        ],
      }),
    ).toEqual({
      id: 'asset-1',
      name: 'Summer hero',
      statusLabel: 'Approved',
      statusColor: 'green',
      kindLabel: 'Image',
      categoryLabel: 'Campaign material',
      brandName: 'Acme',
      fileCount: 1,
      preview: { kind: 'IMAGE', url: 'u', label: 'hero.jpg', extension: 'jpg' },
    });
  });

  it('handles a bare record, as returned when brands are not readable', () => {
    expect(mapDamAssetNodeToCard({ id: 'asset-2' })).toMatchObject({
      name: 'Untitled',
      statusLabel: null,
      statusColor: null,
      brandName: null,
      fileCount: 0,
    });
  });

  it('shows options added by an admin with their raw value', () => {
    expect(
      mapDamAssetNodeToCard({ id: 'asset-3', status: 'ON_HOLD' }),
    ).toMatchObject({ statusLabel: 'ON_HOLD', statusColor: 'gray' });
  });
});
