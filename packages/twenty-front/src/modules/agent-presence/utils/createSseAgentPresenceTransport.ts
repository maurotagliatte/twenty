import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import { isDefined } from 'twenty-shared/utils';
import { Doc } from 'yjs';

import { AGENT_PRESENCE_BROWSER_EVENT_NAME } from '@/agent-presence/constants/AgentPresenceBrowserEventName';
import { AGENT_PRESENCE_LINGER_TIME_IN_MS } from '@/agent-presence/constants/AgentPresenceLingerTimeInMs';
import { type AgentPresenceAwarenessState } from '@/agent-presence/types/AgentPresenceAwarenessState';
import { type AgentPresenceTransport } from '@/agent-presence/types/AgentPresenceTransport';
import { getAgentPresenceClientId } from '@/agent-presence/utils/getAgentPresenceClientId';
import { toAgentPresenceAwarenessState } from '@/agent-presence/utils/toAgentPresenceAwarenessState';
import { type AgentPresenceEvent } from '~/generated-metadata/graphql';

const SSE_TRANSPORT_ORIGIN = 'agent-presence-sse-transport';

type AgentPeer = {
  awareness: Awareness;
  expiryTimer: ReturnType<typeof setTimeout> | null;
};

// The server only streams events, so each agent is mirrored as a remote Yjs peer
// whose updates go through the real awareness wire format.
export const createSseAgentPresenceTransport = ({
  lingerTimeInMs = AGENT_PRESENCE_LINGER_TIME_IN_MS,
}: { lingerTimeInMs?: number } = {}): AgentPresenceTransport => ({
  connect: (awareness) => {
    const peerByActorId = new Map<string, AgentPeer>();

    const publishPeerState = (
      peer: AgentPeer,
      state: AgentPresenceAwarenessState | null,
    ) => {
      peer.awareness.setLocalState(state);

      applyAwarenessUpdate(
        awareness,
        encodeAwarenessUpdate(peer.awareness, [peer.awareness.clientID]),
        SSE_TRANSPORT_ORIGIN,
      );
    };

    const getOrCreatePeer = (actorId: string): AgentPeer => {
      const existingPeer = peerByActorId.get(actorId);

      if (isDefined(existingPeer)) {
        return existingPeer;
      }

      const peerDocument = new Doc();

      peerDocument.clientID = getAgentPresenceClientId(actorId);

      const peer: AgentPeer = {
        awareness: new Awareness(peerDocument),
        expiryTimer: null,
      };

      peerByActorId.set(actorId, peer);

      return peer;
    };

    const handleAgentPresenceEvent = (event: Event) => {
      const state = toAgentPresenceAwarenessState(
        (event as CustomEvent<AgentPresenceEvent>).detail,
      );

      if (!isDefined(state)) {
        return;
      }

      const peer = getOrCreatePeer(state.actor.id);

      publishPeerState(peer, state);

      if (isDefined(peer.expiryTimer)) {
        clearTimeout(peer.expiryTimer);
      }

      peer.expiryTimer = setTimeout(() => {
        peer.expiryTimer = null;
        publishPeerState(peer, null);
      }, lingerTimeInMs);
    };

    window.addEventListener(
      AGENT_PRESENCE_BROWSER_EVENT_NAME,
      handleAgentPresenceEvent,
    );

    return () => {
      window.removeEventListener(
        AGENT_PRESENCE_BROWSER_EVENT_NAME,
        handleAgentPresenceEvent,
      );

      for (const peer of peerByActorId.values()) {
        if (isDefined(peer.expiryTimer)) {
          clearTimeout(peer.expiryTimer);
        }

        publishPeerState(peer, null);
        peer.awareness.destroy();
        peer.awareness.doc.destroy();
      }

      peerByActorId.clear();
    };
  },
});
