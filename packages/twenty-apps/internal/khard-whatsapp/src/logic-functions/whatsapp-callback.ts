import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  kv,
  listConnections,
  type ConnectionCallbackPayload,
  type ConnectionCallbackResult,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_CALLBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';
import { getWhatsappPhoneNumberClaimKey } from 'src/logic-functions/utils/get-whatsapp-phone-number-claim-key.util';
import { selectSignupPhoneNumber } from 'src/logic-functions/utils/select-signup-phone-number.util';
import { saveWhatsappPhoneNumberAccount } from 'src/logic-functions/utils/whatsapp-phone-number-account.util';
import { exchangeEmbeddedSignupCode } from 'src/meta/utils/exchange-embedded-signup-code.util';
import { getRequiredServerVariable } from 'src/meta/utils/get-required-server-variable.util';
import { listGrantedWhatsappBusinessAccountIds } from 'src/meta/utils/list-granted-whatsapp-business-account-ids.util';
import { listWhatsappPhoneNumbers } from 'src/meta/utils/list-whatsapp-phone-numbers.util';

export const whatsappCallbackHandler = async ({
  queryStringParameters,
}: ConnectionCallbackPayload): Promise<ConnectionCallbackResult> => {
  const {
    code,
    error,
    error_description: errorDescription,
    waba_id: sessionWabaId,
    phone_number_id: sessionPhoneNumberId,
  } = queryStringParameters;

  if (isNonEmptyString(error)) {
    throw new Error(
      isNonEmptyString(errorDescription)
        ? `${error}: ${errorDescription}`
        : error,
    );
  }

  if (!isNonEmptyString(code)) {
    throw new Error('WhatsApp signup returned no authorization code');
  }

  const appId = getRequiredServerVariable('META_APP_ID');
  const appSecret = getRequiredServerVariable('META_APP_SECRET');

  const accessToken = await exchangeEmbeddedSignupCode({
    code,
    appId,
    appSecret,
  });

  const [grantedWhatsappBusinessAccountIds, connections] = await Promise.all([
    listGrantedWhatsappBusinessAccountIds({ accessToken, appId, appSecret }),
    listConnections({ providerName: WHATSAPP_PROVIDER_NAME }),
  ]);

  // Session info comes from the browser, so it only narrows down what the
  // token itself was granted.
  const whatsappBusinessAccountIds = isNonEmptyString(sessionWabaId)
    ? grantedWhatsappBusinessAccountIds.filter((id) => id === sessionWabaId)
    : grantedWhatsappBusinessAccountIds;

  const connectedPhoneNumberIds = new Set(
    connections.map(({ externalAccountId }) => externalAccountId),
  );

  const phoneNumbersByAccount = await Promise.all(
    whatsappBusinessAccountIds.map(async (whatsappBusinessAccountId) =>
      (
        await listWhatsappPhoneNumbers({
          whatsappBusinessAccountId,
          accessToken,
        })
      )
        .filter(
          ({ id }) =>
            !isNonEmptyString(sessionPhoneNumberId) ||
            id === sessionPhoneNumberId,
        )
        .map((phoneNumber) => ({ whatsappBusinessAccountId, phoneNumber })),
    ),
  );

  const candidates = await Promise.all(
    phoneNumbersByAccount.flat().map(async (candidate) => ({
      ...candidate,
      claimedByWorkspaceId: await kv.get<string>(
        getWhatsappPhoneNumberClaimKey(candidate.phoneNumber.id),
        { scope: 'SERVER' },
      ),
      isConnectedInThisWorkspace: connectedPhoneNumberIds.has(
        candidate.phoneNumber.id,
      ),
    })),
  );

  const { whatsappBusinessAccountId, phoneNumber } =
    selectSignupPhoneNumber(candidates);

  await saveWhatsappPhoneNumberAccount(phoneNumber.id, {
    whatsappBusinessAccountId,
  });

  return {
    externalAccountId: phoneNumber.id,
    handle: isNonEmptyString(phoneNumber.verified_name)
      ? `${phoneNumber.verified_name} (${phoneNumber.display_phone_number})`
      : phoneNumber.display_phone_number,
    accessToken,
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_CALLBACK_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-callback',
  description:
    'Trades the Embedded Signup code for the customer business token and identifies the WhatsApp number it connected.',
  timeoutSeconds: 10,
  handler: whatsappCallbackHandler,
});
