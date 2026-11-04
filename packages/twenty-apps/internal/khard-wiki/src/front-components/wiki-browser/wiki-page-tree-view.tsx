import {
  IconChevronDown,
  IconChevronRight,
  IconFileText,
} from 'twenty-ui/icon';

import { type WikiBrowserStyles } from 'src/front-components/wiki-browser/build-wiki-browser-styles';
import { type WikiTreeRow } from 'src/utils/wiki-page-tree';

type WikiPageTreeViewProps = {
  rows: WikiTreeRow[];
  selectedPageId: string | null;
  loadingPageIds: ReadonlySet<string>;
  styles: WikiBrowserStyles;
  onToggle: (pageId: string) => void;
  onSelect: (pageId: string) => void;
};

const INDENT_PER_LEVEL_PX = 14;

export const WikiPageTreeView = ({
  rows,
  selectedPageId,
  loadingPageIds,
  styles,
  onToggle,
  onSelect,
}: WikiPageTreeViewProps) => (
  <div role="tree" style={styles.tree}>
    {rows.map(({ page, depth, isExpanded, childCount }) => {
      const isSelected = page.id === selectedPageId;
      const isLeaf = childCount === 0;

      return (
        <div
          key={page.id}
          role="treeitem"
          aria-selected={isSelected}
          aria-expanded={isLeaf ? undefined : isExpanded}
          tabIndex={0}
          style={{
            ...styles.treeRow,
            ...(isSelected ? styles.treeRowSelected : {}),
            paddingLeft: `${4 + depth * INDENT_PER_LEVEL_PX}px`,
          }}
          onClick={() => onSelect(page.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSelect(page.id);
            }
            if (event.key === 'ArrowRight' && !isExpanded) {
              onToggle(page.id);
            }
            if (event.key === 'ArrowLeft' && isExpanded) {
              onToggle(page.id);
            }
          }}
        >
          <button
            type="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            style={{
              ...styles.treeToggle,
              visibility: isLeaf ? 'hidden' : 'visible',
            }}
            onClick={(event) => {
              event.stopPropagation();
              onToggle(page.id);
            }}
          >
            {loadingPageIds.has(page.id) ? (
              '…'
            ) : isExpanded ? (
              <IconChevronDown size={14} />
            ) : (
              <IconChevronRight size={14} />
            )}
          </button>
          {page.icon ? (
            <span aria-hidden="true">{page.icon}</span>
          ) : (
            <IconFileText size={14} />
          )}
          <span style={styles.treeLabel}>{page.title || 'Untitled'}</span>
          {page.status === 'DRAFT' ? (
            <span style={styles.draftBadge}>Draft</span>
          ) : null}
        </div>
      );
    })}
  </div>
);
