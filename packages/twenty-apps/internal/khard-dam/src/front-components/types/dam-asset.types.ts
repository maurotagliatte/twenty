export type FilePreviewKind =
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'PDF'
  | 'DOCUMENT'
  | 'PRESENTATION'
  | 'FONT'
  | 'ARCHIVE'
  | 'OTHER';

export type DamFileValue = {
  fileId?: string | null;
  label?: string | null;
  extension?: string | null;
  url?: string | null;
};

export type DamAssetNode = {
  id: string;
  name?: string | null;
  status?: string | null;
  kind?: string | null;
  category?: string | null;
  updatedAt?: string | null;
  files?: DamFileValue[] | null;
  brand?: { id: string; name?: string | null } | null;
};

export type DamFilePreview = {
  kind: FilePreviewKind;
  url: string | null;
  label: string | null;
  extension: string | null;
};

export type DamAssetCard = {
  id: string;
  name: string;
  statusLabel: string | null;
  statusColor: string | null;
  kindLabel: string | null;
  categoryLabel: string | null;
  brandName: string | null;
  fileCount: number;
  preview: DamFilePreview;
};

export type DamAssetSortDirection = 'DESC' | 'ASC';

export type DamAssetFilters = {
  brandId: string | null;
  status: string | null;
  category: string | null;
  kind: string | null;
  tag: string | null;
  searchText: string;
  sortDirection: DamAssetSortDirection;
};

export type RecordPage<TItem> = {
  items: TItem[];
  endCursor: string | null;
  hasNextPage: boolean;
};

export type NamedRecord = {
  id: string;
  name: string;
};
