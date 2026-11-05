import { AGENT_PRESENCE_BROWSER_EVENT_NAME } from '@/agent-presence/constants/AgentPresenceBrowserEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { type AgentPresenceEvent } from '~/generated-metadata/graphql';

export const dispatchAgentPresenceEventsFromSseToBrowserEvents = (
  agentPresenceEvents: AgentPresenceEvent[],
) => {
  for (const agentPresenceEvent of agentPresenceEvents) {
    dispatchBrowserEvent(AGENT_PRESENCE_BROWSER_EVENT_NAME, agentPresenceEvent);
  }
};
