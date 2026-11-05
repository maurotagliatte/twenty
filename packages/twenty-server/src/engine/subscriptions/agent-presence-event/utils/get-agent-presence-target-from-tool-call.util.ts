import { isNonEmptyString } from '@sniptt/guards';
import { type DatabaseCrudOperation } from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type AgentToolExecutedEvent } from 'src/engine/subscriptions/agent-presence-event/types/agent-tool-executed-event.type';
import {
  type AgentPresenceAction,
  type AgentPresenceTarget,
  type AgentPresenceTargetKind,
} from 'src/engine/subscriptions/agent-presence-event/types/agent-presence-target.type';

type MetadataToolTarget = {
  action: AgentPresenceAction;
  kind: AgentPresenceTargetKind;
  // Batch tools carry their items under this key; the pointer follows the first one
  itemsKey?: string;
};

const METADATA_TOOL_TARGETS: Record<string, MetadataToolTarget> = {
  create_object_metadata: { action: 'create', kind: 'object' },
  create_many_object_metadata: {
    action: 'create',
    kind: 'object',
    itemsKey: 'objects',
  },
  update_object_metadata: { action: 'update', kind: 'object' },
  update_many_object_metadata: {
    action: 'update',
    kind: 'object',
    itemsKey: 'objects',
  },
  delete_object_metadata: { action: 'delete', kind: 'object' },
  create_field_metadata: { action: 'create', kind: 'field' },
  create_many_field_metadata: {
    action: 'create',
    kind: 'field',
    itemsKey: 'fields',
  },
  create_many_relation_fields: {
    action: 'create',
    kind: 'field',
    itemsKey: 'relations',
  },
  update_field_metadata: { action: 'update', kind: 'field' },
  update_many_field_metadata: {
    action: 'update',
    kind: 'field',
    itemsKey: 'fields',
  },
  delete_field_metadata: { action: 'delete', kind: 'field' },
  create_view: { action: 'create', kind: 'view' },
  update_view: { action: 'update', kind: 'view' },
  upsert_complete_view: { action: 'update', kind: 'view' },
  delete_view: { action: 'delete', kind: 'view' },
};

const ACTION_BY_DATABASE_CRUD_OPERATION: Partial<
  Record<DatabaseCrudOperation, AgentPresenceAction>
> = {
  create_one: 'create',
  create_many: 'create',
  update_one: 'update',
  update_many: 'update',
  upsert_many: 'update',
  merge_many: 'update',
  delete_one: 'delete',
  delete_many: 'delete',
};

const readString = (
  source: Record<string, unknown> | undefined,
  key: string,
): string | undefined => {
  const value = source?.[key];

  return isNonEmptyString(value) ? value : undefined;
};

const toPlainObject = (value: unknown): Record<string, unknown> | undefined =>
  isPlainObject(value) ? (value as Record<string, unknown>) : undefined;

const getFirstItem = (
  source: Record<string, unknown>,
  itemsKey: string | undefined,
): Record<string, unknown> => {
  if (!isDefined(itemsKey)) {
    return source;
  }

  const items = source[itemsKey];

  return Array.isArray(items) ? (toPlainObject(items[0]) ?? {}) : {};
};

const getFirstRecordId = (
  result: unknown,
  args: Record<string, unknown>,
): string | undefined => {
  if (Array.isArray(result)) {
    return readString(toPlainObject(result[0]), 'id');
  }

  const resultObject = toPlainObject(result);
  const records = resultObject?.records;

  if (Array.isArray(records)) {
    return readString(toPlainObject(records[0]), 'id');
  }

  return readString(resultObject, 'id') ?? readString(args, 'id');
};

const getMetadataTarget = (
  { action, kind, itemsKey }: MetadataToolTarget,
  args: Record<string, unknown>,
  result: Record<string, unknown> | undefined,
): AgentPresenceTarget => {
  const item = getFirstItem(args, itemsKey);
  const isSingleItemTool = !isDefined(itemsKey);
  const resultId = isSingleItemTool ? readString(result, 'id') : undefined;
  const id = resultId ?? readString(item, 'id');

  switch (kind) {
    case 'object':
      return {
        action,
        kind,
        objectMetadataId: id,
        objectNameSingular:
          readString(result, 'nameSingular') ??
          readString(item, 'nameSingular'),
      };
    case 'field':
      return {
        action,
        kind,
        fieldMetadataId: id,
        fieldName: readString(result, 'name') ?? readString(item, 'name'),
        objectMetadataId:
          readString(result, 'objectMetadataId') ??
          readString(item, 'objectMetadataId'),
      };
    case 'view':
      return {
        action,
        kind,
        viewId: id,
        objectMetadataId: readString(result, 'objectMetadataId'),
        objectNameSingular:
          readString(result, 'objectNameSingular') ??
          readString(item, 'objectNameSingular'),
      };
    case 'record':
      return { action, kind };
  }
};

export const getAgentPresenceTargetFromToolCall = ({
  toolName,
  args,
  output,
  databaseCrud,
}: Pick<
  AgentToolExecutedEvent,
  'toolName' | 'args' | 'output' | 'databaseCrud'
>): AgentPresenceTarget | null => {
  if (!output.success) {
    return null;
  }

  if (isDefined(databaseCrud)) {
    const action = ACTION_BY_DATABASE_CRUD_OPERATION[databaseCrud.operation];

    if (!isDefined(action)) {
      return null;
    }

    return {
      action,
      kind: 'record',
      objectNameSingular: databaseCrud.objectNameSingular,
      recordId: getFirstRecordId(output.result, args),
    };
  }

  const metadataToolTarget = METADATA_TOOL_TARGETS[toolName];

  if (!isDefined(metadataToolTarget)) {
    return null;
  }

  return getMetadataTarget(
    metadataToolTarget,
    args,
    toPlainObject(output.result),
  );
};
