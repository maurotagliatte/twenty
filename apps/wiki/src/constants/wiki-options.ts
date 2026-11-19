export const WIKI_PAGE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
  { value: 'PUBLISHED', label: 'Published', position: 1, color: 'green' },
  { value: 'ARCHIVED', label: 'Archived', position: 2, color: 'bronze' },
] as const;

export type WikiPageStatus = (typeof WIKI_PAGE_STATUS_OPTIONS)[number]['value'];

export const WIKI_SPACE_VISIBILITY_OPTIONS = [
  { value: 'WORKSPACE', label: 'Whole workspace', position: 0, color: 'green' },
  { value: 'TEAM', label: 'Team', position: 1, color: 'blue' },
  { value: 'PRIVATE', label: 'Private', position: 2, color: 'gray' },
] as const;

export const WIKI_REVIEW_INTERVAL_DAYS = 90;
