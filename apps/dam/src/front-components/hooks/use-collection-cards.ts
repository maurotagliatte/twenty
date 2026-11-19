import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type DamCollectionCard } from 'src/front-components/types/dam-asset.types';
import {
  type DamQueryClient,
  fetchDamCollectionCards,
} from 'src/front-components/utils/fetch-dam-records';
import { getErrorMessage } from 'src/front-components/utils/get-error-message';

export const useCollectionCards = (isEnabled: boolean) => {
  const [collections, setCollections] = useState<DamCollectionCard[]>([]);
  const [isLoading, setIsLoading] = useState(isEnabled);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let isCancelled = false;

    fetchDamCollectionCards({ client: new CoreApiClient() as DamQueryClient })
      .then((cards) => {
        if (!isCancelled) {
          setCollections(cards);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isEnabled]);

  return { collections, isLoading, errorMessage };
};
