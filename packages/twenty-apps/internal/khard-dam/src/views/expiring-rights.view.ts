import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  EXPIRING_RIGHTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildViewFields } from 'src/views/utils/build-view-fields';

export default defineView({
  universalIdentifier: EXPIRING_RIGHTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Rights expiring in 30 days',
  objectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconHourglass',
  position: 4,
  fields: buildViewFields([
    {
      universalIdentifier: '0a1632a1-43db-4f82-986e-a478631cda76',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.name,
      size: 220,
    },
    {
      universalIdentifier: 'aa519660-3fae-4af3-8801-7ec53981d4b3',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      size: 140,
    },
    {
      universalIdentifier: '416efcef-bf6f-4ac2-aa8a-04451e335814',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.license,
      size: 150,
    },
    {
      universalIdentifier: 'e687f371-985a-4656-8864-5c3e62dbc86b',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageChannels,
      size: 200,
    },
    {
      universalIdentifier: 'a1a77418-9432-4063-9430-21a5435a943c',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.brand,
      size: 160,
    },
    {
      universalIdentifier: '57673232-9cf5-40c3-8e86-d1ece35cfef6',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.owner,
      size: 160,
    },
    {
      universalIdentifier: '339e9fd5-f8de-4403-96fd-c002152332fd',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
      size: 140,
    },
  ]),
  filters: [
    {
      universalIdentifier: '7db75477-6b42-4017-a9d3-bfb988b2b5bd',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      operand: ViewFilterOperand.IS_RELATIVE,
      value: 'NEXT_30_DAY',
    },
    {
      universalIdentifier: 'e9203145-cd23-44af-a73c-e4e45cf0d206',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
      operand: ViewFilterOperand.IS_NOT,
      value: ['ARCHIVED'],
    },
  ],
  sorts: [
    {
      universalIdentifier: '762d39d3-768b-40d9-9449-b0203ce7bab3',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      direction: ViewSortDirection.ASC,
    },
  ],
});
