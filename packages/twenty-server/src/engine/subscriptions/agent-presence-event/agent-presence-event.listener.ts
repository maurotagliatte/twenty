import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatFieldMetadataByName } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadata-by-name.util';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import { AGENT_TOOL_EXECUTED_EVENT_NAME } from 'src/engine/subscriptions/agent-presence-event/constants/agent-tool-executed-event-name.constant';
import { type AgentPresenceEvent } from 'src/engine/subscriptions/agent-presence-event/types/agent-presence-event.type';
import { type AgentToolExecutedEvent } from 'src/engine/subscriptions/agent-presence-event/types/agent-tool-executed-event.type';
import { getAgentPresenceTargetFromToolCall } from 'src/engine/subscriptions/agent-presence-event/utils/get-agent-presence-target-from-tool-call.util';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentPresenceEventListener {
  private readonly logger = new Logger(AgentPresenceEventListener.name);

  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @OnEvent(AGENT_TOOL_EXECUTED_EVENT_NAME)
  async handleAgentToolExecuted(event: AgentToolExecutedEvent): Promise<void> {
    try {
      const target = getAgentPresenceTargetFromToolCall(event);

      if (!isDefined(target)) {
        return;
      }

      // Without a user to scope to (e.g. a workflow run), only schema changes are shared workspace-wide
      if (
        !isDefined(event.userWorkspaceId) &&
        target.kind !== 'object' &&
        target.kind !== 'field'
      ) {
        return;
      }

      const {
        featureFlagsMap,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatAgentMaps,
      } = await this.workspaceCacheService.getOrRecompute(event.workspaceId, [
        'featureFlagsMap',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatAgentMaps',
      ]);

      if (
        featureFlagsMap[FeatureFlagKey.IS_AGENT_UI_PRESENCE_ENABLED] !== true
      ) {
        return;
      }

      const fieldMetadata = isDefined(target.fieldMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: target.fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })
        : undefined;

      const objectMetadataId =
        target.objectMetadataId ??
        fieldMetadata?.objectMetadataId ??
        (isDefined(target.objectNameSingular)
          ? getObjectMetadataIdByName({
              flatObjectMetadataMaps,
              objectName: target.objectNameSingular,
            })
          : undefined);

      const objectMetadata = isDefined(objectMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: objectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      const resolvedFieldMetadata =
        fieldMetadata ??
        (isDefined(target.fieldName) && isDefined(objectMetadata)
          ? findFlatFieldMetadataByName({
              fieldName: target.fieldName,
              flatObjectMetadata: objectMetadata,
              flatFieldMetadataMaps,
            })
          : undefined);

      const agent = isDefined(event.agentId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: event.agentId,
            flatEntityMaps: flatAgentMaps,
          })
        : undefined;

      const agentPresenceEvent: AgentPresenceEvent = {
        id: v4(),
        agentId: event.agentId,
        agentName: agent?.label,
        toolName: event.toolName,
        action: target.action,
        targetKind: target.kind,
        objectMetadataId: objectMetadata?.id ?? objectMetadataId,
        objectNameSingular:
          objectMetadata?.nameSingular ?? target.objectNameSingular,
        objectLabel: objectMetadata?.labelSingular,
        fieldMetadataId: resolvedFieldMetadata?.id ?? target.fieldMetadataId,
        fieldLabel: resolvedFieldMetadata?.label,
        viewId: target.viewId,
        recordId: target.recordId,
        emittedAt: Date.now(),
      };

      await this.workspaceEventBroadcaster.broadcastAgentPresenceEvent({
        workspaceId: event.workspaceId,
        userWorkspaceId: event.userWorkspaceId,
        agentPresenceEvent,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to broadcast agent presence for tool ${event.toolName} in workspace ${event.workspaceId}`,
        error,
      );
    }
  }
}
