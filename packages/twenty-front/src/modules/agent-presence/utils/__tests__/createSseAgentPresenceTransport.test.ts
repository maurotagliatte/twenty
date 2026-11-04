import { Awareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';

import { AGENT_PRESENCE_BROWSER_EVENT_NAME } from '@/agent-presence/constants/AgentPresenceBrowserEventName';
import { createSseAgentPresenceTransport } from '@/agent-presence/utils/createSseAgentPresenceTransport';
import { getAgentPresenceClientId } from '@/agent-presence/utils/getAgentPresenceClientId';
import { readAgentPresencePeers } from '@/agent-presence/utils/readAgentPresencePeers';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { type AgentPresenceEvent } from '~/generated-metadata/graphql';

const buildEvent = (
  overrides: Partial<AgentPresenceEvent> = {},
): AgentPresenceEvent => ({
  id: 'event-1',
  agentId: 'agent-1',
  agentName: 'Data modeler',
  toolName: 'create_field_metadata',
  action: 'create',
  targetKind: 'field',
  objectMetadataId: 'object-id',
  objectNameSingular: 'company',
  objectLabel: 'Company',
  fieldMetadataId: 'field-id',
  fieldLabel: 'Budget',
  viewId: null,
  recordId: null,
  emittedAt: 1700000000000,
  ...overrides,
});

describe('createSseAgentPresenceTransport', () => {
  let awareness: Awareness;
  let disconnect: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
    awareness = new Awareness(new Doc());
    disconnect = createSseAgentPresenceTransport({
      lingerTimeInMs: 1000,
    }).connect(awareness);
  });

  afterEach(() => {
    disconnect();
    awareness.destroy();
    jest.useRealTimers();
  });

  it('adds each agent as a remote awareness peer', () => {
    const handleChange = jest.fn();

    awareness.on('change', handleChange);

    dispatchBrowserEvent(AGENT_PRESENCE_BROWSER_EVENT_NAME, buildEvent());

    const peers = readAgentPresencePeers(awareness);

    expect(peers).toHaveLength(1);
    expect(peers[0].clientId).toBe(getAgentPresenceClientId('agent-1'));
    expect(peers[0].state.activity.target.fieldMetadataId).toBe('field-id');
    expect(handleChange).toHaveBeenCalledWith(
      { added: [peers[0].clientId], updated: [], removed: [] },
      'agent-presence-sse-transport',
    );
  });

  it('keeps one peer per agent and moves it to the latest activity', () => {
    dispatchBrowserEvent(AGENT_PRESENCE_BROWSER_EVENT_NAME, buildEvent());
    dispatchBrowserEvent(
      AGENT_PRESENCE_BROWSER_EVENT_NAME,
      buildEvent({ id: 'event-2', fieldMetadataId: 'other-field-id' }),
    );
    dispatchBrowserEvent(
      AGENT_PRESENCE_BROWSER_EVENT_NAME,
      buildEvent({ id: 'event-3', agentId: 'agent-2' }),
    );

    const peers = readAgentPresencePeers(awareness);

    expect(peers).toHaveLength(2);
    expect(
      peers.find(
        ({ clientId }) => clientId === getAgentPresenceClientId('agent-1'),
      )?.state.activity.id,
    ).toBe('event-2');
  });

  it('removes the peer once the agent has been idle for the linger time', () => {
    dispatchBrowserEvent(AGENT_PRESENCE_BROWSER_EVENT_NAME, buildEvent());

    jest.advanceTimersByTime(999);
    expect(readAgentPresencePeers(awareness)).toHaveLength(1);

    jest.advanceTimersByTime(1);
    expect(readAgentPresencePeers(awareness)).toHaveLength(0);
  });

  it('brings an expired agent back on its next activity', () => {
    dispatchBrowserEvent(AGENT_PRESENCE_BROWSER_EVENT_NAME, buildEvent());
    jest.advanceTimersByTime(1000);

    dispatchBrowserEvent(
      AGENT_PRESENCE_BROWSER_EVENT_NAME,
      buildEvent({ id: 'event-2' }),
    );

    expect(readAgentPresencePeers(awareness)).toHaveLength(1);
  });

  it('ignores events once disconnected and removes the peers it added', () => {
    dispatchBrowserEvent(AGENT_PRESENCE_BROWSER_EVENT_NAME, buildEvent());

    disconnect();

    expect(readAgentPresencePeers(awareness)).toHaveLength(0);

    dispatchBrowserEvent(
      AGENT_PRESENCE_BROWSER_EVENT_NAME,
      buildEvent({ id: 'event-2' }),
    );

    expect(readAgentPresencePeers(awareness)).toHaveLength(0);
  });
});
