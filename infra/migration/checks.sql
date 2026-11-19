-- Read-only. Run against twenty-production before the backup and against
-- the restored clone before and after cleanup-for-vanilla.sql.

SELECT version();

SELECT count(*) AS workspaces FROM core.workspace;

SELECT name, status, "workspaceId", "executedByVersion", "createdAt"
FROM core."upgradeMigration"
WHERE "isInitial" = false
ORDER BY "createdAt" DESC
LIMIT 15;

SELECT name, count(*) AS rows
FROM core."upgradeMigration"
WHERE name ILIKE '%EnableVectorExtension%'
   OR name ILIKE '%ReplayInstanceSchemaSkippedByUpgradeCursor%'
   OR name ILIKE '2.56.0\_AddMessageAttachmentTarget%'
GROUP BY name;

SELECT key, value, "workspaceId"
FROM core."featureFlag"
WHERE key = 'IS_AGENT_UI_PRESENCE_ENABLED';

SELECT column_default
FROM information_schema.columns
WHERE table_schema = 'core'
  AND table_name = 'role'
  AND column_name = 'canBeAssignedToApplications';

SELECT "canBeAssignedToApplications", count(*)
FROM core.role
GROUP BY 1;

SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

SELECT id, name, "universalIdentifier" FROM core.application ORDER BY name;
