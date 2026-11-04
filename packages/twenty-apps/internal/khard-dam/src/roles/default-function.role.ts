import { defineApplicationRole } from 'twenty-sdk/define';

import { DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  DAM_OBJECT_UNIVERSAL_IDENTIFIERS,
  READ_ONLY,
} from 'src/roles/dam-object-permissions';

// Front components query with this role intersected with the viewer's, so it caps them and never widens access.
export default defineApplicationRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'DAM & BAM function role',
  description:
    'Ceiling for the gallery, collection and brand kit views: read-only on DAM objects',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: DAM_OBJECT_UNIVERSAL_IDENTIFIERS.map(
    (objectUniversalIdentifier) => ({ objectUniversalIdentifier, ...READ_ONLY }),
  ),
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
