import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_ASSETS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: DAM_ASSETS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'damAssets',
  label: 'Assets',
  description: 'Library assets this person created, requested or appears in',
  icon: 'IconPhoto',
  relationTargetObjectMetadataUniversalIdentifier:
    DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.contact,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
