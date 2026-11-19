import { getFieldUniversalIdentifier } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const getWikiPageSystemFieldUniversalIdentifier = (name: string) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
    name,
  });

export const WIKI_PAGE_SYSTEM_FIELDS = {
  updatedAt: getWikiPageSystemFieldUniversalIdentifier('updatedAt'),
  updatedBy: getWikiPageSystemFieldUniversalIdentifier('updatedBy'),
} as const;
