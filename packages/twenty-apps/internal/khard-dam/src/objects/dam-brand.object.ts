import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  DAM_ASSET_FIELDS,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_BRAND_FIELDS,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_BRANDS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_FIELDS,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'damBrand',
  namePlural: 'damBrands',
  labelSingular: 'Brand',
  labelPlural: 'Brands',
  description:
    'A brand kit: guidelines, colors, typography, voice and its assets',
  icon: 'IconBadge',
  labelIdentifierFieldMetadataUniversalIdentifier: DAM_BRAND_FIELDS.name,
  imageIdentifierFieldMetadataUniversalIdentifier: DAM_BRAND_FIELDS.logo,
  fields: [
    {
      universalIdentifier: DAM_BRAND_FIELDS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.logo,
      type: FieldType.FILES,
      name: 'logo',
      label: 'Primary logo',
      description:
        'Quick-reference mark; every logo variant lives as an asset with category Logo',
      icon: 'IconPhoto',
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.guidelines,
      type: FieldType.RICH_TEXT,
      name: 'guidelines',
      label: 'Guidelines',
      description: "Usage rules, do's and don'ts",
      icon: 'IconFileText',
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.toneOfVoice,
      type: FieldType.TEXT,
      name: 'toneOfVoice',
      label: 'Tone of voice',
      icon: 'IconMessageCircle',
      isSearchable: true,
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.colors,
      type: FieldType.ARRAY,
      name: 'colors',
      label: 'Colors',
      description: 'Palette as hex codes, primary first, e.g. #1A2B3C',
      icon: 'IconPalette',
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.fonts,
      type: FieldType.ARRAY,
      name: 'fonts',
      label: 'Fonts',
      description: 'Font families with their role, e.g. Inter (headings)',
      icon: 'IconTypography',
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.website,
      type: FieldType.LINKS,
      name: 'website',
      label: 'Website',
      icon: 'IconWorld',
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.company,
      type: FieldType.RELATION,
      name: 'company',
      label: 'Company',
      description: 'Company that owns the brand, e.g. a client',
      icon: 'IconBuildingSkyscraper',
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        DAM_BRANDS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'companyId',
      },
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.assets,
      type: FieldType.RELATION,
      name: 'assets',
      label: 'Assets',
      icon: 'IconPhoto',
      relationTargetObjectMetadataUniversalIdentifier:
        DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier: DAM_ASSET_FIELDS.brand,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    {
      universalIdentifier: DAM_BRAND_FIELDS.collections,
      type: FieldType.RELATION,
      name: 'collections',
      label: 'Collections',
      icon: 'IconFolders',
      relationTargetObjectMetadataUniversalIdentifier:
        DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        DAM_COLLECTION_FIELDS.brand,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
  ],
});
