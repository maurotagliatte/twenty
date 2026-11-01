import { META_PROVIDER_NAME } from 'src/constants/provider-names.constant';
import { fetchMetaGraph } from 'src/logic-functions/utils/fetch-meta-graph.util';
import { findDefaultConnection } from 'src/logic-functions/utils/find-default-connection.util';
import {
  settleAssetRequest,
  type AssetRequestResult,
} from 'src/logic-functions/utils/settle-asset-request.util';

type MetaAsset = { id: string; name: string };

type HandlerResult =
  | {
      success: true;
      account: string;
      facebookPages: AssetRequestResult<MetaAsset>;
      instagramAccounts: AssetRequestResult<MetaAsset>;
      whatsappBusinessAccounts: AssetRequestResult<MetaAsset>;
    }
  | { success: false; error: string };

type MetaPagesResponse = {
  data: {
    id: string;
    name: string;
    instagram_business_account?: { id: string; username?: string };
  }[];
};

type MetaBusinessesResponse = {
  data: {
    id: string;
    name: string;
    owned_whatsapp_business_accounts?: {
      data: { id: string; name: string }[];
    };
  }[];
};

export const listMetaAssetsHandler = async (): Promise<HandlerResult> => {
  const connection = await findDefaultConnection(META_PROVIDER_NAME);

  if (!connection) {
    return {
      success: false,
      error:
        'Meta is not connected. Open the Khard Marketing app settings and click "Add connection".',
    };
  }

  const { accessToken } = connection;

  const pagesRequest = fetchMetaGraph<MetaPagesResponse>('/me/accounts', {
    fields: 'id,name,instagram_business_account{id,username}',
    access_token: accessToken,
  });

  const [facebookPages, instagramAccounts, whatsappBusinessAccounts] =
    await Promise.all([
      settleAssetRequest(async () =>
        (await pagesRequest).data.map((page) => ({
          id: page.id,
          name: page.name,
        })),
      ),
      settleAssetRequest(async () =>
        (await pagesRequest).data.flatMap(
          ({ instagram_business_account: instagramAccount }) =>
            instagramAccount === undefined
              ? []
              : [
                  {
                    id: instagramAccount.id,
                    name: instagramAccount.username ?? instagramAccount.id,
                  },
                ],
        ),
      ),
      settleAssetRequest(async () => {
        const response = await fetchMetaGraph<MetaBusinessesResponse>(
          '/me/businesses',
          {
            fields: 'id,name,owned_whatsapp_business_accounts{id,name}',
            access_token: accessToken,
          },
        );

        return response.data.flatMap((business) =>
          (business.owned_whatsapp_business_accounts?.data ?? []).map(
            (whatsappAccount) => ({
              id: whatsappAccount.id,
              name: `${business.name} / ${whatsappAccount.name}`,
            }),
          ),
        );
      }),
    ]);

  return {
    success: true,
    account: connection.label,
    facebookPages,
    instagramAccounts,
    whatsappBusinessAccounts,
  };
};
