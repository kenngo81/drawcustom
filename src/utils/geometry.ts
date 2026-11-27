import type {
  ArrowShape,
  Bounds,
  Camera,
  CanvasShape,
  Point,
  ResizeHandle,
} from '../types/canvas';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function screenToWorld(point: Point, camera: Camera): Point {
  return {
    x: (point.x - camera.x) / camera.zoom,
    y: (point.y - camera.y) / camera.zoom,
  };
}

export function worldToScreen(point: Point, camera: Camera): Point {
  return {
    x: point.x * camera.zoom + camera.x,
    y: point.y * camera.zoom + camera.y,
  };
}

export function zoomCameraAt(camera: Camera, screenPoint: Point, nextZoom: number): Camera {
  const clamped = clampZoom(nextZoom);
  const worldBefore = screenToWorld(screenPoint, camera);
  return {
    x: screenPoint.x - worldBefore.x * clamped,
    y: screenPoint.y - worldBefore.y * clamped,
    zoom: clamped,
  };
}

export function getShapeCenter(shape: Pick<CanvasShape, 'x' | 'y' | 'width' | 'height'>): Point {
  return {
    x: shape.x + Math.max(1, shape.width) / 2,
    y: shape.y + Math.max(1, shape.height) / 2,
  };
}

export function rotatePoint(point: Point, origin: Point, angleDeg: number): Point {
  if (!angleDeg) return point;
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}

export function normalizeAngle(deg: number): number {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return Math.round(a * 10) / 10;
}

export function getRotatedBoundsCorners(bounds: Bounds, angleDeg = 0): Point[] {
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const center = { x: cx, y: cy };
  const corners: Point[] = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ];
  return angleDeg ? corners.map((c) => rotatePoint(c, center, angleDeg)) : corners;
}

export function getShapeBounds(shape: CanvasShape): Bounds {
  const base: Bounds = {
    x: shape.x,
    y: shape.y,
    width: Math.max(1, shape.width),
    height: Math.max(1, shape.height),
  };
  const rot = shape.rotation ?? 0;
  if (!rot) return base;
  const corners = getRotatedBoundsCorners(base, rot);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of corners) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x);
    maxY = Math.max(maxY, c.y);
  }
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function getSelectionBounds(shapes: CanvasShape[]): Bounds | null {
  if (shapes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const shape of shapes) {
    const b = getShapeBounds(shape);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return (
    a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.height &&
    a.y + a.height >= b.y
  );
}

export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

export function getArrowPoints(shape: Pick<ArrowShape, 'points'>): [Point, Point, Point] {
  if (shape.points.length === 3) {
    return shape.points;
  }
  const [p0, p2] = shape.points;
  return [p0, { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 }, p2];
}

export function sampleQuadraticBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  steps = 16
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    });
  }
  return pts;
}

export function hitTestShape(shape: CanvasShape, worldPoint: Point, tolerance = 8): boolean {
  const pad = tolerance + shape.style.strokeWidth / 2;
  const x = shape.x;
  const y = shape.y;
  const width = Math.max(1, shape.width);
  const height = Math.max(1, shape.height);
  const rotation = shape.rotation ?? 0;
  const localWorld = rotation
    ? rotatePoint(worldPoint, { x: x + width / 2, y: y + height / 2 }, -rotation)
    : worldPoint;

  if (shape.type === 'pin') {
    // The name label hangs below the pin box; clicking it should hit the pin too
    const { label } = getPinLayout(shape);
    if (
      localWorld.x >= x + label.x - pad &&
      localWorld.x <= x + label.x + label.width + pad &&
      localWorld.y >= y + label.y - pad &&
      localWorld.y <= y + label.y + label.height + pad
    ) {
      return true;
    }
  }

  if (
    localWorld.x < x - pad ||
    localWorld.x > x + width + pad ||
    localWorld.y < y - pad ||
    localWorld.y > y + height + pad
  ) {
    return false;
  }

  switch (shape.type) {
    case 'rect':
    case 'text':
    case 'image':
    case 'sticker':
    case 'pin':
      return true;

    case 'ellipse': {
      const rx = width / 2 + pad;
      const ry = height / 2 + pad;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const norm = ((localWorld.x - cx) ** 2) / (rx * rx) + ((localWorld.y - cy) ** 2) / (ry * ry);
      return norm <= 1;
    }

    case 'diamond': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const rx = width / 2 + pad;
      const ry = height / 2 + pad;
      return Math.abs(localWorld.x - cx) / rx + Math.abs(localWorld.y - cy) / ry <= 1;
    }

    case 'line': {
      const a = { x: x + shape.points[0].x, y: y + shape.points[0].y };
      const b = { x: x + shape.points[1].x, y: y + shape.points[1].y };
      return distanceToSegment(localWorld, a, b) <= pad;
    }

    case 'arrow': {
      const [p0, p1, p2] = getArrowPoints(shape);
      const sampled = sampleQuadraticBezier(
        { x: x + p0.x, y: y + p0.y },
        { x: x + p1.x, y: y + p1.y },
        { x: x + p2.x, y: y + p2.y },
        16
      );
      for (let i = 0; i < sampled.length - 1; i++) {
        if (distanceToSegment(localWorld, sampled[i], sampled[i + 1]) <= pad) {
          return true;
        }
      }
      return false;
    }

    case 'draw': {
      const pts = shape.points;
      if (pts.length === 0) return false;
      if (pts.length === 1) {
        return Math.hypot(localWorld.x - (x + pts[0].x), localWorld.y - (y + pts[0].y)) <= pad;
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const a = { x: x + pts[i].x, y: y + pts[i].y };
        const b = { x: x + pts[i + 1].x, y: y + pts[i + 1].y };
        if (distanceToSegment(localWorld, a, b) <= pad) return true;
      }
      return false;
    }
  }
}

