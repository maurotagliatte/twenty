import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Warns instead of failing: nothing depends on vector yet, and self-hosted
// servers without pgvector or with a non-superuser app role must still upgrade.
@RegisteredInstanceCommand('2.56.0', 1793779918381)
export class EnableVectorExtensionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS vector');
  }
}
