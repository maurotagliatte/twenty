import { kv } from 'twenty-sdk/logic-function';

type WhatsappPhoneNumberAccount = { whatsappBusinessAccountId: string };

const getKey = (phoneNumberId: string): string =>
  `whatsapp-phone-number-account:${phoneNumberId}`;

// WORKSPACE-scoped: which WABA a connected number belongs to, learnt at signup.
export const saveWhatsappPhoneNumberAccount = (
  phoneNumberId: string,
  account: WhatsappPhoneNumberAccount,
): Promise<void> => kv.set(getKey(phoneNumberId), account);

export const getWhatsappPhoneNumberAccount = (
  phoneNumberId: string,
): Promise<WhatsappPhoneNumberAccount | null> =>
  kv.get<WhatsappPhoneNumberAccount>(getKey(phoneNumberId));

export const deleteWhatsappPhoneNumberAccount = (
  phoneNumberId: string,
): Promise<boolean> => kv.delete(getKey(phoneNumberId));
