import { describe, expect, it } from 'vitest';

import {
  parseBrandColor,
  parseBrandColors,
  parseBrandFonts,
} from 'src/front-components/utils/parse-brand-kit';

describe('parseBrandColor', () => {
  it.each([
    ['#1a2b3c', { hex: '#1A2B3C', label: '#1A2B3C' }],
    ['Primary #1A2B3C', { hex: '#1A2B3C', label: 'Primary' }],
    ['#FF0000 - Signal red', { hex: '#FF0000', label: 'Signal red' }],
    ['Ink: #000', { hex: '#000', label: 'Ink' }],
    ['Sky (#87CEEB)', { hex: '#87CEEB', label: 'Sky' }],
    ['Pantone 286 C', { hex: null, label: 'Pantone 286 C' }],
  ])('parses %s', (value, expected) => {
    expect(parseBrandColor(value)).toEqual(expected);
  });

  it('never returns a non-hex value as a color', () => {
    expect(parseBrandColor('red; background: url(x)')?.hex).toBeNull();
  });

  it('drops blank entries', () => {
    expect(parseBrandColors(['', '  ', '#fff'])).toEqual([
      { hex: '#FFF', label: '#FFF' },
    ]);
    expect(parseBrandColors(null)).toEqual([]);
  });
});

describe('parseBrandFonts', () => {
  it('splits the family from its role', () => {
    expect(
      parseBrandFonts(['Inter (headings)', 'Georgia', '  ', 'Noto Sans ()']),
    ).toEqual([
      { family: 'Inter', role: 'headings' },
      { family: 'Georgia', role: null },
      { family: 'Noto Sans', role: null },
    ]);
  });
});
