import {
  definePageLayoutTab,
  getSystemRecordPageLayoutUniversalIdentifier,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_CONTENT_TAB_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_CONTENT_WIDGET_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Position 5 puts the editor ahead of the generated Home tab (10), so a page opens on its body.
export default definePageLayoutTab({
  universalIdentifier: WIKI_PAGE_CONTENT_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  }),
  title: 'Page',
  position: 5,
  icon: 'IconFileText',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: WIKI_PAGE_CONTENT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Body',
      type: 'FIELD',
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId: WIKI_PAGE_FIELDS.body,
        fieldDisplayMode: 'EDITOR',
      },
    },
  ],
});
