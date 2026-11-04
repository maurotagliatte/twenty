export type AgentPresenceTargetKeyKind =
  | 'object'
  | 'field'
  | 'record'
  | 'navigation-object';

export const buildAgentPresenceTargetKey = (
  kind: AgentPresenceTargetKeyKind,
  id: string,
) => `${kind}:${id}`;
