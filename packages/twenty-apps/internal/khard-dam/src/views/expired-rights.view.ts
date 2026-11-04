import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import {
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  EXPIRED_RIGHTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildViewFields } from 'src/views/utils/build-view-fields';

export default defineView({
  universalIdentifier: EXPIRED_RIGHTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Expired rights, still active',
  objectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCalendarX',
  position: 5,
  fields: buildViewFields([
    {
      universalIdentifier: 'd787ccbf-af51-4637-ba8b-f21a9c1194e6',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.name,
      size: 220,
    },
    {
      universalIdentifier: 'ff5daabe-3198-4b93-b202-02aee8084fee',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      size: 140,
    },
    {
      universalIdentifier: '751c9eec-9ccf-4b63-910b-c586126648ac',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
      size: 140,
    },
    {
      universalIdentifier: '46ea3fe6-d6d0-48f3-8920-b1ead4a2ffd2',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.license,
      size: 150,
    },
    {
      universalIdentifier: 'e7a991ad-25cf-442d-b650-2e9d09b0d05f',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.brand,
      size: 160,
    },
    {
      universalIdentifier: 'be9435e3-e304-4494-a0e2-7d56601dc923',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.owner,
      size: 160,
    },
  ]),
  filters: [
    {
      universalIdentifier: '93b832fc-14f7-4719-b562-272af4b465c6',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      operand: ViewFilterOperand.IS_IN_PAST,
      value: '',
    },
    {
      universalIdentifier: '863c28c1-9c3c-433d-839a-d4ccbd6acdba',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
      operand: ViewFilterOperand.IS_NOT,
      value: ['ARCHIVED'],
    },
  ],
  sorts: [
    {
      universalIdentifier: 'ef10f326-dcf2-4421-8ed0-b0ab8c5a0c2b',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      direction: ViewSortDirection.ASC,
    },
  ],
});
