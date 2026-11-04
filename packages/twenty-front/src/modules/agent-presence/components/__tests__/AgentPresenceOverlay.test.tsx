import { act, render, screen } from '@testing-library/react';
import { Awareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';

import { AgentPresenceOverlay } from '@/agent-presence/components/AgentPresenceOverlay';
import { AGENT_PRESENCE_BROWSER_EVENT_NAME } from '@/agent-presence/constants/AgentPresenceBrowserEventName';
import { AGENT_PRESENCE_TARGET_LOOKUP_INTERVAL_IN_MS } from '@/agent-presence/constants/AgentPresenceTargetLookupIntervalInMs';
import { AGENT_PRESENCE_TARGET_LOOKUP_TIMEOUT_IN_MS } from '@/agent-presence/constants/AgentPresenceTargetLookupTimeoutInMs';
import { createSseAgentPresenceTransport } from '@/agent-presence/utils/createSseAgentPresenceTransport';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { type AgentPresenceEvent } from '~/generated-metadata/graphql';

const FIELD_CREATED_EVENT: AgentPresenceEvent = {
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
};

const mountTarget = (targetKey: string) => {
  const target = document.createElement('div');

  target.setAttribute('data-agent-presence-target', targetKey);
  jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
    top: 100,
    left: 40,
    width: 300,
    height: 32,
    bottom: 132,
    right: 340,
    x: 40,
    y: 100,
    toJSON: () => ({}),
  });
  document.body.appendChild(target);

  return target;
};

const renderOverlay = () => {
  const awareness = new Awareness(new Doc());
  const disconnect = createSseAgentPresenceTransport().connect(awareness);

  render(<AgentPresenceOverlay awareness={awareness} />);

  return () => {
    disconnect();
    awareness.destroy();
  };
};

const emitAgentPresenceEvent = (event: AgentPresenceEvent) =>
  act(() => {
    dispatchBrowserEvent(AGENT_PRESENCE_BROWSER_EVENT_NAME, event);
  });

describe('AgentPresenceOverlay', () => {
  let cleanupOverlay: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => cleanupOverlay());
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  it('renders nothing until an agent acts', () => {
    cleanupOverlay = renderOverlay();

    expect(screen.queryByTestId('agent-presence-pointer')).toBeNull();
  });

  it('moves the agent pointer onto the field it created', () => {
    mountTarget('field:field-id');
    cleanupOverlay = renderOverlay();

    emitAgentPresenceEvent(FIELD_CREATED_EVENT);

    expect(screen.getByText('Data modeler')).toBeInTheDocument();
    expect(
      screen.getByText('Added field Budget to Company'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('agent-presence-pointer')).toHaveStyle({
      transform: 'translate(64px, 116px)',
    });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('falls back to a notice when the target is not on screen', () => {
    cleanupOverlay = renderOverlay();

    emitAgentPresenceEvent(FIELD_CREATED_EVENT);

    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(
        AGENT_PRESENCE_TARGET_LOOKUP_TIMEOUT_IN_MS +
          AGENT_PRESENCE_TARGET_LOOKUP_INTERVAL_IN_MS,
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Added field Budget to Company',
    );
    expect(screen.queryByTestId('agent-presence-pointer')).toBeNull();
  });

  it('pulses the object in the navigation when only the fallback is visible', () => {
    mountTarget('navigation-object:company');
    cleanupOverlay = renderOverlay();

    emitAgentPresenceEvent(FIELD_CREATED_EVENT);

    expect(screen.getByRole('status')).toHaveTextContent('Data modeler');
    expect(screen.getByTestId('agent-presence-pointer')).toBeInTheDocument();
  });
});
