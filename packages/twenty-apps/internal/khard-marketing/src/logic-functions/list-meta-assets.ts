import { defineLogicFunction } from 'twenty-sdk/define';

import { LIST_META_ASSETS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listMetaAssetsHandler } from 'src/logic-functions/handlers/list-meta-assets-handler';

export default defineLogicFunction({
  universalIdentifier: LIST_META_ASSETS_UNIVERSAL_IDENTIFIER,
  name: 'list-meta-assets',
  description:
    'Lists the Facebook Pages, Instagram professional accounts and WhatsApp Business accounts the connected Meta account can access.',
  timeoutSeconds: 30,
  handler: listMetaAssetsHandler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  workflowActionTriggerSettings: {
    label: 'List Meta Assets',
    inputSchema: [
      {
        type: 'object',
        properties: {},
      },
    ],
  },
});
