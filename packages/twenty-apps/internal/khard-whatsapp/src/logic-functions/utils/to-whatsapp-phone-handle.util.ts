// Twenty stores phone handles as + and digits, the form Person.phones is matched on.
export const toWhatsappPhoneHandle = (phoneNumber: string): string =>
  `+${phoneNumber.replace(/\D/g, '')}`;
