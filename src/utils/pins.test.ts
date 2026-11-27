import { describe, expect, it } from 'vitest';
import canvasReducer, { DEFAULT_STYLE, duplicateWithIds } from '../store/canvasSlice';
import type { CanvasShape, PinShape } from '../types/canvas';
import {
  UNKNOWN_AUTHOR,
  cameraCenteredOn,
  findPinBySlug,
  makeUniquePinSlug,
  migratePins,
  normalizeSearchText,
  readPinSlugFromHash,
  searchPins,
  slugify,
} from './pins';

const author = { id: 'user_1', name: 'An' };
const pin = (id: string, slug: string, title: string): PinShape => ({
  id,
  type: 'pin',
  slug,
  title,
  createdBy: author,
  createdAt: 1,
  x: 0,
  y: 0,
  width: 32,
  height: 40,
  style: DEFAULT_STYLE,
});

const shapes: Record<string, CanvasShape> = {
  a: pin('a', 'quan-ca-phe-ha-noi', 'Quán cà phê Hà Nội'),
  b: pin('b', 'ha-noi', 'Hà Nội'),
  b2: pin('b2', 'ha-noi-2', 'Hà Nội'), // same title, different primary key
  c: pin('c', 'sai-gon', 'Sài Gòn'),
  d: pin('d', 'idea', 'idea'),
  e: { ...pin('e', 'x', 'Hà Nội'), type: 'rect' } as unknown as CanvasShape,
};
const ids = (q: string) => searchPins(shapes, q).map((p) => p.id);

describe('slug (primary key)', () => {
  it('slugifies Vietnamese titles to URL-safe ids', () => {
    expect(normalizeSearchText('  Đà   Nẵng ')).toBe('da nang');
    expect(slugify('Quán Cà Phê #1 — Đà Nẵng!')).toBe('quan-ca-phe-1-da-nang');
    expect(slugify('###')).toBe('idea');
  });

  it('makes slugs unique with -2, -3 ...', () => {
    expect(makeUniquePinSlug({}, 'idea')).toBe('idea');
    expect(makeUniquePinSlug(shapes, 'idea')).toBe('idea-2');
    expect(makeUniquePinSlug(shapes, 'Hà Nội')).toBe('ha-noi-3');
    expect(makeUniquePinSlug(shapes, 'Hà Nội', 'b')).toBe('ha-noi');
  });

  it('finds a pin by slug, with or without "#"', () => {
    expect(findPinBySlug(shapes, '#ha-noi-2')?.id).toBe('b2');
    expect(findPinBySlug(shapes, 'nope')).toBeUndefined();
  });

  it('reads the slug from a deep-link hash', () => {
    expect(readPinSlugFromHash('#pin=ha-noi-2')).toBe('ha-noi-2');
    expect(readPinSlugFromHash('#x=1&pin=idea')).toBe('idea');
    expect(readPinSlugFromHash('#other')).toBeNull();
  });
});

describe('migration of old pins', () => {
  it('converts { name } pins and de-duplicates slugs', () => {
    const legacy = {
      p1: { ...pin('p1', '', ''), slug: undefined, title: undefined, createdBy: undefined, createdAt: undefined, name: 'Hà Nội' },
      p2: { ...pin('p2', '', ''), slug: undefined, title: undefined, createdBy: undefined, createdAt: undefined, name: '#hà nội' },
    } as unknown as Record<string, CanvasShape>;
    const out = migratePins(legacy);
    const p1 = out.p1 as PinShape;
    const p2 = out.p2 as PinShape;
    expect([p1.slug, p2.slug]).toEqual(['ha-noi', 'ha-noi-2']);
    expect(p2.title).toBe('hà nội');
    expect(p1.createdBy).toEqual(UNKNOWN_AUTHOR);
    expect('name' in p1).toBe(false);
  });

  it('returns the same object when nothing changes', () => {
    expect(migratePins(shapes)).toBe(shapes);
  });
});

describe('search', () => {
  it('shows nothing for an empty query', () => {
    expect(ids('')).toEqual([]);
    expect(ids('#')).toEqual([]);
  });

  it('puts an exact slug match first', () => {
    expect(ids('#ha-noi-2')[0]).toBe('b2');
  });

  it('matches titles ignoring diacritics, prefix matches first', () => {
    expect(ids('ha noi').slice(0, 2).sort()).toEqual(['b', 'b2']);
    expect(ids('ha noi')).toContain('a');
  });

  it('tolerates small typos and missing letters', () => {
    expect(ids('sai gonn')).toContain('c');
    expect(ids('hanoi')).toEqual(expect.arrayContaining(['a', 'b', 'b2']));
    expect(ids('xyzw')).toEqual([]);
  });
});

describe('duplicating a pin', () => {
  it('gets a new unique slug and the duplicating user as author', () => {
    let state = canvasReducer(undefined, { type: 'init' });
    state = { ...state, shapes: { b: shapes.b }, shapeOrder: ['b'] };
    state = canvasReducer(state, duplicateWithIds([{ sourceId: 'b', newId: 'copy1' }]));
    const copy = state.shapes.copy1 as PinShape;
    expect(copy.slug).toBe('ha-noi-2');
    expect(copy.title).toBe('Hà Nội');
    expect(copy.createdBy.id).not.toBe(author.id);
  });
});

describe('camera', () => {
  it('centers the camera on a world point', () => {
    const cam = cameraCenteredOn({ x: 1000, y: 500 }, { width: 800, height: 600 }, 2);
    expect(cam).toEqual({ x: 400 - 2000, y: 300 - 1000, zoom: 2 });
  });
});

describe('pin label', () => {
  it('always displays the title with a leading "#"', async () => {
    const { formatPinTitle, cleanPinTitle } = await import('./pins');
    expect(formatPinTitle('ý tưởng')).toBe('#ý tưởng');
    expect(formatPinTitle('#new-idea')).toBe('#new-idea');
    expect(cleanPinTitle('##  idea1 ')).toBe('idea1');
  });

  it('scales the label together with the pin and keeps the marker undistorted', async () => {
    const { getPinLayout } = await import('./geometry');
    const base = getPinLayout({ width: 32, height: 40, title: 'idea' });
    const big = getPinLayout({ width: 64, height: 80, title: 'idea' });
    expect(base.label.text).toBe('#idea');
    expect(big.label.fontSize).toBeCloseTo(base.label.fontSize * 2);
    expect(big.label.width).toBeCloseTo(base.label.width * 2);
    // A stretched box (like the old squashed pin) uses the smaller side → no distortion
    const stretched = getPinLayout({ width: 300, height: 40, title: 'idea' });
    expect(stretched.label.fontSize).toBeCloseTo(base.label.fontSize);
  });
});
