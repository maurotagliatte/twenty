import { WIKI_REVIEW_INTERVAL_DAYS } from 'src/constants/wiki-options';

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const computeReviewDates = (today: Date) => {
  const nextReview = new Date(today);

  nextReview.setUTCDate(nextReview.getUTCDate() + WIKI_REVIEW_INTERVAL_DAYS);

  return {
    lastReviewedAt: toIsoDate(today),
    nextReviewAt: toIsoDate(nextReview),
  };
};
