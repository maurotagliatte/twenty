import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Khard Marketing',
  description:
    'Connects Google (Tag Manager, GA4, Search Console, YouTube) and Meta (Instagram, WhatsApp Business) accounts to Twenty.',
  author: 'Khard',
  category: 'Marketing',
  serverVariables: {
    GOOGLE_CLIENT_ID: {
      description:
        'OAuth client ID from the Google Cloud project (APIs & Services > Credentials, Web application).',
      isSecret: false,
      isRequired: true,
    },
    GOOGLE_CLIENT_SECRET: {
      description: 'OAuth client secret from the same Google Cloud client.',
      isSecret: true,
      isRequired: true,
    },
    META_APP_ID: {
      description: 'App ID from the Meta for Developers app (App settings > Basic).',
      isSecret: false,
      isRequired: true,
    },
    META_APP_SECRET: {
      description: 'App secret from the same Meta app.',
      isSecret: true,
      isRequired: true,
    },
    WHATSAPP_SYSTEM_USER_TOKEN: {
      description:
        'Permanent token of a Business Manager system user with WhatsApp access, used to send messages without depending on a member connection.',
      isSecret: true,
      isRequired: false,
    },
  },
});
