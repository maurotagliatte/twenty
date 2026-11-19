import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Wiki',
  description:
    'Knowledge base with spaces, nested pages, review dates and a page tree browser.',
  author: 'Khard',
  category: 'Productivity',
});
