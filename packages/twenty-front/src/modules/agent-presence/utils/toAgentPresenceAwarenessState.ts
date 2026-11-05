import { isNonEmptyString } from '@sniptt/guards';
import { stringToThemeColor } from 'twenty-ui/utilities';

import {
  type AgentPresenceAction,
  type AgentPresenceAwarenessState,
  type AgentPresenceTargetKind,
} from '@/agent-presence/types/AgentPresenceAwarenessState';
import { type AgentPresenceEvent } from '~/generated-metadata/graphql';

const AGENT_PRESENCE_ACTIONS: AgentPresenceAction[] = [
  'create',
  'update',
  'delete',
];

const AGENT_PRESENCE_TARGET_KINDS: AgentPresenceTargetKind[] = [
  'object',
  'field',
  'view',
  'record',
];

// The default workspace assistant runs without an agent record
const DEFAULT_AGENT_ACTOR_ID = 'workspace-assistant';

const isAgentPresenceAction = (value: string): value is AgentPresenceAction =>
  AGENT_PRESENCE_ACTIONS.includes(value as AgentPresenceAction);

const isAgentPresenceTargetKind = (
  value: string,
): value is AgentPresenceTargetKind =>
  AGENT_PRESENCE_TARGET_KINDS.includes(value as AgentPresenceTargetKind);

export const toAgentPresenceAwarenessState = (
  event: AgentPresenceEvent,
): AgentPresenceAwarenessState | null => {
  const { action, targetKind } = event;

  if (
    !isAgentPresenceAction(action) ||
    !isAgentPresenceTargetKind(targetKind)
  ) {
    return null;
  }

  const actorId = isNonEmptyString(event.agentId)
    ? event.agentId
    : DEFAULT_AGENT_ACTOR_ID;

  return {
    actor: {
      kind: 'agent',
      id: actorId,
      name: event.agentName ?? null,
      color: stringToThemeColor(actorId),
    },
    activity: {
      id: event.id,
      toolName: event.toolName,
      action,
      target: {
        kind: targetKind,
        objectNameSingular: event.objectNameSingular ?? null,
        objectLabel: event.objectLabel ?? null,
        fieldMetadataId: event.fieldMetadataId ?? null,
        fieldLabel: event.fieldLabel ?? null,
        viewId: event.viewId ?? null,
        recordId: event.recordId ?? null,
      },
      emittedAt: event.emittedAt,
    },
  };
};
