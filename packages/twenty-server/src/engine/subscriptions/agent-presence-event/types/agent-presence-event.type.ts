import {
  type AgentPresenceAction,
  type AgentPresenceTargetKind,
} from 'src/engine/subscriptions/agent-presence-event/types/agent-presence-target.type';

export type AgentPresenceEvent = {
  id: string;
  agentId?: string;
  agentName?: string;
  toolName: string;
  action: AgentPresenceAction;
  targetKind: AgentPresenceTargetKind;
  objectMetadataId?: string;
  objectNameSingular?: string;
  objectLabel?: string;
  fieldMetadataId?: string;
  fieldLabel?: string;
  viewId?: string;
  recordId?: string;
  emittedAt: number;
};
