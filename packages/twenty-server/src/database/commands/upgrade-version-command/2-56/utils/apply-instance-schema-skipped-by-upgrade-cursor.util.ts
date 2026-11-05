import { type QueryRunner } from 'typeorm';

type SqlQuery = (sql: string) => Promise<unknown[]>;

const columnExists = async (
  query: SqlQuery,
  tableName: string,
  columnName: string,
): Promise<boolean> => {
  const rows = await query(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'core' AND table_name = '${tableName}' AND column_name = '${columnName}'`,
  );

  return rows.length > 0;
};

const addColumnIfMissing = async (
  query: SqlQuery,
  tableName: string,
  columnName: string,
  definition: string,
): Promise<void> => {
  if (await columnExists(query, tableName, columnName)) {
    return;
  }

  await query(
    `ALTER TABLE "core"."${tableName}" ADD "${columnName}" ${definition}`,
  );
};

// `upgrade` resumes after the last recorded command. Fast instance commands
// sit before every workspace command of the same version, so a database that
// already finished a 2.56 workspace command never visits fast commands added
// later — including vector on production and the upstream DDL on preview.
export const applyInstanceSchemaSkippedByUpgradeCursor = async (
  query: SqlQuery,
): Promise<void> => {
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'vector'
      ) THEN
        RAISE WARNING 'Extension "vector" is not installed on this PostgreSQL server, skipping';
        RETURN;
      END IF;

      CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE WARNING 'Extension "vector" requires a superuser, run CREATE EXTENSION vector WITH SCHEMA public as one';
    END $$;
  `);

  await addColumnIfMissing(query, 'mcpServer', 'tools', `jsonb NOT NULL DEFAULT '[]'`);
  await addColumnIfMissing(
    query,
    'mcpServer',
    'toolsSyncedAt',
    'TIMESTAMP WITH TIME ZONE',
  );
  await addColumnIfMissing(
    query,
    'mcpServer',
    'toolsSyncError',
    'character varying',
  );

  const billingCustomer = await query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
  );
  const billingArrangement = await query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingArrangement'`,
  );

  if (billingCustomer.length > 0 && billingArrangement.length === 0) {
    await query(
      `CREATE TYPE "core"."billingArrangement_type_enum" AS ENUM('COMMITTED_SEATS', 'FREE_SEATS', 'DISCOUNT', 'TRIAL_EXTENSION', 'WORKSPACE_CREDIT_ALLOWANCE', 'LIMIT_OVERRIDE', 'REFUND', 'CREDIT_GRANT')`,
    );
    await query(
      `CREATE TYPE "core"."billingArrangement_seatcapmode_enum" AS ENUM('SOFT', 'HARD')`,
    );
    await query(
      `CREATE TABLE "core"."billingArrangement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "type" "core"."billingArrangement_type_enum" NOT NULL, "label" character varying NOT NULL, "comment" character varying(500), "seats" integer, "seatCapMode" "core"."billingArrangement_seatcapmode_enum", "stripePriceId" character varying, "stripeDiscountId" character varying, "creditAllowanceMicro" bigint, "stripeCreditNoteId" character varying, "creditGrantId" uuid, "usageLimitId" uuid, "startsAt" TIMESTAMP WITH TIME ZONE NOT NULL, "endsAt" TIMESTAMP WITH TIME ZONE, "revokedAt" TIMESTAMP WITH TIME ZONE, "revokedByUserId" uuid, "grantedByUserId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9451bfacd03125c95a4a60a4e63" PRIMARY KEY ("id"))`,
    );
    await query(
      `CREATE UNIQUE INDEX "IDX_BILLING_ARRANGEMENT_STRIPE_DISCOUNT_ID_UNIQUE" ON "core"."billingArrangement" ("stripeDiscountId")`,
    );
    await query(
      `CREATE INDEX "IDX_BILLING_ARRANGEMENT_WORKSPACE_ID_TYPE" ON "core"."billingArrangement" ("workspaceId", "type")`,
    );
  }

  await addColumnIfMissing(query, 'navigationMenuItem', 'nativePageKey', 'text');

  const nativePageValue = await query(
    `SELECT 1
       FROM pg_enum e
       JOIN pg_type t ON t.oid = e.enumtypid
       JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'core'
        AND t.typname = 'navigationMenuItem_type_enum'
        AND e.enumlabel = 'NATIVE_PAGE'`,
  );

  if (nativePageValue.length === 0) {
    await query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"`,
    );
    await query(
      `ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"`,
    );
    await query(
      `CREATE TYPE "core"."navigationMenuItem_type_enum" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'AGENT_CHAT_CHANNEL', 'NATIVE_PAGE')`,
    );
    await query(
      `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await query(
      `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"`,
    );
    await query(`DROP TYPE "core"."navigationMenuItem_type_enum_old"`);
    await query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL) OR ("type" = 'AGENT_CHAT_CHANNEL' AND "agentChatChannelId" IS NOT NULL) OR ("type" = 'NATIVE_PAGE' AND "nativePageKey" IS NOT NULL))`,
    );
  }

  await addColumnIfMissing(
    query,
    'commandMenuItem',
    'availabilityCoreObjectName',
    'character varying',
  );
  await addColumnIfMissing(
    query,
    'workspace',
    'aiChatAssistantProfile',
    `jsonb NOT NULL DEFAULT '{"displayName":"Ada","avatarShape":"circle","avatarColor":"blue","avatarFace":"default","isAvatarAnimated":true}'`,
  );

  const fieldMetadataOption = await query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'fieldMetadataOption'`,
  );

  if (fieldMetadataOption.length === 0) {
    await query(
      `CREATE TABLE "core"."fieldMetadataOption" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "overrides" jsonb, "isActive" boolean NOT NULL DEFAULT true, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "value" character varying NOT NULL, "label" character varying NOT NULL, "color" character varying, "position" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c9060d4696fdbd5f86ecebd7fb1" PRIMARY KEY ("id"))`,
    );
    await query(
      `CREATE UNIQUE INDEX "IDX_8943119a119b01408f422b8212" ON "core"."fieldMetadataOption" ("workspaceId", "universalIdentifier")`,
    );
    await query(
      `CREATE UNIQUE INDEX "IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE" ON "core"."fieldMetadataOption" ("fieldMetadataId", "value")`,
    );
    await query(
      `CREATE INDEX "IDX_FIELD_METADATA_OPTION_APPLICATION_ID" ON "core"."fieldMetadataOption" ("applicationId")`,
    );
    await query(
      `ALTER TABLE "core"."fieldMetadataOption" ADD CONSTRAINT "FK_27b4d06b908e0663b675de3e974" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await query(
      `ALTER TABLE "core"."fieldMetadataOption" ADD CONSTRAINT "FK_db1306d4c94604c52d5db100668" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await query(
      `ALTER TABLE "core"."fieldMetadataOption" ADD CONSTRAINT "FK_12966faa34751ce8979af6e5a1a" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  await addColumnIfMissing(query, 'roleTarget', 'targetApplicationId', 'uuid');
  await addColumnIfMissing(
    query,
    'role',
    'canBeAssignedToApplications',
    'boolean NOT NULL DEFAULT false',
  );

  const roleTargetApplicationIndex = await query(
    `SELECT 1 FROM pg_indexes WHERE schemaname = 'core' AND indexname = 'IDX_ROLE_TARGET_TARGET_APPLICATION_ID'`,
  );

  if (roleTargetApplicationIndex.length === 0) {
    await query(
      `CREATE INDEX "IDX_ROLE_TARGET_TARGET_APPLICATION_ID" ON "core"."roleTarget" ("targetApplicationId")`,
    );
  }

  const roleTargetApplicationUnique = await query(
    `SELECT 1 FROM pg_constraint WHERE conname = 'IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION'`,
  );

  if (roleTargetApplicationUnique.length === 0) {
    await query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION" UNIQUE ("workspaceId", "targetApplicationId")`,
    );
  }

  const roleTargetApplicationFk = await query(
    `SELECT 1 FROM pg_constraint WHERE conname = 'FK_3f78f147358cb6d12a82ec02a96'`,
  );

  if (roleTargetApplicationFk.length === 0) {
    await query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_3f78f147358cb6d12a82ec02a96" FOREIGN KEY ("targetApplicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  await query(
    `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT IF EXISTS "CHK_role_target_single_entity"`,
  );
  await query(
    `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "CHK_role_target_single_entity" CHECK ((("agentId" IS NOT NULL)::int + ("userWorkspaceId" IS NOT NULL)::int + ("apiKeyId" IS NOT NULL)::int + ("webhookId" IS NOT NULL)::int + ("targetApplicationId" IS NOT NULL)::int) = 1)`,
  );
};

export const applyInstanceSchemaSkippedByUpgradeCursorOnQueryRunner = (
  queryRunner: QueryRunner,
): Promise<void> =>
  applyInstanceSchemaSkippedByUpgradeCursor((sql) => queryRunner.query(sql));
