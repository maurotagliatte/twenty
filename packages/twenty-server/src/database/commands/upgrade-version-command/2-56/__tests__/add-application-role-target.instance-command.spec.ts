import { DataSource } from 'typeorm';

import { AddApplicationRoleTargetFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-instance-command-fast-1793816136545-add-application-role-target';

describe('AddApplicationRoleTargetFastInstanceCommand', () => {
  const command = new AddApplicationRoleTargetFastInstanceCommand();

  it('adds the role-target columns with IF NOT EXISTS so a legacy column does not abort upgrade', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = new DataSource({ type: 'postgres' }).createQueryRunner();

    queryRunner.query = query;

    await command.up(queryRunner);

    const statements = query.mock.calls.map((call) => call[0] as string);

    expect(statements[0]).toContain(
      'ADD COLUMN IF NOT EXISTS "targetApplicationId"',
    );
    expect(statements[1]).toContain(
      'ADD COLUMN IF NOT EXISTS "canBeAssignedToApplications"',
    );
    expect(statements[2]).toContain('CREATE INDEX IF NOT EXISTS');
    expect(statements[3]).toContain(
      'IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION',
    );
    expect(statements[4]).toContain('DROP CONSTRAINT IF EXISTS');
  });
});
