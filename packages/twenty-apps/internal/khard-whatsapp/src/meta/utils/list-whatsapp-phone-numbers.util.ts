import { type WhatsappPhoneNumber } from 'src/meta/types/whatsapp-phone-number.type';
import { requestMetaGraph } from 'src/meta/utils/request-meta-graph.util';

export const WHATSAPP_PHONE_NUMBER_FIELDS =
  'id,display_phone_number,verified_name,platform_type';

export const listWhatsappPhoneNumbers = async ({
  whatsappBusinessAccountId,
  accessToken,
}: {
  whatsappBusinessAccountId: string;
  accessToken: string;
}): Promise<WhatsappPhoneNumber[]> => {
  const { data } = await requestMetaGraph<{ data?: WhatsappPhoneNumber[] }>({
    path: `/${whatsappBusinessAccountId}/phone_numbers`,
    accessToken,
    searchParams: { fields: WHATSAPP_PHONE_NUMBER_FIELDS },
  });

  return data ?? [];
};
