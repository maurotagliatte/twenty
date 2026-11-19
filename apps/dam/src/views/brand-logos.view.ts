import { defineView, ViewFilterOperand, ViewType } from 'twenty-sdk/define';

import {
  BRAND_LOGOS_VIEW_UNIVERSAL_IDENTIFIER,
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildViewFields } from 'src/views/utils/build-view-fields';

export default defineView({
  universalIdentifier: BRAND_LOGOS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Brand logos',
  objectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBadge',
  position: 3,
  fields: buildViewFields([
    {
      universalIdentifier: '4ae2b9b0-6674-44dd-9489-90a407142caa',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.name,
      size: 220,
    },
    {
      universalIdentifier: 'd6b554f1-03e8-4b72-9fb4-e8cb4a9a3752',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.brand,
      size: 180,
    },
    {
      universalIdentifier: '4dc47dad-6824-4cbf-a5ad-94063c9b485c',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.files,
      size: 200,
    },
    {
      universalIdentifier: '0be18dda-1d47-4eb6-ba1c-efc8196d0a62',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.kind,
      size: 120,
    },
    {
      universalIdentifier: '5dc6237d-6ade-4534-813e-cbcfc7b1a3b9',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.description,
      size: 260,
    },
    {
      universalIdentifier: '2b14bc90-f91d-46fe-8179-acb805fd06c8',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.width,
      size: 110,
    },
    {
      universalIdentifier: '0a33c670-ea07-40cf-8576-50d6414a565b',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.height,
      size: 110,
    },
  ]),
  filters: [
    {
      universalIdentifier: 'a4be804b-5b42-4492-b60a-87fbb1c34d6a',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.category,
      operand: ViewFilterOperand.IS,
      value: ['LOGO'],
    },
    {
      universalIdentifier: '15db2c43-2f9a-4aaa-892c-cce44b0f413c',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
      operand: ViewFilterOperand.IS,
      value: ['APPROVED'],
    },
  ],
});
