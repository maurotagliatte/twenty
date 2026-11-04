import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  RECENTLY_UPDATED_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'ca917cd9-65a1-4efe-b61d-adbf193ea706',
  type: NavigationMenuItemType.VIEW,
  name: 'Recently updated',
  icon: 'IconClockEdit',
  viewUniversalIdentifier: RECENTLY_UPDATED_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 4,
});
