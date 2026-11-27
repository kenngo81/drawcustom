import { applyRemoteChanges, type BoardChanges } from '../store/canvasSlice';
import type { DrawStore } from '../store';
import type { CanvasShape } from '../types/canvas';
import type { BoardAdapter } from './adapters/types';

type ShapeMap = Record<string, CanvasShape>;

function sameOrder(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/**
 * What changed between two board states. Redux gives every edited shape a new object,
 * so identity comparison is exact and cheap even with thousands of shapes.
 */
export function diffBoard(
  prev: { shapes: ShapeMap; shapeOrder: string[] },
  next: { shapes: ShapeMap; shapeOrder: string[] }
): BoardChanges | null {
  if (prev.shapes === next.shapes && sameOrder(prev.shapeOrder, next.shapeOrder)) return null;
  const upserts: CanvasShape[] = [];
  const deletes: string[] = [];
  for (const id in next.shapes) {
    if (prev.shapes[id] !== next.shapes[id]) upserts.push(next.shapes[id]);
  }
  for (const id in prev.shapes) {
    if (!(id in next.shapes)) deletes.push(id);
  }
  const orderChanged = !sameOrder(prev.shapeOrder, next.shapeOrder);
  if (upserts.length === 0 && deletes.length === 0 && !orderChanged) return null;
  return { upserts, deletes, ...(orderChanged ? { order: [...next.shapeOrder] } : {}) };
}

export interface SyncOptions {
  /** Wait this long after the last edit before saving (drags produce many updates). */
  debounceMs?: number;
  onError?: (error: unknown) => void;
  onSaving?: (saving: boolean) => void;
}

/**
 * Connects a board store to its adapter after the initial load:
 * local edits → adapter.save (debounced, diffs only); adapter.subscribe → store.
 * Returns { flush, dispose }.
 */
export function attachSync(store: DrawStore, adapter: BoardAdapter, options: SyncOptions = {}) {
  const debounceMs = options.debounceMs ?? 400;
  // What the adapter is known to have. Remote changes update it too, so they are not echoed back.
  let baseline = (() => {
    const s = store.getState().canvas;
    return { shapes: s.shapes, shapeOrder: s.shapeOrder };
  })();
  let lastCamera = store.getState().canvas.camera;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cameraTimer: ReturnType<typeof setTimeout> | undefined;
  let saving: Promise<void> = Promise.resolve();

  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (!adapter.save) return saving;
    const { shapes, shapeOrder, camera } = store.getState().canvas;
    const changes = diffBoard(baseline, { shapes, shapeOrder });
    if (!changes) return saving;
    baseline = { shapes, shapeOrder };
    const save = adapter.save.bind(adapter);
    // Saves run one after another so they reach the backend in order
    saving = saving.then(async () => {
      options.onSaving?.(true);
      try {
        await save(changes, { shapes, shapeOrder, camera });
      } catch (error) {
        options.onError?.(error);
      } finally {
        options.onSaving?.(false);
      }
    });
    return saving;
  };

  const unsubscribeStore = store.subscribe(() => {
    const s = store.getState().canvas;
    if (adapter.save && (s.shapes !== baseline.shapes || s.shapeOrder !== baseline.shapeOrder)) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, debounceMs);
    }
    if (adapter.saveCamera && s.camera !== lastCamera) {
      lastCamera = s.camera;
      if (cameraTimer) clearTimeout(cameraTimer);
      cameraTimer = setTimeout(() => adapter.saveCamera?.(lastCamera), 300);
    }
  });

  const unsubscribeRemote = adapter.subscribe?.((changes) => {
    store.dispatch(applyRemoteChanges(changes));
    // Fold the remote result into the baseline (only for the shapes it touched),
    // so local edits still pending elsewhere are kept and these are not re-saved.
    const s = store.getState().canvas;
    const shapes = { ...baseline.shapes };
    for (const id of changes.deletes) delete shapes[id];
    for (const shape of changes.upserts) {
      if (s.shapes[shape.id]) shapes[shape.id] = s.shapes[shape.id];
    }
    // The remote side's order is now known too; local-only shapes (not yet saved) stay out
    // of the baseline so they still show up as changes on the next flush.
    baseline = { shapes, shapeOrder: s.shapeOrder.filter((id) => id in shapes) };
  });

  return {
    flush,
    dispose() {
      void flush();
      if (cameraTimer) clearTimeout(cameraTimer);
      unsubscribeStore();
      unsubscribeRemote?.();
    },
  };
}
