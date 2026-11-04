export type AgentPresenceAction = 'create' | 'update' | 'delete';

export type AgentPresenceTargetKind = 'object' | 'field' | 'view' | 'record';

export type AgentPresenceTarget = {
  action: AgentPresenceAction;
  kind: AgentPresenceTargetKind;
  objectMetadataId?: string;
  objectNameSingular?: string;
  fieldMetadataId?: string;
  fieldName?: string;
  viewId?: string;
  recordId?: string;
};
