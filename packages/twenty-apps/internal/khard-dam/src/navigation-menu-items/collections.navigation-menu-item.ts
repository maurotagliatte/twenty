import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '13c1575e-84c3-4105-ba23-c28970b1c8a0',
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 4,
});
