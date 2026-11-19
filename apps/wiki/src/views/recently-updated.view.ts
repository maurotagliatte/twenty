import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  RECENTLY_UPDATED_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WIKI_PAGE_SYSTEM_FIELDS } from 'src/constants/wiki-page-system-fields';
import { buildViewFields } from 'src/views/utils/build-view-fields';

export default defineView({
  universalIdentifier: RECENTLY_UPDATED_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Recently updated',
  objectUniversalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconClockEdit',
  position: 2,
  fields: buildViewFields([
    {
      universalIdentifier: 'c987dd71-4fc1-4643-86d6-93737c5f571d',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.title,
      size: 260,
    },
    {
      universalIdentifier: '22fc7257-ad50-4393-a854-1258fb6e2dc9',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_SYSTEM_FIELDS.updatedAt,
      size: 150,
    },
    {
      universalIdentifier: 'a572ee3e-2bc1-4660-8bbd-04b6cee9cc58',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_SYSTEM_FIELDS.updatedBy,
      size: 160,
    },
    {
      universalIdentifier: 'e5c68a1e-748d-41d0-9423-a2e2fa5912bc',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.space,
      size: 180,
    },
    {
      universalIdentifier: '1fbba4b5-e57d-4243-b300-482c1669b140',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.status,
      size: 120,
    },
  ]),
  filters: [
    {
      universalIdentifier: '778e3b9b-824d-43ac-9dad-b81b9dc7e9ba',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.status,
      operand: ViewFilterOperand.IS_NOT,
      value: ['ARCHIVED'],
    },
  ],
  sorts: [
    {
      universalIdentifier: '4fa9800e-062d-4f69-8f41-649e7e254d1d',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_SYSTEM_FIELDS.updatedAt,
      direction: ViewSortDirection.DESC,
    },
  ],
});
