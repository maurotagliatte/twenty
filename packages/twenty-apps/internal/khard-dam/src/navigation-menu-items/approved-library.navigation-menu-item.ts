import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  APPROVED_LIBRARY_VIEW_UNIVERSAL_IDENTIFIER,
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'ee959b44-aa6a-4a34-bc08-c5036e01a3a7',
  type: NavigationMenuItemType.VIEW,
  name: 'Approved library',
  icon: 'IconCircleCheck',
  viewUniversalIdentifier: APPROVED_LIBRARY_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 2,
});
