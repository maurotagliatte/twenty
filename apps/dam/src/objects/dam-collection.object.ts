import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  DAM_BRAND_FIELDS,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_ASSET_FIELDS,
  DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_FIELDS,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'damCollection',
  namePlural: 'damCollections',
  labelSingular: 'Collection',
  labelPlural: 'Collections',
  description:
    'A curated set of assets, e.g. a campaign, a press kit or a launch',
  icon: 'IconFolders',
  labelIdentifierFieldMetadataUniversalIdentifier: DAM_COLLECTION_FIELDS.name,
  imageIdentifierFieldMetadataUniversalIdentifier: DAM_COLLECTION_FIELDS.cover,
  fields: [
    {
      universalIdentifier: DAM_COLLECTION_FIELDS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: DAM_COLLECTION_FIELDS.description,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      icon: 'IconAlignLeft',
      isSearchable: true,
    },
    {
      universalIdentifier: DAM_COLLECTION_FIELDS.cover,
      type: FieldType.FILES,
      name: 'cover',
      label: 'Cover',
      icon: 'IconPhoto',
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: DAM_COLLECTION_FIELDS.brand,
      type: FieldType.RELATION,
      name: 'brand',
      label: 'Brand',
      icon: 'IconBadge',
      relationTargetObjectMetadataUniversalIdentifier:
        DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        DAM_BRAND_FIELDS.collections,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'brandId',
      },
    },
    {
      universalIdentifier: DAM_COLLECTION_FIELDS.collectionAssets,
      type: FieldType.RELATION,
      name: 'collectionAssets',
      label: 'Assets',
      icon: 'IconPhoto',
      relationTargetObjectMetadataUniversalIdentifier:
        DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        DAM_COLLECTION_ASSET_FIELDS.collection,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldUniversalIdentifier:
          DAM_COLLECTION_ASSET_FIELDS.asset,
      },
    },
  ],
});
