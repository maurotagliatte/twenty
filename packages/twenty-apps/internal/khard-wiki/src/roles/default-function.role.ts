import {
  defineApplicationRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  MANAGE,
  READ_ONLY,
  WIKI_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'src/roles/wiki-object-permissions';

// The browser's token is this role intersected with the viewer's, so it caps the component, never widens it.
export default defineApplicationRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Wiki function role',
  description:
    'Ceiling for the wiki browser: wiki objects and workspace member names',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    ...WIKI_OBJECT_UNIVERSAL_IDENTIFIERS.map((objectUniversalIdentifier) => ({
      objectUniversalIdentifier,
      ...MANAGE,
    })),
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      ...READ_ONLY,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
