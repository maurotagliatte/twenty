import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DRAFTS_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'fb47c662-7866-4a05-9e5e-2120cdbcaadd',
  type: NavigationMenuItemType.VIEW,
  name: 'Drafts',
  icon: 'IconPencil',
  viewUniversalIdentifier: DRAFTS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 5,
});
