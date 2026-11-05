import { isNonEmptyString } from '@sniptt/guards';

import { type AgentPresenceTarget } from '@/agent-presence/types/AgentPresenceAwarenessState';
import {
  type AgentPresenceTargetKeyKind,
  buildAgentPresenceTargetKey,
} from '@/agent-presence/utils/buildAgentPresenceTargetKey';

export type AgentPresenceTargetKey = {
  key: string;
  isFallback: boolean;
};

const toTargetKey = (
  kind: AgentPresenceTargetKeyKind,
  id: string | null,
  isFallback: boolean,
): AgentPresenceTargetKey[] =>
  isNonEmptyString(id)
    ? [{ key: buildAgentPresenceTargetKey(kind, id), isFallback }]
    : [];

// Ordered from the most precise element to the navigation fallback
export const getAgentPresenceTargetKeys = (
  target: AgentPresenceTarget,
): AgentPresenceTargetKey[] => {
  const objectFallbackKeys = [
    ...toTargetKey('object', target.objectNameSingular, true),
    ...toTargetKey('navigation-object', target.objectNameSingular, true),
  ];

  switch (target.kind) {
    case 'field':
      return [
        ...toTargetKey('field', target.fieldMetadataId, false),
        ...objectFallbackKeys,
      ];
    case 'object':
      return [
        ...toTargetKey('object', target.objectNameSingular, false),
        ...toTargetKey('navigation-object', target.objectNameSingular, true),
      ];
    case 'record':
      return [
        ...toTargetKey('record', target.recordId, false),
        ...toTargetKey('navigation-object', target.objectNameSingular, true),
      ];
    case 'view':
      return toTargetKey('navigation-object', target.objectNameSingular, true);
  }
};
