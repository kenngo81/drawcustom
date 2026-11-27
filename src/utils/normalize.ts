import type { CanvasShape, ShapeStyle } from '../types/canvas';

/**
 * Shapes reach the board from storage written by OTHER people (shared backends), so they
 * are untrusted input: a malformed record must never crash the board for everyone.
 * `normalizeShape` returns a safe shape, or null for anything that can't be drawn.
 */
const KNOWN_TYPES = new Set([
  'rect', 'ellipse', 'diamond', 'draw', 'arrow', 'line', 'text', 'image', 'sticker', 'pin',
]);

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isPoint = (p: unknown) => isObj(p) && isNum(p.x) && isNum(p.y);

const STYLE_KEYS: Array<keyof ShapeStyle> = [
  'stroke', 'fill', 'fillStyle', 'dash', 'brushType', 'strokeWidth', 'opacity', 'fontSize', 'fontFamily',
];

function normalizeStyle(raw: unknown, defaults: ShapeStyle): ShapeStyle {
  const style: ShapeStyle = { ...defaults };
  if (!isObj(raw)) return style;
  for (const key of STYLE_KEYS) {
    const value = raw[key];
    const fallback = defaults[key];
    if (typeof value === typeof fallback && (typeof value !== 'number' || Number.isFinite(value))) {
      (style as unknown as Record<string, unknown>)[key] = value;
    }
  }
  return style;
}

export function normalizeShape(raw: unknown, defaultStyle: ShapeStyle): CanvasShape | null {
  if (!isObj(raw)) return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== 'string' || !s.id || typeof s.type !== 'string' || !KNOWN_TYPES.has(s.type)) {
    return null;
  }
  if (![s.x, s.y, s.width, s.height].every(isNum)) return null;
  if (s.rotation !== undefined && !isNum(s.rotation)) return null;

  switch (s.type) {
    case 'draw':
      if (!Array.isArray(s.points) || !s.points.every(isPoint)) return null;
      break;
    case 'arrow':
    case 'line':
      if (!Array.isArray(s.points) || s.points.length < 2 || !s.points.every(isPoint)) return null;
      break;
    case 'text':
      if (typeof s.text !== 'string') return null;
      break;
    case 'image':
      if (typeof s.src !== 'string') return null;
      break;
    case 'sticker':
      if (typeof s.svgMarkup !== 'string' || typeof s.viewBox !== 'string') return null;
      break;
    case 'pin':
      // Missing pin fields are filled in by migratePins()
      break;
  }

  return { ...s, style: normalizeStyle(s.style, defaultStyle) } as unknown as CanvasShape;
}

/** Keeps only drawable shapes (by id). */
export function normalizeShapes(
  shapes: Record<string, unknown> | null | undefined,
  defaultStyle: ShapeStyle
): Record<string, CanvasShape> {
  const out: Record<string, CanvasShape> = {};
  if (!isObj(shapes)) return out;
  for (const [id, raw] of Object.entries(shapes)) {
    const shape = normalizeShape(raw, defaultStyle);
    if (shape && shape.id === id) out[id] = shape;
  }
  return out;
}

/**
 * Stickers are user-provided SVG. Rendering it inline (innerHTML) would let a crafted
 * sticker run script for every viewer of a shared board. Loaded as an image, an SVG
 * document can never run script — so stickers are always drawn through this data URL.
 */
export function stickerImageHref(viewBox: string, svgMarkup: string): string {
  const safeViewBox = /^[\d.\s,-]+$/.test(viewBox) ? viewBox : '0 0 24 24';
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${safeViewBox}">${svgMarkup}</svg>`;
  const bytes = new TextEncoder().encode(doc);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}
