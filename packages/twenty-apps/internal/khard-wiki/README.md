# Wiki

Twenty app for a knowledge base: spaces, nested pages and a page tree browser.
Data stays in native objects, so search, permissions, views and the record page
editor work as for any other object. No external services.

## Data model

| Object | API name | Purpose |
| --- | --- | --- |
| Wiki space | `wikiSpace` | Name, icon (emoji), description, visibility (informational: access is governed by roles). Has many pages. |
| Wiki page | `wikiPage` | Title, icon, `body` (RICH_TEXT), status (draft, published, archived), space, parent page and subpages (self relation), owner (workspace member), last reviewed, review by, tags (free-form array). Siblings are ordered by the system `position` field. |

`workspaceMember.ownedWikiPages` is the inverse of the owner relation. Both
objects and the page body are searchable.

A page is one record; its content is the whole rich text body. Links between
pages are meant to be extracted later from `mentionTag` nodes of the body into
a typed edge object and traversed with a recursive CTE.

## Views and navigation

A "Wiki" sidebar folder holds Browse wiki (the custom browser), Wiki spaces,
Wiki pages, Pages by space, Recently updated, Drafts and Needs review
(published pages whose review date has passed).

## Browser and editing

Browse wiki is a standalone page rendering the `wiki-browser` front component:
space selector, lazily loaded page tree, breadcrumb and a read-only view of the
body. The body is rendered from its TipTap JSON into React elements (no raw
HTML, unsafe URLs dropped). Actions: new page, new subpage, move up and down,
indent and outdent, publish, mark reviewed (sets the next review 90 days out)
and Open to edit.

Front components run in a sandboxed worker that cannot host a rich text
editor, so editing happens on the native record page: the app adds a "Page"
tab, first on the wiki page record page, with the native editor for `body`.

## Roles

- `Wiki function role`: the browser's ceiling. Its token is this role
  intersected with the viewer's, so the browser never exceeds what the viewer
  may do.
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
