export type AssetRequestResult<TAsset> =
  | { success: true; items: TAsset[] }
  | { success: false; error: string };

// One API being disabled or denied must not hide the assets of the others.
export const settleAssetRequest = async <TAsset>(
  request: () => Promise<TAsset[]>,
): Promise<AssetRequestResult<TAsset>> => {
  try {
    return { success: true, items: await request() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
