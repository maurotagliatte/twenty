import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'DAM & BAM',
  description:
    'Digital asset library with a review flow, usage rights tracking, collections and brand kits.',
  author: 'Khard',
  category: 'Marketing',
});
