import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  type DamBrandKit,
  type DamQueryClient,
  fetchDamBrandKit,
} from 'src/front-components/utils/fetch-dam-records';
import { getErrorMessage } from 'src/front-components/utils/get-error-message';

type BrandKitState = {
  brandKit: DamBrandKit | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export const useBrandKit = (brandId: string | null) => {
  const [state, setState] = useState<BrandKitState>({
    brandKit: null,
    isLoading: brandId !== null,
    errorMessage: null,
  });

  useEffect(() => {
    if (brandId === null) {
      setState({ brandKit: null, isLoading: false, errorMessage: null });

      return;
    }

    let isCancelled = false;

    setState({ brandKit: null, isLoading: true, errorMessage: null });

    fetchDamBrandKit({
      client: new CoreApiClient() as DamQueryClient,
      brandId,
    })
      .then((brandKit) => {
        if (!isCancelled) {
          setState({ brandKit, isLoading: false, errorMessage: null });
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setState({
            brandKit: null,
            isLoading: false,
            errorMessage: getErrorMessage(error),
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [brandId]);

  return state;
};
