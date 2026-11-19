import { defineFrontComponent, PageLayoutType } from 'twenty-sdk/define';

import {
  COLLECTION_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { CollectionGallery } from 'src/front-components/components/CollectionGallery';

export default defineFrontComponent({
  universalIdentifier: COLLECTION_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Collection gallery',
  description: "Thumbnail grid of a collection's assets.",
  component: CollectionGallery,
  widgetAvailability: {
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifiers: [DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER],
  },
});
