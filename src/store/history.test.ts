import { describe, expect, it } from 'vitest';
import { createDrawStore } from '.';
import {
  DEFAULT_STYLE,
  addShape,
  applyRemoteChanges,
  bringToFront,
  deleteSelected,
  recordSnapshot,
  redo,
  selectShapes,
  undo,
  updateShapes,
} from './canvasSlice';
import type { RectShape } from '../types/canvas';

const rect = (id: string, x = 0): RectShape => ({
  id,
  type: 'rect',
  x,
  y: 0,
  width: 10,
  height: 10,
  style: DEFAULT_STYLE,
});

const setup = () => {
  const store = createDrawStore({ user: { id: 'me', name: 'Me' } });
  const shapes = () => store.getState().canvas.shapes;
  const order = () => store.getState().canvas.shapeOrder;
  return { store, d: store.dispatch, shapes, order };
};

describe('undo / redo per operation', () => {
  it('undoes and redoes an add', () => {
    const { d, shapes } = setup();
    d(addShape({ shape: rect('a'), record: true }));
    d(undo());
    expect(shapes().a).toBeUndefined();
    d(redo());
    expect(shapes().a).toBeDefined();
  });

  it('a whole drag (many updates) is one step', () => {
    const { d, shapes } = setup();
    d(addShape({ shape: rect('a', 0), record: true }));
    d(recordSnapshot());
    for (let x = 1; x <= 20; x++) d(updateShapes([{ id: 'a', patch: { x } }]));
    d(undo());
    expect(shapes().a.x).toBe(0);
    d(undo());
    expect(shapes().a).toBeUndefined();
  });

  it('never removes shapes other people added meanwhile', () => {
    const { d, shapes } = setup();
    d(addShape({ shape: rect('mine'), record: true }));
    d(applyRemoteChanges({ upserts: [rect('theirs')], deletes: [] }));
    d(undo());
    expect(shapes().mine).toBeUndefined();
    expect(shapes().theirs).toBeDefined();
  });

  it('keeps a later edit by someone else instead of reverting it', () => {
    const { d, shapes } = setup();
    d(addShape({ shape: rect('a', 0), record: true }));
    d(recordSnapshot());
    d(updateShapes([{ id: 'a', patch: { x: 10 } }])); // my move
    d(recordSnapshot()); // next gesture starts → my move is closed
    d(applyRemoteChanges({ upserts: [{ ...rect('a', 500) }], deletes: [] })); // they move it
    d(undo()); // undo of my move must not clobber theirs
    expect(shapes().a.x).toBe(500);
  });

  it('restores a deleted shape at its old position in the z-order', () => {
    const { d, order } = setup();
    d(addShape({ shape: rect('a'), record: true }));
    d(addShape({ shape: rect('b'), record: true }));
    d(addShape({ shape: rect('c'), record: true }));
    d(selectShapes(['b']));
    d(deleteSelected());
    expect(order()).toEqual(['a', 'c']);
    d(undo());
    expect(order()).toEqual(['a', 'b', 'c']);
  });

  it('undoes a pure re-order', () => {
    const { d, order } = setup();
    d(addShape({ shape: rect('a'), record: true }));
    d(addShape({ shape: rect('b'), record: true }));
    d(selectShapes(['a']));
    d(bringToFront());
    expect(order()).toEqual(['b', 'a']);
    d(undo());
    expect(order()).toEqual(['a', 'b']);
  });

  it('keeps no deep copies: unchanged shapes are shared with history', () => {
    const { store, d } = setup();
    d(addShape({ shape: rect('big'), record: true }));
    d(addShape({ shape: rect('other'), record: true }));
    const big = store.getState().canvas.shapes.big;
    const entry = store.getState().canvas.past[store.getState().canvas.past.length - 1];
    expect(entry.base.big).toBe(big);
  });
});

describe('empty text boxes', () => {
  it('are removed however editing ends', async () => {
    const { setEditingTextId, setTool } = await import('./canvasSlice');
    const { d, shapes } = setup();
    const text = { id: 't1', type: 'text' as const, x: 0, y: 0, width: 50, height: 20, text: '', style: DEFAULT_STYLE };
    d(addShape({ shape: text, record: true }));
    d(setEditingTextId('t1'));
    d(setTool('rect')); // switching tool instead of pressing Escape
    expect(shapes().t1).toBeUndefined();

    d(addShape({ shape: { ...text, id: 't2', text: 'kept' }, record: true }));
    d(setEditingTextId('t2'));
    d(setEditingTextId(null));
    expect(shapes().t2).toBeDefined();
  });
});
