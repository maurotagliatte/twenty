import { type ThemeColor } from 'twenty-ui/theme';

export type AgentPresenceAction = 'create' | 'update' | 'delete';

export type AgentPresenceTargetKind = 'object' | 'field' | 'view' | 'record';

export type AgentPresenceTarget = {
  kind: AgentPresenceTargetKind;
  objectNameSingular: string | null;
  objectLabel: string | null;
  fieldMetadataId: string | null;
  fieldLabel: string | null;
  viewId: string | null;
  recordId: string | null;
};

// Shape every peer (agent or human) publishes in the shared Yjs awareness
export type AgentPresenceAwarenessState = {
  actor: {
    kind: 'agent';
    id: string;
    name: string | null;
    color: ThemeColor;
  };
  activity: {
    id: string;
    toolName: string;
    action: AgentPresenceAction;
    target: AgentPresenceTarget;
    emittedAt: number;
  };
};
