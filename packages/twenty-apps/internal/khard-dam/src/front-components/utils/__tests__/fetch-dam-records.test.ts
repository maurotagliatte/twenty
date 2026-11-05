import { describe, expect, it, vi } from 'vitest';

import {
  DAM_ASSET_PAGE_SIZE,
  fetchDamAssetPage,
  fetchDamBrandKit,
  fetchDamCollectionAssetPage,
  type DamQueryClient,
} from 'src/front-components/utils/fetch-dam-records';

const createClient = (response: Record<string, unknown>) => {
  const query = vi.fn().mockResolvedValue(response);

  return { client: { query } as DamQueryClient, query };
};

describe('fetchDamAssetPage', () => {
  it('requests one page at a time and maps the cards', async () => {
    const { client, query } = createClient({
      damAssets: {
        pageInfo: { hasNextPage: true, endCursor: 'cursor-2' },
        edges: [{ node: { id: 'asset-1', name: 'Logo', status: 'DRAFT' } }],
      },
    });

    const page = await fetchDamAssetPage({
      client,
      filter: { status: { eq: 'DRAFT' } },
      orderBy: [{ updatedAt: 'DescNullsLast' }],
      after: 'cursor-1',
      includeBrand: false,
    });

    const request = query.mock.calls[0][0].damAssets;

    expect(request.__args).toEqual({
      filter: { status: { eq: 'DRAFT' } },
      orderBy: [{ updatedAt: 'DescNullsLast' }],
      first: DAM_ASSET_PAGE_SIZE,
      after: 'cursor-1',
    });
    expect(request.edges.node.brand).toBeUndefined();
    expect(request.edges.node.files).toEqual({
      fileId: true,
      label: true,
      extension: true,
      url: true,
    });
    expect(page.hasNextPage).toBe(true);
    expect(page.endCursor).toBe('cursor-2');
    expect(page.items.map((item) => item.name)).toEqual(['Logo']);
  });

  it('omits the cursor on the first page and selects the brand on request', async () => {
    const { client, query } = createClient({ damAssets: { edges: [] } });

    const page = await fetchDamAssetPage({
      client,
      filter: {},
      orderBy: [],
      after: null,
      includeBrand: true,
    });

    const request = query.mock.calls[0][0].damAssets;

    expect(request.__args).not.toHaveProperty('after');
    expect(request.edges.node.brand).toEqual({ id: true, name: true });
    expect(page).toEqual({ items: [], endCursor: null, hasNextPage: false });
  });
});

describe('fetchDamCollectionAssetPage', () => {
  it('skips junction rows whose asset is not visible', async () => {
    const { client, query } = createClient({
      damCollectionAssets: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: [
          { node: { id: 'link-1', asset: { id: 'asset-1', name: 'One' } } },
          { node: { id: 'link-2', asset: null } },
        ],
      },
    });

    const page = await fetchDamCollectionAssetPage({
      client,
      collectionId: 'collection-1',
      after: null,
      includeBrand: true,
    });

    expect(query.mock.calls[0][0].damCollectionAssets.__args.filter).toEqual({
      collectionId: { eq: 'collection-1' },
    });
    expect(page.items.map((item) => item.id)).toEqual(['asset-1']);
  });
});

describe('fetchDamBrandKit', () => {
  it('returns null when the brand is not visible', async () => {
    const { client } = createClient({ damBrands: { edges: [] } });

    expect(await fetchDamBrandKit({ client, brandId: 'brand-1' })).toBeNull();
  });

  it('normalizes empty brand fields', async () => {
    const { client } = createClient({
      damBrands: {
        edges: [
          {
            node: {
              id: 'brand-1',
              name: 'Acme',
              colors: null,
              fonts: ['Inter'],
              toneOfVoice: '  ',
              website: { primaryLinkUrl: 'https://acme.test' },
            },
          },
        ],
      },
    });

    expect(await fetchDamBrandKit({ client, brandId: 'brand-1' })).toEqual({
      id: 'brand-1',
      name: 'Acme',
      logo: [],
      colors: [],
      fonts: ['Inter'],
      toneOfVoice: null,
      websiteUrl: 'https://acme.test',
    });
  });
});
