import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  OWNED_DAM_ASSETS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    OWNED_DAM_ASSETS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'ownedDamAssets',
  label: 'Owned assets',
  description: 'Library assets this member is responsible for',
  icon: 'IconPhoto',
  relationTargetObjectMetadataUniversalIdentifier:
    DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.owner,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
