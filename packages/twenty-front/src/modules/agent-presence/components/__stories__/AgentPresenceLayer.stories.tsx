import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AgentPresenceLayer } from '@/agent-presence/components/AgentPresenceLayer';
import { AGENT_PRESENCE_BROWSER_EVENT_NAME } from '@/agent-presence/constants/AgentPresenceBrowserEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { type AgentPresenceEvent } from '~/generated-metadata/graphql';

const FIELD_CREATED_EVENT: AgentPresenceEvent = {
  id: 'story-event',
  agentId: 'story-agent',
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
  emittedAt: 0,
};

const meta: Meta<typeof AgentPresenceLayer> = {
  title: 'Modules/AgentPresence/AgentPresenceLayer',
  component: AgentPresenceLayer,
  decorators: [ComponentDecorator],
  render: () => (
    <>
      <div style={{ padding: 48 }}>
        <div data-table-row style={{ padding: 8, width: 320 }}>
          <div data-agent-presence-target="field:field-id">Budget</div>
        </div>
      </div>
      <AgentPresenceLayer />
    </>
  ),
};

export default meta;
type Story = StoryObj<typeof AgentPresenceLayer>;

export const FieldCreated: Story = {
  play: async ({ canvasElement }) => {
    dispatchBrowserEvent(
      AGENT_PRESENCE_BROWSER_EVENT_NAME,
      FIELD_CREATED_EVENT,
    );

    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Added field Budget to Company'),
    ).toBeVisible();
  },
};
