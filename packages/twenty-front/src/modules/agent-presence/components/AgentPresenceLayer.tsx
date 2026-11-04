import { useEffect, useState } from 'react';
import { Awareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';

import { AgentPresenceOverlay } from '@/agent-presence/components/AgentPresenceOverlay';
import { type AgentPresenceTransport } from '@/agent-presence/types/AgentPresenceTransport';
import { createSseAgentPresenceTransport } from '@/agent-presence/utils/createSseAgentPresenceTransport';

type AgentPresenceLayerProps = {
  transport?: AgentPresenceTransport;
};

export const AgentPresenceLayer = ({ transport }: AgentPresenceLayerProps) => {
  const [awareness] = useState(() => new Awareness(new Doc()));
  const [activeTransport] = useState(
    () => transport ?? createSseAgentPresenceTransport(),
  );

  useEffect(
    () => activeTransport.connect(awareness),
    [activeTransport, awareness],
  );

  return <AgentPresenceOverlay awareness={awareness} />;
};
