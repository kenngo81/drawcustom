import { createSlice, isDraft, original, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_FONT_FAMILY } from '../data/fonts';
import type {
  BrushType,
  Camera,
  CanvasDocument,
  CanvasShape,
  Point,
  ShapeStyle,
  ToolType,
} from '../types/canvas';
import { clampZoom, zoomCameraAt } from '../utils/geometry';
import { makeUniquePinSlug, migratePins } from '../utils/pins';
import { canEdit, canLock, type BoardUser } from '../utils/permissions';
import { normalizeShape, normalizeShapes } from '../utils/normalize';
import { openEntry, redoStep, undoStep, type HistoryEntry } from './history';

export interface CanvasState {
  shapes: Record<string, CanvasShape>;
  shapeOrder: string[];
  selectedIds: string[];
  activeTool: ToolType;
  currentStyle: ShapeStyle;
  camera: Camera;
  editingTextId: string | null;
  showGrid: boolean;
  past: HistoryEntry[];
  future: HistoryEntry[];
  /** Who is editing: drives ownership and lock checks inside every reducer. */
  user: BoardUser;
}

export const ANONYMOUS_USER: BoardUser = { id: 'anonymous', name: 'Khách' };

const MAX_HISTORY = 50;

export const BRUSH_MULTIPLIER: Record<BrushType, number> = {
  pen: 1,
  soft: 1.8,
  marker: 2.2,
  highlighter: 3.4,
};

export const DEFAULT_STYLE: ShapeStyle = {
  stroke: '#1e1e1e',
  fill: '#4dabf7',
  fillStyle: 'none',
  dash: 'solid',
  brushType: 'pen',
  strokeWidth: 3,
  opacity: 1,
  fontSize: 22,
  fontFamily: DEFAULT_FONT_FAMILY,
};

export const DEFAULT_CAMERA: Camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

/** The value as it was before the current action (no copy: boards are immutable). */
function before<T>(value: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return isDraft(value) ? (original(value as any) as T) : value;
}

/**
 * Start a new undoable operation. The previous one is closed at the board state just
 * before this action, and the new one remembers that same state as its starting point.
 */
function pushHistory(state: CanvasState): void {
  const shapes = before(state.shapes);
  const order = before(state.shapeOrder);
  const last = state.past[state.past.length - 1];
  if (last && !last.end) {
    last.end = shapes;
    last.endOrder = order;
  }
  state.past.push(openEntry(shapes, order));
  if (state.past.length > MAX_HISTORY) {
    state.past.shift();
  }
  state.future = [];
}

/** Ids the current user may edit, expanded to whole groups, in z-order. */
function editableSelection(state: CanvasState, ids: Iterable<string>): string[] {
  const picked = new Set<string>();
  const groups = new Set<string>();
  for (const id of ids) {
    const shape = state.shapes[id];
    if (!shape || !canEdit(shape, state.user)) continue;
    picked.add(id);
    if (shape.groupId) groups.add(shape.groupId);
  }
  if (groups.size > 0) {
    for (const id of state.shapeOrder) {
      const shape = state.shapes[id];
      if (shape?.groupId && groups.has(shape.groupId) && canEdit(shape, state.user)) picked.add(id);
    }
  }
  return state.shapeOrder.filter((id) => picked.has(id));
}

/**
 * Stop editing text. A text box left empty is removed — whichever way editing ends
 * (Escape, clicking away, switching tool...). Its creation and removal cancel out in history.
 */
function leaveTextEditing(state: CanvasState): void {
  const id = state.editingTextId;
  state.editingTextId = null;
  if (!id) return;
  const shape = state.shapes[id];
  if (shape?.type === 'text' && shape.text.trim() === '' && canEdit(shape, state.user)) {
    delete state.shapes[id];
    state.shapeOrder = state.shapeOrder.filter((sid) => sid !== id);
    state.selectedIds = state.selectedIds.filter((sid) => sid !== id);
  }
}

function withOwner(shape: CanvasShape, user: BoardUser): CanvasShape {
  return shape.ownerId ? shape : { ...shape, ownerId: user.id };
}

/** Board content shared with adapters (no UI state). */
export interface BoardSnapshot {
  shapes: Record<string, CanvasShape>;
  shapeOrder: string[];
  camera?: Camera;
}

/** A batch of shape changes coming from / going to an adapter. */
export interface BoardChanges {
  upserts: CanvasShape[];
  deletes: string[];
  /** Full z-order, only when it changed. */
  order?: string[];
}

