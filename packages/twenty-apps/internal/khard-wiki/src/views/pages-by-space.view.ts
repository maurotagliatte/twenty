import { defineView, ViewSortDirection, ViewType } from 'twenty-sdk/define';

import {
  PAGES_BY_SPACE_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WIKI_PAGE_SYSTEM_FIELDS } from 'src/constants/wiki-page-system-fields';
import { buildViewFields } from 'src/views/utils/build-view-fields';

export default defineView({
  universalIdentifier: PAGES_BY_SPACE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Pages by space',
  objectUniversalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBooks',
  position: 1,
  fields: buildViewFields([
    {
      universalIdentifier: 'b36e898b-3f34-4a6f-971d-c83590f6f218',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.title,
      size: 260,
    },
    {
      universalIdentifier: '2bb6115d-2fdf-4502-b9d1-a83fa87a6105',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.space,
      size: 180,
    },
    {
      universalIdentifier: '67d3557d-0f23-4707-96a8-b279504ea0b0',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.parentPage,
      size: 200,
    },
    {
      universalIdentifier: 'c16e3b9c-7d67-4050-a43c-afef2cf4a507',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.status,
      size: 120,
    },
    {
      universalIdentifier: 'c609f475-fcf3-4406-92d8-e4d17c57cb51',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.owner,
      size: 160,
    },
    {
      universalIdentifier: '0c24166c-fbc7-4554-84d0-625a7309be59',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.tags,
      size: 180,
    },
    {
      universalIdentifier: '2b7536f4-9066-4864-ac66-5a643f33c3a7',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_SYSTEM_FIELDS.updatedAt,
      size: 150,
    },
  ]),
  sorts: [
    {
      universalIdentifier: '560c40bc-b078-421f-bc54-21514acf0d62',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.space,
      direction: ViewSortDirection.ASC,
    },
    {
      universalIdentifier: 'aaf267f1-93d5-481d-9278-730c70170f8b',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.title,
      direction: ViewSortDirection.ASC,
    },
  ],
});
