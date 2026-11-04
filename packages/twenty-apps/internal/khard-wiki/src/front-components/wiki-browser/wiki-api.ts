import { RestApiClient } from 'twenty-client-sdk/rest';

import { type WikiPageStatus } from 'src/constants/wiki-options';
import { type RichTextBody } from 'src/utils/rich-text/parse-rich-text-body';
import { isUuid } from 'src/utils/rich-text/safe-url';
import { type WikiPageSummary } from 'src/utils/wiki-page-tree';

export type WikiSpace = {
  id: string;
  name: string | null;
  icon: string | null;
  description: string | null;
};

export type WikiPageDetail = WikiPageSummary & {
  body: RichTextBody | null;
  updatedAt: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  tags: string[] | null;
};

type FindManyResponse<TRecord> = {
  data: Record<string, TRecord[]>;
};

type SingleRecordResponse<TRecord> = {
  data: Record<string, TRecord>;
};

const PAGE_SUMMARY_FIELDS =
  'id,title,icon,status,position,parentPage,space';
const QUERY_MAX_RECORDS = 200;
const VISIBLE_STATUSES: WikiPageStatus[] = ['DRAFT', 'PUBLISHED'];

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
  const statusFilter = `status[in]:[${VISIBLE_STATUSES.map((status) => `"${status}"`).join(',')}]`;
  const parentFilter =
    parentPageId === null
      ? `spaceId[eq]:"${assertUuid(spaceId)}",parentPageId[is]:NULL`
      : `parentPageId[eq]:"${assertUuid(parentPageId)}"`;

  const response = await client().get<FindManyResponse<WikiPageSummary>>(
    '/rest/wikiPages',
    {
      query: {
        fields: PAGE_SUMMARY_FIELDS,
        filter: `and(${parentFilter},${statusFilter})`,
        order_by: 'position[AscNullsLast],title[AscNullsLast]',
        limit: QUERY_MAX_RECORDS,
      },
    },
  );

  return response.data.wikiPages ?? [];
};

export const getWikiPage = async (pageId: string): Promise<WikiPageDetail> =>
  firstRecord(
    await client().get<SingleRecordResponse<WikiPageDetail>>(
      `/rest/wikiPages/${assertUuid(pageId)}`,
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
