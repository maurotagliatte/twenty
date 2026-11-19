import { describe, expect, it } from 'vitest';

import {
  selectSignupPhoneNumber,
  type SignupPhoneNumberCandidate,
} from 'src/logic-functions/utils/select-signup-phone-number.util';

const candidate = (
  id: string,
  overrides: Partial<SignupPhoneNumberCandidate> = {},
): SignupPhoneNumberCandidate => ({
  whatsappBusinessAccountId: 'waba-1',
  phoneNumber: { id, display_phone_number: `+55 11 9000-000${id.slice(-1)}` },
  claimedByWorkspaceId: null,
  isConnectedInThisWorkspace: false,
  ...overrides,
});

describe('selectSignupPhoneNumber', () => {
  it('picks the only number nobody has connected yet', () => {
    expect(
      selectSignupPhoneNumber([
        candidate('phone-1', { claimedByWorkspaceId: 'workspace-b' }),
        candidate('phone-2'),
      ]).phoneNumber.id,
    ).toBe('phone-2');
  });

  it('reconnects the number this workspace already holds', () => {
    expect(
      selectSignupPhoneNumber([
        candidate('phone-1', {
          claimedByWorkspaceId: 'workspace-a',
          isConnectedInThisWorkspace: true,
        }),
      ]).phoneNumber.id,
    ).toBe('phone-1');
  });

  it('never hands over a number another workspace holds', () => {
    expect(() =>
      selectSignupPhoneNumber([
        candidate('phone-1', { claimedByWorkspaceId: 'workspace-b' }),
      ]),
    ).toThrow('already connected to another Twenty workspace');
  });

  it('refuses to guess between several new numbers or with none', () => {
    expect(() =>
      selectSignupPhoneNumber([candidate('phone-1'), candidate('phone-2')]),
    ).toThrow('several WhatsApp numbers');
    expect(() => selectSignupPhoneNumber([])).toThrow(
      'Meta shared no WhatsApp number',
    );
  });
});
