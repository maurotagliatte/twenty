export const DAM_ASSET_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
  { value: 'IN_REVIEW', label: 'In review', position: 1, color: 'orange' },
  {
    value: 'CHANGES_REQUESTED',
    label: 'Changes requested',
    position: 2,
    color: 'red',
  },
  { value: 'APPROVED', label: 'Approved', position: 3, color: 'green' },
  { value: 'ARCHIVED', label: 'Archived', position: 4, color: 'bronze' },
] as const;

export const DAM_ASSET_KIND_OPTIONS = [
  { value: 'IMAGE', label: 'Image', position: 0, color: 'sky' },
  { value: 'VECTOR', label: 'Vector', position: 1, color: 'violet' },
  { value: 'VIDEO', label: 'Video', position: 2, color: 'red' },
  { value: 'AUDIO', label: 'Audio', position: 3, color: 'amber' },
  { value: 'DOCUMENT', label: 'Document', position: 4, color: 'blue' },
  {
    value: 'PRESENTATION',
    label: 'Presentation',
    position: 5,
    color: 'orange',
  },
  { value: 'FONT', label: 'Font', position: 6, color: 'gray' },
  { value: 'ARCHIVE', label: 'Archive', position: 7, color: 'brown' },
  { value: 'OTHER', label: 'Other', position: 8, color: 'gray' },
] as const;

export const DAM_ASSET_CATEGORY_OPTIONS = [
  { value: 'LOGO', label: 'Logo', position: 0, color: 'purple' },
  { value: 'ICON', label: 'Icon', position: 1, color: 'iris' },
  { value: 'PHOTOGRAPHY', label: 'Photography', position: 2, color: 'sky' },
  { value: 'ILLUSTRATION', label: 'Illustration', position: 3, color: 'pink' },
  { value: 'TYPEFACE', label: 'Typeface', position: 4, color: 'gray' },
  { value: 'TEMPLATE', label: 'Template', position: 5, color: 'turquoise' },
  { value: 'GUIDELINE', label: 'Guideline', position: 6, color: 'blue' },
  {
    value: 'CAMPAIGN',
    label: 'Campaign material',
    position: 7,
    color: 'orange',
  },
  { value: 'PRODUCT', label: 'Product', position: 8, color: 'green' },
  { value: 'OTHER', label: 'Other', position: 9, color: 'gray' },
] as const;

export const DAM_ASSET_TAG_OPTIONS = [
  { value: 'HERO', label: 'Hero', position: 0, color: 'amber' },
  { value: 'LIFESTYLE', label: 'Lifestyle', position: 1, color: 'pink' },
  { value: 'PEOPLE', label: 'People', position: 2, color: 'plum' },
  { value: 'PRODUCT_SHOT', label: 'Product shot', position: 3, color: 'green' },
  {
    value: 'BEHIND_THE_SCENES',
    label: 'Behind the scenes',
    position: 4,
    color: 'brown',
  },
  { value: 'EVENT', label: 'Event', position: 5, color: 'orange' },
  { value: 'SEASONAL', label: 'Seasonal', position: 6, color: 'lime' },
  { value: 'EVERGREEN', label: 'Evergreen', position: 7, color: 'jade' },
] as const;

export const DAM_ASSET_SOURCE_OPTIONS = [
  { value: 'IN_HOUSE', label: 'In-house', position: 0, color: 'blue' },
  { value: 'AGENCY', label: 'Agency', position: 1, color: 'purple' },
  { value: 'CLIENT', label: 'Client', position: 2, color: 'green' },
  { value: 'STOCK', label: 'Stock', position: 3, color: 'amber' },
  {
    value: 'USER_GENERATED',
    label: 'User generated',
    position: 4,
    color: 'pink',
  },
  { value: 'AI_GENERATED', label: 'AI generated', position: 5, color: 'cyan' },
  { value: 'OTHER', label: 'Other', position: 6, color: 'gray' },
] as const;

export const DAM_ASSET_LICENSE_OPTIONS = [
  { value: 'OWNED', label: 'Owned', position: 0, color: 'green' },
  { value: 'ROYALTY_FREE', label: 'Royalty free', position: 1, color: 'jade' },
  {
    value: 'RIGHTS_MANAGED',
    label: 'Rights managed',
    position: 2,
    color: 'orange',
  },
  {
    value: 'CREATIVE_COMMONS',
    label: 'Creative Commons',
    position: 3,
    color: 'sky',
  },
  {
    value: 'EDITORIAL_ONLY',
    label: 'Editorial only',
    position: 4,
    color: 'amber',
  },
  { value: 'UNKNOWN', label: 'Unknown', position: 5, color: 'red' },
] as const;

export const DAM_ASSET_USAGE_CHANNEL_OPTIONS = [
  { value: 'WEB', label: 'Web', position: 0, color: 'blue' },
  { value: 'SOCIAL', label: 'Social', position: 1, color: 'pink' },
  { value: 'EMAIL', label: 'Email', position: 2, color: 'sky' },
  { value: 'PAID_ADS', label: 'Paid ads', position: 3, color: 'orange' },
  { value: 'PRINT', label: 'Print', position: 4, color: 'brown' },
  { value: 'OUT_OF_HOME', label: 'Out of home', position: 5, color: 'amber' },
  { value: 'BROADCAST', label: 'Broadcast', position: 6, color: 'red' },
  { value: 'EVENTS', label: 'Events', position: 7, color: 'purple' },
  { value: 'INTERNAL', label: 'Internal only', position: 8, color: 'gray' },
] as const;
