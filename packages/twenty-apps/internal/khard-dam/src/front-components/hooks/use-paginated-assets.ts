import { useCallback, useEffect, useRef, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  type DamAssetCard,
  type RecordPage,
} from 'src/front-components/types/dam-asset.types';
import { type DamQueryClient } from 'src/front-components/utils/fetch-dam-records';
import { getErrorMessage } from 'src/front-components/utils/get-error-message';
import { isPermissionDeniedError } from 'src/front-components/utils/is-permission-denied-error';

export type FetchAssetPage = (options: {
  client: DamQueryClient;
  after: string | null;
  includeBrand: boolean;
}) => Promise<RecordPage<DamAssetCard>>;

type PaginatedAssetsState = {
  assets: DamAssetCard[];
  endCursor: string | null;
  hasNextPage: boolean;
  isLoading: boolean;
  errorMessage: string | null;
};

const INITIAL_STATE: PaginatedAssetsState = {
  assets: [],
  endCursor: null,
  hasNextPage: false,
  isLoading: true,
  errorMessage: null,
};

// `queryKey` must change whenever `fetchPage` would return different records.
export const usePaginatedAssets = (
  fetchPage: FetchAssetPage | null,
  queryKey: string,
) => {
  const [state, setState] = useState<PaginatedAssetsState>(INITIAL_STATE);
  const requestIdRef = useRef(0);
  // Brand names are dropped, not the whole grid, for viewers who cannot read brands.
  const includeBrandRef = useRef(true);
  const fetchPageRef = useRef(fetchPage);

  fetchPageRef.current = fetchPage;

  const loadPage = useCallback(async (after: string | null) => {
    const currentFetchPage = fetchPageRef.current;

    if (currentFetchPage === null) {
      setState({ ...INITIAL_STATE, isLoading: false });

      return;
    }

    const requestId = ++requestIdRef.current;
    const client = new CoreApiClient() as DamQueryClient;

    setState((previous) => ({
      ...(after === null ? INITIAL_STATE : previous),
      isLoading: true,
      errorMessage: null,
    }));

    const run = (includeBrand: boolean) =>
      currentFetchPage({ client, after, includeBrand });

    try {
      let page: RecordPage<DamAssetCard>;

      try {
        page = await run(includeBrandRef.current);
      } catch (error) {
        if (!includeBrandRef.current || !isPermissionDeniedError(error)) {
          throw error;
        }
        includeBrandRef.current = false;
        page = await run(false);
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setState((previous) => ({
        assets:
          after === null ? page.items : [...previous.assets, ...page.items],
        endCursor: page.endCursor,
        hasNextPage: page.hasNextPage,
        isLoading: false,
        errorMessage: null,
      }));
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState((previous) => ({
        ...previous,
        isLoading: false,
        errorMessage: getErrorMessage(error),
      }));
    }
  }, []);

  useEffect(() => {
    void loadPage(null);
  }, [loadPage, queryKey]);

  const loadMore = () => {
    if (state.isLoading || !state.hasNextPage) {
      return;
    }
    void loadPage(state.endCursor);
  };

  const reload = () => {
    void loadPage(null);
  };

  return { ...state, loadMore, reload };
};
