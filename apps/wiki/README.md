# Wiki

Twenty app for a knowledge base: spaces and nested pages shown as documents with a page tree.
Data stays in native objects, so search, permissions, views and the record page
editor work as for any other object. No external services.

## Data model

| Object | API name | Purpose |
| --- | --- | --- |
| Wiki space | `wikiSpace` | Name, icon (emoji), description, visibility (informational: access is governed by roles). Has many pages. |
| Wiki page | `wikiPage` | Title, icon, cover (FILES, one image), `body` (RICH_TEXT), status (draft, published, archived), space, parent page and subpages (self relation), owner (workspace member), last reviewed, review by, tags (free-form array). Siblings are ordered by the system `position` field. |

`workspaceMember.ownedWikiPages` is the inverse of the owner relation. Both
objects and the page body are searchable.

A page is one record; its content is the whole rich text body. Links between
pages are meant to be extracted later from `mentionTag` nodes of the body into
a typed edge object and traversed with a recursive CTE.

## Views and navigation

A "Wiki" sidebar folder holds Wiki home, Wiki spaces and Wiki pages. The saved
views Pages by space, Recently updated, Drafts and Needs review (published
pages whose review date has passed) live in the Wiki pages view picker.

## Page experience

Each wiki page record reads as a document:

- Left column: the `wiki-page-tree` front component in a "Pages" tab. The
  record page pins its lowest positioned tab to the left, so this tab sits at
  position 1. Space selector, lazily loaded tree that expands to the open page,
  new page, new subpage, move up and down, indent and outdent. Clicking a page
  navigates to its record.
- "Page" tab: the `wiki-page-header` front component (cover, icon and title
  edited inline, owner, last update, status, review date, Publish, Mark
  reviewed, subpages table with Add subpage) above the native rich text editor
  for `body`, which fills the rest of the tab.
- Wiki home: a standalone page whose `wiki-home` component opens the most
  recently updated page (with `replace`, so Back does not bounce into it) or
  offers to create the first page.

Front components run in a sandboxed worker that cannot host a rich text editor,
which is why the body stays in the native editor. The cover is a FILES field
(`cover`) uploaded from the record's fields tab; components cannot upload.

## Roles

- `Wiki function role`: the front components' ceiling. Their token is this
  role intersected with the viewer's, so they never exceed what the viewer may
  do.
- `Wiki editor`: reads the CRM; creates, edits and deletes wiki spaces and pages.

## Development

```bash
yarn install
yarn typecheck
yarn lint
yarn test
npx twenty@2.55.0 app build
```

Install into a workspace with `npx twenty@2.55.0 app apply --create` against a
saved remote.