/** Every board starts empty; content arrives through `hydrate` from its adapter. */
export function createInitialState(): CanvasState {
  return {
    shapes: {},
    shapeOrder: [],
    selectedIds: [],
    activeTool: 'select',
    currentStyle: DEFAULT_STYLE,
    camera: DEFAULT_CAMERA,
    editingTextId: null,
    showGrid: true,
    past: [],
    future: [],
    user: ANONYMOUS_USER,
  };
}

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState: createInitialState,
  reducers: {
    setUser(state, action: PayloadAction<BoardUser>) {
      state.user = action.payload;
      state.selectedIds = editableSelection(state, state.selectedIds);
    },

    setTool(state, action: PayloadAction<ToolType>) {
      state.activeTool = action.payload;
      if (action.payload !== 'select') {
        state.selectedIds = [];
      }
      leaveTextEditing(state);
    },

    setCamera(state, action: PayloadAction<Partial<Camera>>) {
      state.camera = {
        ...state.camera,
        ...action.payload,
        zoom: clampZoom(action.payload.zoom ?? state.camera.zoom),
      };
    },

    panBy(state, action: PayloadAction<Point>) {
      state.camera.x += action.payload.x;
      state.camera.y += action.payload.y;
    },

    zoomAt(state, action: PayloadAction<{ screenPoint: Point; nextZoom: number }>) {
      state.camera = zoomCameraAt(state.camera, action.payload.screenPoint, action.payload.nextZoom);
    },

    recordSnapshot(state) {
      pushHistory(state);
    },

    addShape(state, action: PayloadAction<{ shape: CanvasShape; record?: boolean; select?: boolean }>) {
      const { shape, record = true, select = false } = action.payload;
      if (record) pushHistory(state);
      state.shapes[shape.id] = withOwner(shape, state.user);
      if (!state.shapeOrder.includes(shape.id)) {
        state.shapeOrder.push(shape.id);
      }
      if (select) {
        state.selectedIds = [shape.id];
      }
    },

    upsertShapeTransient(state, action: PayloadAction<CanvasShape>) {
      const shape = action.payload;
      const existing = state.shapes[shape.id];
      if (existing && !canEdit(existing, state.user)) return;
      state.shapes[shape.id] = withOwner(shape, state.user);
      if (!state.shapeOrder.includes(shape.id)) {
        state.shapeOrder.push(shape.id);
      }
    },

    updateShapes(state, action: PayloadAction<Array<{ id: string; patch: Partial<CanvasShape> }>>) {
      for (const { id, patch } of action.payload) {
        const existing = state.shapes[id];
        if (existing && canEdit(existing, state.user)) {
          state.shapes[id] = { ...existing, ...patch } as CanvasShape;
        }
      }
    },

    removeShape(state, action: PayloadAction<{ id: string; record?: boolean }>) {
      const { id, record = true } = action.payload;
      if (!canEdit(state.shapes[id], state.user)) return;
      if (record) pushHistory(state);
      delete state.shapes[id];
      state.shapeOrder = state.shapeOrder.filter((sid) => sid !== id);
      state.selectedIds = state.selectedIds.filter((sid) => sid !== id);
    },

    selectShapes(state, action: PayloadAction<string[]>) {
      state.selectedIds = editableSelection(state, action.payload);
    },

    toggleSelectShape(state, action: PayloadAction<string>) {
      const id = action.payload;
      const members = editableSelection(state, [id]);
      if (members.length === 0) return;
      if (state.selectedIds.includes(id)) {
        const drop = new Set(members);
        state.selectedIds = state.selectedIds.filter((sid) => !drop.has(sid));
      } else {
        state.selectedIds = editableSelection(state, [...state.selectedIds, ...members]);
      }
    },

    clearSelection(state) {
      state.selectedIds = [];
    },

    selectAll(state) {
      state.selectedIds = editableSelection(state, state.shapeOrder);
    },

    deleteSelected(state) {
      const ids = editableSelection(state, state.selectedIds);
      if (ids.length === 0) return;
      pushHistory(state);
      const toDelete = new Set(ids);
      for (const id of toDelete) {
        delete state.shapes[id];
      }
      state.shapeOrder = state.shapeOrder.filter((id) => !toDelete.has(id));
      state.selectedIds = [];
      state.editingTextId = null;
    },

    setStyle(state, action: PayloadAction<Partial<ShapeStyle>>) {
      const nextPatch = { ...action.payload };
      state.currentStyle = { ...state.currentStyle, ...nextPatch };
      const ids = editableSelection(state, state.selectedIds);
      if (ids.length > 0) {
        pushHistory(state);
        for (const id of ids) {
          const shape = state.shapes[id];
          if (shape) {
            shape.style = { ...shape.style, ...nextPatch };
          }
        }
      }
    },

    bringToFront(state) {
      const ids = editableSelection(state, state.selectedIds);
      if (ids.length === 0) return;
      pushHistory(state);
      const selected = new Set(ids);
      state.shapeOrder = [
        ...state.shapeOrder.filter((id) => !selected.has(id)),
        ...state.shapeOrder.filter((id) => selected.has(id)),
      ];
    },

    sendToBack(state) {
      const ids = editableSelection(state, state.selectedIds);
      if (ids.length === 0) return;
      pushHistory(state);
      const selected = new Set(ids);
      state.shapeOrder = [
        ...state.shapeOrder.filter((id) => selected.has(id)),
        ...state.shapeOrder.filter((id) => !selected.has(id)),
      ];
    },

    duplicateWithIds: {
      // prepare() captures the impure "now"; who duplicates comes from state.user
      prepare(items: Array<{ sourceId: string; newId: string }>) {
        return { payload: items, meta: { now: Date.now() } };
      },
      reducer(
        state,
        action: PayloadAction<Array<{ sourceId: string; newId: string }>, string, { now: number }>
      ) {
        const sources = action.payload.filter(({ sourceId }) =>
          canEdit(state.shapes[sourceId], state.user)
        );
        if (sources.length === 0) return;
        pushHistory(state);
        const nextSelected: string[] = [];
        const groupMap = new Map<string, string>();
        for (const { sourceId, newId } of sources) {
          const src = before(state.shapes[sourceId]);
          const copy = structuredClone(src);
          copy.id = newId;
          copy.x += 24;
          copy.y += 24;
          // A copy belongs to whoever made it, unlocked, in its own copy of the group
          copy.ownerId = state.user.id;
          delete copy.locked;
          if (copy.groupId) {
            if (!groupMap.has(copy.groupId)) groupMap.set(copy.groupId, `grp_${newId}`);
            copy.groupId = groupMap.get(copy.groupId);
          }
          if (copy.type === 'pin') {
            // A copy is a new pin: new primary key
            copy.slug = makeUniquePinSlug(state.shapes, copy.slug);
            copy.createdBy = { id: state.user.id, name: state.user.name };
            copy.createdAt = action.meta.now;
          }
          state.shapes[newId] = copy;
          state.shapeOrder.push(newId);
          nextSelected.push(newId);
        }
        state.selectedIds = nextSelected;
      },
    },

    /** Selected shapes move and select together from now on. Needs 2+ shapes. */
    groupSelected(state, action: PayloadAction<{ groupId: string }>) {
      const ids = editableSelection(state, state.selectedIds);
      if (ids.length < 2) return;
      pushHistory(state);
      for (const id of ids) {
        state.shapes[id] = { ...state.shapes[id], groupId: action.payload.groupId };
      }
      state.selectedIds = ids;
    },

    ungroupSelected(state) {
      const ids = editableSelection(state, state.selectedIds).filter(
        (id) => state.shapes[id].groupId
      );
      if (ids.length === 0) return;
      pushHistory(state);
      for (const id of ids) {
        const { groupId: _dropped, ...rest } = state.shapes[id];
        state.shapes[id] = rest as CanvasShape;
      }
    },

    /**
     * Lock / unlock the selection. Only shapes the user owns (or, for admins, any) change;
     * locking an unowned shape claims it. Others then can only view locked shapes.
     */
    setSelectionLocked(state, action: PayloadAction<boolean>) {
      const locked = action.payload;
      const ids = editableSelection(state, state.selectedIds).filter(
        (id) => canLock(state.shapes[id], state.user) && Boolean(state.shapes[id].locked) !== locked
      );
      if (ids.length === 0) return;
      pushHistory(state);
      for (const id of ids) {
        const shape = state.shapes[id];
        if (locked) {
          state.shapes[id] = { ...shape, locked: true, ownerId: shape.ownerId ?? state.user.id };
        } else {
          const { locked: _dropped, ...rest } = shape;
          state.shapes[id] = rest as CanvasShape;
        }
      }
    },

    undo(state) {
      const s = original(state)!;
      const next = undoStep(s);
      if (!next) return;
      state.shapes = next.shapes;
      state.shapeOrder = next.shapeOrder;
      state.past = next.past;
      state.future = next.future;
      state.selectedIds = state.selectedIds.filter((id) => Boolean(next.shapes[id]));
      state.editingTextId = null;
    },

    redo(state) {
      const s = original(state)!;
      const next = redoStep(s);
      if (!next) return;
      state.shapes = next.shapes;
      state.shapeOrder = next.shapeOrder;
      state.past = next.past;
      state.future = next.future;
      state.selectedIds = state.selectedIds.filter((id) => Boolean(next.shapes[id]));
      state.editingTextId = null;
    },

    setEditingTextId(state, action: PayloadAction<string | null>) {
      if (state.editingTextId !== action.payload) leaveTextEditing(state);
      state.editingTextId = action.payload;
    },

    toggleGrid(state) {
      state.showGrid = !state.showGrid;
    },

    /** Replace the board with what the adapter loaded. Not undoable. */
    hydrate(state, action: PayloadAction<BoardSnapshot>) {
      // Untrusted input (other people's data): keep only drawable shapes
      state.shapes = migratePins(normalizeShapes(action.payload.shapes, DEFAULT_STYLE));
      state.shapeOrder = (action.payload.shapeOrder ?? []).filter((id) => Boolean(state.shapes[id]));
      // Shapes missing from the order (e.g. written by another client) go on top
      for (const id of Object.keys(state.shapes)) {
        if (!state.shapeOrder.includes(id)) state.shapeOrder.push(id);
      }
      if (action.payload.camera) state.camera = action.payload.camera;
      state.selectedIds = [];
      state.editingTextId = null;
      state.past = [];
      state.future = [];
    },

    /** Changes made by someone else (realtime adapters). Not undoable. */
    applyRemoteChanges(state, action: PayloadAction<BoardChanges>) {
      const { deletes, order } = action.payload;
      const upserts = action.payload.upserts
        .map((raw) => normalizeShape(raw, DEFAULT_STYLE))
        .filter((shape): shape is CanvasShape => shape !== null);
      // The operation in progress must never revert what others just did
      const open = state.past[state.past.length - 1];
      if (open && !open.end) {
        open.excluded.push(...deletes, ...upserts.map((shape) => shape.id));
      }
      for (const id of deletes) {
        delete state.shapes[id];
      }
      const removed = new Set(deletes);
      for (const shape of upserts) {
        state.shapes[shape.id] = shape;
      }
      if (order) {
        state.shapeOrder = order.filter((id) => Boolean(state.shapes[id]));
      } else if (removed.size > 0) {
        state.shapeOrder = state.shapeOrder.filter((id) => !removed.has(id));
      }
      const inOrder = new Set(state.shapeOrder);
      for (const shape of upserts) {
        if (!inOrder.has(shape.id)) state.shapeOrder.push(shape.id);
      }
      // Someone may have locked a shape this user had selected
      state.selectedIds = editableSelection(state, state.selectedIds);
      if (state.editingTextId && !canEdit(state.shapes[state.editingTextId], state.user)) {
        state.editingTextId = null;
      }
    },

    loadDocument(state, action: PayloadAction<CanvasDocument>) {
      pushHistory(state);
      // Importing a file never removes what others locked
      const kept = Object.values(state.shapes).filter((sh) => !canEdit(sh, state.user));
      state.shapes = migratePins(normalizeShapes(action.payload.shapes, DEFAULT_STYLE));
      state.shapeOrder = action.payload.shapeOrder.filter((id) => Boolean(state.shapes[id]));
      for (const sh of kept) {
        state.shapes[sh.id] = sh;
        if (!state.shapeOrder.includes(sh.id)) state.shapeOrder.push(sh.id);
      }
      state.camera = action.payload.camera ?? DEFAULT_CAMERA;
      state.selectedIds = [];
      state.editingTextId = null;
    },

    clearCanvas(state) {
      // Clears what this user may edit; others' locked shapes stay
      const removable = state.shapeOrder.filter((id) => canEdit(state.shapes[id], state.user));
      if (removable.length === 0) return;
      pushHistory(state);
      const gone = new Set(removable);
      for (const id of removable) delete state.shapes[id];
      state.shapeOrder = state.shapeOrder.filter((id) => !gone.has(id));
      state.selectedIds = [];
      state.editingTextId = null;
    },
  },
});

export const {
  setUser,
  groupSelected,
  ungroupSelected,
  setSelectionLocked,
  setTool,
  setCamera,
  panBy,
  zoomAt,
  recordSnapshot,
  addShape,
  upsertShapeTransient,
  updateShapes,
  removeShape,
  selectShapes,
  toggleSelectShape,
  clearSelection,
  selectAll,
  deleteSelected,
  setStyle,
  bringToFront,
  sendToBack,
  duplicateWithIds,
  undo,
  redo,
  setEditingTextId,
  toggleGrid,
  loadDocument,
  clearCanvas,
  hydrate,
  applyRemoteChanges,
} = canvasSlice.actions;

export default canvasSlice.reducer;
