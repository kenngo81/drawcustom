import { BRUSH_MULTIPLIER } from '../store/canvasSlice';
import type { Bounds, CanvasShape } from '../types/canvas';
import { getPinLayout, getShapeBounds } from '../utils/geometry';

export interface SvgExport {
  /** Standalone SVG document (string). Safe to show through <img src="data:image/svg+xml...">. */
  svg: string;
  /** Area covered, in board (world) units — where to place the SVG over the original. */
  bounds: Bounds;
}

/** Visual extent of shapes, including stroke width, soft-brush blur and pin labels. */
export function getContentBounds(shapes: CanvasShape[], padding = 4): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const shape of shapes) {
    const b = getShapeBounds(shape);
    const brush = shape.style.brushType ?? 'pen';
    const width =
      (shape.style.strokeWidth ?? 3) * (shape.type === 'draw' ? BRUSH_MULTIPLIER[brush] ?? 1 : 1);
    // Half the stroke sticks out of the geometry; the soft brush blur spreads a bit more
    const grow = width / 2 + (shape.type === 'draw' && brush === 'soft' ? 8 : 0);
    minX = Math.min(minX, b.x - grow);
    minY = Math.min(minY, b.y - grow);
    maxX = Math.max(maxX, b.x + b.width + grow);
    maxY = Math.max(maxY, b.y + b.height + grow);
    if (shape.type === 'pin') {
      const { label } = getPinLayout(shape);
      minX = Math.min(minX, shape.x + label.x);
      maxX = Math.max(maxX, shape.x + label.x + label.width);
      maxY = Math.max(maxY, shape.y + label.y + label.height);
    }
  }
  if (!Number.isFinite(minX)) return null;
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Wraps serialized SVG content in a standalone document cropped to `bounds`. */
export function buildSvgDocument(content: string, defs: string, bounds: Bounds): string {
  const { x, y, width, height } = bounds;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="${round(x)} ${round(y)} ${round(width)} ${round(height)}" ` +
    `width="${round(width)}" height="${round(height)}">` +
    defs +
    content +
    `</svg>`
  );
}

/**
 * Serializes what is drawn on a rendered board (its `.dc-shapes` layer). Overlays —
 * selection handles, lock badges, the annotation background — are left out.
 */
export function exportBoardSvg(
  root: HTMLElement,
  shapes: CanvasShape[],
  opts: { padding?: number } = {}
): SvgExport | null {
  const bounds = getContentBounds(shapes, opts.padding ?? 4);
  const svgEl = root.querySelector('svg.canvas-svg');
  const layer = svgEl?.querySelector('g.dc-shapes');
  if (!bounds || !svgEl || !layer) return null;
  const serializer = new XMLSerializer();
  const defsEl = svgEl.querySelector(':scope > defs');
  const defs = defsEl ? serializer.serializeToString(defsEl) : '';
  const content = Array.from(layer.childNodes)
    .map((node) => serializer.serializeToString(node))
    .join('');
  return { svg: buildSvgDocument(content, defs, bounds), bounds };
}

/** UTF-8 safe base64 data URL for an SVG string. */
export function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}
