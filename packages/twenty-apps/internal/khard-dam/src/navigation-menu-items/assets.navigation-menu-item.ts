import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'ccec0071-b260-4f46-8a05-936196691b7f',
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 0,
});
