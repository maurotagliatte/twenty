import {
  definePageLayoutTab,
  getSystemRecordPageLayoutUniversalIdentifier,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  COLLECTION_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  COLLECTION_GALLERY_RECORD_PAGE_TAB_UNIVERSAL_IDENTIFIER,
  COLLECTION_GALLERY_RECORD_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier: COLLECTION_GALLERY_RECORD_PAGE_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
  }),
  title: 'Gallery',
  position: 5,
  icon: 'IconLayoutGrid',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier:
        COLLECTION_GALLERY_RECORD_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Gallery',
      type: 'FRONT_COMPONENT',
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          COLLECTION_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
