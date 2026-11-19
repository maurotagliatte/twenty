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
  WIKI_PAGE_HEADER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_HEADER_WIDGET_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
      universalIdentifier: WIKI_PAGE_HEADER_WIDGET_UNIVERSAL_IDENTIFIER,
      title: ' ',
      type: 'FRONT_COMPONENT',
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          WIKI_PAGE_HEADER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
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
