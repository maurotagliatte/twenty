import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  BRAND_LOGOS_VIEW_UNIVERSAL_IDENTIFIER,
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '68ed5696-0451-48e3-a997-8fbea8784e2f',
  type: NavigationMenuItemType.VIEW,
  name: 'Brand logos',
  icon: 'IconBadge',
  viewUniversalIdentifier: BRAND_LOGOS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 6,
});
