import { type QueryRunner } from 'typeorm';

import { EnableVectorExtensionFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-instance-command-fast-1793779918381-enable-vector-extension';

describe('EnableVectorExtensionFastInstanceCommand', () => {
  let command: EnableVectorExtensionFastInstanceCommand;

  beforeEach(() => {
    command = new EnableVectorExtensionFastInstanceCommand();
  });

  it('creates the vector extension in the public schema when available', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await command.up({ query } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(1);

    const sql = query.mock.calls[0][0] as string;

    expect(sql).toContain("FROM pg_available_extensions WHERE name = 'vector'");
    expect(sql).toContain(
      'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public',
    );
    expect(sql).toContain('WHEN insufficient_privilege THEN');
  });

  it('drops the vector extension without cascading', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await command.down({ query } as unknown as QueryRunner);

    expect(query.mock.calls.map((call) => call[0] as string)).toEqual([
      'DROP EXTENSION IF EXISTS vector',
    ]);
  });
});
