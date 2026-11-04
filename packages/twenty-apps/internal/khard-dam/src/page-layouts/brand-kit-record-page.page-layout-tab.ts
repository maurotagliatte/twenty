import {
  definePageLayoutTab,
  getSystemRecordPageLayoutUniversalIdentifier,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  BRAND_KIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  BRAND_KIT_RECORD_PAGE_TAB_UNIVERSAL_IDENTIFIER,
  BRAND_KIT_RECORD_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier: BRAND_KIT_RECORD_PAGE_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  }),
  title: 'Brand kit',
  position: 5,
  icon: 'IconColorSwatch',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: BRAND_KIT_RECORD_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Brand kit',
      type: 'FRONT_COMPONENT',
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          BRAND_KIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
