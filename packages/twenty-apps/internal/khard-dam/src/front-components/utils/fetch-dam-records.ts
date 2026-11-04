import {
  type DamAssetCard,
  type DamAssetNode,
  type DamCollectionCard,
  type NamedRecord,
  type RecordPage,
} from 'src/front-components/types/dam-asset.types';
import { getFilePreview } from 'src/front-components/utils/get-file-preview';
import { mapDamAssetNodeToCard } from 'src/front-components/utils/map-dam-asset-node-to-card';

export const DAM_ASSET_PAGE_SIZE = 24;
export const DAM_PICKER_PAGE_SIZE = 200;

type Connection<TNode> = {
  edges?: { node: TNode }[] | null;
  pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null };
};

// The generated CoreApiClient is a stub until the app is synced, so only `query` is relied on.
export type DamQueryClient = {
  query: (request: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const toRecordPage = <TNode, TItem>(
  connection: Connection<TNode> | undefined,
  mapNode: (node: TNode) => TItem | null,
): RecordPage<TItem> => ({
  items: (connection?.edges ?? [])
    .map((edge) => mapNode(edge.node))
    .filter((item): item is TItem => item !== null),
  endCursor: connection?.pageInfo?.endCursor ?? null,
  hasNextPage: connection?.pageInfo?.hasNextPage === true,
});

const paginationArgs = (after: string | null, first: number) =>
  after === null ? { first } : { first, after };

export const buildDamAssetSelection = (includeBrand: boolean) => ({
  id: true,
  name: true,
  status: true,
  kind: true,
  category: true,
  updatedAt: true,
  files: { fileId: true, label: true, extension: true, url: true },
  ...(includeBrand ? { brand: { id: true, name: true } } : {}),
});

export const fetchDamAssetPage = async ({
  client,
  filter,
  orderBy,
  after,
  includeBrand,
  first = DAM_ASSET_PAGE_SIZE,
}: {
  client: DamQueryClient;
  filter: Record<string, unknown>;
  orderBy: Record<string, string>[];
  after: string | null;
  includeBrand: boolean;
  first?: number;
}): Promise<RecordPage<DamAssetCard>> => {
  const result = await client.query({
    damAssets: {
      __args: { filter, orderBy, ...paginationArgs(after, first) },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: { node: buildDamAssetSelection(includeBrand) },
    },
  });

  return toRecordPage(
    result.damAssets as Connection<DamAssetNode> | undefined,
    mapDamAssetNodeToCard,
  );
};

export const fetchDamCollectionAssetPage = async ({
  client,
  collectionId,
  after,
  includeBrand,
  first = DAM_ASSET_PAGE_SIZE,
}: {
  client: DamQueryClient;
  collectionId: string;
  after: string | null;
  includeBrand: boolean;
  first?: number;
}): Promise<RecordPage<DamAssetCard>> => {
  const result = await client.query({
    damCollectionAssets: {
      __args: {
        filter: { collectionId: { eq: collectionId } },
        orderBy: [{ createdAt: 'AscNullsLast' }],
        ...paginationArgs(after, first),
      },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: {
        node: { id: true, asset: buildDamAssetSelection(includeBrand) },
      },
    },
  });

  return toRecordPage(
    result.damCollectionAssets as
      | Connection<{ id: string; asset?: DamAssetNode | null }>
      | undefined,
    (node) => (node.asset ? mapDamAssetNodeToCard(node.asset) : null),
  );
};

const COLLECTION_SAMPLE_SIZE = 4;
const FILE_SELECTION = { fileId: true, label: true, extension: true, url: true };

type DamCollectionNode = {
  id: string;
  name?: string | null;
  updatedAt?: string | null;
  brand?: { name?: string | null } | null;
  cover?: DamAssetNode['files'];
  collectionAssets?: {
    totalCount?: number | null;
    edges?: { node: { asset?: { files?: DamAssetNode['files'] } | null } }[];
  } | null;
};

export const mapDamCollectionNodeToCard = (
  node: DamCollectionNode,
): DamCollectionCard => ({
  id: node.id,
  name: node.name?.trim() || 'Untitled',
  brandName: node.brand?.name?.trim() || null,
  updatedAt: node.updatedAt ?? null,
  assetCount: node.collectionAssets?.totalCount ?? 0,
  cover: getFilePreview(node.cover),
  samplePreviews: (node.collectionAssets?.edges ?? [])
    .map((edge) => getFilePreview(edge.node.asset?.files))
    .filter((preview) => preview.kind === 'IMAGE' && preview.url !== null),
});

export const fetchDamCollectionCards = async ({
  client,
}: {
  client: DamQueryClient;
}): Promise<DamCollectionCard[]> => {
  const result = await client.query({
    damCollections: {
      __args: {
        orderBy: [{ updatedAt: 'DescNullsLast' }],
        first: DAM_PICKER_PAGE_SIZE,
      },
      edges: {
        node: {
          id: true,
          name: true,
          updatedAt: true,
          brand: { name: true },
          cover: FILE_SELECTION,
          collectionAssets: {
            __args: { first: COLLECTION_SAMPLE_SIZE },
            totalCount: true,
            edges: { node: { asset: { files: FILE_SELECTION } } },
          },
        },
      },
    },
  });

  return toRecordPage(
    result.damCollections as Connection<DamCollectionNode> | undefined,
    mapDamCollectionNodeToCard,
  ).items;
};

const toNamedRecord = (node: { id: string; name?: string | null }) => ({
  id: node.id,
  name: node.name?.trim() || 'Untitled',
});

export const fetchNamedRecords = async ({
  client,
  objectNamePlural,
}: {
  client: DamQueryClient;
  objectNamePlural: 'damBrands' | 'damCollections';
}): Promise<NamedRecord[]> => {
  const result = await client.query({
    [objectNamePlural]: {
      __args: {
        orderBy: [{ name: 'AscNullsLast' }],
        first: DAM_PICKER_PAGE_SIZE,
      },
      edges: { node: { id: true, name: true } },
    },
  });

  return toRecordPage(
    result[objectNamePlural] as
      | Connection<{ id: string; name?: string | null }>
      | undefined,
    toNamedRecord,
  ).items;
};

export type DamBrandKit = {
  id: string;
  name: string;
  logo: DamAssetNode['files'];
  colors: string[];
  fonts: string[];
  toneOfVoice: string | null;
  websiteUrl: string | null;
};

type DamBrandNode = {
  id: string;
  name?: string | null;
  logo?: DamAssetNode['files'];
  colors?: string[] | null;
  fonts?: string[] | null;
  toneOfVoice?: string | null;
  website?: { primaryLinkUrl?: string | null } | null;
};

export const fetchDamBrandKit = async ({
  client,
  brandId,
}: {
  client: DamQueryClient;
  brandId: string;
}): Promise<DamBrandKit | null> => {
  const result = await client.query({
    damBrands: {
      __args: { filter: { id: { eq: brandId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          logo: { fileId: true, label: true, extension: true, url: true },
          colors: true,
          fonts: true,
          toneOfVoice: true,
          website: { primaryLinkUrl: true },
        },
      },
    },
  });

  const node = (result.damBrands as Connection<DamBrandNode> | undefined)
    ?.edges?.[0]?.node;

  if (node === undefined) {
    return null;
  }

  return {
    ...toNamedRecord(node),
    logo: node.logo ?? [],
    colors: node.colors ?? [],
    fonts: node.fonts ?? [],
    toneOfVoice: node.toneOfVoice?.trim() || null,
    websiteUrl: node.website?.primaryLinkUrl?.trim() || null,
  };
};
