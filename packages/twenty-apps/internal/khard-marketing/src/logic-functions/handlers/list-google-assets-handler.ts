import { GOOGLE_PROVIDER_NAME } from 'src/constants/provider-names.constant';
import { fetchGoogleApi } from 'src/logic-functions/utils/fetch-google-api.util';
import { findDefaultConnection } from 'src/logic-functions/utils/find-default-connection.util';
import {
  settleAssetRequest,
  type AssetRequestResult,
} from 'src/logic-functions/utils/settle-asset-request.util';

type GoogleAsset = { id: string; name: string };

type HandlerResult =
  | {
      success: true;
      account: string;
      tagManagerAccounts: AssetRequestResult<GoogleAsset>;
      analyticsProperties: AssetRequestResult<GoogleAsset>;
      searchConsoleSites: AssetRequestResult<GoogleAsset>;
      youtubeChannels: AssetRequestResult<GoogleAsset>;
    }
  | { success: false; error: string };

type TagManagerAccountsResponse = {
  account?: { accountId: string; name: string }[];
};

type AnalyticsAccountSummariesResponse = {
  accountSummaries?: {
    displayName: string;
    propertySummaries?: { property: string; displayName: string }[];
  }[];
};

type SearchConsoleSitesResponse = {
  siteEntry?: { siteUrl: string; permissionLevel: string }[];
};

type YoutubeChannelsResponse = {
  items?: { id: string; snippet?: { title?: string } }[];
};

export const listGoogleAssetsHandler = async (): Promise<HandlerResult> => {
  const connection = await findDefaultConnection(GOOGLE_PROVIDER_NAME);

  if (!connection) {
    return {
      success: false,
      error:
        'Google is not connected. Open the Khard Marketing app settings and click "Add connection".',
    };
  }

  const { accessToken } = connection;

  const [
    tagManagerAccounts,
    analyticsProperties,
    searchConsoleSites,
    youtubeChannels,
  ] = await Promise.all([
    settleAssetRequest(async () => {
      const response = await fetchGoogleApi<TagManagerAccountsResponse>({
        url: 'https://tagmanager.googleapis.com/tagmanager/v2/accounts',
        accessToken,
      });

      return (response.account ?? []).map((account) => ({
        id: account.accountId,
        name: account.name,
      }));
    }),
    settleAssetRequest(async () => {
      const response = await fetchGoogleApi<AnalyticsAccountSummariesResponse>(
        {
          url: 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
          accessToken,
        },
      );

      return (response.accountSummaries ?? []).flatMap((accountSummary) =>
        (accountSummary.propertySummaries ?? []).map((propertySummary) => ({
          id: propertySummary.property,
          name: `${accountSummary.displayName} / ${propertySummary.displayName}`,
        })),
      );
    }),
    settleAssetRequest(async () => {
      const response = await fetchGoogleApi<SearchConsoleSitesResponse>({
        url: 'https://www.googleapis.com/webmasters/v3/sites',
        accessToken,
      });

      return (response.siteEntry ?? []).map((site) => ({
        id: site.siteUrl,
        name: `${site.siteUrl} (${site.permissionLevel})`,
      }));
    }),
    settleAssetRequest(async () => {
      const response = await fetchGoogleApi<YoutubeChannelsResponse>({
        url: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        accessToken,
      });

      return (response.items ?? []).map((channel) => ({
        id: channel.id,
        name: channel.snippet?.title ?? channel.id,
      }));
    }),
  ]);

  return {
    success: true,
    account: connection.label,
    tagManagerAccounts,
    analyticsProperties,
    searchConsoleSites,
    youtubeChannels,
  };
};
