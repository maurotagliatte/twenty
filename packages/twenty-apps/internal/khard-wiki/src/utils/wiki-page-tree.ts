import { type WikiPageStatus } from 'src/constants/wiki-options';

export type WikiPageSummary = {
  id: string;
  title: string | null;
  icon: string | null;
  status: WikiPageStatus;
  position: number | null;
  parentPageId: string | null;
  spaceId: string | null;
};

// Children lists keyed by parent page id; the space's top-level pages live under ROOT_PARENT_KEY.
export type ChildrenByParentKey = Record<string, WikiPageSummary[] | undefined>;

export const ROOT_PARENT_KEY = '__root__';

export const getParentKey = (parentPageId: string | null) =>
  parentPageId ?? ROOT_PARENT_KEY;

export type WikiTreeRow = {
  page: WikiPageSummary;
  depth: number;
  isExpanded: boolean;
  // undefined while the children were never fetched
  childCount: number | undefined;
};

const compareSiblings = (left: WikiPageSummary, right: WikiPageSummary) => {
  const leftPosition = left.position ?? Number.POSITIVE_INFINITY;
  const rightPosition = right.position ?? Number.POSITIVE_INFINITY;

  if (leftPosition !== rightPosition) {
    return leftPosition < rightPosition ? -1 : 1;
  }

  return (left.title ?? '').localeCompare(right.title ?? '');
};

export const sortSiblings = (pages: WikiPageSummary[]) =>
  [...pages].sort(compareSiblings);

export const flattenVisibleTree = ({
  childrenByParentKey,
  expandedPageIds,
}: {
  childrenByParentKey: ChildrenByParentKey;
  expandedPageIds: ReadonlySet<string>;
}): WikiTreeRow[] => {
  const rows: WikiTreeRow[] = [];
  const visitedPageIds = new Set<string>();

  const visit = (parentKey: string, depth: number) => {
    for (const page of sortSiblings(childrenByParentKey[parentKey] ?? [])) {
      // A parent cycle in the data must not hang the browser.
      if (visitedPageIds.has(page.id)) {
        continue;
      }
      visitedPageIds.add(page.id);

      const children = childrenByParentKey[page.id];
      const isExpanded = expandedPageIds.has(page.id);

      rows.push({
        page,
        depth,
        isExpanded,
        childCount: children?.length,
      });

      if (isExpanded) {
        visit(page.id, depth + 1);
      }
    }
  };

  visit(ROOT_PARENT_KEY, 0);

  return rows;
};

export const indexLoadedPages = (childrenByParentKey: ChildrenByParentKey) => {
  const pagesById = new Map<string, WikiPageSummary>();

  for (const pages of Object.values(childrenByParentKey)) {
    for (const page of pages ?? []) {
      pagesById.set(page.id, page);
    }
  }

  return pagesById;
};

export const buildBreadcrumb = (
  pagesById: ReadonlyMap<string, WikiPageSummary>,
  pageId: string,
): WikiPageSummary[] => {
  const trail: WikiPageSummary[] = [];
  const visitedPageIds = new Set<string>();
  let currentPage = pagesById.get(pageId);

  while (currentPage !== undefined && !visitedPageIds.has(currentPage.id)) {
    visitedPageIds.add(currentPage.id);
    trail.unshift(currentPage);
    currentPage =
      currentPage.parentPageId === null
        ? undefined
        : pagesById.get(currentPage.parentPageId);
  }

  return trail;
};

export const getPositionAfterLast = (siblings: WikiPageSummary[]) =>
  siblings.reduce(
    (maximum, sibling) => Math.max(maximum, sibling.position ?? 0),
    0,
  ) + 1;

export const getPositionAfter = (
  siblings: WikiPageSummary[],
  anchorPageId: string,
) => {
  const orderedSiblings = sortSiblings(siblings);
  const anchorIndex = orderedSiblings.findIndex(
    (sibling) => sibling.id === anchorPageId,
  );

  if (anchorIndex === -1) {
    return getPositionAfterLast(siblings);
  }

  const anchorPosition = orderedSiblings[anchorIndex].position ?? 0;
  const nextPosition = orderedSiblings[anchorIndex + 1]?.position;

  return nextPosition === null || nextPosition === undefined
    ? anchorPosition + 1
    : (anchorPosition + nextPosition) / 2;
};

export type PositionUpdate = { id: string; position: number };

// Renumbers the whole sibling list when positions tie or are missing, so a swap is always visible.
export const computeSiblingMove = (
  siblings: WikiPageSummary[],
  pageId: string,
  direction: 'up' | 'down',
): PositionUpdate[] => {
  const orderedSiblings = sortSiblings(siblings);
  const index = orderedSiblings.findIndex((sibling) => sibling.id === pageId);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (
    index === -1 ||
    targetIndex < 0 ||
    targetIndex >= orderedSiblings.length
  ) {
    return [];
  }

  const positions = orderedSiblings.map((sibling) => sibling.position);
  const hasDistinctPositions =
    positions.every((position) => position !== null) &&
    new Set(positions).size === positions.length;

  const reordered = [...orderedSiblings];
  [reordered[index], reordered[targetIndex]] = [
    reordered[targetIndex],
    reordered[index],
  ];

  if (hasDistinctPositions) {
    return [
      { id: orderedSiblings[index].id, position: positions[targetIndex] ?? 0 },
      { id: orderedSiblings[targetIndex].id, position: positions[index] ?? 0 },
    ];
  }

  return reordered
    .map((sibling, newIndex) => ({ id: sibling.id, position: newIndex + 1 }))
    .filter(
      (update) =>
        orderedSiblings.find((sibling) => sibling.id === update.id)
          ?.position !== update.position,
    );
};

export const getPreviousSibling = (
  siblings: WikiPageSummary[],
  pageId: string,
) => {
  const orderedSiblings = sortSiblings(siblings);
  const index = orderedSiblings.findIndex((sibling) => sibling.id === pageId);

  return index > 0 ? orderedSiblings[index - 1] : undefined;
};

export const applyPositionUpdates = (
  pages: WikiPageSummary[],
  updates: PositionUpdate[],
) =>
  pages.map((page) => {
    const update = updates.find((candidate) => candidate.id === page.id);

    return update === undefined ? page : { ...page, position: update.position };
  });
