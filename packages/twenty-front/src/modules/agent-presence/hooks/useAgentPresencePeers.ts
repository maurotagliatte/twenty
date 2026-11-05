import { useCallback, useSyncExternalStore } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type Awareness } from 'y-protocols/awareness';

import {
  type AgentPresencePeer,
  readAgentPresencePeers,
} from '@/agent-presence/utils/readAgentPresencePeers';

const peersSnapshotByAwareness = new WeakMap<Awareness, AgentPresencePeer[]>();

const getPeersSnapshot = (awareness: Awareness) => {
  const cachedPeers = peersSnapshotByAwareness.get(awareness);

  if (isDefined(cachedPeers)) {
    return cachedPeers;
  }

  const peers = readAgentPresencePeers(awareness);

  peersSnapshotByAwareness.set(awareness, peers);

  return peers;
};

export const useAgentPresencePeers = (awareness: Awareness) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleChange = () => {
        peersSnapshotByAwareness.set(
          awareness,
          readAgentPresencePeers(awareness),
        );
        onStoreChange();
      };

      awareness.on('change', handleChange);

      return () => awareness.off('change', handleChange);
    },
    [awareness],
  );

  return useSyncExternalStore(subscribe, () => getPeersSnapshot(awareness));
};
