import { type WhatsappPhoneNumber } from 'src/meta/types/whatsapp-phone-number.type';

export type SignupPhoneNumberCandidate = {
  whatsappBusinessAccountId: string;
  phoneNumber: WhatsappPhoneNumber;
  // Workspace id holding the routing claim, null when unclaimed
  claimedByWorkspaceId: string | null;
  isConnectedInThisWorkspace: boolean;
};

// The redirect flow does not say which number was picked in the dialog, so
// the one number nobody has connected yet is the one just signed up.
export const selectSignupPhoneNumber = (
  candidates: SignupPhoneNumberCandidate[],
): SignupPhoneNumberCandidate => {
  if (candidates.length === 0) {
    throw new Error(
      'Meta shared no WhatsApp number. Finish Embedded Signup by adding and verifying a phone number.',
    );
  }

  const unclaimed = candidates.filter(
    ({ claimedByWorkspaceId }) => claimedByWorkspaceId === null,
  );

  if (unclaimed.length === 1) {
    return unclaimed[0];
  }

  if (unclaimed.length > 1) {
    throw new Error(
      `Meta shared several WhatsApp numbers not yet connected (${unclaimed
        .map(({ phoneNumber }) => phoneNumber.display_phone_number)
        .join(
          ', ',
        )}). Connect again and share only the number this connection is for.`,
    );
  }

  const reconnectable = candidates.filter(
    ({ isConnectedInThisWorkspace }) => isConnectedInThisWorkspace,
  );

  if (reconnectable.length === 1) {
    return reconnectable[0];
  }

  throw new Error(
    'Every WhatsApp number Meta shared is already connected to another Twenty workspace. Disconnect it there first.',
  );
};
