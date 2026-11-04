import { defineView, ViewType } from 'twenty-sdk/define';

import { DAM_ASSET_STATUS_OPTIONS } from 'src/constants/dam-asset-options';
import {
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  REVIEW_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildViewFields } from 'src/views/utils/build-view-fields';

const STATUS_GROUP_UNIVERSAL_IDENTIFIERS: Record<
  (typeof DAM_ASSET_STATUS_OPTIONS)[number]['value'],
  string
> = {
  DRAFT: 'd9ed8ab6-27de-40e5-a439-50ae0b63ed90',
  IN_REVIEW: '670691d5-96e2-499e-9908-702e5c2f2543',
  CHANGES_REQUESTED: '633333fd-1c40-477c-970d-0a950467d661',
  APPROVED: '773afadc-8a57-4052-90d3-d6991291ba0e',
  ARCHIVED: 'cddf36d1-4736-4af7-ba93-513be7f21c69',
};

export default defineView({
  universalIdentifier: REVIEW_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Review board',
  objectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 1,
  mainGroupByFieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
  fields: buildViewFields([
    {
      universalIdentifier: 'f81c4688-1059-40b0-b9d6-7dbb8836fd4a',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.name,
      size: 200,
    },
    {
      universalIdentifier: '8f43f8d1-f36c-4188-8b93-0ed9110b768f',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.files,
      size: 160,
    },
    {
      universalIdentifier: '1f3d7a8d-9dbf-463e-8b8e-d1f0e1bfa610',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.category,
      size: 140,
    },
    {
      universalIdentifier: '3cfecafd-d424-479a-b297-5a905df8b0b9',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.brand,
      size: 160,
    },
    {
      universalIdentifier: 'febf095d-b35d-41ae-badc-c07ed022f666',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.owner,
      size: 160,
    },
    {
      universalIdentifier: 'e1fd95fb-5246-45a5-9687-571736ae2555',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      size: 140,
    },
  ]),
  groups: DAM_ASSET_STATUS_OPTIONS.map((option) => ({
    universalIdentifier: STATUS_GROUP_UNIVERSAL_IDENTIFIERS[option.value],
    fieldValue: option.value,
    position: option.position,
    isVisible: true,
  })),
});
