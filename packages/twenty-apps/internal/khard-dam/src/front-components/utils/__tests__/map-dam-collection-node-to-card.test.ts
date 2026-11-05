import { describe, expect, it } from 'vitest';

import { mapDamCollectionNodeToCard } from 'src/front-components/utils/fetch-dam-records';

describe('mapDamCollectionNodeToCard', () => {
  it('keeps the cover, the asset count and only image samples', () => {
    const card = mapDamCollectionNodeToCard({
      id: 'collection-1',
      name: ' Winter menu ',
      brand: { name: 'Aurora' },
      cover: [{ label: 'cover.jpg', extension: '.jpg', url: 'cover-url' }],
      collectionAssets: {
        totalCount: 7,
        edges: [
          { node: { asset: { files: [{ extension: '.jpg', url: 'a' }] } } },
          { node: { asset: { files: [{ extension: '.pdf', url: 'b' }] } } },
          { node: { asset: null } },
        ],
      },
    });

    expect(card).toMatchObject({
      name: 'Winter menu',
      brandName: 'Aurora',
      assetCount: 7,
      cover: { kind: 'IMAGE', url: 'cover-url' },
    });
    expect(card.samplePreviews.map((preview) => preview.url)).toEqual(['a']);
  });

  it('handles a collection without cover or assets', () => {
    expect(mapDamCollectionNodeToCard({ id: 'collection-2' })).toMatchObject({
      name: 'Untitled',
      assetCount: 0,
      cover: { kind: 'OTHER', url: null },
      samplePreviews: [],
    });
  });
});
