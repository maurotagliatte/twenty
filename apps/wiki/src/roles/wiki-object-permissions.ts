import {
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  WIKI_SPACE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export const READ_ONLY = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

export const MANAGE = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: false,
};

export const WIKI_OBJECT_UNIVERSAL_IDENTIFIERS = [
  WIKI_SPACE_OBJECT_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
];
