import type { CanvasDocument } from '../../types/canvas';
import { fetchBoard, isCanvasDocument } from '../../utils/boardIO';
import type { BoardAdapter, BoardSnapshot } from './types';

/** Key used by the original standalone app, so existing local boards are kept. */
export const DEFAULT_LOCAL_KEY = 'drawcustom.document.v1';

/**
 * Board stored only in this browser (localStorage). Nothing leaves the device.
 * Note: localStorage holds ~5 MB, so boards with many pasted images can hit the limit.
 */
export function createLocalStorageAdapter(options: { key?: string } = {}): BoardAdapter {
  const key = options.key ?? DEFAULT_LOCAL_KEY;
  let latest: CanvasDocument | null = null;
  let timer: number | undefined;

  const read = (): CanvasDocument | null => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isCanvasDocument(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const write = () => {
    if (!latest) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(latest));
    } catch {
      // Quota exceeded or storage blocked: keep working in memory
    }
  };

  return {
    async load() {
      latest = read() ?? { version: 1, shapes: {}, shapeOrder: [], camera: { x: 0, y: 0, zoom: 1 } };
      return { shapes: latest.shapes, shapeOrder: latest.shapeOrder, camera: latest.camera };
    },
    async save(_changes, full) {
      latest = {
        version: 1,
        shapes: full.shapes,
        shapeOrder: full.shapeOrder,
        camera: latest?.camera ?? full.camera ?? { x: 0, y: 0, zoom: 1 },
      };
      write();
    },
    saveCamera(camera) {
      if (!latest) return;
      latest = { ...latest, camera };
      window.clearTimeout(timer);
      timer = window.setTimeout(write, 400);
    },
  };
}

/** Read-only board loaded from a published DrawCustom JSON file (needs CORS on the host). */
export function createJsonUrlAdapter(url: string): BoardAdapter {
  return {
    async load() {
      const doc = await fetchBoard(url);
      return { shapes: doc.shapes, shapeOrder: doc.shapeOrder };
    },
  };
}

/** In-memory board (tests, demos, or a host that manages persistence itself). */
export function createMemoryAdapter(initial?: Partial<BoardSnapshot>): BoardAdapter & {
  snapshot(): BoardSnapshot;
} {
  let current: BoardSnapshot = {
    shapes: initial?.shapes ?? {},
    shapeOrder: initial?.shapeOrder ?? [],
    camera: initial?.camera,
  };
  return {
    async load() {
      return current;
    },
    async save(_changes, full) {
      current = full;
    },
    snapshot: () => current,
  };
}
