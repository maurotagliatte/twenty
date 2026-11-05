import { applyInstanceSchemaSkippedByUpgradeCursor } from 'src/database/commands/upgrade-version-command/2-56/utils/apply-instance-schema-skipped-by-upgrade-cursor.util';

describe('applyInstanceSchemaSkippedByUpgradeCursor', () => {
  it('adds the upstream columns and the vector extension when they are missing', async () => {
    const statements: string[] = [];

    await applyInstanceSchemaSkippedByUpgradeCursor(async (sql) => {
      statements.push(sql);

      if (sql.includes("tablename = 'billingCustomer'")) {
        return [{ present: 1 }];
      }

      return [];
    });

    const joined = statements.join('\n');

    expect(joined).toContain('CREATE EXTENSION IF NOT EXISTS vector');
    expect(joined).toContain('ADD "tools" jsonb NOT NULL DEFAULT');
    expect(joined).toContain('CREATE TABLE "core"."billingArrangement"');
    expect(joined).toContain("'NATIVE_PAGE'");
    expect(joined).toContain('ADD "availabilityCoreObjectName"');
    expect(joined).toContain('ADD "aiChatAssistantProfile"');
    expect(joined).toContain('CREATE TABLE "core"."fieldMetadataOption"');
    expect(joined).toContain('ADD "targetApplicationId" uuid');
  });

  it('does not repeat objects that are already present', async () => {
    const statements: string[] = [];

    await applyInstanceSchemaSkippedByUpgradeCursor(async (sql) => {
      statements.push(sql);

      if (sql.includes('information_schema.columns')) {
        return [{ present: 1 }];
      }

      if (
        sql.includes('pg_tables') ||
        sql.includes('pg_enum') ||
        sql.includes('pg_indexes') ||
        sql.includes('pg_constraint')
      ) {
        return [{ present: 1 }];
      }

      return [];
    });

    const joined = statements.join('\n');

    expect(joined).toContain('CREATE EXTENSION IF NOT EXISTS vector');
    expect(joined).not.toContain('ADD "tools"');
    expect(joined).not.toContain('CREATE TABLE "core"."billingArrangement"');
    expect(joined).not.toContain('RENAME TO "navigationMenuItem_type_enum_old"');
    expect(joined).not.toContain('CREATE TABLE "core"."fieldMetadataOption"');
    expect(joined).not.toContain('ADD "targetApplicationId"');
  });
});
