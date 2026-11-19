export type ViewColumn = {
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  size: number;
};

export const buildViewFields = (columns: ViewColumn[]) =>
  columns.map((column, position) => ({
    ...column,
    position,
    isVisible: true,
  }));
