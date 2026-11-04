import { toAgentPresenceAwarenessState } from '@/agent-presence/utils/toAgentPresenceAwarenessState';
import { type AgentPresenceEvent } from '~/generated-metadata/graphql';

const BASE_EVENT: AgentPresenceEvent = {
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

describe('toAgentPresenceAwarenessState', () => {
  it('maps a server event to an agent awareness state', () => {
    const state = toAgentPresenceAwarenessState(BASE_EVENT);

    expect(state?.actor).toMatchObject({
      kind: 'agent',
      id: 'agent-1',
      name: 'Data modeler',
    });
    expect(state?.activity).toEqual({
      id: 'event-1',
      toolName: 'create_field_metadata',
      action: 'create',
      emittedAt: 1700000000000,
      target: {
        kind: 'field',
        objectNameSingular: 'company',
        objectLabel: 'Company',
        fieldMetadataId: 'field-id',
        fieldLabel: 'Budget',
        viewId: null,
        recordId: null,
      },
    });
  });

  it('gives the same color to the same agent', () => {
    expect(toAgentPresenceAwarenessState(BASE_EVENT)?.actor.color).toBe(
      toAgentPresenceAwarenessState({ ...BASE_EVENT, id: 'event-2' })?.actor
        .color,
    );
  });

  it('groups runs without an agent under the workspace assistant', () => {
    expect(
      toAgentPresenceAwarenessState({ ...BASE_EVENT, agentId: null })?.actor.id,
    ).toBe('workspace-assistant');
  });

  it('rejects unknown actions and targets', () => {
    expect(
      toAgentPresenceAwarenessState({ ...BASE_EVENT, action: 'read' }),
    ).toBeNull();
    expect(
      toAgentPresenceAwarenessState({ ...BASE_EVENT, targetKind: 'page' }),
    ).toBeNull();
  });
});
