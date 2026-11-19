import { defineFrontComponent } from 'twenty-sdk/define';

import { ASSET_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { AssetGallery } from 'src/front-components/components/AssetGallery';

export default defineFrontComponent({
  universalIdentifier: ASSET_GALLERY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Asset gallery',
  description:
    'Thumbnail grid of assets with brand, status, category, kind, tag and text filters.',
  component: AssetGallery,
});
