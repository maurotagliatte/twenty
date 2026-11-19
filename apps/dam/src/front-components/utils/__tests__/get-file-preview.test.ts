import { describe, expect, it } from 'vitest';

import {
  getFileExtension,
  getFilePreview,
  getFilePreviewKind,
} from 'src/front-components/utils/get-file-preview';

describe('getFileExtension', () => {
  it('normalizes a dotted, upper-case extension', () => {
    expect(getFileExtension({ extension: '.PNG' })).toBe('png');
  });

  it('falls back to the label when the extension is missing', () => {
    expect(getFileExtension({ label: 'brand-guide.v2.pdf' })).toBe('pdf');
  });

  it('returns null when neither gives an extension', () => {
    expect(getFileExtension({ label: 'README' })).toBeNull();
    expect(getFileExtension({ label: '.env' })).toBeNull();
  });
});

describe('getFilePreviewKind', () => {
  it.each([
    ['jpg', 'IMAGE'],
    ['svg', 'IMAGE'],
    ['mp4', 'VIDEO'],
    ['pdf', 'PDF'],
    ['pptx', 'PRESENTATION'],
    ['woff2', 'FONT'],
    ['zip', 'ARCHIVE'],
    ['psd', 'OTHER'],
  ] as const)('maps %s to %s', (extension, kind) => {
    expect(getFilePreviewKind(extension)).toBe(kind);
  });
});

describe('getFilePreview', () => {
  it('previews the first file only', () => {
    expect(
      getFilePreview([
        {
          fileId: 'file-1',
          label: 'hero.webp',
          extension: '.webp',
          url: 'https://example.test/file/files-field/file-1?token=a',
        },
        { fileId: 'file-2', label: 'hero.pdf', extension: '.pdf', url: 'x' },
      ]),
    ).toEqual({
      kind: 'IMAGE',
      url: 'https://example.test/file/files-field/file-1?token=a',
      label: 'hero.webp',
      extension: 'webp',
    });
  });

  it('has no url when the asset has no files', () => {
    expect(getFilePreview([])).toEqual({
      kind: 'OTHER',
      url: null,
      label: null,
      extension: null,
    });
    expect(getFilePreview(null).url).toBeNull();
  });
});
