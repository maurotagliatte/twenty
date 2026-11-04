const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

// Yjs client ids are uint32; hashing keeps one stable peer per agent across events
export const getAgentPresenceClientId = (actorId: string): number => {
  let hash = FNV_OFFSET_BASIS;

  for (let index = 0; index < actorId.length; index++) {
    hash ^= actorId.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0 || 1;
};
