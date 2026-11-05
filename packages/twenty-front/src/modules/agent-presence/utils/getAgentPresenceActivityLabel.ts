import { t } from '@lingui/core/macro';

import {
  type AgentPresenceAction,
  type AgentPresenceAwarenessState,
} from '@/agent-presence/types/AgentPresenceAwarenessState';

export const getAgentPresenceActivityLabel = ({
  action,
  target,
}: AgentPresenceAwarenessState['activity']): string => {
  const objectLabel = target.objectLabel ?? t`an object`;
  const fieldLabel = target.fieldLabel ?? t`a field`;

  const labelsByKind: Record<
    AgentPresenceAwarenessState['activity']['target']['kind'],
    () => Record<AgentPresenceAction, string>
  > = {
    field: () => ({
      create: t`Added field ${fieldLabel} to ${objectLabel}`,
      update: t`Updated field ${fieldLabel} on ${objectLabel}`,
      delete: t`Removed field ${fieldLabel} from ${objectLabel}`,
    }),
    object: () => ({
      create: t`Created object ${objectLabel}`,
      update: t`Updated object ${objectLabel}`,
      delete: t`Deleted object ${objectLabel}`,
    }),
    view: () => ({
      create: t`Created a view on ${objectLabel}`,
      update: t`Updated a view on ${objectLabel}`,
      delete: t`Deleted a view on ${objectLabel}`,
    }),
    record: () => ({
      create: t`Created a ${objectLabel} record`,
      update: t`Updated a ${objectLabel} record`,
      delete: t`Deleted a ${objectLabel} record`,
    }),
  };

  return labelsByKind[target.kind]()[action];
};
