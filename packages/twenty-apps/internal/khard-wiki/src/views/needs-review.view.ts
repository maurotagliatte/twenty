import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildViewFields } from 'src/views/utils/build-view-fields';

export default defineView({
  universalIdentifier: NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Needs review',
  objectUniversalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCalendarDue',
  position: 4,
  fields: buildViewFields([
    {
      universalIdentifier: '04ea3380-9225-4bd7-8c0b-6e22a3ff7f40',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.title,
      size: 260,
    },
    {
      universalIdentifier: 'db6256d0-63ee-46d0-a016-46533a49a19e',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.nextReviewAt,
      size: 140,
    },
    {
      universalIdentifier: '99cc633b-e999-4655-bae9-701c1ef96b3b',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.lastReviewedAt,
      size: 140,
    },
    {
      universalIdentifier: 'f15b6b7f-accd-4c30-89d8-ced5e9b727d2',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.owner,
      size: 160,
    },
    {
      universalIdentifier: 'd1e89536-e324-420c-bd0d-9587c26be97e',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.space,
      size: 180,
    },
  ]),
  filters: [
    {
      universalIdentifier: '0f331980-81af-4457-93ab-1f659e4cbca9',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.status,
      operand: ViewFilterOperand.IS,
      value: ['PUBLISHED'],
    },
    {
      universalIdentifier: '7d967ad3-718e-4b6f-980f-e408d6660286',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.nextReviewAt,
      operand: ViewFilterOperand.IS_IN_PAST,
      value: '',
    },
  ],
  sorts: [
    {
      universalIdentifier: 'bda1930b-d63a-4168-8816-4dc83cd00cd3',
      fieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.nextReviewAt,
      direction: ViewSortDirection.ASC,
    },
  ],
});
