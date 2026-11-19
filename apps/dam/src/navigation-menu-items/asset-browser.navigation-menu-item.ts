import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  ASSET_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '98916a69-389c-4e48-83a1-426151f06b20',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  name: 'Asset browser',
  icon: 'IconLayoutGrid',
  pageLayoutUniversalIdentifier: ASSET_BROWSER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: -1,
});
