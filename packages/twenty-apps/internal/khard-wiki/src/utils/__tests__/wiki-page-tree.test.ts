import { describe, expect, it } from 'vitest';

import {
  buildBreadcrumb,
  computeSiblingMove,
  flattenVisibleTree,
  getPositionAfter,
  getPositionAfterLast,
  getPreviousSibling,
  indexLoadedPages,
  ROOT_PARENT_KEY,
  type WikiPageSummary,
} from 'src/utils/wiki-page-tree';

const page = (
  id: string,
  overrides: Partial<WikiPageSummary> = {},
): WikiPageSummary => ({
  id,
  title: id,
  icon: null,
  status: 'PUBLISHED',
  position: null,
  parentPageId: null,
  spaceId: 'space',
  ...overrides,
});

describe('flattenVisibleTree', () => {
  const childrenByParentKey = {
    [ROOT_PARENT_KEY]: [page('b', { position: 2 }), page('a', { position: 1 })],
    a: [
      page('a2', { parentPageId: 'a', position: 2 }),
      page('a1', { parentPageId: 'a', position: 1 }),
    ],
    a1: [],
  };

  it('orders siblings by position and hides collapsed children', () => {
    const rows = flattenVisibleTree({
      childrenByParentKey,
      expandedPageIds: new Set(),
    });

    expect(rows.map((row) => row.page.id)).toEqual(['a', 'b']);
    expect(rows[0].childCount).toBe(2);
    expect(rows[1].childCount).toBeUndefined();
  });

  it('nests expanded children one level deeper', () => {
    const rows = flattenVisibleTree({
      childrenByParentKey,
      expandedPageIds: new Set(['a', 'a1']),
    });

    expect(rows.map((row) => [row.page.id, row.depth])).toEqual([
      ['a', 0],
      ['a1', 1],
      ['a2', 1],
      ['b', 0],
    ]);
    expect(rows[1].childCount).toBe(0);
  });

  it('falls back to title order when positions tie or are missing', () => {
    const rows = flattenVisibleTree({
      childrenByParentKey: {
        [ROOT_PARENT_KEY]: [
          page('zeta'),
          page('alpha'),
          page('first', { position: 0 }),
        ],
      },
      expandedPageIds: new Set(),
    });

    expect(rows.map((row) => row.page.id)).toEqual(['first', 'alpha', 'zeta']);
  });

  it('survives a parent cycle in the data', () => {
    const rows = flattenVisibleTree({
      childrenByParentKey: {
        [ROOT_PARENT_KEY]: [page('a')],
        a: [page('b', { parentPageId: 'a' })],
        b: [page('a', { parentPageId: 'b' })],
      },
      expandedPageIds: new Set(['a', 'b']),
    });

    expect(rows.map((row) => row.page.id)).toEqual(['a', 'b']);
  });
});

describe('buildBreadcrumb', () => {
  it('walks parents from the root to the page', () => {
    const pagesById = indexLoadedPages({
      [ROOT_PARENT_KEY]: [page('root')],
      root: [page('child', { parentPageId: 'root' })],
      child: [page('leaf', { parentPageId: 'child' })],
    });

    expect(buildBreadcrumb(pagesById, 'leaf').map(({ id }) => id)).toEqual([
      'root',
      'child',
      'leaf',
    ]);
  });

  it('stops on a cycle instead of looping forever', () => {
    const pagesById = new Map([
      ['a', page('a', { parentPageId: 'b' })],
      ['b', page('b', { parentPageId: 'a' })],
    ]);

    expect(buildBreadcrumb(pagesById, 'a').map(({ id }) => id)).toEqual([
      'b',
      'a',
    ]);
  });
});

describe('positions', () => {
  const siblings = [
    page('a', { position: 1 }),
    page('b', { position: 2 }),
    page('c', { position: 4 }),
  ];

  it('appends after the last sibling', () => {
    expect(getPositionAfterLast(siblings)).toBe(5);
    expect(getPositionAfterLast([])).toBe(1);
  });

  it('slots between an anchor and its next sibling', () => {
    expect(getPositionAfter(siblings, 'b')).toBe(3);
    expect(getPositionAfter(siblings, 'c')).toBe(5);
  });

  it('finds the previous sibling to indent under', () => {
    expect(getPreviousSibling(siblings, 'b')?.id).toBe('a');
    expect(getPreviousSibling(siblings, 'a')).toBeUndefined();
  });
});

describe('computeSiblingMove', () => {
  it('swaps two distinct positions', () => {
    const siblings = [page('a', { position: 1 }), page('b', { position: 2 })];

    expect(computeSiblingMove(siblings, 'b', 'up')).toEqual([
      { id: 'b', position: 1 },
      { id: 'a', position: 2 },
    ]);
  });

  it('renumbers when positions tie so the move is visible', () => {
    const siblings = [
      page('a', { position: 0 }),
      page('b', { position: 0 }),
      page('c', { position: 0 }),
    ];

    expect(computeSiblingMove(siblings, 'c', 'up')).toEqual([
      { id: 'a', position: 1 },
      { id: 'c', position: 2 },
      { id: 'b', position: 3 },
    ]);
  });

  it('does nothing at the edges', () => {
    const siblings = [page('a', { position: 1 }), page('b', { position: 2 })];

    expect(computeSiblingMove(siblings, 'a', 'up')).toEqual([]);
    expect(computeSiblingMove(siblings, 'b', 'down')).toEqual([]);
  });
});
