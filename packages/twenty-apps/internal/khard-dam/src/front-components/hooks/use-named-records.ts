import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type NamedRecord } from 'src/front-components/types/dam-asset.types';
import {
  type DamQueryClient,
  fetchNamedRecords,
} from 'src/front-components/utils/fetch-dam-records';
import { getErrorMessage } from 'src/front-components/utils/get-error-message';

export const useNamedRecords = (
  objectNamePlural: 'damBrands' | 'damCollections',
) => {
  const [records, setRecords] = useState<NamedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    fetchNamedRecords({
      client: new CoreApiClient() as DamQueryClient,
      objectNamePlural,
    })
      .then((nextRecords) => {
        if (!isCancelled) {
          setRecords(nextRecords);
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
  }, [objectNamePlural]);

  return { records, isLoading, errorMessage };
};
