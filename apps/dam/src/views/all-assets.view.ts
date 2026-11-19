import { defineView, ViewType } from 'twenty-sdk/define';

import {
  ALL_ASSETS_VIEW_UNIVERSAL_IDENTIFIER,
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildViewFields } from 'src/views/utils/build-view-fields';

// Lowest position: the Assets sidebar entry opens this view first.
export default defineView({
  universalIdentifier: ALL_ASSETS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All assets',
  objectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconPhoto',
  position: 0,
  fields: buildViewFields([
    {
      universalIdentifier: '01e68ee4-3df3-4abe-9256-bd39de19ef72',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.name,
      size: 240,
    },
    {
      universalIdentifier: 'de8da1f0-a643-4b33-b571-4f449d6dbba4',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.brand,
      size: 180,
    },
    {
      universalIdentifier: 'e933cb13-37cb-4802-8c32-df024f495bc8',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.category,
      size: 140,
    },
    {
      universalIdentifier: 'e868700e-a4d7-49ba-9241-1ff381e1c554',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.status,
      size: 140,
    },
    {
      universalIdentifier: 'e42fc297-7a4a-40f5-ad8b-6a08a402c051',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.kind,
      size: 120,
    },
    {
      universalIdentifier: '72a9b973-e9e4-4aa0-887f-06285d7f4321',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.files,
      size: 200,
    },
    {
      universalIdentifier: '1416ca39-23e9-4f96-849f-19816fb449f3',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.usageExpiresAt,
      size: 160,
    },
    {
      universalIdentifier: 'a38aed05-88f7-42b8-b853-4b49b65fec90',
      fieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.owner,
      size: 160,
    },
  ]),
});
