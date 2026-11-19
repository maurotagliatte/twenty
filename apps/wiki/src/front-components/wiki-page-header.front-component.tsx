import { useEffect, useMemo, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import {
  IconCircleCheck,
  IconFileText,
  IconMoodSmile,
  IconPlus,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { WIKI_PAGE_HEADER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WIKI_PAGE_STATUS_OPTIONS } from 'src/constants/wiki-options';
import {
  buildWikiStyles,
  type WikiStyles,
} from 'src/front-components/shared/build-wiki-styles';
import { describeApiError } from 'src/front-components/shared/describe-api-error';
import { formatRelativeDate } from 'src/front-components/shared/format-relative-date';
import { openWikiPage } from 'src/front-components/shared/open-wiki-page';
import { useResolveWorkspaceMemberId } from 'src/front-components/shared/use-workspace-member-id';
import {
  createWikiPage,
  getWikiPage,
  listSubpages,
  updateWikiPage,
  type WikiPageDetail,
  type WikiPageOwner,
  type WikiSubpage,
} from 'src/front-components/shared/wiki-api';
import { computeReviewDates } from 'src/utils/compute-review-dates';
import { toSafeImageUrl } from 'src/utils/safe-url';
import { getPositionAfterLast } from 'src/utils/wiki-page-tree';

const showError = (message: string) =>
  enqueueSnackbar({ message, variant: 'error' });

const formatOwnerName = (owner: WikiPageOwner | null) =>
  [owner?.name?.firstName, owner?.name?.lastName]
    .filter((part) => Boolean(part))
    .join(' ');

type OwnerBadgeProps = {
  owner: WikiPageOwner | null;
  styles: WikiStyles;
};

const OwnerBadge = ({ owner, styles }: OwnerBadgeProps) => {
  const name = formatOwnerName(owner);

  if (name === '') {
    return <span style={styles.metaMuted}>No owner</span>;
  }

  const avatarUrl = toSafeImageUrl(owner?.avatarUrl);

  return (
    <span style={styles.owner}>
      {avatarUrl === undefined ? (
        <span style={styles.avatarFallback}>{name[0]?.toUpperCase()}</span>
      ) : (
        <img src={avatarUrl} alt="" style={styles.avatar} />
      )}
      {name}
    </span>
  );
};

const WikiPageHeader = () => {
  const theme = useTheme();
  const styles = useMemo(() => buildWikiStyles(theme), [theme]);
  const pageId = useRecordId();
  const resolveWorkspaceMemberId = useResolveWorkspaceMemberId();

  const [page, setPage] = useState<WikiPageDetail | null>(null);
  const [subpages, setSubpages] = useState<WikiSubpage[]>([]);
  const [titleDraft, setTitleDraft] = useState('');
  const [iconDraft, setIconDraft] = useState<string | null>(null);
  const [subpageDraft, setSubpageDraft] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const latestRequestRef = useRef<string | null>(null);

  const load = async (targetPageId: string) => {
    latestRequestRef.current = targetPageId;

    try {
      const [loadedPage, loadedSubpages] = await Promise.all([
        getWikiPage(targetPageId),
        listSubpages(targetPageId),
      ]);

      if (latestRequestRef.current === targetPageId) {
        setPage(loadedPage);
        setTitleDraft(loadedPage.title ?? '');
        setSubpages(loadedSubpages);
      }
    } catch (error) {
      if (latestRequestRef.current === targetPageId) {
        showError(describeApiError(error, 'load this page'));
      }
    }
  };

  useEffect(() => {
    setPage(null);
    setSubpages([]);
    setIconDraft(null);
    setSubpageDraft(null);

    if (pageId !== null) {
      void load(pageId);
    }
    // Re-run only when the host navigates to another record.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const runMutation = async (action: string, mutation: () => Promise<void>) => {
    if (pageId === null) {
      return;
    }

    setIsMutating(true);

    try {
      await mutation();
      await load(pageId);
    } catch (error) {
      showError(describeApiError(error, action));
    } finally {
      setIsMutating(false);
    }
  };

  const saveTitle = () => {
    const title = titleDraft.trim();

    if (page === null || title === (page.title ?? '')) {
      return;
    }

    void runMutation('rename the page', () =>
      updateWikiPage(page.id, { title }),
    );
  };

  const saveIcon = () => {
    if (page === null || iconDraft === null) {
      return;
    }

    const icon = iconDraft.trim();

    setIconDraft(null);

    if (icon !== (page.icon ?? '')) {
      void runMutation('change the icon', () =>
        updateWikiPage(page.id, { icon: icon === '' ? null : icon }),
      );
    }
  };

  const createSubpage = () =>
    runMutation('create the subpage', async () => {
      if (page === null || page.spaceId === null || subpageDraft === null) {
        return;
      }

      const createdPage = await createWikiPage({
        title: subpageDraft.trim() || 'Untitled',
        spaceId: page.spaceId,
        parentPageId: page.id,
        position: getPositionAfterLast(subpages),
        ownerId: await resolveWorkspaceMemberId(),
      });

      setSubpageDraft(null);
      await openWikiPage(createdPage.id);
    });

  if (page === null) {
    return <div style={styles.muted}>Loading page…</div>;
  }

  const coverUrl = toSafeImageUrl(page.cover?.[0]?.url);
  const status = WIKI_PAGE_STATUS_OPTIONS.find(
    (option) => option.value === page.status,
  );
  const updatedByName = page.updatedBy?.name;

  return (
    <div style={styles.document}>
      {coverUrl === undefined ? null : (
        <img src={coverUrl} alt="" style={styles.cover} />
      )}
      <div style={styles.documentBody}>
        <div style={styles.iconRow}>
          {iconDraft !== null ? (
            <input
              aria-label="Page icon"
              autoFocus
              placeholder="Paste an emoji"
              style={styles.iconInput}
              value={iconDraft}
              onChange={(event) => setIconDraft(event.target.value)}
              onBlur={saveIcon}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  saveIcon();
                }
                if (event.key === 'Escape') {
                  setIconDraft(null);
                }
              }}
            />
          ) : page.icon ? (
            <button
              type="button"
              title="Change icon"
              style={styles.pageIcon}
              onClick={() => setIconDraft(page.icon ?? '')}
            >
              {page.icon}
            </button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              startIcon={<IconMoodSmile size={14} />}
              onClick={() => setIconDraft('')}
            >
              Add icon
            </Button>
          )}
        </div>
        <input
          aria-label="Page title"
          placeholder="Untitled"
          style={styles.titleInput}
          value={titleDraft}
          onChange={(event) => setTitleDraft(event.target.value)}
          onBlur={saveTitle}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              saveTitle();
            }
          }}
        />
        <div style={styles.metaRow}>
          <OwnerBadge owner={page.owner} styles={styles} />
          {page.updatedAt === null ? null : (
            <span style={styles.metaMuted}>
              Updated {formatRelativeDate(page.updatedAt)}
              {updatedByName ? ` by ${updatedByName}` : ''}
            </span>
          )}
          {status === undefined ? null : (
            <span style={styles.statusChip}>{status.label}</span>
          )}
          {page.nextReviewAt === null ? null : (
            <span style={styles.metaMuted}>
              Review {formatRelativeDate(page.nextReviewAt)}
            </span>
          )}
          <span style={styles.spacer} />
          {page.status === 'DRAFT' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={() =>
                void runMutation('publish the page', () =>
                  updateWikiPage(page.id, { status: 'PUBLISHED' }),
                )
              }
            >
              Publish
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconCircleCheck size={14} />}
            disabled={isMutating}
            onClick={() =>
              void runMutation('mark the page as reviewed', async () => {
                await updateWikiPage(page.id, computeReviewDates(new Date()));
                await enqueueSnackbar({
                  message: 'Marked as reviewed',
                  variant: 'success',
                });
              })
            }
          >
            Mark reviewed
          </Button>
        </div>
        <section style={styles.subpages}>
          <div style={styles.subpagesHeader}>
            <span style={styles.sectionTitle}>
              Subpages{subpages.length > 0 ? ` (${subpages.length})` : ''}
            </span>
            {subpageDraft === null ? (
              <Button
                size="sm"
                variant="ghost"
                startIcon={<IconPlus size={14} />}
                disabled={isMutating}
                onClick={() => setSubpageDraft('')}
              >
                Add subpage
              </Button>
            ) : null}
          </div>
          {subpageDraft === null ? null : (
            <form
              style={styles.inlineForm}
              onSubmit={(event) => {
                event.preventDefault();
                void createSubpage();
              }}
            >
              <input
                aria-label="Subpage title"
                autoFocus
                placeholder="Subpage title"
                style={styles.input}
                value={subpageDraft}
                onChange={(event) => setSubpageDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSubpageDraft(null);
                  }
                }}
              />
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
                onClick={() => setSubpageDraft(null)}
              >
                Cancel
              </Button>
            </form>
          )}
          {subpages.length === 0 ? null : (
            <table style={styles.subpageTable}>
              <thead>
                <tr>
                  <th style={styles.subpageHeadCell}>Name</th>
                  <th style={styles.subpageHeadCell}>Owner</th>
                  <th style={styles.subpageHeadCell}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {subpages.map((subpage) => (
                  <tr
                    key={subpage.id}
                    style={styles.subpageRow}
                    onClick={() => void openWikiPage(subpage.id)}
                  >
                    <td style={styles.subpageCell}>
                      <span style={styles.subpageName}>
                        {subpage.icon ? (
                          <span aria-hidden="true">{subpage.icon}</span>
                        ) : (
                          <IconFileText size={14} />
                        )}
                        {subpage.title || 'Untitled'}
                        {subpage.status === 'DRAFT' ? (
                          <span style={styles.draftBadge}>Draft</span>
                        ) : null}
                      </span>
                    </td>
                    <td style={styles.subpageCell}>
                      <OwnerBadge owner={subpage.owner} styles={styles} />
                    </td>
                    <td style={{ ...styles.subpageCell, ...styles.metaMuted }}>
                      {subpage.updatedAt === null
                        ? ''
                        : formatRelativeDate(subpage.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: WIKI_PAGE_HEADER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'wiki-page-header',
  description:
    'Document header of a wiki page: cover, icon, title, owner, status and subpages',
  component: WikiPageHeader,
});
