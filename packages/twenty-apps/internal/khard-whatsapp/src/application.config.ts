import { defineApplication } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Only the instance-wide Meta app lives here; every WhatsApp token and id
// belongs to the workspace connection that Embedded Signup created.
export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'WhatsApp',
  description:
    'Connect your WhatsApp Business number and handle its conversations on the people they are about.',
  author: 'Khard',
  category: 'Communication',
  serverVariables: {
    META_APP_ID: {
      description:
        'App ID of the Meta Tech Provider app (Meta for Developers > App settings > Basic).',
      isSecret: false,
      isRequired: true,
    },
    META_APP_SECRET: {
      description:
        'App secret of the same Meta app. Signs every webhook delivery and trades Embedded Signup codes.',
      isSecret: true,
      isRequired: true,
    },
    WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID: {
      description:
        'Configuration ID of the WhatsApp Embedded Signup login configuration (Facebook Login for Business > Configurations).',
      isSecret: false,
      isRequired: true,
    },
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: {
      description:
        'Random string also typed in the Meta app WhatsApp webhook settings, echoed back to verify the callback URL.',
      isSecret: true,
      isRequired: true,
    },
  },
});
