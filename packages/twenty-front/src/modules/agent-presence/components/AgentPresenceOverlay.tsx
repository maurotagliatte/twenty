import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { type Awareness } from 'y-protocols/awareness';

import { AgentPresencePointer } from '@/agent-presence/components/AgentPresencePointer';
import { useAgentPresencePeers } from '@/agent-presence/hooks/useAgentPresencePeers';

const StyledOverlay = styled.div`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: fixed;
  z-index: ${themeCssVariables.lastLayerZIndex};
`;

type AgentPresenceOverlayProps = {
  awareness: Awareness;
};

export const AgentPresenceOverlay = ({
  awareness,
}: AgentPresenceOverlayProps) => {
  const peers = useAgentPresencePeers(awareness);

  if (peers.length === 0) {
    return null;
  }

  return (
    <StyledOverlay aria-live="polite">
      {peers.map(({ clientId, state }) => (
        <AgentPresencePointer key={clientId} state={state} />
      ))}
    </StyledOverlay>
  );
};
