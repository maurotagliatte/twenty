import { defineConnectionProvider } from 'twenty-sdk/define';

import { META_PROVIDER_NAME } from 'src/constants/provider-names.constant';
import {
  META_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  META_CALLBACK_UNIVERSAL_IDENTIFIER,
  META_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Custom flow because Meta issues no refresh token: the callback trades the
// code for a 60-day token, and the member reconnects when it expires.
export default defineConnectionProvider({
  universalIdentifier: META_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: META_PROVIDER_NAME,
  displayName: 'Meta (Instagram e WhatsApp)',
  type: 'custom',
  custom: {
    authorizeLogicFunction: {
      universalIdentifier: META_AUTHORIZE_UNIVERSAL_IDENTIFIER,
    },
    callbackLogicFunction: {
      universalIdentifier: META_CALLBACK_UNIVERSAL_IDENTIFIER,
    },
  },
});
