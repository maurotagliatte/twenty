import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  WIKI_HOME_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WIKI_HOME_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  WIKI_HOME_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  WIKI_HOME_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: WIKI_HOME_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Wiki',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: WIKI_HOME_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            WIKI_HOME_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: ' ',
          type: 'FRONT_COMPONENT',
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              WIKI_HOME_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
