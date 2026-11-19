import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_ASSET_FIELDS,
  DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_FIELDS,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'damCollectionAsset',
  namePlural: 'damCollectionAssets',
  labelSingular: 'Collection asset',
  labelPlural: 'Collection assets',
  description:
    'Links an asset to a collection; an asset can sit in many collections',
  icon: 'IconLink',
  fields: [
    {
      universalIdentifier: DAM_COLLECTION_ASSET_FIELDS.collection,
      type: FieldType.RELATION,
      name: 'collection',
      label: 'Collection',
      icon: 'IconFolders',
      relationTargetObjectMetadataUniversalIdentifier:
        DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        DAM_COLLECTION_FIELDS.collectionAssets,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'collectionId',
      },
    },
    {
      universalIdentifier: DAM_COLLECTION_ASSET_FIELDS.asset,
      type: FieldType.RELATION,
      name: 'asset',
      label: 'Asset',
      icon: 'IconPhoto',
      relationTargetObjectMetadataUniversalIdentifier:
        DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        DAM_ASSET_FIELDS.collectionAssets,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'assetId',
      },
    },
  ],
});
