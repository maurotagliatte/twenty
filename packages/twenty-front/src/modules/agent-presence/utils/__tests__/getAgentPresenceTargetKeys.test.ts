import { type AgentPresenceTarget } from '@/agent-presence/types/AgentPresenceAwarenessState';
import { getAgentPresenceTargetKeys } from '@/agent-presence/utils/getAgentPresenceTargetKeys';

const EMPTY_TARGET: AgentPresenceTarget = {
  kind: 'field',
  objectNameSingular: null,
  objectLabel: null,
  fieldMetadataId: null,
  fieldLabel: null,
  viewId: null,
  recordId: null,
};

describe('getAgentPresenceTargetKeys', () => {
  it('points at the field first, then its object and nav item', () => {
    expect(
      getAgentPresenceTargetKeys({
        ...EMPTY_TARGET,
        kind: 'field',
        fieldMetadataId: 'field-id',
        objectNameSingular: 'company',
      }),
    ).toEqual([
      { key: 'field:field-id', isFallback: false },
      { key: 'object:company', isFallback: true },
      { key: 'navigation-object:company', isFallback: true },
    ]);
  });

  it('points at the record row, then the object nav item', () => {
    expect(
      getAgentPresenceTargetKeys({
        ...EMPTY_TARGET,
        kind: 'record',
        recordId: 'record-id',
        objectNameSingular: 'person',
      }),
    ).toEqual([
      { key: 'record:record-id', isFallback: false },
      { key: 'navigation-object:person', isFallback: true },
    ]);
  });

  it('points at the object row', () => {
    expect(
      getAgentPresenceTargetKeys({
        ...EMPTY_TARGET,
        kind: 'object',
        objectNameSingular: 'invoice',
      }),
    ).toEqual([
      { key: 'object:invoice', isFallback: false },
      { key: 'navigation-object:invoice', isFallback: true },
    ]);
  });

  it('only has the nav fallback for views', () => {
    expect(
      getAgentPresenceTargetKeys({
        ...EMPTY_TARGET,
        kind: 'view',
        viewId: 'view-id',
        objectNameSingular: 'opportunity',
      }),
    ).toEqual([{ key: 'navigation-object:opportunity', isFallback: true }]);
  });

  it('skips keys whose identifier is unknown', () => {
    expect(
      getAgentPresenceTargetKeys({ ...EMPTY_TARGET, kind: 'record' }),
    ).toEqual([]);
  });
});
