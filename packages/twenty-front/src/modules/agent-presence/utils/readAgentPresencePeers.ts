import { isPlainObject } from 'twenty-shared/utils';
import { type Awareness } from 'y-protocols/awareness';

import { type AgentPresenceAwarenessState } from '@/agent-presence/types/AgentPresenceAwarenessState';

export type AgentPresencePeer = {
  clientId: number;
  state: AgentPresenceAwarenessState;
};

const isAgentPresenceAwarenessState = (
  state: unknown,
): state is AgentPresenceAwarenessState =>
  isPlainObject(state) &&
  isPlainObject(state.actor) &&
  state.actor.kind === 'agent' &&
  isPlainObject(state.activity);

export const readAgentPresencePeers = (
  awareness: Awareness,
): AgentPresencePeer[] =>
  [...awareness.getStates().entries()]
    .filter(([clientId]) => clientId !== awareness.clientID)
    .flatMap(([clientId, state]) =>
      isAgentPresenceAwarenessState(state) ? [{ clientId, state }] : [],
    );
