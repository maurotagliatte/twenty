import { type Awareness } from 'y-protocols/awareness';

// Feeds remote peers into the local awareness; returns a disconnect function.
// Swapping SSE for a Yjs network provider only means swapping this.
export type AgentPresenceTransport = {
  connect: (awareness: Awareness) => () => void;
};
