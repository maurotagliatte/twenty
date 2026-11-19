import { requestMetaGraph } from 'src/meta/utils/request-meta-graph.util';

type DebugTokenResponse = {
  data?: {
    app_id?: string;
    is_valid?: boolean;
    granular_scopes?: { scope: string; target_ids?: string[] }[];
  };
};

// The token itself says which WABAs the customer shared, so the account is
// never taken from browser parameters. A token minted for another app is refused.
export const listGrantedWhatsappBusinessAccountIds = async ({
  accessToken,
  appId,
  appSecret,
}: {
  accessToken: string;
  appId: string;
  appSecret: string;
}): Promise<string[]> => {
  const { data } = await requestMetaGraph<DebugTokenResponse>({
    path: '/debug_token',
    accessToken: `${appId}|${appSecret}`,
    searchParams: { input_token: accessToken },
  });

  if (data?.is_valid !== true || data.app_id !== appId) {
    throw new Error('Meta did not confirm the signup token for this app');
  }

  const wabaIds = (data.granular_scopes ?? [])
    .filter(({ scope }) => scope === 'whatsapp_business_management')
    .flatMap(({ target_ids }) => target_ids ?? []);

  return [...new Set(wabaIds)];
};
