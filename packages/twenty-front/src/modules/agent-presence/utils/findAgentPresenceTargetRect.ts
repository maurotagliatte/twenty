import { isDefined } from 'twenty-shared/utils';

import { AGENT_PRESENCE_TARGET_DATA_ATTRIBUTE } from '@/agent-presence/constants/AgentPresenceTargetDataAttribute';
import { type AgentPresenceTargetKey } from '@/agent-presence/utils/getAgentPresenceTargetKeys';

export type AgentPresenceTargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  isFallback: boolean;
};

const getMeasurableElement = (element: Element): Element => {
  const tableRow = element.closest('[data-table-row]');

  if (isDefined(tableRow)) {
    return tableRow;
  }

  // Wrappers rendered with display: contents have no box of their own
  return getComputedStyle(element).display === 'contents' &&
    isDefined(element.firstElementChild)
    ? element.firstElementChild
    : element;
};

const isRectInViewport = (rect: DOMRect) =>
  rect.width > 0 &&
  rect.height > 0 &&
  rect.bottom > 0 &&
  rect.right > 0 &&
  rect.top < window.innerHeight &&
  rect.left < window.innerWidth;

export const findAgentPresenceTargetRect = (
  targetKeys: AgentPresenceTargetKey[],
): AgentPresenceTargetRect | null => {
  for (const { key, isFallback } of targetKeys) {
    const elements = document.querySelectorAll(
      `[${AGENT_PRESENCE_TARGET_DATA_ATTRIBUTE}="${key.replace(/["\\]/g, '\\$&')}"]`,
    );

    for (const element of elements) {
      const rect = getMeasurableElement(element).getBoundingClientRect();

      if (isRectInViewport(rect)) {
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          isFallback,
        };
      }
    }
  }

  return null;
};
