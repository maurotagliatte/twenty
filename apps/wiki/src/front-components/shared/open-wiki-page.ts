import { AppPath, navigate } from 'twenty-sdk/front-component';

export const WIKI_PAGE_OBJECT_NAME_SINGULAR = 'wikiPage';

export const openWikiPage = (pageId: string, options?: { replace?: boolean }) =>
  navigate(
    AppPath.RecordShowPage,
    {
      objectNameSingular: WIKI_PAGE_OBJECT_NAME_SINGULAR,
      objectRecordId: pageId,
    },
    undefined,
    options,
  );
