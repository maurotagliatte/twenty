import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  REVIEW_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'fca1ffa9-8021-48e7-a6f2-72523d790593',
  type: NavigationMenuItemType.VIEW,
  name: 'Review board',
  icon: 'IconLayoutKanban',
  viewUniversalIdentifier: REVIEW_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 1,
});
