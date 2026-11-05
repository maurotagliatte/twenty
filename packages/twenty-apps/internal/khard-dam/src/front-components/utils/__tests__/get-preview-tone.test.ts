import { describe, expect, it } from 'vitest';

import { getAssetPreviewTone } from 'src/front-components/utils/get-preview-tone';

const asset = (
  overrides: Partial<Parameters<typeof getAssetPreviewTone>[0]>,
) => ({
  kind: 'IMAGE',
  category: null,
  preview: { kind: 'IMAGE' as const, extension: 'jpg' },
  ...overrides,
});

describe('getAssetPreviewTone', () => {
  it('keeps photos neutral', () => {
    expect(getAssetPreviewTone(asset({}))).toBe('gray');
  });

  it.each([
    asset({ category: 'LOGO' }),
    asset({ kind: 'VECTOR' }),
    asset({ preview: { kind: 'IMAGE', extension: 'svg' } }),
  ])('frames graphics apart from photos', (graphic) => {
    expect(getAssetPreviewTone(graphic)).toBe('violet');
  });

  it('colors documents by file type', () => {
    expect(
      getAssetPreviewTone(
        asset({ preview: { kind: 'PDF', extension: 'pdf' } }),
      ),
    ).toBe('blue');
  });

  it('falls back to the declared kind when no file is attached', () => {
    expect(
      getAssetPreviewTone(
        asset({ kind: 'VIDEO', preview: { kind: 'OTHER', extension: null } }),
      ),
    ).toBe('tomato');
  });
});
