import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  DAM_BRAND_FIELDS,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_BRANDS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: DAM_BRANDS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'damBrands',
  label: 'Brands',
  description: 'Brands owned by this company',
  icon: 'IconBadge',
  relationTargetObjectMetadataUniversalIdentifier:
    DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: DAM_BRAND_FIELDS.company,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
