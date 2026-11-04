import { AgentPresenceLayer } from '@/agent-presence/components/AgentPresenceLayer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AgentPresenceProvider = () => {
  const isAgentUiPresenceEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_UI_PRESENCE_ENABLED,
  );

  if (!isAgentUiPresenceEnabled) {
    return null;
  }

  return <AgentPresenceLayer />;
};
