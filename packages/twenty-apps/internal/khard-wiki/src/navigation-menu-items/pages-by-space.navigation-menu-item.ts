import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  PAGES_BY_SPACE_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '6c86c694-6a22-4a2d-a373-349d1dc379c4',
  type: NavigationMenuItemType.VIEW,
  name: 'Pages by space',
  icon: 'IconBooks',
  viewUniversalIdentifier: PAGES_BY_SPACE_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 3,
});
