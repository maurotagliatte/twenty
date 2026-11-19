import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  DRAFTS_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WIKI_PAGE_SYSTEM_FIELDS } from 'src/constants/wiki-page-system-fields';
import { buildViewFields } from 'src/views/utils/build-view-fields';

export default defineView({
  universalIdentifier: DRAFTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Drafts',
  objectUniversalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconPencil',
  position: 3,
  fields: buildViewFields([
    {
      universalIdentifier: '8dcca0cf-d8a4-4cb5-a8ed-e31979de8c81',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.title,
      size: 260,
    },
    {
      universalIdentifier: 'c7376304-60e2-4b04-b9c3-52e54b02d161',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.space,
      size: 180,
    },
    {
      universalIdentifier: 'dc6c8414-bed4-487b-8d02-61e04915135f',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.owner,
      size: 160,
    },
    {
      universalIdentifier: 'edae89b3-23f8-4c53-b08f-ee851e2b3db3',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_SYSTEM_FIELDS.updatedAt,
      size: 150,
    },
  ]),
  filters: [
    {
      universalIdentifier: '262a2050-0787-403d-9194-c68891deb91c',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.status,
      operand: ViewFilterOperand.IS,
      value: ['DRAFT'],
    },
  ],
  sorts: [
    {
      universalIdentifier: '011b2260-0ebd-4ec3-92f8-6725bb981fdc',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_SYSTEM_FIELDS.updatedAt,
      direction: ViewSortDirection.DESC,
    },
  ],
});
