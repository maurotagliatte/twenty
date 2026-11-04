import {
  defineObject,
  FieldType,
  ObjectOpenRecordIn,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  OWNED_WIKI_PAGES_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  WIKI_SPACE_FIELDS,
  WIKI_SPACE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WIKI_PAGE_STATUS_OPTIONS } from 'src/constants/wiki-options';

export default defineObject({
  universalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'wikiPage',
  namePlural: 'wikiPages',
  labelSingular: 'Wiki page',
  labelPlural: 'Wiki pages',
  description:
    'One wiki page; its whole content lives in the rich text body. Siblings are ordered by the system position field',
  icon: 'IconFileText',
  isSearchable: true,
  openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
  labelIdentifierFieldMetadataUniversalIdentifier: WIKI_PAGE_FIELDS.title,
  fields: [
    {
      universalIdentifier: WIKI_PAGE_FIELDS.title,
      type: FieldType.TEXT,
      name: 'title',
      label: 'Title',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.icon,
      type: FieldType.TEXT,
      name: 'icon',
      label: 'Icon',
      description: 'Emoji shown next to the page title',
      icon: 'IconMoodSmile',
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.cover,
      type: FieldType.FILES,
      name: 'cover',
      label: 'Cover',
      description: 'Banner image shown above the page title',
      icon: 'IconPhoto',
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.body,
      type: FieldType.RICH_TEXT,
      name: 'body',
      label: 'Body',
      icon: 'IconFileText',
      isSearchable: true,
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.status,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      isNullable: false,
      defaultValue: "'DRAFT'",
      options: [...WIKI_PAGE_STATUS_OPTIONS],
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.tags,
      type: FieldType.ARRAY,
      name: 'tags',
      label: 'Tags',
      icon: 'IconTag',
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.lastReviewedAt,
      type: FieldType.DATE,
      name: 'lastReviewedAt',
      label: 'Last reviewed',
      icon: 'IconCalendarCheck',
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.nextReviewAt,
      type: FieldType.DATE,
      name: 'nextReviewAt',
      label: 'Review by',
      description: 'Date after which the page shows up in Needs review',
      icon: 'IconCalendarDue',
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.space,
      type: FieldType.RELATION,
      name: 'space',
      label: 'Space',
      icon: 'IconBooks',
      relationTargetObjectMetadataUniversalIdentifier:
        WIKI_SPACE_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier: WIKI_SPACE_FIELDS.pages,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'spaceId',
      },
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.parentPage,
      type: FieldType.RELATION,
      name: 'parentPage',
      label: 'Parent page',
      icon: 'IconHierarchy',
      relationTargetObjectMetadataUniversalIdentifier:
        WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        WIKI_PAGE_FIELDS.childPages,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'parentPageId',
      },
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.childPages,
      type: FieldType.RELATION,
      name: 'childPages',
      label: 'Subpages',
      icon: 'IconHierarchy2',
      relationTargetObjectMetadataUniversalIdentifier:
        WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        WIKI_PAGE_FIELDS.parentPage,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    {
      universalIdentifier: WIKI_PAGE_FIELDS.owner,
      type: FieldType.RELATION,
      name: 'owner',
      label: 'Owner',
      description: 'Team member responsible for keeping the page accurate',
      icon: 'IconUserCircle',
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        OWNED_WIKI_PAGES_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'ownerId',
      },
    },
  ],
});
