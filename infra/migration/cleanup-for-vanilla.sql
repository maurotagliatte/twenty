-- Run ONLY on a restored clone, after the restore and before the first boot
-- of the official image. Removes what the official upgrade cursor and
-- GraphQL enums do not know. Runbook: infra/migration/README.md.

BEGIN;

DELETE FROM core."upgradeMigration"
WHERE name ILIKE '%EnableVectorExtension%'
   OR name ILIKE '%ReplayInstanceSchemaSkippedByUpgradeCursor%'
   OR name ILIKE '2.56.0\_AddMessageAttachmentTarget%';

DELETE FROM core."featureFlag"
WHERE key = 'IS_AGENT_UI_PRESENCE_ENABLED';

ALTER TABLE core.role
  ALTER COLUMN "canBeAssignedToApplications" SET DEFAULT false;

DROP EXTENSION IF EXISTS vector;

COMMIT;
