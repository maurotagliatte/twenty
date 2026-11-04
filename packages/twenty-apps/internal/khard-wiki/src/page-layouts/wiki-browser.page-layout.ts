import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  WIKI_BROWSER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WIKI_BROWSER_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  WIKI_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  WIKI_BROWSER_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: WIKI_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Wiki',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: WIKI_BROWSER_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Browse',
      position: 0,
      icon: 'IconSitemap',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            WIKI_BROWSER_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: ' ',
          type: 'FRONT_COMPONENT',
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              WIKI_BROWSER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
