import { defineView, ViewFilterOperand, ViewType } from 'twenty-sdk/define';

import { DAM_ASSET_CATEGORY_OPTIONS } from 'src/constants/dam-asset-options';
import {
  APPROVED_LIBRARY_VIEW_UNIVERSAL_IDENTIFIER,
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildViewFields } from 'src/views/utils/build-view-fields';

const CATEGORY_GROUP_UNIVERSAL_IDENTIFIERS: Record<
  (typeof DAM_ASSET_CATEGORY_OPTIONS)[number]['value'],
  string
> = {
  LOGO: '93529aa0-0868-4406-bdf5-8ea7e4eba2bd',
  ICON: '47f90910-71c4-49ef-9703-037763af912c',
  PHOTOGRAPHY: '5d1342dd-a0e4-4b95-af97-6c44b693b462',
  ILLUSTRATION: '4b79b811-37dd-4c9a-9345-80ddb8583e3f',
  TYPEFACE: '9c9f1c6d-d12c-46c9-905b-040cbf4c6165',
  TEMPLATE: 'd381073a-f407-4a62-aedd-357689f6a5c1',
  GUIDELINE: '66a67eb6-2edc-47e9-b013-cc536c0a4020',
  CAMPAIGN: '1ae8c907-2cb4-470c-80f1-c6d1da6049e3',
  PRODUCT: '868de865-14ca-45b7-8f63-4a81e954b2a0',
  OTHER: 'b4e71d6e-24d2-4b47-9d32-3246bd1e4b2e',
};

export default defineView({
  universalIdentifier: APPROVED_LIBRARY_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Approved library',
  objectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCircleCheck',
  position: 2,
  mainGroupByFieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.category,
  shouldHideEmptyGroups: true,
  fields: buildViewFields([
    {
      universalIdentifier: '0d074bc8-b31d-4e1b-9a3b-edd5217f3557',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.name,
      size: 220,
    },
    {
      universalIdentifier: 'a717ad3e-ad3d-46ca-b690-c15b362e9022',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.files,
      size: 180,
    },
    {
      universalIdentifier: '66537460-1384-4c40-942b-b0a1e0314d75',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.brand,
      size: 160,
    },
    {
      universalIdentifier: '40868b3b-d38c-44ea-b2d1-fa7a2caf95a4',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.kind,
      size: 120,
    },
    {
      universalIdentifier: '223ee15f-0b21-43c8-8f08-a94eb2919764',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.tags,
      size: 200,
    },
    {
      universalIdentifier: '18def78b-eef9-4603-955d-20129acc93f0',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageChannels,
      size: 200,
    },
    {
      universalIdentifier: '4f4a9100-37b8-4ef5-b3d5-6fe0d527e839',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.license,
      size: 150,
    },
    {
      universalIdentifier: '4826a577-b00b-4424-8208-6e0232362262',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      size: 140,
    },
  ]),
  filters: [
    {
      universalIdentifier: '11189927-4230-4585-b211-7482f55baaa3',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
      operand: ViewFilterOperand.IS,
      value: ['APPROVED'],
    },
  ],
  groups: DAM_ASSET_CATEGORY_OPTIONS.map((option) => ({
    universalIdentifier: CATEGORY_GROUP_UNIVERSAL_IDENTIFIERS[option.value],
    fieldValue: option.value,
    position: option.position,
    isVisible: true,
  })),
});
