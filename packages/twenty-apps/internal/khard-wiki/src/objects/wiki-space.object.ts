import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';

import {
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  WIKI_SPACE_FIELDS,
  WIKI_SPACE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WIKI_SPACE_VISIBILITY_OPTIONS } from 'src/constants/wiki-options';

export default defineObject({
  universalIdentifier: WIKI_SPACE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'wikiSpace',
  namePlural: 'wikiSpaces',
  labelSingular: 'Wiki space',
  labelPlural: 'Wiki spaces',
  description:
    'A top-level area of the wiki, e.g. a team handbook or a product',
  icon: 'IconBooks',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier: WIKI_SPACE_FIELDS.name,
  fields: [
    {
      universalIdentifier: WIKI_SPACE_FIELDS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: WIKI_SPACE_FIELDS.icon,
      type: FieldType.TEXT,
      name: 'icon',
      label: 'Icon',
      description: 'Emoji shown next to the space name',
      icon: 'IconMoodSmile',
    },
    {
      universalIdentifier: WIKI_SPACE_FIELDS.description,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      icon: 'IconAlignLeft',
      isSearchable: true,
    },
    {
      universalIdentifier: WIKI_SPACE_FIELDS.visibility,
      type: FieldType.SELECT,
      name: 'visibility',
      label: 'Visibility',
      description:
        'Intended audience. Access itself is governed by workspace roles',
      icon: 'IconEye',
      isNullable: false,
      defaultValue: "'WORKSPACE'",
      options: [...WIKI_SPACE_VISIBILITY_OPTIONS],
    },
    {
      universalIdentifier: WIKI_SPACE_FIELDS.pages,
      type: FieldType.RELATION,
      name: 'pages',
      label: 'Pages',
      icon: 'IconFileText',
      relationTargetObjectMetadataUniversalIdentifier:
        WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.space,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
  ],
});
