import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconLego } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AGENT_PRESENCE_TARGET_LOOKUP_INTERVAL_IN_MS } from '@/agent-presence/constants/AgentPresenceTargetLookupIntervalInMs';
import { AGENT_PRESENCE_TARGET_LOOKUP_TIMEOUT_IN_MS } from '@/agent-presence/constants/AgentPresenceTargetLookupTimeoutInMs';
import { type AgentPresenceAwarenessState } from '@/agent-presence/types/AgentPresenceAwarenessState';
import {
  type AgentPresenceTargetRect,
  findAgentPresenceTargetRect,
} from '@/agent-presence/utils/findAgentPresenceTargetRect';
import { getAgentPresenceActivityLabel } from '@/agent-presence/utils/getAgentPresenceActivityLabel';
import { getAgentPresenceTargetKeys } from '@/agent-presence/utils/getAgentPresenceTargetKeys';

const StyledPointer = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledCursor = styled.svg`
  color: var(--agent-presence-color);
  display: block;
  filter: drop-shadow(0 1px 1px ${themeCssVariables.font.color.tertiary});
`;

const StyledLabel = styled.div`
  background: var(--agent-presence-color);
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-left: ${themeCssVariables.spacing[3]};
  max-width: 240px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledLabelName = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledHighlight = styled.div`
  border: 2px solid var(--agent-presence-color);
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  position: absolute;

  &[data-pulse='true'] {
    animation: agent-presence-pulse 1.2s ease-out 3;
  }

  @keyframes agent-presence-pulse {
    0% {
      box-shadow: 0 0 0 0 var(--agent-presence-color);
    }
    100% {
      box-shadow: 0 0 0 8px transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-pulse='true'] {
      animation: none;
    }
  }
`;

const StyledNotice = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid var(--agent-presence-color);
  border-radius: ${themeCssVariables.border.radius.md};
  bottom: ${themeCssVariables.spacing[4]};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  left: ${themeCssVariables.spacing[4]};
  max-width: 320px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  position: absolute;
`;

type AgentPresencePointerProps = {
  state: AgentPresenceAwarenessState;
};

type TargetLookup = {
  activityId: string;
  rect: AgentPresenceTargetRect | null;
};

const getInitialPointerPosition = () => ({
  left: window.innerWidth - 120,
  top: window.innerHeight - 120,
});

export const AgentPresencePointer = ({ state }: AgentPresencePointerProps) => {
  const { t } = useLingui();
  const { actor, activity } = state;

  const [pointerPosition, setPointerPosition] = useState(
    getInitialPointerPosition,
  );
  const [targetLookup, setTargetLookup] = useState<TargetLookup | null>(null);

  const targetKeys = useMemo(
    () => getAgentPresenceTargetKeys(activity.target),
    [activity.target],
  );

  // The target can render after the event (metadata refetch), so the DOM is polled briefly
  useEffect(() => {
    const startedAt = Date.now();

    const lookUpTarget = () => {
      const rect = findAgentPresenceTargetRect(targetKeys);

      if (isDefined(rect)) {
        setPointerPosition({
          left: rect.left + Math.min(24, rect.width / 2),
          top: rect.top + rect.height / 2,
        });
        setTargetLookup({ activityId: activity.id, rect });

        return true;
      }

      if (
        Date.now() - startedAt >=
        AGENT_PRESENCE_TARGET_LOOKUP_TIMEOUT_IN_MS
      ) {
        setTargetLookup({ activityId: activity.id, rect: null });

        return true;
      }

      return false;
    };

    if (lookUpTarget()) {
      return;
    }

    const lookupInterval = setInterval(() => {
      if (lookUpTarget()) {
        clearInterval(lookupInterval);
      }
    }, AGENT_PRESENCE_TARGET_LOOKUP_INTERVAL_IN_MS);

    return () => clearInterval(lookupInterval);
  }, [activity.id, targetKeys]);

  const currentLookup =
    targetLookup?.activityId === activity.id ? targetLookup : null;
  const targetRect = currentLookup?.rect ?? null;
  const isTargetMissing = isDefined(currentLookup) && !isDefined(targetRect);
  const shouldShowNotice = isTargetMissing || targetRect?.isFallback === true;

  const agentName = actor.name ?? t`AI agent`;
  const activityLabel = getAgentPresenceActivityLabel(activity);

  return (
    <div
      style={
        {
          '--agent-presence-color': themeCssVariables.color[actor.color],
        } as React.CSSProperties
      }
    >
      {isDefined(targetRect) && (
        <StyledHighlight
          data-pulse={targetRect.isFallback || undefined}
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}
      {!isTargetMissing && (
        <StyledPointer
          data-testid="agent-presence-pointer"
          style={{
            transform: `translate(${pointerPosition.left}px, ${pointerPosition.top}px)`,
          }}
        >
          <StyledCursor width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path
              d="M1 1L7.5 17L9.8 10L17 7.6L1 1Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </StyledCursor>
          <StyledLabel>
            <StyledLabelName>
              <IconLego size={12} />
              {agentName}
            </StyledLabelName>
            {activityLabel}
          </StyledLabel>
        </StyledPointer>
      )}
      {shouldShowNotice && (
        <StyledNotice role="status">
          <StyledLabelName>
            <IconLego size={14} />
            {agentName}
          </StyledLabelName>
          {activityLabel}
        </StyledNotice>
      )}
    </div>
  );
};
