import { useEffect, useMemo, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconPlus,
  IconRefresh,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { WIKI_PAGE_TREE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWikiStyles } from 'src/front-components/shared/build-wiki-styles';
import { describeApiError } from 'src/front-components/shared/describe-api-error';
import { openWikiPage } from 'src/front-components/shared/open-wiki-page';
import { useResolveWorkspaceMemberId } from 'src/front-components/shared/use-workspace-member-id';
import {
  createWikiPage,
  getWikiPageSummary,
  listChildPages,
  listWikiSpaces,
  updateWikiPage,
  type WikiSpace,
} from 'src/front-components/shared/wiki-api';
import { WikiPageTreeView } from 'src/front-components/shared/wiki-page-tree-view';
import {
  applyPositionUpdates,
  type ChildrenByParentKey,
  computeSiblingMove,
  flattenVisibleTree,
  getParentKey,
  getPositionAfter,
  getPositionAfterLast,
  getPreviousSibling,
  indexLoadedPages,
  ROOT_PARENT_KEY,
  type WikiPageSummary,
} from 'src/utils/wiki-page-tree';

const MAX_ANCESTOR_DEPTH = 20;

type PageDraft = { parentPageId: string | null; title: string };

const showError = (message: string) =>
  enqueueSnackbar({ message, variant: 'error' });

const loadAncestorIds = async (page: WikiPageSummary) => {
  const ancestorIds: string[] = [];
  let parentPageId = page.parentPageId;

  while (parentPageId !== null && ancestorIds.length < MAX_ANCESTOR_DEPTH) {
    ancestorIds.unshift(parentPageId);
    parentPageId = (await getWikiPageSummary(parentPageId)).parentPageId;
  }

  return ancestorIds;
};

const WikiPageTree = () => {
  const theme = useTheme();
  const styles = useMemo(() => buildWikiStyles(theme), [theme]);
  const currentPageId = useRecordId();
  const resolveWorkspaceMemberId = useResolveWorkspaceMemberId();

  const [spaces, setSpaces] = useState<WikiSpace[] | null>(null);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [childrenByParentKey, setChildrenByParentKey] =
    useState<ChildrenByParentKey>({});
  const [expandedPageIds, setExpandedPageIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [loadingPageIds, setLoadingPageIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [draft, setDraft] = useState<PageDraft | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const spaceIdRef = useRef<string | null>(null);

  const pagesById = useMemo(
    () => indexLoadedPages(childrenByParentKey),
    [childrenByParentKey],
  );
  const treeRows = useMemo(
    () => flattenVisibleTree({ childrenByParentKey, expandedPageIds }),
    [childrenByParentKey, expandedPageIds],
  );
  const currentSummary =
    currentPageId === null ? undefined : pagesById.get(currentPageId);

  const setPageLoading = (pageId: string, isLoading: boolean) =>
    setLoadingPageIds((previous) => {
      const next = new Set(previous);

      if (isLoading) {
        next.add(pageId);
      } else {
        next.delete(pageId);
      }

      return next;
    });

  const loadChildren = async (
    targetSpaceId: string,
    parentPageId: string | null,
  ) => {
    if (parentPageId !== null) {
      setPageLoading(parentPageId, true);
    }

    try {
      const pages = await listChildPages({
        spaceId: targetSpaceId,
        parentPageId,
      });

      if (targetSpaceId === spaceIdRef.current) {
        setChildrenByParentKey((previous) => ({
          ...previous,
          [getParentKey(parentPageId)]: pages,
        }));
      }

      return pages;
    } catch (error) {
      showError(describeApiError(error, 'load wiki pages'));

      return [];
    } finally {
      if (parentPageId !== null) {
        setPageLoading(parentPageId, false);
      }
    }
  };

  const switchSpace = async (nextSpaceId: string) => {
    spaceIdRef.current = nextSpaceId;
    setSpaceId(nextSpaceId);
    setChildrenByParentKey({});
    setExpandedPageIds(new Set());
    setDraft(null);
    await loadChildren(nextSpaceId, null);
  };

  const expandPages = (pageIds: string[]) =>
    setExpandedPageIds((previous) => new Set([...previous, ...pageIds]));

  const revealPage = async (pageId: string) => {
    try {
      const page = await getWikiPageSummary(pageId);

      if (page.spaceId === null) {
        return;
      }

      if (page.spaceId !== spaceIdRef.current) {
        await switchSpace(page.spaceId);
      }

      const ancestorIds = await loadAncestorIds(page);

      for (const ancestorId of [...ancestorIds, page.id]) {
        await loadChildren(page.spaceId, ancestorId);
      }

      expandPages([...ancestorIds, page.id]);
    } catch (error) {
      showError(describeApiError(error, 'load the page tree'));
    }
  };

  useEffect(() => {
    void listWikiSpaces()
      .then(async (loadedSpaces) => {
        setSpaces(loadedSpaces);

        if (
          currentPageId === null &&
          spaceIdRef.current === null &&
          loadedSpaces[0] !== undefined
        ) {
          await switchSpace(loadedSpaces[0].id);
        }
      })
      .catch((error) => {
        setSpaces([]);
        showError(describeApiError(error, 'load wiki spaces'));
      });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPageId !== null) {
      void revealPage(currentPageId);
    }
    // Re-run only when the host navigates to another record.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId]);

  const togglePage = async (pageId: string) => {
    if (expandedPageIds.has(pageId)) {
      setExpandedPageIds((previous) => {
        const next = new Set(previous);

        next.delete(pageId);

        return next;
      });

      return;
    }

    expandPages([pageId]);

    if (childrenByParentKey[pageId] === undefined && spaceId !== null) {
      await loadChildren(spaceId, pageId);
    }
  };

  const runMutation = async (action: string, mutation: () => Promise<void>) => {
    setIsMutating(true);

    try {
      await mutation();
    } catch (error) {
      showError(describeApiError(error, action));
    } finally {
      setIsMutating(false);
    }
  };

  const submitDraft = () =>
    runMutation('create the page', async () => {
      if (draft === null || spaceId === null) {
        return;
      }

      const { parentPageId } = draft;
      const siblings =
        childrenByParentKey[getParentKey(parentPageId)] ??
        (await loadChildren(spaceId, parentPageId));

      const createdPage = await createWikiPage({
        title: draft.title.trim() || 'Untitled',
        spaceId,
        parentPageId,
        position: getPositionAfterLast(siblings),
        ownerId: await resolveWorkspaceMemberId(),
      });

      setDraft(null);
      await loadChildren(spaceId, parentPageId);
      await openWikiPage(createdPage.id);
    });

  const movePage = (direction: 'up' | 'down') =>
    runMutation('move the page', async () => {
      if (currentSummary === undefined) {
        return;
      }

      const parentKey = getParentKey(currentSummary.parentPageId);
      const updates = computeSiblingMove(
        childrenByParentKey[parentKey] ?? [],
        currentSummary.id,
        direction,
      );

      for (const update of updates) {
        await updateWikiPage(update.id, { position: update.position });
      }

      setChildrenByParentKey((previous) => ({
        ...previous,
        [parentKey]: applyPositionUpdates(previous[parentKey] ?? [], updates),
      }));
    });

  const reparentLocally = (
    page: WikiPageSummary,
    newParentPageId: string | null,
    position: number,
  ) =>
    setChildrenByParentKey((previous) => {
      const oldParentKey = getParentKey(page.parentPageId);
      const newParentKey = getParentKey(newParentPageId);
      const movedPage = { ...page, parentPageId: newParentPageId, position };

      return {
        ...previous,
        [oldParentKey]: (previous[oldParentKey] ?? []).filter(
          (sibling) => sibling.id !== page.id,
        ),
        [newParentKey]: [...(previous[newParentKey] ?? []), movedPage],
      };
    });

  const indentPage = () =>
    runMutation('move the page', async () => {
      if (currentSummary === undefined || spaceId === null) {
        return;
      }

      const newParent = getPreviousSibling(
        childrenByParentKey[getParentKey(currentSummary.parentPageId)] ?? [],
        currentSummary.id,
      );

      if (newParent === undefined) {
        return;
      }

      const newSiblings =
        childrenByParentKey[newParent.id] ??
        (await loadChildren(spaceId, newParent.id));
      const position = getPositionAfterLast(newSiblings);

      await updateWikiPage(currentSummary.id, {
        parentPageId: newParent.id,
        position,
      });
      reparentLocally(currentSummary, newParent.id, position);
      expandPages([newParent.id]);
    });

  const outdentPage = () =>
    runMutation('move the page', async () => {
      const parent =
        currentSummary?.parentPageId === null ||
        currentSummary?.parentPageId === undefined
          ? undefined
          : pagesById.get(currentSummary.parentPageId);

      if (currentSummary === undefined || parent === undefined) {
        return;
      }

      const position = getPositionAfter(
        childrenByParentKey[getParentKey(parent.parentPageId)] ?? [],
        parent.id,
      );

      await updateWikiPage(currentSummary.id, {
        parentPageId: parent.parentPageId,
        position,
      });
      reparentLocally(currentSummary, parent.parentPageId, position);
    });

  const refresh = async () => {
    if (spaceId === null) {
      return;
    }

    await loadChildren(spaceId, null);

    for (const pageId of expandedPageIds) {
      await loadChildren(spaceId, pageId);
    }
  };

  const siblings =
    currentSummary === undefined
      ? []
      : (childrenByParentKey[getParentKey(currentSummary.parentPageId)] ?? []);
  const currentIndex = siblings.findIndex(
    (page) => page.id === currentPageId,
  );
  const canEdit = currentSummary !== undefined && !isMutating;
  const canIndent =
    currentSummary !== undefined &&
    getPreviousSibling(siblings, currentSummary.id) !== undefined;
  const canOutdent =
    currentSummary?.parentPageId !== null &&
    currentSummary?.parentPageId !== undefined &&
    pagesById.has(currentSummary.parentPageId);

  if (spaces === null) {
    return <div style={styles.muted}>Loading wiki…</div>;
  }

  if (spaces.length === 0) {
    return (
      <div style={styles.muted}>
        No wiki space yet. Create one from Wiki spaces in the sidebar.
      </div>
    );
  }

  return (
    <div style={styles.treePanel}>
      <div style={styles.sidebarHeader}>
        <select
          aria-label="Wiki space"
          style={styles.select}
          value={spaceId ?? ''}
          onChange={(event) => void switchSpace(event.target.value)}
        >
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.icon ? `${space.icon} ` : ''}
              {space.name || 'Untitled space'}
            </option>
          ))}
        </select>
        {draft === null ? (
          <div style={styles.treeActions}>
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconPlus size={14} />}
              disabled={isMutating}
              onClick={() => setDraft({ parentPageId: null, title: '' })}
            >
              Page
            </Button>
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconPlus size={14} />}
              disabled={!canEdit}
              onClick={() =>
                setDraft({ parentPageId: currentPageId, title: '' })
              }
            >
              Subpage
            </Button>
            <span style={styles.spacer} />
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move up"
              title="Move up"
              startIcon={<IconArrowUp size={14} />}
              disabled={!canEdit || currentIndex <= 0}
              onClick={() => void movePage('up')}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move down"
              title="Move down"
              startIcon={<IconArrowDown size={14} />}
              disabled={
                !canEdit ||
                currentIndex === -1 ||
                currentIndex >= siblings.length - 1
              }
              onClick={() => void movePage('down')}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label="Move out one level"
              title="Move out one level"
              startIcon={<IconArrowLeft size={14} />}
              disabled={!canEdit || !canOutdent}
              onClick={() => void outdentPage()}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label="Make subpage of the page above"
              title="Make subpage of the page above"
              startIcon={<IconArrowRight size={14} />}
              disabled={!canEdit || !canIndent}
              onClick={() => void indentPage()}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label="Refresh"
              title="Refresh"
              startIcon={<IconRefresh size={14} />}
              onClick={() => void refresh()}
            />
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submitDraft();
            }}
            style={styles.draftForm}
          >
            <input
              aria-label="Page title"
              autoFocus
              placeholder={
                draft.parentPageId === null
                  ? 'New page title'
                  : `Subpage of ${pagesById.get(draft.parentPageId)?.title || 'Untitled'}`
              }
              style={styles.input}
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setDraft(null);
                }
              }}
            />
            <div style={styles.treeActions}>
              <Button
                size="sm"
                variant="solid"
                color="accent"
                type="submit"
                loading={isMutating}
              >
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
      {childrenByParentKey[ROOT_PARENT_KEY]?.length === 0 ? (
        <div style={styles.muted}>No pages in this space yet.</div>
      ) : (
        <WikiPageTreeView
          rows={treeRows}
          selectedPageId={currentPageId}
          loadingPageIds={loadingPageIds}
          styles={styles}
          onToggle={(pageId) => void togglePage(pageId)}
          onSelect={(pageId) => {
            if (pageId !== currentPageId) {
              void openWikiPage(pageId);
            }
          }}
        />
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: WIKI_PAGE_TREE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'wiki-page-tree',
  description:
    'Page tree of the current wiki space, shown next to the open page',
  component: WikiPageTree,
});
