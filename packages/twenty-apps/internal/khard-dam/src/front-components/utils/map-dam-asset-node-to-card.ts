import { isNonEmptyString } from '@sniptt/guards';

import {
  DAM_ASSET_CATEGORY_OPTIONS,
  DAM_ASSET_KIND_OPTIONS,
  DAM_ASSET_STATUS_OPTIONS,
} from 'src/constants/dam-asset-options';
import {
  type DamAssetCard,
  type DamAssetNode,
} from 'src/front-components/types/dam-asset.types';
import { getFilePreview } from 'src/front-components/utils/get-file-preview';

type SelectOption = { value: string; label: string; color: string };

const findOption = (
  options: readonly SelectOption[],
  value: string | null | undefined,
) =>
  isNonEmptyString(value)
    ? options.find((option) => option.value === value)
    : undefined;

// Options added by a workspace admin are unknown here, so fall back to the raw value.
const getOptionLabel = (
  options: readonly SelectOption[],
  value: string | null | undefined,
) =>
  findOption(options, value)?.label ?? (isNonEmptyString(value) ? value : null);

export const mapDamAssetNodeToCard = (node: DamAssetNode): DamAssetCard => ({
  id: node.id,
  name: node.name?.trim() || 'Untitled',
  statusLabel: getOptionLabel(DAM_ASSET_STATUS_OPTIONS, node.status),
  statusColor:
    findOption(DAM_ASSET_STATUS_OPTIONS, node.status)?.color ??
    (isNonEmptyString(node.status) ? 'gray' : null),
  kindLabel: getOptionLabel(DAM_ASSET_KIND_OPTIONS, node.kind),
  categoryLabel: getOptionLabel(DAM_ASSET_CATEGORY_OPTIONS, node.category),
  brandName: isNonEmptyString(node.brand?.name) ? node.brand.name : null,
  fileCount: node.files?.length ?? 0,
  preview: getFilePreview(node.files),
});
