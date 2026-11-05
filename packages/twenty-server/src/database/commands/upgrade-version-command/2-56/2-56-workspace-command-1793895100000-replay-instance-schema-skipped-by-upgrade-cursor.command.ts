import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { applyInstanceSchemaSkippedByUpgradeCursor } from 'src/database/commands/upgrade-version-command/2-56/utils/apply-instance-schema-skipped-by-upgrade-cursor.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.56.0', 1793895100000)
@Command({
  name: 'upgrade:2-56:replay-instance-schema-skipped-by-upgrade-cursor',
  description:
    'Apply 2.56 instance schema that the upgrade cursor skips once a workspace command is already recorded',
})
export class ReplayInstanceSchemaSkippedByUpgradeCursorCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun || !isDefined(dataSource)) {
      return;
    }

    await applyInstanceSchemaSkippedByUpgradeCursor((sql) =>
      dataSource.query(sql),
    );
  }
}
