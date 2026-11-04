import { defineFrontComponent, PageLayoutType } from 'twenty-sdk/define';

import {
  BRAND_KIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { BrandKit } from 'src/front-components/components/BrandKit';

export default defineFrontComponent({
  universalIdentifier: BRAND_KIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Brand kit',
  description:
    "A brand's logo, colors, fonts, tone of voice and approved assets.",
  component: BrandKit,
  widgetAvailability: {
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifiers: [DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER],
  },
});
