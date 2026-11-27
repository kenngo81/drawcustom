import { describe, expect, it } from 'vitest';
import {
  getArrowPoints,
  hitTestShape,
  normalizePointsToBox,
  resizeBounds,
  screenToWorld,
  worldToScreen,
  zoomCameraAt,
} from './geometry';
import type { ArrowShape, RectShape } from '../types/canvas';

describe('geometry utilities', () => {
  it('converts screen <-> world coordinates accurately', () => {
    const camera = { x: 100, y: -50, zoom: 2 };
    const world = screenToWorld({ x: 300, y: 150 }, camera);
    expect(world).toEqual({ x: 100, y: 100 });
    expect(worldToScreen(world, camera)).toEqual({ x: 300, y: 150 });
  });

  it('keeps cursor anchor stationary during zoomCameraAt', () => {
    const camera = { x: 40, y: 80, zoom: 1 };
    const cursor = { x: 240, y: 180 };
    const worldBefore = screenToWorld(cursor, camera);
    const nextCamera = zoomCameraAt(camera, cursor, 2.5);
    const worldAfter = screenToWorld(cursor, nextCamera);
    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 6);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 6);
  });

  it('normalizes raw draw points to bounding box', () => {
    const res = normalizePointsToBox([
      { x: 10, y: 20 },
      { x: 50, y: 60 },
    ]);
    expect(res.x).toBe(10);
    expect(res.y).toBe(20);
    expect(res.width).toBe(40);
    expect(res.height).toBe(40);
    expect(res.points).toEqual([
      { x: 0, y: 0 },
      { x: 40, y: 40 },
    ]);
  });

  it('resizes bounds from nw handle without flipping below minSize', () => {
    const resized = resizeBounds({ x: 100, y: 100, width: 50, height: 50 }, 'nw', 20, 10, 10);
    expect(resized).toEqual({ x: 120, y: 110, width: 30, height: 40 });
  });

  it('hit-tests rectangle and curved 3-point arrow cleanly', () => {
    const style = {
      stroke: '#000',
      fill: 'transparent',
      fillStyle: 'none' as const,
      dash: 'solid' as const,
      brushType: 'pen' as const,
      strokeWidth: 2,
      opacity: 1,
      fontSize: 20,
      fontFamily: 'sans-serif',
    };
    const rect: RectShape = {
      id: 'r1',
      type: 'rect',
      x: 10,
      y: 10,
      width: 100,
      height: 50,
      style,
    };
    expect(hitTestShape(rect, { x: 50, y: 30 }, 4)).toBe(true);
    expect(hitTestShape(rect, { x: 200, y: 200 }, 4)).toBe(false);

    const curvedArrow: ArrowShape = {
      id: 'a1',
      type: 'arrow',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      points: [
        { x: 0, y: 100 },
        { x: 50, y: -100 }, // Curve apex at t=0.5 is (50, 0)
        { x: 100, y: 100 },
      ],
      style,
    };
    expect(getArrowPoints(curvedArrow).length).toBe(3);
    expect(hitTestShape(curvedArrow, { x: 50, y: 0 }, 4)).toBe(true);
    expect(hitTestShape(curvedArrow, { x: 50, y: 95 }, 4)).toBe(false);
  });
});
