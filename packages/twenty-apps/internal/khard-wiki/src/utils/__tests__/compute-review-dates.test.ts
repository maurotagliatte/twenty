import { describe, expect, it } from 'vitest';

import { computeReviewDates } from 'src/utils/compute-review-dates';

describe('computeReviewDates', () => {
  it('schedules the next review 90 days after today', () => {
    expect(computeReviewDates(new Date('2026-11-04T15:00:00Z'))).toEqual({
      lastReviewedAt: '2026-11-04',
      nextReviewAt: '2027-02-02',
    });
  });
});
