import { describe, expect, it } from 'vitest';

import { formatRelativeDate } from 'src/front-components/shared/format-relative-date';

const NOW = new Date('2026-11-04T12:00:00.000Z');

describe('formatRelativeDate', () => {
  it.each([
    ['2026-11-04T11:59:40.000Z', 'this minute'],
    ['2026-11-04T09:00:00.000Z', '3 hours ago'],
    ['2026-11-03T12:00:00.000Z', 'yesterday'],
    ['2027-02-04T12:00:00.000Z', 'in 3 months'],
  ])('formats %s as %s', (isoDate, expected) => {
    expect(formatRelativeDate(isoDate, NOW)).toBe(expected);
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatRelativeDate('not a date', NOW)).toBe('');
  });
});
