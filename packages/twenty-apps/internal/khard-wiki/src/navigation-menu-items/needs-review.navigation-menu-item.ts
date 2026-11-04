import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'ff289e76-8e22-40ae-9ac6-da2ac354fcf0',
  type: NavigationMenuItemType.VIEW,
  name: 'Needs review',
  icon: 'IconCalendarDue',
  viewUniversalIdentifier: NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  position: 6,
});