export function normalizePointsToBox(worldPoints: Point[]): {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Point[];
} {
  if (worldPoints.length === 0) {
    return { x: 0, y: 0, width: 1, height: 1, points: [] };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of worldPoints) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
    points: worldPoints.map((p) => ({ x: p.x - minX, y: p.y - minY })),
  };
}

export function resizeBounds(
  initial: Bounds,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  minSize = 8
): Bounds {
  let { x, y, width, height } = initial;

  if (handle.includes('e')) {
    width = Math.max(minSize, initial.width + dx);
  }
  if (handle.includes('s')) {
    height = Math.max(minSize, initial.height + dy);
  }
  if (handle.includes('w')) {
    const nextW = Math.max(minSize, initial.width - dx);
    x = initial.x + (initial.width - nextW);
    width = nextW;
  }
  if (handle.includes('n')) {
    const nextH = Math.max(minSize, initial.height - dy);
    y = initial.y + (initial.height - nextH);
    height = nextH;
  }

  return { x, y, width, height };
}

export function scalePointsInBox(
  points: Point[],
  oldWidth: number,
  oldHeight: number,
  newWidth: number,
  newHeight: number
): Point[] {
  const sx = oldWidth > 0 ? newWidth / oldWidth : 1;
  const sy = oldHeight > 0 ? newHeight / oldHeight : 1;
  return points.map((p) => ({ x: p.x * sx, y: p.y * sy }));
}

export function pointsToSmoothSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} L ${(p.x + 0.1).toFixed(2)} ${(p.y + 0.1).toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return d;
}

/** Base (unscaled) pin box size; the marker artwork uses a 24x30 viewBox. */
export const PIN_BASE_WIDTH = 32;
export const PIN_BASE_HEIGHT = 40;
const PIN_ART_W = 24;
const PIN_ART_H = 30;

export interface PinLayout {
  /** Uniform scale relative to the default pin size (1 = default). */
  scale: number;
  /** Marker artwork transform inside the pin box: tip touches the bottom centre. */
  art: { x: number; y: number; scale: number };
  label: { text: string; x: number; y: number; width: number; height: number; fontSize: number };
}

/**
 * Shared by the renderer and hit-testing so the label always scales together with the
 * marker (keeps aspect ratio even if the box was stretched) and is clickable.
 */
export function getPinLayout(pin: { width: number; height: number; title: string }): PinLayout {
  const w = Math.max(1, pin.width);
  const h = Math.max(1, pin.height);
  const artScale = Math.min(w / PIN_ART_W, h / PIN_ART_H);
  const scale = (artScale * PIN_ART_W) / PIN_BASE_WIDTH;
  const fontSize = 13 * scale;
  const text = `#${(pin.title ?? '').replace(/^#+/, '')}`;
  const width = Math.max(36 * scale, text.length * fontSize * 0.6 + 16 * scale);
  const height = fontSize + 10 * scale;
  return {
    scale,
    art: { x: (w - PIN_ART_W * artScale) / 2, y: h - PIN_ART_H * artScale, scale: artScale },
    label: { text, x: w / 2 - width / 2, y: h + 4 * scale, width, height, fontSize },
  };
}
