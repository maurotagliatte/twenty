import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  EXPIRING_RIGHTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '0ddf6856-b2ae-4151-a6f9-01da4af8d777',
  type: NavigationMenuItemType.VIEW,
  name: 'Expiring rights',
  icon: 'IconHourglass',
  viewUniversalIdentifier: EXPIRING_RIGHTS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 3,
});
