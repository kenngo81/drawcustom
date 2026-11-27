import { describe, expect, it } from 'vitest';
import { createDrawStore } from '.';
import {
  DEFAULT_STYLE,
  addShape,
  clearCanvas,
  deleteSelected,
  duplicateWithIds,
  groupSelected,
  hydrate,
  removeShape,
  selectAll,
  selectShapes,
  setSelectionLocked,
  setUser,
  ungroupSelected,
  updateShapes,
} from './canvasSlice';
import type { RectShape } from '../types/canvas';
import { canEdit, canLock } from '../utils/permissions';

const rect = (id: string, extra: Partial<RectShape> = {}): RectShape => ({
  id,
  type: 'rect',
  x: 0,
  y: 0,
  width: 10,
  height: 10,
  style: DEFAULT_STYLE,
  ...extra,
});

const ALICE = { id: 'alice', name: 'Alice' };
const BOB = { id: 'bob', name: 'Bob' };
const ADMIN = { id: 'root', name: 'Admin', isAdmin: true };

describe('permission rules', () => {
  it('everyone edits unlocked shapes; only owner/admin edit locked ones', () => {
    const open = rect('a', { ownerId: 'alice' });
    const locked = rect('b', { ownerId: 'alice', locked: true });
    expect(canEdit(open, BOB)).toBe(true);
    expect(canEdit(locked, BOB)).toBe(false);
    expect(canEdit(locked, ALICE)).toBe(true);
    expect(canEdit(locked, ADMIN)).toBe(true);
  });

  it('only the owner (or admin) can lock; unowned shapes can be claimed', () => {
    expect(canLock(rect('a', { ownerId: 'alice' }), BOB)).toBe(false);
    expect(canLock(rect('a', { ownerId: 'alice' }), ALICE)).toBe(true);
    expect(canLock(rect('a'), BOB)).toBe(true);
    expect(canLock(rect('a', { ownerId: 'alice' }), ADMIN)).toBe(true);
  });
});

describe('store enforces locks', () => {
  const lockedBoard = () => {
    const store = createDrawStore({ user: ALICE });
    store.dispatch(addShape({ shape: rect('a'), record: true }));
    store.dispatch(addShape({ shape: rect('b'), record: true }));
    store.dispatch(selectShapes(['a']));
    store.dispatch(setSelectionLocked(true));
    store.dispatch(setUser(BOB));
    return store;
  };

  it('stamps the creator as owner', () => {
    const store = createDrawStore({ user: ALICE });
    store.dispatch(addShape({ shape: rect('a'), record: true }));
    expect(store.getState().canvas.shapes.a.ownerId).toBe('alice');
  });

  it("others can't select, move, delete, erase or clear a locked shape", () => {
    const store = lockedBoard();
    const s = () => store.getState().canvas;
    store.dispatch(selectShapes(['a', 'b']));
    expect(s().selectedIds).toEqual(['b']);
    store.dispatch(selectAll());
    expect(s().selectedIds).toEqual(['b']);
    store.dispatch(updateShapes([{ id: 'a', patch: { x: 99 } }]));
    expect(s().shapes.a.x).toBe(0);
    store.dispatch(removeShape({ id: 'a', record: true }));
    expect(s().shapes.a).toBeDefined();
    store.dispatch(clearCanvas());
    expect(Object.keys(s().shapes)).toEqual(['a']);
  });

  it("others can't unlock it, but the owner can", () => {
    const store = lockedBoard();
    store.dispatch(setUser(ALICE));
    store.dispatch(selectShapes(['a']));
    store.dispatch(setSelectionLocked(false));
    expect(store.getState().canvas.shapes.a.locked).toBeUndefined();
  });

  it('a remote lock drops the shape from the local selection', () => {
    const store = createDrawStore({ user: BOB });
    store.dispatch(hydrate({ shapes: { a: rect('a', { ownerId: 'alice' }) }, shapeOrder: ['a'] }));
    store.dispatch(selectShapes(['a']));
    expect(store.getState().canvas.selectedIds).toEqual(['a']);
    store.dispatch(setUser(BOB)); // no-op re-check
    store.dispatch(
      { type: 'canvas/applyRemoteChanges', payload: { upserts: [rect('a', { ownerId: 'alice', locked: true })], deletes: [] } }
    );
    expect(store.getState().canvas.selectedIds).toEqual([]);
  });
});

describe('groups', () => {
  it('selecting one member selects the whole group; ungroup splits it', () => {
    const store = createDrawStore({ user: ALICE });
    const s = () => store.getState().canvas;
    ['a', 'b', 'c'].forEach((id) => store.dispatch(addShape({ shape: rect(id), record: true })));
    store.dispatch(selectShapes(['a', 'b']));
    store.dispatch(groupSelected({ groupId: 'g1' }));
    store.dispatch(selectShapes(['a']));
    expect(s().selectedIds).toEqual(['a', 'b']);
    store.dispatch(ungroupSelected());
    store.dispatch(selectShapes(['a']));
    expect(s().selectedIds).toEqual(['a']);
  });

  it('locking a group locks every member', () => {
    const store = createDrawStore({ user: ALICE });
    ['a', 'b'].forEach((id) => store.dispatch(addShape({ shape: rect(id), record: true })));
    store.dispatch(selectShapes(['a', 'b']));
    store.dispatch(groupSelected({ groupId: 'g1' }));
    store.dispatch(setSelectionLocked(true));
    store.dispatch(setUser(BOB));
    store.dispatch(selectShapes(['a']));
    expect(store.getState().canvas.selectedIds).toEqual([]);
    store.dispatch(deleteSelected());
    expect(Object.keys(store.getState().canvas.shapes)).toEqual(['a', 'b']);
  });

  it('a duplicated locked group belongs to the duplicator, unlocked, in a new group', () => {
    const store = createDrawStore({ user: ALICE });
    ['a', 'b'].forEach((id) => store.dispatch(addShape({ shape: rect(id), record: true })));
    store.dispatch(selectShapes(['a', 'b']));
    store.dispatch(groupSelected({ groupId: 'g1' }));
    store.dispatch(
      duplicateWithIds([
        { sourceId: 'a', newId: 'a2' },
        { sourceId: 'b', newId: 'b2' },
      ])
    );
    const { a2, b2 } = store.getState().canvas.shapes;
    expect(a2.groupId).toBe(b2.groupId);
    expect(a2.groupId).not.toBe('g1');
    expect(a2.ownerId).toBe('alice');
    expect(a2.locked).toBeUndefined();
  });
});
