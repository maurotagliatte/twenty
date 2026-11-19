import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '0fa3bd83-3c1b-44f1-b3b0-8cf176083090',
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 5,
});
