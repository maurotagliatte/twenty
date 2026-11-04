import { type QueryRunner } from 'typeorm';

import { EnableVectorExtensionFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-instance-command-fast-1793779918381-enable-vector-extension';

jest.useRealTimers();

describe('2-56 instance command 1793779918381 - enable vector extension (integration)', () => {
  const enableVectorCommand = new EnableVectorExtensionFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findVectorExtensionSchema = async (): Promise<string | undefined> => {
    const [row] = await queryRunner.query(
      `SELECT n.nspname AS "schemaName"
         FROM pg_extension e
         JOIN pg_namespace n ON n.oid = e.extnamespace
        WHERE e.extname = 'vector'`,
    );

    return row?.schemaName;
  };

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('installs vector in the public schema and is idempotent', async () => {
    await enableVectorCommand.down(queryRunner);

    expect(await findVectorExtensionSchema()).toBeUndefined();

    await enableVectorCommand.up(queryRunner);
    await enableVectorCommand.up(queryRunner);

    expect(await findVectorExtensionSchema()).toBe('public');
  });

  it('lets a workspace schema store and compare vectors', async () => {
    await enableVectorCommand.up(queryRunner);

    const [{ schemaName }] = await queryRunner.query(
      `SELECT nspname AS "schemaName" FROM pg_namespace
        WHERE nspname LIKE 'workspace\\_%' ORDER BY nspname LIMIT 1`,
    );

    await queryRunner.query(
      `CREATE TABLE "${schemaName}"."_vectorProbe" ("embedding" public.vector(3))`,
    );
    await queryRunner.query(
      `INSERT INTO "${schemaName}"."_vectorProbe" VALUES ('[1,2,3]'), ('[4,5,6]')`,
    );

    const rows = await queryRunner.query(
      `SELECT "embedding"::text AS "embedding"
         FROM "${schemaName}"."_vectorProbe"
        ORDER BY "embedding" OPERATOR(public.<->) '[1,2,2]'::public.vector
        LIMIT 1`,
    );

    expect(rows).toEqual([{ embedding: '[1,2,3]' }]);
  });
});
