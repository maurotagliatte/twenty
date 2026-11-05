// SERVER-scoped: its value is the workspace that connected the number, and
// only that workspace can overwrite or release it.
export const getWhatsappPhoneNumberClaimKey = (phoneNumberId: string): string =>
  `whatsapp-phone-number-claim:${phoneNumberId}`;
