import { useEffect, useMemo, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  enqueueSnackbar,
  navigate,
  useUserId,
} from 'twenty-sdk/front-component';
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCircleCheck,
  IconEdit,
  IconPlus,
  IconRefresh,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { WIKI_BROWSER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWikiBrowserStyles } from 'src/front-components/wiki-browser/build-wiki-browser-styles';
import { describeApiError } from 'src/front-components/wiki-browser/describe-api-error';
import {
  createWikiPage,
  findWorkspaceMemberIdByUserId,
  getWikiPage,
  listChildPages,
  listWikiSpaces,
  updateWikiPage,
  type WikiPageDetail,
  type WikiSpace,
} from 'src/front-components/wiki-browser/wiki-api';
import { WikiPageReader } from 'src/front-components/wiki-browser/wiki-page-reader';
import { WikiPageTreeView } from 'src/front-components/wiki-browser/wiki-page-tree-view';
import { computeReviewDates } from 'src/utils/compute-review-dates';
import {
  applyPositionUpdates,
  buildBreadcrumb,
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

const SELECTED_SPACE_STORAGE_KEY = 'khard-wiki:selected-space';
const WIKI_PAGE_OBJECT_NAME_SINGULAR = 'wikiPage';

type PageDraft = { parentPageId: string | null; title: string };

const readStoredSpaceId = () => {
  try {
    return localStorage.getItem(SELECTED_SPACE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const storeSpaceId = (spaceId: string) => {
  try {
    localStorage.setItem(SELECTED_SPACE_STORAGE_KEY, spaceId);
  } catch {
    // Storage is a convenience; the browser still works without it.
  }
};

const showError = (message: string) =>
  enqueueSnackbar({ message, variant: 'error' });

const WikiBrowser = () => {
  const theme = useTheme();
  const styles = useMemo(() => buildWikiBrowserStyles(theme), [theme]);
  const userId = useUserId();

  const [spaces, setSpaces] = useState<WikiSpace[] | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [childrenByParentKey, setChildrenByParentKey] =
    useState<ChildrenByParentKey>({});
  const [expandedPageIds, setExpandedPageIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [loadingPageIds, setLoadingPageIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<WikiPageDetail | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [draft, setDraft] = useState<PageDraft | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const latestPageRequestRef = useRef<string | null>(null);
  const workspaceMemberIdRef = useRef<string | null | undefined>(undefined);

  const pagesById = useMemo(
    () => indexLoadedPages(childrenByParentKey),
    [childrenByParentKey],
  );
  const treeRows = useMemo(
    () => flattenVisibleTree({ childrenByParentKey, expandedPageIds }),
    [childrenByParentKey, expandedPageIds],
  );
  const selectedSummary =
    selectedPageId === null ? undefined : pagesById.get(selectedPageId);
  const breadcrumb =
    selectedPageId === null ? [] : buildBreadcrumb(pagesById, selectedPageId);
  const selectedSpace = spaces?.find((space) => space.id === selectedSpaceId);

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

  const loadChildren = async (spaceId: string, parentPageId: string | null) => {
    const parentKey = getParentKey(parentPageId);

    if (parentPageId !== null) {
      setPageLoading(parentPageId, true);
    }

    try {
      const pages = await listChildPages({ spaceId, parentPageId });

      setChildrenByParentKey((previous) => ({
        ...previous,
        [parentKey]: pages,
      }));

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

  const selectSpace = async (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setChildrenByParentKey({});
    setExpandedPageIds(new Set());
    setSelectedPageId(null);
    setSelectedPage(null);
    setDraft(null);
    storeSpaceId(spaceId);
    await loadChildren(spaceId, null);
  };

  const loadSpaces = async () => {
    try {
      const loadedSpaces = await listWikiSpaces();
      const storedSpaceId = readStoredSpaceId();
      const initialSpace =
        loadedSpaces.find((space) => space.id === storedSpaceId) ??
        loadedSpaces[0];

      setSpaces(loadedSpaces);

      if (initialSpace !== undefined) {
        await selectSpace(initialSpace.id);
      }
    } catch (error) {
      setSpaces([]);
      showError(describeApiError(error, 'load wiki spaces'));
    }
  };

  useEffect(() => {
    void loadSpaces();
    // Initial fetch only; later loads are driven by user actions.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectPage = async (pageId: string) => {
    latestPageRequestRef.current = pageId;
    setSelectedPageId(pageId);
    setIsPageLoading(true);

    try {
      const page = await getWikiPage(pageId);

      if (latestPageRequestRef.current === pageId) {
        setSelectedPage(page);
      }
    } catch (error) {
      if (latestPageRequestRef.current === pageId) {
        setSelectedPage(null);
        showError(describeApiError(error, 'open this page'));
      }
    } finally {
      if (latestPageRequestRef.current === pageId) {
        setIsPageLoading(false);
      }
    }
  };

  const expandPage = (pageId: string) =>
    setExpandedPageIds((previous) => new Set(previous).add(pageId));

  const togglePage = async (pageId: string) => {
    if (expandedPageIds.has(pageId)) {
      setExpandedPageIds((previous) => {
        const next = new Set(previous);

        next.delete(pageId);

        return next;
      });

      return;
    }

    expandPage(pageId);

    if (childrenByParentKey[pageId] === undefined && selectedSpaceId !== null) {
      await loadChildren(selectedSpaceId, pageId);
    }
  };

  const resolveWorkspaceMemberId = async () => {
    if (workspaceMemberIdRef.current !== undefined || userId === null) {
      return workspaceMemberIdRef.current ?? null;
    }

    try {
      workspaceMemberIdRef.current =
        await findWorkspaceMemberIdByUserId(userId);
    } catch {
      workspaceMemberIdRef.current = null;
    }

    return workspaceMemberIdRef.current;
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
      if (draft === null || selectedSpaceId === null) {
        return;
      }

      const { parentPageId } = draft;
      const siblings =
        childrenByParentKey[getParentKey(parentPageId)] ??
        (await loadChildren(selectedSpaceId, parentPageId));

      const createdPage = await createWikiPage({
        title: draft.title.trim() || 'Untitled',
        spaceId: selectedSpaceId,
        parentPageId,
        position: getPositionAfterLast(siblings),
        ownerId: await resolveWorkspaceMemberId(),
      });

      setDraft(null);
      await loadChildren(selectedSpaceId, parentPageId);

      if (parentPageId !== null) {
        expandPage(parentPageId);
      }

      await selectPage(createdPage.id);
      await enqueueSnackbar({ message: 'Page created', variant: 'success' });
    });

  const movePage = (direction: 'up' | 'down') =>
    runMutation('move the page', async () => {
      if (selectedSummary === undefined) {
        return;
      }

      const parentKey = getParentKey(selectedSummary.parentPageId);
      const siblings = childrenByParentKey[parentKey] ?? [];
      const updates = computeSiblingMove(
        siblings,
        selectedSummary.id,
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
      if (selectedSummary === undefined || selectedSpaceId === null) {
        return;
      }

      const newParent = getPreviousSibling(
        childrenByParentKey[getParentKey(selectedSummary.parentPageId)] ?? [],
        selectedSummary.id,
      );

      if (newParent === undefined) {
        return;
      }

      const newSiblings =
        childrenByParentKey[newParent.id] ??
        (await loadChildren(selectedSpaceId, newParent.id));
      const position = getPositionAfterLast(newSiblings);

      await updateWikiPage(selectedSummary.id, {
        parentPageId: newParent.id,
        position,
      });
      reparentLocally(selectedSummary, newParent.id, position);
      expandPage(newParent.id);
    });

  const outdentPage = () =>
    runMutation('move the page', async () => {
      const parent =
        selectedSummary?.parentPageId === null ||
        selectedSummary?.parentPageId === undefined
          ? undefined
          : pagesById.get(selectedSummary.parentPageId);

      if (selectedSummary === undefined || parent === undefined) {
        return;
      }

      const position = getPositionAfter(
        childrenByParentKey[getParentKey(parent.parentPageId)] ?? [],
        parent.id,
      );

      await updateWikiPage(selectedSummary.id, {
        parentPageId: parent.parentPageId,
        position,
      });
      reparentLocally(selectedSummary, parent.parentPageId, position);
    });

  const markReviewed = () =>
    runMutation('mark the page as reviewed', async () => {
      if (selectedPageId === null) {
        return;
      }

      await updateWikiPage(selectedPageId, computeReviewDates(new Date()));
      await selectPage(selectedPageId);
      await enqueueSnackbar({
        message: 'Marked as reviewed',
        variant: 'success',
      });
    });

  const publishPage = () =>
    runMutation('publish the page', async () => {
      if (selectedPageId === null || selectedSummary === undefined) {
        return;
      }

      await updateWikiPage(selectedPageId, { status: 'PUBLISHED' });
      const parentKey = getParentKey(selectedSummary.parentPageId);

      setChildrenByParentKey((previous) => ({
        ...previous,
        [parentKey]: (previous[parentKey] ?? []).map((page) =>
          page.id === selectedPageId ? { ...page, status: 'PUBLISHED' } : page,
        ),
      }));
      await selectPage(selectedPageId);
    });

  const openRecord = ({
    objectNameSingular,
    recordId,
  }: {
    objectNameSingular: string;
    recordId: string;
  }) => {
    if (
      objectNameSingular === WIKI_PAGE_OBJECT_NAME_SINGULAR &&
      pagesById.has(recordId)
    ) {
      void selectPage(recordId);

      return;
    }

    void navigate(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: recordId,
    });
  };

  const openSelectedPageToEdit = () => {
    if (selectedPageId !== null) {
      void navigate(AppPath.RecordShowPage, {
        objectNameSingular: WIKI_PAGE_OBJECT_NAME_SINGULAR,
        objectRecordId: selectedPageId,
      });
    }
  };

  const refresh = async () => {
    if (selectedSpaceId === null) {
      await loadSpaces();

      return;
    }

    await loadChildren(selectedSpaceId, null);

    for (const pageId of expandedPageIds) {
      await loadChildren(selectedSpaceId, pageId);
    }

    if (selectedPageId !== null) {
      await selectPage(selectedPageId);
    }
  };

  const selectedSiblings =
    selectedSummary === undefined
      ? []
      : (childrenByParentKey[getParentKey(selectedSummary.parentPageId)] ?? []);
  const canIndent =
    selectedSummary !== undefined &&
    getPreviousSibling(selectedSiblings, selectedSummary.id) !== undefined;
  const canOutdent =
    selectedSummary?.parentPageId !== null &&
    selectedSummary?.parentPageId !== undefined &&
    pagesById.has(selectedSummary.parentPageId);
  const selectedIndex = selectedSiblings.findIndex(
    (page) => page.id === selectedPageId,
  );
  const hasSelection = selectedSummary !== undefined && !isMutating;

  if (spaces === null) {
    return <div style={styles.muted}>Loading wiki…</div>;
  }

  if (spaces.length === 0) {
    return (
      <div style={styles.muted}>
        No wiki space yet. Create one from Wiki spaces in the sidebar, then come
        back here to build its pages.
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <select
            aria-label="Wiki space"
            style={styles.select}
            value={selectedSpaceId ?? ''}
            onChange={(event) => void selectSpace(event.target.value)}
          >
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.icon ? `${space.icon} ` : ''}
                {space.name || 'Untitled space'}
              </option>
            ))}
          </select>
          {draft === null ? (
            <div style={{ display: 'flex', gap: theme.spacing[1] }}>
              <Button
                size="sm"
                variant="outline"
                startIcon={<IconPlus size={14} />}
                disabled={isMutating}
                onClick={() => setDraft({ parentPageId: null, title: '' })}
              >
                New page
              </Button>
              <Button
                size="sm"
                variant="outline"
                startIcon={<IconPlus size={14} />}
                disabled={!hasSelection}
                onClick={() =>
                  setDraft({ parentPageId: selectedPageId, title: '' })
                }
              >
                New subpage
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Refresh"
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
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
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
              <div style={{ display: 'flex', gap: theme.spacing[1] }}>
                <Button
                  size="sm"
                  variant="solid"
                  color="accent"
                  type="submit"
                  loading={isMutating}
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDraft(null)}
                >
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
            selectedPageId={selectedPageId}
            loadingPageIds={loadingPageIds}
            styles={styles}
            onToggle={(pageId) => void togglePage(pageId)}
            onSelect={(pageId) => void selectPage(pageId)}
          />
        )}
      </aside>
      <main style={styles.main}>
        <div style={styles.toolbar}>
          <nav aria-label="Breadcrumb" style={styles.breadcrumb}>
            <span>
              {selectedSpace?.icon ? `${selectedSpace.icon} ` : ''}
              {selectedSpace?.name || 'Untitled space'}
            </span>
            {breadcrumb.map((page) => (
              <span key={page.id} style={{ display: 'flex', gap: '4px' }}>
                <span aria-hidden="true">/</span>
                <button
                  type="button"
                  style={styles.breadcrumbLink}
                  onClick={() => void selectPage(page.id)}
                >
                  {page.title || 'Untitled'}
                </button>
              </span>
            ))}
          </nav>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Move up"
            title="Move up"
            startIcon={<IconArrowUp size={14} />}
            disabled={!hasSelection || selectedIndex <= 0}
            onClick={() => void movePage('up')}
          />
          <Button
            size="sm"
            variant="ghost"
            aria-label="Move down"
            title="Move down"
            startIcon={<IconArrowDown size={14} />}
            disabled={
              !hasSelection ||
              selectedIndex === -1 ||
              selectedIndex >= selectedSiblings.length - 1
            }
            onClick={() => void movePage('down')}
          />
          <Button
            size="sm"
            variant="ghost"
            aria-label="Move out one level"
            title="Move out one level"
            startIcon={<IconArrowLeft size={14} />}
            disabled={!hasSelection || !canOutdent}
            onClick={() => void outdentPage()}
          />
          <Button
            size="sm"
            variant="ghost"
            aria-label="Make subpage of the page above"
            title="Make subpage of the page above"
            startIcon={<IconArrowRight size={14} />}
            disabled={!hasSelection || !canIndent}
            onClick={() => void indentPage()}
          />
          {selectedPage?.status === 'DRAFT' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={!hasSelection}
              onClick={() => void publishPage()}
            >
              Publish
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            startIcon={<IconCircleCheck size={14} />}
            disabled={!hasSelection}
            onClick={() => void markReviewed()}
          >
            Mark reviewed
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="accent"
            startIcon={<IconEdit size={14} />}
            disabled={selectedPageId === null}
            onClick={openSelectedPageToEdit}
          >
            Open to edit
          </Button>
        </div>
        <div style={styles.reader}>
          {selectedPageId === null ? (
            <div style={styles.muted}>
              Pick a page in the tree, or create one with New page.
            </div>
          ) : isPageLoading && selectedPage?.id !== selectedPageId ? (
            <div style={styles.muted}>Loading page…</div>
          ) : selectedPage === null ? null : (
            <WikiPageReader
              page={selectedPage}
              styles={styles}
              onOpenRecord={openRecord}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: WIKI_BROWSER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'wiki-browser',
  description:
    'Browse a wiki space as a page tree, read pages and organise them',
  component: WikiBrowser,
});
