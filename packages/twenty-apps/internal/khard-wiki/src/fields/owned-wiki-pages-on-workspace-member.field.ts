import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  OWNED_WIKI_PAGES_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    OWNED_WIKI_PAGES_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'ownedWikiPages',
  label: 'Owned wiki pages',
  description: 'Wiki pages this member keeps up to date',
  icon: 'IconFileText',
  relationTargetObjectMetadataUniversalIdentifier:
    WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.owner,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
