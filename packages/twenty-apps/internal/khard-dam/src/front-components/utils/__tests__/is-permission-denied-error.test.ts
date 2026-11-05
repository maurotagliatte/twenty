import { describe, expect, it } from 'vitest';

import { isPermissionDeniedError } from 'src/front-components/utils/is-permission-denied-error';

describe('isPermissionDeniedError', () => {
  it('detects a FORBIDDEN GraphQL error', () => {
    expect(
      isPermissionDeniedError({
        errors: [{ message: 'denied', extensions: { code: 'FORBIDDEN' } }],
      }),
    ).toBe(true);
  });

  it('ignores other failures', () => {
    expect(isPermissionDeniedError(new Error('Network down'))).toBe(false);
    expect(
      isPermissionDeniedError({ errors: [{ extensions: { code: 'X' } }] }),
    ).toBe(false);
  });
});
