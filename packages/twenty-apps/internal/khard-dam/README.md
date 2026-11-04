# DAM & BAM

Twenty app for digital asset management (DAM) and brand asset management (BAM),
built from native objects, fields, views and sidebar entries, plus three front
components that show the files themselves. It ships no logic functions or
external services, so it installs the same way in every workspace.

## Data model

| Object | API name | Purpose |
| --- | --- | --- |
| Asset | `damAsset` | One file (FILES field, master first plus alternate formats) with kind, category, review status, tags, keywords, description, alt text, source, credit, license, allowed channels, restrictions, usage expiry and dimensions/duration. Links to a Brand, a Company, a Person (contact) and a workspace member (owner). |
| Collection | `damCollection` | Curated set of assets (campaign, press kit). Optional Brand and cover image. |
| Collection asset | `damCollectionAsset` | Junction that lets an asset sit in many collections. No sidebar entry. |
| Brand | `damBrand` | Brand kit: primary logo, guidelines (rich text), tone of voice, colors, fonts, website, owning Company. Logo variants and other brand files are Assets with category Logo. |

Standard objects gain `company.damAssets`, `company.damBrands`,
`person.damAssets` and `workspaceMember.ownedDamAssets`. Object API names carry a
`dam` prefix so the app cannot collide with a workspace's own `asset`, `brand`
or `collection` object.

## Views and navigation

A "DAM & BAM" sidebar folder holds Assets, Review board (kanban by status),
Approved library (approved assets grouped by category), Expiring rights (usage
expires in the next 30 days), Collections, Brands and Brand logos. An "Expired
rights, still active" view is available from the Assets view picker.

## Asset browser

"Asset browser" (first entry of the DAM & BAM folder) is a standalone page with
three tabs, each a front component:

- Gallery: thumbnail grid of assets, 24 per page with "Load more", filtered by
  brand, status, category, kind, tag and a search over name, description and
  keywords, sorted by last update. A card opens the asset's record page.
- Brand kits: a brand's primary logo, color swatches (hex codes parsed from the
  Colors list), fonts, tone of voice and its approved assets.
- Collections: a collection's assets as a grid.

Brand records also get a "Brand kit" tab and collection records a "Gallery" tab.
The thumbnail is the first file of `files`; images render as `img`, videos as a
muted `video` frame, anything else as a file-type icon. Data is read with the
viewer's own token (their role intersected with the app's), so record and
field permissions apply, and file URLs are the signed URLs the API returns with
each record.

## Roles

- `DAM & BAM function role`: the app's own role, with no access.
- `Brand manager`: reads the CRM; creates, edits and deletes assets, collections and brands.
- `Asset contributor`: reads the CRM; creates and edits assets and collections; brands are read-only; cannot delete.

Roles assignable to members require the custom roles entitlement. It is granted
when billing is disabled; with billing enabled, a workspace without it cannot
install the app until those two role files are removed.

## Development

```bash
yarn install
yarn typecheck
yarn lint
yarn test
npx twenty@2.55.0 app build
```

Install into a workspace with `npx twenty@2.55.0 app apply --create` against a
saved remote (see the CLI README).
