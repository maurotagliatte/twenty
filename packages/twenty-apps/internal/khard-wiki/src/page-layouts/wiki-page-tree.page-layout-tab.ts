import {
  definePageLayoutTab,
  getSystemRecordPageLayoutUniversalIdentifier,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_TREE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_TREE_TAB_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_TREE_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The lowest positioned tab is pinned to the left column of the record page.
export default definePageLayoutTab({
  universalIdentifier: WIKI_PAGE_TREE_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  }),
  title: 'Pages',
  position: 1,
  icon: 'IconSitemap',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: WIKI_PAGE_TREE_WIDGET_UNIVERSAL_IDENTIFIER,
      title: ' ',
      type: 'FRONT_COMPONENT',
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          WIKI_PAGE_TREE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
