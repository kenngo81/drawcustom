import { describe, expect, it } from 'vitest';
import { createDrawStore } from '../store';
import { DEFAULT_STYLE, addShape, applyRemoteChanges, hydrate, updateShapes } from '../store/canvasSlice';
import type { RectShape } from '../types/canvas';
import type { BoardAdapter, BoardChanges } from './adapters/types';
import { createMemoryAdapter } from './adapters/local';
import { attachSync, diffBoard } from './sync';

const rect = (id: string, x = 0): RectShape => ({
  id,
  type: 'rect',
  x,
  y: 0,
  width: 10,
  height: 10,
  style: DEFAULT_STYLE,
});

describe('diffBoard', () => {
  it('reports only shapes whose object changed', () => {
    const a = rect('a');
    const b = rect('b');
    const prev = { shapes: { a, b }, shapeOrder: ['a', 'b'] };
    expect(diffBoard(prev, prev)).toBeNull();
    const b2 = { ...b, x: 5 };
    const c = rect('c');
    const next = { shapes: { b: b2, c }, shapeOrder: ['b', 'c'] };
    const d = diffBoard(prev, next)!;
    expect(d.upserts.map((s) => s.id).sort()).toEqual(['b', 'c']);
    expect(d.deletes).toEqual(['a']);
    expect(d.order).toEqual(['b', 'c']);
  });

  it('omits order when only content changed', () => {
    const a = rect('a');
    const d = diffBoard({ shapes: { a }, shapeOrder: ['a'] }, { shapes: { a: { ...a, x: 1 } }, shapeOrder: ['a'] })!;
    expect(d.order).toBeUndefined();
  });
});

describe('attachSync', () => {
  it('saves local edits as diffs and does not echo remote changes', async () => {
    const saved: BoardChanges[] = [];
    let push: ((c: BoardChanges) => void) | null = null;
    const adapter: BoardAdapter = {
      load: async () => ({ shapes: {}, shapeOrder: [] }),
      save: async (changes) => {
        saved.push(changes);
      },
      subscribe: (fn) => {
        push = fn;
        return () => {
          push = null;
        };
      },
    };
    const store = createDrawStore();
    store.dispatch(hydrate(await adapter.load()));
    const sync = attachSync(store, adapter, { debounceMs: 10_000 });

    store.dispatch(addShape({ shape: rect('mine'), record: true }));
    await sync.flush();
    expect(saved).toHaveLength(1);
    expect(saved[0].upserts.map((s) => s.id)).toEqual(['mine']);

    // Someone else adds a shape → applied locally, never saved back
    push!({ upserts: [rect('theirs', 50)], deletes: [] });
    expect(store.getState().canvas.shapes.theirs).toBeDefined();
    await sync.flush();
    expect(saved).toHaveLength(1);

    // A later local edit only sends that shape
    store.dispatch(updateShapes([{ id: 'mine', patch: { x: 99 } }]));
    await sync.flush();
    expect(saved).toHaveLength(2);
    expect(saved[1].upserts.map((s) => s.id)).toEqual(['mine']);
    expect(saved[1].deletes).toEqual([]);
    sync.dispose();
  });

  it('read-only adapters (no save) never write', async () => {
    const adapter = createMemoryAdapter();
    const readOnly: BoardAdapter = { load: adapter.load };
    const store = createDrawStore();
    const sync = attachSync(store, readOnly);
    store.dispatch(addShape({ shape: rect('x'), record: true }));
    await sync.flush();
    expect(adapter.snapshot().shapes).toEqual({});
    sync.dispose();
  });

  it('remote deletes remove the shape and its selection', () => {
    const store = createDrawStore();
    store.dispatch(hydrate({ shapes: { a: rect('a') }, shapeOrder: ['a'] }));
    store.dispatch(applyRemoteChanges({ upserts: [], deletes: ['a'] }));
    expect(store.getState().canvas.shapes.a).toBeUndefined();
    expect(store.getState().canvas.shapeOrder).toEqual([]);
  });
});

describe('createDrawStore', () => {
  it('gives every board its own state', () => {
    const one = createDrawStore();
    const two = createDrawStore();
    one.dispatch(addShape({ shape: rect('only-in-one'), record: true }));
    expect(two.getState().canvas.shapes['only-in-one']).toBeUndefined();
  });
});
