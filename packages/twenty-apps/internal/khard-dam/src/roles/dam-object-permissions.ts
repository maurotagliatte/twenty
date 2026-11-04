import {
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export const READ_ONLY = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

export const READ_WRITE = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

export const MANAGE = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: false,
};

export const DAM_OBJECT_UNIVERSAL_IDENTIFIERS = [
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
];
