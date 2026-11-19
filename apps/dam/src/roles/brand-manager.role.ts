import { defineRole } from 'twenty-sdk/define';

import { BRAND_MANAGER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  DAM_OBJECT_UNIVERSAL_IDENTIFIERS,
  MANAGE,
} from 'src/roles/dam-object-permissions';

export default defineRole({
  universalIdentifier: BRAND_MANAGER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Brand manager',
  description:
    'Owns the asset library and brand kits: approves, archives and removes assets, edits brands. Read-only on the rest of the CRM.',
  icon: 'IconBadge',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: DAM_OBJECT_UNIVERSAL_IDENTIFIERS.map(
    (objectUniversalIdentifier) => ({ objectUniversalIdentifier, ...MANAGE }),
  ),
});
