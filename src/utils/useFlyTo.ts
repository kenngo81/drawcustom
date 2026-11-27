import { useCallback, useEffect, useRef } from 'react';
import { useBoard } from '../lib/context';
import { useAppDispatch, useAppStore } from '../store';
import { selectShapes, setCamera } from '../store/canvasSlice';
import type { Bounds, CanvasShape, PinShape, Point } from '../types/canvas';
import { getSelectionBounds, screenToWorld } from './geometry';
import { PIN_FOCUS_ZOOM, cameraCenteredOn, getPinCenter } from './pins';

const FLY_DURATION_MS = 550;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Camera target that fits every shape (plus `extra`, e.g. an annotation background)
 * inside the viewport. `fill` < 1 leaves room around the content to draw.
 */
export function fitContentTarget(
  shapes: CanvasShape[],
  viewport: { width: number; height: number },
  opts: { extra?: Bounds | null; fill?: number } = {}
): { center: Point; zoom: number } | null {
  let b = getSelectionBounds(shapes);
  if (opts.extra) {
    const e = opts.extra;
    if (!b) b = e;
    else {
      const x = Math.min(b.x, e.x);
      const y = Math.min(b.y, e.y);
      b = {
        x,
        y,
        width: Math.max(b.x + b.width, e.x + e.width) - x,
        height: Math.max(b.y + b.height, e.y + e.height) - y,
      };
    }
  }
  if (!b) return null;
  const pad = Math.min(48, viewport.width * 0.08);
  const fill = opts.fill ?? 1;
  const zoom = Math.min(
    1.5,
    ((viewport.width - pad * 2) * fill) / b.width,
    ((viewport.height - pad * 2) * fill) / b.height
  );
  return { center: { x: b.x + b.width / 2, y: b.y + b.height / 2 }, zoom: Math.max(0.1, zoom) };
}

/** Smooth camera moves shared by search, deep links and embeds. */
export function useFlyTo() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { getViewport } = useBoard();
  const rafRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const flyTo = useCallback(
    (to: Point, targetZoom: number, animate = true) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const vp = getViewport();
      if (!animate) {
        dispatch(setCamera(cameraCenteredOn(to, vp, targetZoom)));
        return;
      }
      const cam = store.getState().canvas.camera;
      const from = screenToWorld({ x: vp.width / 2, y: vp.height / 2 }, cam);
      const z0 = cam.zoom;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / FLY_DURATION_MS);
        const k = easeInOutCubic(t);
        const center = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
        // Interpolate zoom geometrically so it feels uniform
        dispatch(setCamera(cameraCenteredOn(center, vp, z0 * (targetZoom / z0) ** k)));
        rafRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [dispatch, store, getViewport]
  );

  const flyToPin = useCallback(
    (pin: PinShape, opts: { animate?: boolean; select?: boolean; zoom?: number } = {}) => {
      if (opts.select !== false) dispatch(selectShapes([pin.id]));
      flyTo(getPinCenter(pin), opts.zoom ?? PIN_FOCUS_ZOOM, opts.animate !== false);
    },
    [dispatch, flyTo]
  );

  /** Center of the visible area, in world coordinates. */
  const getViewCenter = useCallback(() => {
    const vp = getViewport();
    return screenToWorld({ x: vp.width / 2, y: vp.height / 2 }, store.getState().canvas.camera);
  }, [getViewport, store]);

  return { flyTo, flyToPin, getViewCenter };
}
