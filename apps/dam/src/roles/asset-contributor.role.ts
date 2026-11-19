import { defineRole } from 'twenty-sdk/define';

import {
  ASSET_CONTRIBUTOR_ROLE_UNIVERSAL_IDENTIFIER,
  DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { READ_ONLY, READ_WRITE } from 'src/roles/dam-object-permissions';

export default defineRole({
  universalIdentifier: ASSET_CONTRIBUTOR_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Asset contributor',
  description:
    'Uploads and edits assets and collections, cannot delete them or change brand kits. Read-only on the rest of the CRM.',
  icon: 'IconUpload',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: DAM_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
      ...READ_WRITE,
    },
    {
      objectUniversalIdentifier: DAM_COLLECTION_OBJECT_UNIVERSAL_IDENTIFIER,
      ...READ_WRITE,
    },
    {
      objectUniversalIdentifier:
        DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
      ...READ_WRITE,
    },
    {
      objectUniversalIdentifier: DAM_BRAND_OBJECT_UNIVERSAL_IDENTIFIER,
      ...READ_ONLY,
    },
  ],
});
