import { defineLogicFunction } from 'twenty-sdk/define';

import { LIST_GOOGLE_ASSETS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listGoogleAssetsHandler } from 'src/logic-functions/handlers/list-google-assets-handler';

export default defineLogicFunction({
  universalIdentifier: LIST_GOOGLE_ASSETS_UNIVERSAL_IDENTIFIER,
  name: 'list-google-assets',
  description:
    'Lists the Tag Manager accounts, GA4 properties, Search Console sites and YouTube channels the connected Google account can access.',
  timeoutSeconds: 30,
  handler: listGoogleAssetsHandler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  workflowActionTriggerSettings: {
    label: 'List Google Marketing Assets',
    inputSchema: [
      {
        type: 'object',
        properties: {},
      },
    ],
  },
});
