import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  WIKI_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'ed153e29-19e7-4aff-a083-2ea41f763f34',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  name: 'Browse wiki',
  icon: 'IconSitemap',
  pageLayoutUniversalIdentifier: WIKI_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 0,
});
