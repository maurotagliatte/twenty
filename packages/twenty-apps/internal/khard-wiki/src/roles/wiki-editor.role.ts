import { defineRole } from 'twenty-sdk/define';

import { WIKI_EDITOR_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  MANAGE,
  WIKI_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'src/roles/wiki-object-permissions';

export default defineRole({
  universalIdentifier: WIKI_EDITOR_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Wiki editor',
  description:
    'Writes, moves and archives wiki spaces and pages. Read-only on the rest of the CRM.',
  icon: 'IconBooks',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: WIKI_OBJECT_UNIVERSAL_IDENTIFIERS.map(
    (objectUniversalIdentifier) => ({ objectUniversalIdentifier, ...MANAGE }),
  ),
});
