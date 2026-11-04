import { type WhatsappPhoneNumber } from 'src/meta/types/whatsapp-phone-number.type';
import { WHATSAPP_PHONE_NUMBER_FIELDS } from 'src/meta/utils/list-whatsapp-phone-numbers.util';
import { requestMetaGraph } from 'src/meta/utils/request-meta-graph.util';

export const getWhatsappPhoneNumber = ({
  phoneNumberId,
  accessToken,
}: {
  phoneNumberId: string;
  accessToken: string;
}): Promise<WhatsappPhoneNumber> =>
  requestMetaGraph<WhatsappPhoneNumber>({
    path: `/${phoneNumberId}`,
    accessToken,
    searchParams: { fields: WHATSAPP_PHONE_NUMBER_FIELDS },
  });
