import { RestApiClient } from 'twenty-client-sdk/rest';

import { type WikiPageStatus } from 'src/constants/wiki-options';
import { isUuid } from 'src/utils/safe-url';
import { type WikiPageSummary } from 'src/utils/wiki-page-tree';

export type WikiSpace = {
  id: string;
  name: string | null;
  icon: string | null;
  description: string | null;
};

export type WikiPageOwner = {
  id: string;
  name: { firstName: string | null; lastName: string | null } | null;
  avatarUrl: string | null;
};

export type WikiPageDetail = WikiPageSummary & {
  updatedAt: string | null;
  updatedBy: { name: string | null } | null;
  owner: WikiPageOwner | null;
  cover: { url?: string | null; label?: string | null }[] | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
};

export type WikiSubpage = WikiPageSummary & {
  updatedAt: string | null;
  owner: WikiPageOwner | null;
};

type FindManyResponse<TRecord> = {
  data: Record<string, TRecord[]>;
};

type SingleRecordResponse<TRecord> = {
  data: Record<string, TRecord>;
};

const PAGE_SUMMARY_FIELDS =
  'id,title,icon,status,position,parentPage,space';
const PAGE_DETAIL_FIELDS = `${PAGE_SUMMARY_FIELDS},updatedAt,updatedBy,owner,cover,lastReviewedAt,nextReviewAt`;
const SUBPAGE_FIELDS = `${PAGE_SUMMARY_FIELDS},updatedAt,owner`;
const QUERY_MAX_RECORDS = 200;
const VISIBLE_STATUSES: WikiPageStatus[] = ['DRAFT', 'PUBLISHED'];
const VISIBLE_STATUS_FILTER = `status[in]:[${VISIBLE_STATUSES.map((status) => `"${status}"`).join(',')}]`;

// Ids are interpolated into the REST filter grammar, so anything that is not a uuid is refused up front.
const assertUuid = (value: string) => {
  if (!isUuid(value)) {
    throw new Error(`Invalid record id: ${value}`);
  }

  return value;
};

const client = () => new RestApiClient();

const firstRecord = <TRecord>(response: SingleRecordResponse<TRecord>) =>
  Object.values(response.data)[0];

export const listWikiSpaces = async (): Promise<WikiSpace[]> => {
  const response = await client().get<FindManyResponse<WikiSpace>>(
    '/rest/wikiSpaces',
    {
      query: {
        fields: 'id,name,icon,description',
        order_by: 'position[AscNullsLast],name[AscNullsLast]',
        limit: QUERY_MAX_RECORDS,
      },
    },
  );

  return response.data.wikiSpaces ?? [];
};

export const listChildPages = async ({
  spaceId,
  parentPageId,
}: {
  spaceId: string;
  parentPageId: string | null;
}): Promise<WikiPageSummary[]> => {
  const parentFilter =
    parentPageId === null
      ? `spaceId[eq]:"${assertUuid(spaceId)}",parentPageId[is]:NULL`
      : `parentPageId[eq]:"${assertUuid(parentPageId)}"`;

  const response = await client().get<FindManyResponse<WikiPageSummary>>(
    '/rest/wikiPages',
    {
      query: {
        fields: PAGE_SUMMARY_FIELDS,
        filter: `and(${parentFilter},${VISIBLE_STATUS_FILTER})`,
        order_by: 'position[AscNullsLast],title[AscNullsLast]',
        limit: QUERY_MAX_RECORDS,
      },
    },
  );

  return response.data.wikiPages ?? [];
};

export const listSubpages = async (
  parentPageId: string,
): Promise<WikiSubpage[]> => {
  const response = await client().get<FindManyResponse<WikiSubpage>>(
    '/rest/wikiPages',
    {
      query: {
        fields: SUBPAGE_FIELDS,
        depth: 1,
        filter: `and(parentPageId[eq]:"${assertUuid(parentPageId)}",${VISIBLE_STATUS_FILTER})`,
        order_by: 'position[AscNullsLast],title[AscNullsLast]',
        limit: QUERY_MAX_RECORDS,
      },
    },
  );

  return response.data.wikiPages ?? [];
};

export const findMostRecentPageId = async (): Promise<string | null> => {
  const response = await client().get<FindManyResponse<{ id: string }>>(
    '/rest/wikiPages',
    {
      query: {
        fields: 'id',
        filter: VISIBLE_STATUS_FILTER,
        order_by: 'updatedAt[DescNullsLast]',
        limit: 1,
      },
    },
  );

  return response.data.wikiPages?.[0]?.id ?? null;
};

export const getWikiPageSummary = async (
  pageId: string,
): Promise<WikiPageSummary> =>
  firstRecord(
    await client().get<SingleRecordResponse<WikiPageSummary>>(
      `/rest/wikiPages/${assertUuid(pageId)}`,
      { query: { fields: PAGE_SUMMARY_FIELDS } },
    ),
  );

export const getWikiPage = async (pageId: string): Promise<WikiPageDetail> =>
  firstRecord(
    await client().get<SingleRecordResponse<WikiPageDetail>>(
      `/rest/wikiPages/${assertUuid(pageId)}`,
      { query: { fields: PAGE_DETAIL_FIELDS, depth: 1 } },
    ),
  );

export const createWikiPage = async (input: {
  title: string;
  spaceId: string;
  parentPageId: string | null;
  position: number;
  ownerId: string | null;
}): Promise<WikiPageSummary> =>
  firstRecord(
    await client().post<SingleRecordResponse<WikiPageSummary>>(
      '/rest/wikiPages',
      {
        title: input.title,
        status: 'DRAFT',
        spaceId: assertUuid(input.spaceId),
        parentPageId:
          input.parentPageId === null ? null : assertUuid(input.parentPageId),
        position: input.position,
        ...(input.ownerId === null
          ? {}
          : { ownerId: assertUuid(input.ownerId) }),
      },
    ),
  );

export const updateWikiPage = async (
  pageId: string,
  patch: Partial<{
    title: string;
    icon: string | null;
    parentPageId: string | null;
    position: number;
    lastReviewedAt: string;
    nextReviewAt: string;
    status: WikiPageStatus;
  }>,
) => {
  await client().patch(`/rest/wikiPages/${assertUuid(pageId)}`, patch);
};

export const findWorkspaceMemberIdByUserId = async (
  userId: string,
): Promise<string | null> => {
  const response = await client().get<FindManyResponse<{ id: string }>>(
    '/rest/workspaceMembers',
    {
      query: {
        fields: 'id',
        filter: `userId[eq]:"${assertUuid(userId)}"`,
        limit: 1,
      },
    },
  );

  return response.data.workspaceMembers?.[0]?.id ?? null;
};
