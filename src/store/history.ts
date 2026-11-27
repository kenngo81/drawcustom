import type { CanvasShape } from '../types/canvas';

type ShapeMap = Record<string, CanvasShape>;

/**
 * One undoable operation, stored as references to the (immutable) board before and
 * after it — no deep copies, so history stays cheap on boards with thousands of shapes.
 *
 * An entry is "open" (end = null) from the moment an operation starts until the next one
 * starts (or undo is pressed), so follow-up edits of the same gesture (dragging, typing)
 * belong to it.
 */
export interface HistoryEntry {
  base: ShapeMap;
  baseOrder: string[];
  end: ShapeMap | null;
  endOrder: string[] | null;
  /** Shapes changed by other people while this entry was open: never reverted by it. */
  excluded: string[];
}

export function openEntry(shapes: ShapeMap, order: string[]): HistoryEntry {
  return { base: shapes, baseOrder: order, end: null, endOrder: null, excluded: [] };
}

export function closeEntry(entry: HistoryEntry, shapes: ShapeMap, order: string[]): HistoryEntry {
  return entry.end ? entry : { ...entry, end: shapes, endOrder: order };
}

/** Ids whose shape differs between two maps. */
function changedIds(a: ShapeMap, b: ShapeMap): string[] {
  const ids: string[] = [];
  for (const id in a) if (a[id] !== b[id]) ids.push(id);
  for (const id in b) if (!(id in a)) ids.push(id);
  return ids;
}

/**
 * Move the board from `from` to `to` for the shapes this entry touched — but only where
 * the board still matches `from`. A shape someone else edited (or deleted) since is
 * left alone: undo never overwrites other people's work.
 */
function applyEntry(
  shapes: ShapeMap,
  order: string[],
  from: ShapeMap,
  fromOrder: string[],
  to: ShapeMap,
  toOrder: string[],
  excluded: string[]
): { shapes: ShapeMap; order: string[] } | null {
  const skip = new Set(excluded);
  let applied = false;
  const next: ShapeMap = { ...shapes };
  for (const id of changedIds(from, to)) {
    if (skip.has(id)) continue;
    if (shapes[id] !== from[id]) continue; // changed by someone else since
    if (to[id]) next[id] = to[id];
    else delete next[id];
    applied = true;
  }

  // Order: the target order for shapes it knows, then everything else (e.g. shapes
  // added by others meanwhile) in its current relative position
  const inTarget = new Set(toOrder);
  const merged = toOrder.filter((id) => id in next);
  for (const id of order) if (id in next && !inTarget.has(id)) merged.push(id);
  const placed = new Set(merged);
  for (const id in next) if (!placed.has(id)) merged.push(id);

  // A pure re-order (bring to front / send to back) counts as a change too
  const reordered = fromOrder !== toOrder && !sameArray(order, merged);
  if (!applied && !reordered) return null;
  return { shapes: next, order: merged };
}

function sameArray(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export interface HistoryState {
  shapes: ShapeMap;
  shapeOrder: string[];
  past: HistoryEntry[];
  future: HistoryEntry[];
}

/** Undo the most recent operation that still has something to revert. */
export function undoStep(s: HistoryState): HistoryState | null {
  const past = [...s.past];
  while (past.length > 0) {
    const entry = closeEntry(past.pop()!, s.shapes, s.shapeOrder);
    const result = applyEntry(
      s.shapes,
      s.shapeOrder,
      entry.end!,
      entry.endOrder!,
      entry.base,
      entry.baseOrder,
      entry.excluded
    );
    if (result) {
      return { shapes: result.shapes, shapeOrder: result.order, past, future: [...s.future, entry] };
    }
    // Nothing left to revert (empty gesture, or fully overwritten by others): drop it
  }
  return s.past.length > 0 ? { ...s, past: [] } : null;
}

export function redoStep(s: HistoryState): HistoryState | null {
  const future = [...s.future];
  while (future.length > 0) {
    const entry = future.pop()!;
    const result = applyEntry(
      s.shapes,
      s.shapeOrder,
      entry.base,
      entry.baseOrder,
      entry.end!,
      entry.endOrder!,
      entry.excluded
    );
    if (result) {
      return { shapes: result.shapes, shapeOrder: result.order, past: [...s.past, entry], future };
    }
  }
  return s.future.length > 0 ? { ...s, future: [] } : null;
}
