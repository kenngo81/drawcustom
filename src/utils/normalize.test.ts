import { describe, expect, it } from 'vitest';
import { createDrawStore } from '../store';
import { DEFAULT_STYLE, applyRemoteChanges, hydrate } from '../store/canvasSlice';
import { normalizeShape, stickerImageHref } from './normalize';

const good = { id: 'a', type: 'rect', x: 0, y: 0, width: 10, height: 10, style: DEFAULT_STYLE };

describe('normalizeShape (untrusted storage data)', () => {
  it('keeps valid shapes', () => {
    expect(normalizeShape(good, DEFAULT_STYLE)).toEqual(good);
  });

  it('fills a missing or broken style instead of crashing', () => {
    const { style: _s, ...noStyle } = good;
    expect(normalizeShape(noStyle, DEFAULT_STYLE)?.style).toEqual(DEFAULT_STYLE);
    const weird = normalizeShape({ ...good, style: { stroke: 42, strokeWidth: 'x', opacity: 0.5 } }, DEFAULT_STYLE)!;
    expect(weird.style.stroke).toBe(DEFAULT_STYLE.stroke);
    expect(weird.style.strokeWidth).toBe(DEFAULT_STYLE.strokeWidth);
    expect(weird.style.opacity).toBe(0.5);
  });

  it('drops shapes that cannot be drawn', () => {
    expect(normalizeShape(null, DEFAULT_STYLE)).toBeNull();
    expect(normalizeShape({ ...good, type: 'evil' }, DEFAULT_STYLE)).toBeNull();
    expect(normalizeShape({ ...good, x: 'NaN' }, DEFAULT_STYLE)).toBeNull();
    expect(normalizeShape({ ...good, type: 'draw', points: [{ x: 1 }] }, DEFAULT_STYLE)).toBeNull();
    expect(normalizeShape({ ...good, type: 'text' }, DEFAULT_STYLE)).toBeNull();
    expect(normalizeShape({ ...good, type: 'sticker', svgMarkup: 1, viewBox: '0 0 1 1' }, DEFAULT_STYLE)).toBeNull();
  });

  it('a malformed remote record never reaches (or breaks) the board', () => {
    const store = createDrawStore();
    store.dispatch(hydrate({ shapes: { a: good as never, bad: { id: 'bad' } as never }, shapeOrder: ['a', 'bad'] }));
    expect(Object.keys(store.getState().canvas.shapes)).toEqual(['a']);
    store.dispatch(
      applyRemoteChanges({ upserts: [{ id: 'probe', type: 'rect', x: 0, y: 0, width: 1, height: 1 } as never, { id: 'x' } as never], deletes: [] })
    );
    const s = store.getState().canvas;
    expect(s.shapes.probe.style).toEqual(DEFAULT_STYLE);
    expect(s.shapes.x).toBeUndefined();
    expect(s.shapeOrder).toEqual(['a', 'probe']);
  });
});

describe('stickerImageHref', () => {
  it('wraps sticker SVG in an image data URL (scripts can never run from <image>)', () => {
    const href = stickerImageHref('0 0 24 24', '<img src=x onerror="alert(1)"/>');
    expect(href.startsWith('data:image/svg+xml;base64,')).toBe(true);
  });

  it('rejects an injected viewBox', () => {
    const href = stickerImageHref('0 0 1 1" onload="alert(1)', '<circle r="1"/>');
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(href.split(',')[1]), (c) => c.charCodeAt(0)));
    expect(decoded).toContain('viewBox="0 0 24 24"');
    expect(decoded).not.toContain('onload');
  });
});
