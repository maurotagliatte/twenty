import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  ASSET_BROWSER_PAGE_LAYOUT_TABS,
  ASSET_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  ASSET_BROWSER_PAGE_LAYOUT_WIDGETS,
  ASSET_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  BRAND_KIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  COLLECTION_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const frontComponentTab = ({
  universalIdentifier,
  widgetUniversalIdentifier,
  frontComponentUniversalIdentifier,
  title,
  icon,
  position,
}: {
  universalIdentifier: string;
  widgetUniversalIdentifier: string;
  frontComponentUniversalIdentifier: string;
  title: string;
  icon: string;
  position: number;
}) => ({
  universalIdentifier,
  title,
  icon,
  position,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: widgetUniversalIdentifier,
      title,
      type: 'FRONT_COMPONENT' as const,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      configuration: {
        configurationType: 'FRONT_COMPONENT' as const,
        frontComponentUniversalIdentifier,
      },
    },
  ],
});

export default definePageLayout({
  universalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Asset browser',
  type: 'STANDALONE_PAGE',
  tabs: [
    frontComponentTab({
      universalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_TABS.gallery,
      widgetUniversalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_WIDGETS.gallery,
      frontComponentUniversalIdentifier:
        ASSET_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      title: 'Gallery',
      icon: 'IconLayoutGrid',
      position: 0,
    }),
    frontComponentTab({
      universalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_TABS.brandKit,
      widgetUniversalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_WIDGETS.brandKit,
      frontComponentUniversalIdentifier:
        BRAND_KIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      title: 'Brand kits',
      icon: 'IconColorSwatch',
      position: 1,
    }),
    frontComponentTab({
      universalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_TABS.collections,
      widgetUniversalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_WIDGETS.collections,
      frontComponentUniversalIdentifier:
        COLLECTION_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      title: 'Collections',
      icon: 'IconFolders',
      position: 2,
    }),
  ],
});
