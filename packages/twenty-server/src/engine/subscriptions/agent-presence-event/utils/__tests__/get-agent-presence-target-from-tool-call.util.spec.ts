import { getAgentPresenceTargetFromToolCall } from 'src/engine/subscriptions/agent-presence-event/utils/get-agent-presence-target-from-tool-call.util';

const OBJECT_ID = '20202020-0000-4000-8000-000000000001';
const FIELD_ID = '20202020-0000-4000-8000-000000000002';
const VIEW_ID = '20202020-0000-4000-8000-000000000003';
const RECORD_ID = '20202020-0000-4000-8000-000000000004';

describe('getAgentPresenceTargetFromToolCall', () => {
  it('should target the created field and its object', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'create_field_metadata',
        args: { objectMetadataId: OBJECT_ID, name: 'budget', type: 'NUMBER' },
        output: {
          success: true,
          message: 'Created',
          result: { id: FIELD_ID, name: 'budget', objectMetadataId: OBJECT_ID },
        },
      }),
    ).toEqual({
      action: 'create',
      kind: 'field',
      fieldMetadataId: FIELD_ID,
      fieldName: 'budget',
      objectMetadataId: OBJECT_ID,
    });
  });

  it('should follow the first item of a batch field creation', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'create_many_field_metadata',
        args: {
          fields: [
            { objectMetadataId: OBJECT_ID, name: 'budget' },
            { objectMetadataId: OBJECT_ID, name: 'stage' },
          ],
        },
        output: { success: true, message: 'Created 2 field(s).' },
      }),
    ).toEqual({
      action: 'create',
      kind: 'field',
      fieldMetadataId: undefined,
      fieldName: 'budget',
      objectMetadataId: OBJECT_ID,
    });
  });

  it('should target an updated object by id', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'update_object_metadata',
        args: { id: OBJECT_ID, labelSingular: 'Deal' },
        output: {
          success: true,
          message: 'Updated',
          result: { id: OBJECT_ID, nameSingular: 'opportunity' },
        },
      }),
    ).toEqual({
      action: 'update',
      kind: 'object',
      objectMetadataId: OBJECT_ID,
      objectNameSingular: 'opportunity',
    });
  });

  it('should target a created view', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'create_view',
        args: { name: 'Hot deals', objectNameSingular: 'opportunity' },
        output: {
          success: true,
          message: 'Created',
          result: { id: VIEW_ID, objectNameSingular: 'opportunity' },
        },
      }),
    ).toEqual({
      action: 'create',
      kind: 'view',
      viewId: VIEW_ID,
      objectMetadataId: undefined,
      objectNameSingular: 'opportunity',
    });
  });

  it('should target the record returned by a record creation', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'create_one_company',
        args: { name: 'Acme' },
        output: {
          success: true,
          message: 'Created',
          result: { id: RECORD_ID },
        },
        databaseCrud: {
          objectNameSingular: 'company',
          operation: 'create_one',
        },
      }),
    ).toEqual({
      action: 'create',
      kind: 'record',
      objectNameSingular: 'company',
      recordId: RECORD_ID,
    });
  });

  it('should fall back to the input id when an update returns no record', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'update_one_company',
        args: { id: RECORD_ID, name: 'Acme' },
        output: { success: true, message: 'Updated' },
        databaseCrud: {
          objectNameSingular: 'company',
          operation: 'update_one',
        },
      }),
    ).toMatchObject({ action: 'update', recordId: RECORD_ID });
  });

  it('should take the first record of a batch result', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'delete_many_companies',
        args: {},
        output: {
          success: true,
          message: 'Deleted',
          result: [{ id: RECORD_ID }, { id: OBJECT_ID }],
        },
        databaseCrud: {
          objectNameSingular: 'company',
          operation: 'delete_many',
        },
      }),
    ).toMatchObject({ action: 'delete', recordId: RECORD_ID });
  });

  it('should ignore read-only record tools', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'find_companies',
        args: {},
        output: { success: true, message: 'Found', result: [] },
        databaseCrud: { objectNameSingular: 'company', operation: 'find_many' },
      }),
    ).toBeNull();
  });

  it('should ignore failed and unknown tools', () => {
    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'create_field_metadata',
        args: { objectMetadataId: OBJECT_ID },
        output: { success: false, message: 'Failed' },
      }),
    ).toBeNull();

    expect(
      getAgentPresenceTargetFromToolCall({
        toolName: 'web_search',
        args: {},
        output: { success: true, message: 'Done' },
      }),
    ).toBeNull();
  });
});
