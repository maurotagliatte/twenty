import { useRef } from 'react';
import { useUserId } from 'twenty-sdk/front-component';

import { findWorkspaceMemberIdByUserId } from 'src/front-components/shared/wiki-api';

export const useResolveWorkspaceMemberId = () => {
  const userId = useUserId();
  const workspaceMemberIdRef = useRef<string | null | undefined>(undefined);

  return async () => {
    if (workspaceMemberIdRef.current !== undefined || userId === null) {
      return workspaceMemberIdRef.current ?? null;
    }

    try {
      workspaceMemberIdRef.current =
        await findWorkspaceMemberIdByUserId(userId);
    } catch {
      workspaceMemberIdRef.current = null;
    }

    return workspaceMemberIdRef.current;
  };
};
