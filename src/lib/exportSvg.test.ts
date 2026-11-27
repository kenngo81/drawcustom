import { describe, expect, it } from 'vitest';
import { DEFAULT_STYLE } from '../store/canvasSlice';
import type { DrawShape, PinShape, RectShape } from '../types/canvas';
import { fitContentTarget } from '../utils/useFlyTo';
import { buildSvgDocument, getContentBounds } from './exportSvg';

const rect: RectShape = { id: 'r', type: 'rect', x: 100, y: 50, width: 200, height: 100, style: { ...DEFAULT_STYLE, strokeWidth: 4 } };

describe('getContentBounds', () => {
  it('includes half the stroke width plus padding', () => {
    expect(getContentBounds([rect], 0)).toEqual({ x: 98, y: 48, width: 204, height: 104 });
    expect(getContentBounds([rect], 5)).toEqual({ x: 93, y: 43, width: 214, height: 114 });
  });

  it('accounts for thick brushes and the soft-brush blur', () => {
    const soft: DrawShape = {
      id: 'd', type: 'draw', x: 0, y: 0, width: 10, height: 10, points: [],
      style: { ...DEFAULT_STYLE, strokeWidth: 10, brushType: 'soft' },
    };
    // 10 * 1.8 / 2 = 9, + 8 blur
    expect(getContentBounds([soft], 0)!.x).toBeCloseTo(-17);
  });

  it('includes the label hanging under a pin', () => {
    const pin: PinShape = {
      id: 'p', type: 'pin', slug: 'a', title: 'a very long pin title', x: 0, y: 0, width: 32, height: 40,
      createdBy: { id: 'u', name: 'U' }, createdAt: 0, style: DEFAULT_STYLE,
    };
    const b = getContentBounds([pin], 0)!;
    expect(b.y + b.height).toBeGreaterThan(40 + 20);
    expect(b.width).toBeGreaterThan(32);
  });

  it('is null for an empty drawing', () => {
    expect(getContentBounds([])).toBeNull();
  });
});

describe('buildSvgDocument', () => {
  it('crops the document to the bounds', () => {
    const svg = buildSvgDocument('<g/>', '<defs/>', { x: -10.123, y: 5, width: 300, height: 120.5 });
    expect(svg).toContain('viewBox="-10.12 5 300 120.5"');
    expect(svg).toContain('width="300" height="120.5"');
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain('<defs/><g/></svg>');
  });
});

describe('fitContentTarget with a background', () => {
  it('frames the picture even with no drawing, leaving a margin', () => {
    const fit = fitContentTarget([], { width: 1000, height: 800 }, {
      extra: { x: 0, y: 0, width: 1000, height: 500 },
      fill: 0.8,
    })!;
    expect(fit.center).toEqual({ x: 500, y: 250 });
    expect(fit.zoom).toBeLessThan(1);
  });
});
