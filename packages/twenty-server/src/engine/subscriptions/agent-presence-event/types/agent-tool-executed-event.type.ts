import { type DatabaseCrudOperation } from 'twenty-shared/ai';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export type AgentToolExecutedEvent = {
  workspaceId: string;
  userWorkspaceId?: string;
  agentId?: string;
  toolName: string;
  args: Record<string, unknown>;
  output: ToolOutput;
  databaseCrud?: {
    objectNameSingular: string;
    operation: DatabaseCrudOperation;
  };
};
