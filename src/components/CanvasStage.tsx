import React, { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { DEFAULT_FONT_FAMILY } from '../data/fonts';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import {
  addShape,
  clearSelection,
  panBy,
  recordSnapshot,
  removeShape,
  selectShapes,
  setEditingTextId,
  setTool,
  toggleSelectShape,
  updateShapes,
  upsertShapeTransient,
  zoomAt,
} from '../store/canvasSlice';
import type {
  ArrowShape,
  Bounds,
  CanvasShape,
  PinShape,
  Point,
  ResizeHandle,
  TextShape,
} from '../types/canvas';
import {
  boundsIntersect,
  getArrowPoints,
  getSelectionBounds,
  getShapeBounds,
  getShapeCenter,
  hitTestShape,
  normalizeAngle,
  normalizePointsToBox,
  resizeBounds,
  sampleQuadraticBezier,
  scalePointsInBox,
  screenToWorld,
  worldToScreen,
} from '../utils/geometry';
import { createId } from '../utils/id';
import { readImageFileAsShape } from '../utils/image';
import {
  PIN_DEFAULT_COLOR,
  PIN_DEFAULT_TITLE,
  PIN_HEIGHT,
  PIN_WIDTH,
  cleanPinTitle,
  isPin,
  makeUniquePinSlug,
} from '../utils/pins';
import { DEFAULT_STYLE } from '../store/canvasSlice';
import { useFlyTo } from '../utils/useFlyTo';
import { useBoard } from '../lib/context';
import { canEdit } from '../utils/permissions';
import { SelectionOverlay } from './SelectionOverlay';
import { ShapeBoundary } from './ShapeBoundary';
import { ShapeRenderer } from './ShapeRenderer';

type InteractionState =
  | { kind: 'idle' }
  | { kind: 'panning'; lastScreen: Point }
  | { kind: 'marquee'; startWorld: Point; currentWorld: Point }
  | {
      kind: 'moving';
      startWorld: Point;
      initialPositions: Record<string, { x: number; y: number }>;
      hasMoved: boolean;
    }
  | {
      kind: 'resizing';
      handle: ResizeHandle;
      startWorld: Point;
      initialGroupBounds: Bounds;
      initialShapes: Record<string, CanvasShape>;
      hasResized: boolean;
    }
  | {
      kind: 'arrow-handle';
      shapeId: string;
      handleIndex: 0 | 1 | 2;
      worldPoints: [Point, Point, Point];
      hasMoved: boolean;
    }
  | {
      kind: 'creating';
      shapeId: string;
      tool: 'rect' | 'ellipse' | 'diamond' | 'arrow' | 'line';
      startWorld: Point;
      hasDragged: boolean;
    }
  | {
      kind: 'drawing';
      shapeId: string;
      points: Point[];
    }
  | {
      kind: 'rotating';
      center: Point;
      startAngle: number;
      initialRotations: Record<string, number>;
      hasRotated: boolean;
    }
  | { kind: 'erasing' };

export const CanvasStage: React.FC = () => {
  const { readOnly, user, getViewport, isKeyboardActive, onPinOpen, features, background } =
    useBoard();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { flyToPin } = useFlyTo();
  const {
    shapes,
    shapeOrder,
    selectedIds,
    activeTool,
    currentStyle,
    camera,
    editingTextId,
    showGrid,
  } = useAppSelector((s) => s.canvas);

  const stageRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const interactionRef = useRef<InteractionState>({ kind: 'idle' });
  const [spacePressed, setSpacePressed] = useState(false);
  const [marqueeBounds, setMarqueeBounds] = useState<Bounds | null>(null);
  const [pinEdit, setPinEdit] = useState<{ id: string; isNew: boolean; draft: string } | null>(
    null
  );
  const pinEditRef = useRef(pinEdit);
  pinEditRef.current = pinEdit;
  const pinInputRef = useRef<HTMLInputElement>(null);
  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;

  const orderedShapes = useMemo(
    () => shapeOrder.map((id) => shapes[id]).filter((s): s is CanvasShape => Boolean(s)),
    [shapeOrder, shapes]
  );

  const selectedShapes = useMemo(
    () => selectedIds.map((id) => shapes[id]).filter((s): s is CanvasShape => Boolean(s)),
    [selectedIds, shapes]
  );

  const singleArrow =
    selectedShapes.length === 1 && selectedShapes[0].type === 'arrow'
      ? (selectedShapes[0] as ArrowShape)
      : null;

  const selectionBounds = useMemo(
    () => (singleArrow ? null : getSelectionBounds(selectedShapes)),
    [selectedShapes, singleArrow]
  );

  const editingShape = editingTextId ? (shapes[editingTextId] as TextShape | undefined) : undefined;

  const insertImageFiles = useCallback(
    async (files: File[], worldCenter: Point) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        try {
          const shape = await readImageFileAsShape(
            file,
            { x: worldCenter.x + i * 24, y: worldCenter.y + i * 24 },
            currentStyle
          );
          dispatch(addShape({ shape, record: true, select: true }));
          dispatch(setTool('select'));
        } catch {
          // Ignore unreadable image
        }
      }
    },
    [currentStyle, dispatch]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || store.getState().canvas.editingTextId || !isKeyboardActive()) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      // Prevent page scroll / re-clicking a focused toolbar button
      e.preventDefault();
      setSpacePressed(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      if (editingTextId || readOnly || !features.images || !isKeyboardActive()) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        const vp = getViewport();
        const center = screenToWorld({ x: vp.width / 2, y: vp.height / 2 }, camera);
        void insertImageFiles(imageFiles, center);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('paste', onPaste);
    };
  }, [camera, editingTextId, insertImageFiles, readOnly, getViewport, isKeyboardActive, features.images]);

  useLayoutEffect(() => {
    if (!editingTextId) return;
    const focus = () => {
      const el = textAreaRef.current;
      if (!el || document.activeElement === el) return;
      el.focus();
      el.select();
    };
    // Focus as soon as the box exists (so the very first keystroke lands in it), and again
    // after the pointer event finishes in case the browser moved focus meanwhile
    focus();
    const raf = requestAnimationFrame(focus);
    return () => cancelAnimationFrame(raf);
  }, [editingTextId]);

  const startPinEdit = useCallback((pin: PinShape, isNew: boolean) => {
    setPinEdit({ id: pin.id, isNew, draft: pin.title });
  }, []);

  /** Save (or cancel) the pin name being edited. Idempotent: safe to call from blur + pointerdown. */
  const finishPinEdit = useCallback(
    (cancel = false) => {
      const edit = pinEditRef.current;
      if (!edit) return;
      pinEditRef.current = null;
      setPinEdit(null);
      const pin = shapesRef.current[edit.id];
      if (!isPin(pin)) return;
      const title = cleanPinTitle(edit.draft);
      if (cancel || !title) {
        if (edit.isNew) dispatch(removeShape({ id: edit.id, record: false }));
        return;
      }
      if (edit.isNew) {
        // The slug (primary key) is derived from the first title, then frozen forever
        const slug = makeUniquePinSlug(shapesRef.current, title, edit.id);
        dispatch(updateShapes([{ id: edit.id, patch: { title, slug } }]));
        return;
      }
      if (title === pin.title) return;
      dispatch(recordSnapshot());
      dispatch(updateShapes([{ id: edit.id, patch: { title } }]));
    },
    [dispatch]
  );

  useLayoutEffect(() => {
    if (!pinEdit) return;
    const focus = () => {
      const el = pinInputRef.current;
      if (!el || document.activeElement === el) return;
      el.focus();
      el.select();
    };
    focus();
    const raf = requestAnimationFrame(focus);
    return () => cancelAnimationFrame(raf);
    // Only refocus when a different pin starts editing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinEdit?.id]);

  const finishTextEditing = useCallback(() => {
    if (!editingTextId) return;
    const current = shapes[editingTextId];
    if (current && current.type === 'text' && current.text.trim() === '') {
      dispatch(removeShape({ id: editingTextId, record: false }));
    }
    dispatch(setEditingTextId(null));
  }, [dispatch, editingTextId, shapes]);

  const getLocalScreenPoint = useCallback((e: { clientX: number; clientY: number }): Point => {
    const rect = stageRef.current?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };
  }, []);

  /**
   * Topmost shape under the point. By default shapes the user may not edit (locked by
   * someone else) are transparent to clicks, so they can't be selected, moved or erased.
   */
  const findTopShapeAt = useCallback(
    (worldPoint: Point, editableOnly = true): CanvasShape | null => {
      const tolerance = 8 / camera.zoom;
      for (let i = orderedShapes.length - 1; i >= 0; i--) {
        const shape = orderedShapes[i];
        if (editableOnly && !canEdit(shape, user)) continue;
        if (hitTestShape(shape, worldPoint, tolerance)) {
          return shape;
        }
      }
      return null;
    },
    [orderedShapes, camera.zoom, user]
  );

  /** Locked shapes / groups get a small padlock at their top-right corner. */
  const lockBadges = useMemo(() => {
    if (readOnly) return [];
    const boxes = new Map<string, Bounds & { mine: boolean }>();
    for (const shape of orderedShapes) {
      if (!shape.locked) continue;
      const key = shape.groupId ?? shape.id;
      const b = getShapeBounds(shape);
      const prev = boxes.get(key);
      const mine = canEdit(shape, user);
      if (!prev) {
        boxes.set(key, { ...b, mine });
      } else {
        const x = Math.min(prev.x, b.x);
        const y = Math.min(prev.y, b.y);
        boxes.set(key, {
          x,
          y,
          width: Math.max(prev.x + prev.width, b.x + b.width) - x,
          height: Math.max(prev.y + prev.height, b.y + b.height) - y,
          mine: prev.mine && mine,
        });
      }
    }
    return [...boxes.entries()].map(([key, b]) => ({ key, ...b }));
  }, [orderedShapes, readOnly, user]);

  const handleStartResize = useCallback(
    (handle: ResizeHandle, e: React.PointerEvent) => {
      if (!selectionBounds) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const screen = getLocalScreenPoint(e);
      const startWorld = screenToWorld(screen, camera);
      const initialShapes: Record<string, CanvasShape> = {};
      for (const s of selectedShapes) {
        initialShapes[s.id] = structuredClone(s);
      }
      interactionRef.current = {
        kind: 'resizing',
        handle,
        startWorld,
        initialGroupBounds: selectionBounds,
        initialShapes,
        hasResized: false,
      };
    },
    [selectionBounds, getLocalScreenPoint, camera, selectedShapes]
  );

  const handleStartRotate = useCallback(
    (e: React.PointerEvent) => {
      if (selectedShapes.length === 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const screen = getLocalScreenPoint(e);
      const world = screenToWorld(screen, camera);

      // Compute the visual center of the selection
      const sb = getSelectionBounds(selectedShapes);
      const center = sb
        ? { x: sb.x + sb.width / 2, y: sb.y + sb.height / 2 }
        : getShapeCenter(selectedShapes[0]);

      const startAngle = (Math.atan2(world.y - center.y, world.x - center.x) * 180) / Math.PI;
      const initialRotations: Record<string, number> = {};
      for (const s of selectedShapes) {
        initialRotations[s.id] = s.rotation ?? 0;
      }

      interactionRef.current = {
        kind: 'rotating',
        center,
        startAngle,
        initialRotations,
        hasRotated: false,
      };
    },
    [selectedShapes, getLocalScreenPoint, camera]
  );

  const handleStartArrowHandle = useCallback(
    (arrow: ArrowShape, handleIndex: 0 | 1 | 2, e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const [p0, p1, p2] = getArrowPoints(arrow);
      interactionRef.current = {
        kind: 'arrow-handle',
        shapeId: arrow.id,
        handleIndex,
        worldPoints: [
          { x: arrow.x + p0.x, y: arrow.y + p0.y },
          { x: arrow.x + p1.x, y: arrow.y + p1.y },
          { x: arrow.x + p2.x, y: arrow.y + p2.y },
        ],
        hasMoved: false,
      };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editingTextId) {
      finishTextEditing();
    }
    if (pinEditRef.current) {
      finishPinEdit();
    }

    const screen = getLocalScreenPoint(e);
    const world = screenToWorld(screen, camera);

    if (readOnly) {
      // Viewer/embed: tapping a pin flies to it; anything else just pans the board
      const hit = e.button === 0 ? findTopShapeAt(world, false) : null;
      if (isPin(hit)) {
        flyToPin(hit, { select: false });
        onPinOpen?.(hit);
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      interactionRef.current = { kind: 'panning', lastScreen: screen };
      return;
    }

    if (e.button === 1 || activeTool === 'hand' || spacePressed) {
      e.currentTarget.setPointerCapture(e.pointerId);
      interactionRef.current = { kind: 'panning', lastScreen: screen };
      return;
    }

    if (e.button !== 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    if (activeTool === 'eraser') {
      interactionRef.current = { kind: 'erasing' };
      const hit = findTopShapeAt(world);
      if (hit) {
        dispatch(removeShape({ id: hit.id, record: true }));
      }
      return;
    }

    if (activeTool === 'text') {
      // Stop the browser's mousedown default from stealing focus from the new textarea
      e.preventDefault();
      const hit = findTopShapeAt(world);
      if (hit && hit.type === 'text') {
        dispatch(selectShapes([hit.id]));
        dispatch(setEditingTextId(hit.id));
        return;
      }
      const id = createId('text');
      const newShape: TextShape = {
        id,
        type: 'text',
        x: world.x,
        y: world.y,
        width: 140,
        height: currentStyle.fontSize * 1.5,
        text: '',
        style: { ...currentStyle },
      };
      // setTool resets editingTextId, so switch tool BEFORE entering edit mode
      dispatch(setTool('select'));
      dispatch(addShape({ shape: newShape, record: true, select: true }));
      dispatch(setEditingTextId(id));
      return;
    }

    if (activeTool === 'pin') {
      e.preventDefault();
      dispatch(setTool('select'));
      const hit = findTopShapeAt(world);
      if (isPin(hit)) {
        dispatch(selectShapes([hit.id]));
        startPinEdit(hit, false);
        return;
      }
      // The pin's tip sits exactly where the user clicked
      const pin: PinShape = {
        id: createId('pin'),
        type: 'pin',
        slug: makeUniquePinSlug(shapes, PIN_DEFAULT_TITLE),
        title: PIN_DEFAULT_TITLE,
        createdBy: { id: user.id, name: user.name },
        createdAt: Date.now(),
        x: world.x - PIN_WIDTH / 2,
        y: world.y - PIN_HEIGHT,
        width: PIN_WIDTH,
        height: PIN_HEIGHT,
        // Default dark ink → use the pin red; any other picked colour is kept
        style: {
          ...currentStyle,
          stroke:
            currentStyle.stroke === DEFAULT_STYLE.stroke ? PIN_DEFAULT_COLOR : currentStyle.stroke,
        },
      };
      dispatch(addShape({ shape: pin, record: true, select: true }));
      startPinEdit(pin, true);
      return;
    }

    if (activeTool === 'draw') {
      const id = createId('draw');
      dispatch(recordSnapshot());
      const pts = [world];
      const normalized = normalizePointsToBox(pts);
      dispatch(
        upsertShapeTransient({
          id,
          type: 'draw',
          x: normalized.x,
          y: normalized.y,
          width: normalized.width,
          height: normalized.height,
          points: normalized.points,
          style: { ...currentStyle },
        })
      );
      interactionRef.current = { kind: 'drawing', shapeId: id, points: pts };
      return;
    }

    if (
      activeTool === 'rect' ||
      activeTool === 'ellipse' ||
      activeTool === 'diamond' ||
      activeTool === 'arrow' ||
      activeTool === 'line'
    ) {
      const id = createId(activeTool);
      dispatch(recordSnapshot());
      const base = {
        id,
        x: world.x,
        y: world.y,
        width: 1,
        height: 1,
        style: { ...currentStyle },
      };

      const shape: CanvasShape =
        activeTool === 'arrow'
          ? {
              ...base,
              type: 'arrow',
              points: [
                { x: 0, y: 0 },
                { x: 0.5, y: 0.5 },
                { x: 1, y: 1 },
              ],
            }
          : activeTool === 'line'
            ? { ...base, type: 'line', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }
            : { ...base, type: activeTool };

      dispatch(upsertShapeTransient(shape));
      interactionRef.current = {
        kind: 'creating',
        shapeId: id,
        tool: activeTool,
        startWorld: world,
        hasDragged: false,
      };
      return;
    }

    const hit = findTopShapeAt(world);
    if (hit) {
      if (e.shiftKey) {
        dispatch(toggleSelectShape(hit.id));
        return;
      }

      // Grabbing one member of a group drags the whole group
      const activeSelection = selectedIds.includes(hit.id)
        ? selectedIds
        : hit.groupId
          ? orderedShapes
              .filter((sh) => sh.groupId === hit.groupId && canEdit(sh, user))
              .map((sh) => sh.id)
          : [hit.id];
      if (!selectedIds.includes(hit.id)) {
        dispatch(selectShapes([hit.id]));
      }

      const initialPositions: Record<string, { x: number; y: number }> = {};
      for (const sid of activeSelection) {
        const s = shapes[sid];
        if (s) initialPositions[sid] = { x: s.x, y: s.y };
      }

      interactionRef.current = {
        kind: 'moving',
        startWorld: world,
        initialPositions,
        hasMoved: false,
      };
      return;
    }

    if (!e.shiftKey) {
      dispatch(clearSelection());
    }
    interactionRef.current = { kind: 'marquee', startWorld: world, currentWorld: world };
    setMarqueeBounds({ x: world.x, y: world.y, width: 0, height: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = interactionRef.current;
    if (state.kind === 'idle') return;

    const screen = getLocalScreenPoint(e);
    const world = screenToWorld(screen, camera);

    switch (state.kind) {
      case 'panning': {
        const dx = screen.x - state.lastScreen.x;
        const dy = screen.y - state.lastScreen.y;
        state.lastScreen = screen;
        dispatch(panBy({ x: dx, y: dy }));
        break;
      }

      case 'erasing': {
        const hit = findTopShapeAt(world);
        if (hit) {
          dispatch(removeShape({ id: hit.id, record: false }));
        }
        break;
      }

      case 'marquee': {
        state.currentWorld = world;
        const x = Math.min(state.startWorld.x, world.x);
        const y = Math.min(state.startWorld.y, world.y);
        const width = Math.abs(world.x - state.startWorld.x);
        const height = Math.abs(world.y - state.startWorld.y);
        const box = { x, y, width, height };
        setMarqueeBounds(box);

        const hits = orderedShapes
          .filter((s) => boundsIntersect(getShapeBounds(s), box))
          .map((s) => s.id);
        dispatch(selectShapes(hits));
        break;
      }

      case 'moving': {
        const dx = world.x - state.startWorld.x;
        const dy = world.y - state.startWorld.y;
        if (!state.hasMoved && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
          dispatch(recordSnapshot());
          state.hasMoved = true;
        }
        if (state.hasMoved) {
          const updates = Object.entries(state.initialPositions).map(([id, pos]) => ({
            id,
            patch: { x: pos.x + dx, y: pos.y + dy },
          }));
          dispatch(updateShapes(updates));
        }
        break;
      }

      case 'arrow-handle': {
        if (!state.hasMoved) {
          dispatch(recordSnapshot());
          state.hasMoved = true;
        }
        const [wp0, wp1, wp2] = state.worldPoints;
        let next0 = wp0;
        let next1 = wp1;
        let next2 = wp2;

        if (state.handleIndex === 0) {
          next0 = world;
        } else if (state.handleIndex === 2) {
          next2 = world;
        } else {
          // Keep the curve midpoint directly under the cursor at t = 0.5
          next1 = {
            x: 2 * world.x - 0.5 * (wp0.x + wp2.x),
            y: 2 * world.y - 0.5 * (wp0.y + wp2.y),
          };
        }

        state.worldPoints = [next0, next1, next2];
        const curveSamples = sampleQuadraticBezier(next0, next1, next2, 16);
        const box = normalizePointsToBox(curveSamples);
        dispatch(
          updateShapes([
            {
              id: state.shapeId,
              patch: {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
                points: [
                  { x: next0.x - box.x, y: next0.y - box.y },
                  { x: next1.x - box.x, y: next1.y - box.y },
                  { x: next2.x - box.x, y: next2.y - box.y },
                ],
              },
            },
          ])
        );
        break;
      }

      case 'rotating': {
        const curAngle =
          (Math.atan2(world.y - state.center.y, world.x - state.center.x) * 180) / Math.PI;
        let delta = curAngle - state.startAngle;

        // Snap to 15° increments when holding Shift
        if (e.shiftKey) {
          delta = Math.round(delta / 15) * 15;
        }

        if (!state.hasRotated && Math.abs(delta) > 0.5) {
          dispatch(recordSnapshot());
          state.hasRotated = true;
        }
        if (state.hasRotated) {
          const updates = Object.entries(state.initialRotations).map(([id, initRot]) => ({
            id,
            patch: { rotation: normalizeAngle(initRot + delta) },
          }));
          dispatch(updateShapes(updates));
        }
        break;
      }

      case 'resizing': {
        const dx = world.x - state.startWorld.x;
        const dy = world.y - state.startWorld.y;
        if (!state.hasResized) {
          dispatch(recordSnapshot());
          state.hasResized = true;
        }
        const nextGroup = resizeBounds(state.initialGroupBounds, state.handle, dx, dy, 10);
        const scaleX = nextGroup.width / state.initialGroupBounds.width;
        const scaleY = nextGroup.height / state.initialGroupBounds.height;

        const updates = Object.entries(state.initialShapes).map(([id, orig]) => {
          const nx = nextGroup.x + (orig.x - state.initialGroupBounds.x) * scaleX;
          const ny = nextGroup.y + (orig.y - state.initialGroupBounds.y) * scaleY;
          const nw = Math.max(8, orig.width * scaleX);
          const nh = Math.max(8, orig.height * scaleY);

          if (orig.type === 'draw') {
            return {
              id,
              patch: {
                x: nx,
                y: ny,
                width: nw,
                height: nh,
                points: scalePointsInBox(orig.points, orig.width, orig.height, nw, nh),
              },
            };
          }
          if (orig.type === 'arrow') {
            const pts = getArrowPoints(orig);
            const scaled = scalePointsInBox(pts, orig.width, orig.height, nw, nh) as [
              Point,
              Point,
              Point,
            ];
            return {
              id,
              patch: { x: nx, y: ny, width: nw, height: nh, points: scaled },
            };
          }
          if (orig.type === 'line') {
            const scaled = scalePointsInBox(orig.points, orig.width, orig.height, nw, nh) as [
              Point,
              Point,
            ];
            return {
              id,
              patch: { x: nx, y: ny, width: nw, height: nh, points: scaled },
            };
          }
          if (orig.type === 'pin') {
            // Pins scale uniformly (marker + label together), never stretched
            const h = state.handle;
            const s =
              h === 'e' || h === 'w'
                ? scaleX
                : h === 'n' || h === 's'
                  ? scaleY
                  : Math.max(scaleX, scaleY);
            const k = Math.min(12, Math.max(0.4, s));
            const pw = Math.min(orig.width, (orig.height * PIN_WIDTH) / PIN_HEIGHT) * k;
            return {
              id,
              patch: { x: nx, y: ny, width: pw, height: (pw * PIN_HEIGHT) / PIN_WIDTH },
            };
          }
          if (orig.type === 'text') {
            // Dragging the text frame scales the font size
            const h = state.handle;
            const s = h === 'e' || h === 'w' ? scaleX : h === 'n' || h === 's' ? scaleY : (scaleX + scaleY) / 2;
            const baseFont = orig.style.fontSize ?? 22;
            const fontSize = Math.round(Math.min(400, Math.max(8, baseFont * s)));
            const k = fontSize / baseFont;
            return {
              id,
              patch: {
                x: nx,
                y: ny,
                width: Math.max(8, orig.width * k),
                height: Math.max(8, orig.height * k),
                style: { ...orig.style, fontSize },
              },
            };
          }
          return {
            id,
            patch: { x: nx, y: ny, width: nw, height: nh },
          };
        });

        dispatch(updateShapes(updates));
        break;
      }

      case 'drawing': {
        const last = state.points[state.points.length - 1];
        if (Math.hypot(world.x - last.x, world.y - last.y) < 2 / camera.zoom) return;
        state.points.push(world);
        const normalized = normalizePointsToBox(state.points);
        dispatch(
          updateShapes([
            {
              id: state.shapeId,
              patch: {
                x: normalized.x,
                y: normalized.y,
                width: normalized.width,
                height: normalized.height,
                points: normalized.points,
              },
            },
          ])
        );
        break;
      }

      case 'creating': {
        const x = Math.min(state.startWorld.x, world.x);
        const y = Math.min(state.startWorld.y, world.y);
        const width = Math.max(2, Math.abs(world.x - state.startWorld.x));
        const height = Math.max(2, Math.abs(world.y - state.startWorld.y));
        if (width >= 4 || height >= 4) {
          state.hasDragged = true;
        }

        if (state.tool === 'arrow') {
          const p0 = { x: state.startWorld.x - x, y: state.startWorld.y - y };
          const p2 = { x: world.x - x, y: world.y - y };
          const mid = { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 };
          dispatch(
            updateShapes([
              { id: state.shapeId, patch: { x, y, width, height, points: [p0, mid, p2] } },
            ])
          );
        } else if (state.tool === 'line') {
          const p1 = { x: state.startWorld.x - x, y: state.startWorld.y - y };
          const p2 = { x: world.x - x, y: world.y - y };
          dispatch(
            updateShapes([
              { id: state.shapeId, patch: { x, y, width, height, points: [p1, p2] } },
            ])
          );
        } else {
          dispatch(updateShapes([{ id: state.shapeId, patch: { x, y, width, height } }]));
        }
        break;
      }
    }
  };

  const handlePointerUp = () => {
    const state = interactionRef.current;
    if (state.kind === 'creating') {
      if (!state.hasDragged) {
        dispatch(
          updateShapes([
            {
              id: state.shapeId,
              patch:
                state.tool === 'arrow'
                  ? {
                      width: 120,
                      height: 60,
                      points: [
                        { x: 0, y: 30 },
                        { x: 60, y: 0 },
                        { x: 120, y: 30 },
                      ],
                    }
                  : state.tool === 'line'
                    ? { width: 100, height: 60, points: [{ x: 0, y: 0 }, { x: 100, y: 60 }] }
                    : { width: 100, height: 70 },
            },
          ])
        );
      }
      dispatch(selectShapes([state.shapeId]));
      dispatch(setTool('select'));
    }

    if (state.kind === 'marquee') {
      setMarqueeBounds(null);
    }

    interactionRef.current = { kind: 'idle' };
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const screen = getLocalScreenPoint(e);
    const world = screenToWorld(screen, camera);
    const hit = findTopShapeAt(world);
    if (hit && hit.type === 'text') {
      dispatch(selectShapes([hit.id]));
      dispatch(setEditingTextId(hit.id));
    } else if (isPin(hit)) {
      dispatch(selectShapes([hit.id]));
      startPinEdit(hit, false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || !e.shiftKey) {
      const screen = getLocalScreenPoint(e);
      const factor = Math.exp(-e.deltaY * 0.0015);
      dispatch(zoomAt({ screenPoint: screen, nextZoom: camera.zoom * factor }));
    } else {
      dispatch(panBy({ x: -e.deltaY, y: -e.deltaX }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (readOnly || !features.images) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    const screen = getLocalScreenPoint(e);
    const world = screenToWorld(screen, camera);
    void insertImageFiles(files, world);
  };

  const cursor =
    readOnly || activeTool === 'hand' || spacePressed
      ? interactionRef.current.kind === 'panning'
        ? 'grabbing'
        : 'grab'
      : activeTool === 'select'
        ? 'default'
        : activeTool === 'text'
          ? 'text'
          : 'crosshair';

  const gridSize = 24 * camera.zoom;
  const gridStyle: React.CSSProperties = showGrid
    ? {
        backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.18) ${Math.max(0.8, 1.1 * camera.zoom)}px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${camera.x}px ${camera.y}px`,
      }
    : {};

  const pinEditShape = pinEdit ? shapes[pinEdit.id] : undefined;
  const pinSlugPreview =
    pinEdit && isPin(shapes[pinEdit.id])
      ? pinEdit.isNew
        ? makeUniquePinSlug(shapes, cleanPinTitle(pinEdit.draft) || PIN_DEFAULT_TITLE, pinEdit.id)
        : (shapes[pinEdit.id] as PinShape).slug
      : '';
  const pinEditScreenPos = isPin(pinEditShape)
    ? worldToScreen(
        { x: pinEditShape.x + pinEditShape.width / 2, y: pinEditShape.y + pinEditShape.height },
        camera
      )
    : null;

  const editingScreenPos = editingShape
    ? worldToScreen({ x: editingShape.x, y: editingShape.y }, camera)
    : null;

  const renderArrowHandles = (arrow: ArrowShape) => {
    const [p0, p1, p2] = getArrowPoints(arrow);
    const wp0 = { x: arrow.x + p0.x, y: arrow.y + p0.y };
    const wp2 = { x: arrow.x + p2.x, y: arrow.y + p2.y };
    // Point directly on curve at t = 0.5
    const midOnCurve = {
      x: arrow.x + 0.25 * p0.x + 0.5 * p1.x + 0.25 * p2.x,
      y: arrow.y + 0.25 * p0.y + 0.5 * p1.y + 0.25 * p2.y,
    };
    const r = 6 / camera.zoom;
    const sw = 1.8 / camera.zoom;
    const handles: Array<{ idx: 0 | 1 | 2; pt: Point; isMid: boolean }> = [
      { idx: 0, pt: wp0, isMid: false },
      { idx: 1, pt: midOnCurve, isMid: true },
      { idx: 2, pt: wp2, isMid: false },
    ];

    return (
      <g>
        {handles.map((h) => (
          <circle
            key={h.idx}
            cx={h.pt.x}
            cy={h.pt.y}
            r={h.isMid ? r * 0.92 : r}
            fill={h.isMid ? '#2f80ed' : '#ffffff'}
            stroke={h.isMid ? '#ffffff' : '#2f80ed'}
            strokeWidth={sw}
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => handleStartArrowHandle(arrow, h.idx, e)}
          />
        ))}
      </g>
    );
  };

  return (
    <div
      ref={stageRef}
      className="canvas-stage"
      style={{ cursor, ...gridStyle }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <svg className="canvas-svg">
        <defs>
          <filter id="soft-brush-filter" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" />
          </filter>
        </defs>
        <g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
          {background && (
            <image
              className="dc-background"
              href={background.src}
              x={0}
              y={0}
              width={background.width}
              height={background.height}
              preserveAspectRatio="none"
              pointerEvents="none"
            />
          )}

          {/* Only real content lives in this layer: it is what exportSvg() serializes */}
          <g className="dc-shapes">
            {orderedShapes.map((shape) => (
              <ShapeBoundary key={shape.id} id={shape.id}>
                <ShapeRenderer
                  shape={shape}
                  isEditing={shape.id === editingTextId || shape.id === pinEdit?.id}
                />
              </ShapeBoundary>
            ))}
          </g>

          {marqueeBounds && (
            <rect
              x={marqueeBounds.x}
              y={marqueeBounds.y}
              width={marqueeBounds.width}
              height={marqueeBounds.height}
              fill="rgba(47, 128, 237, 0.08)"
              stroke="#2f80ed"
              strokeWidth={1 / camera.zoom}
              strokeDasharray={`${4 / camera.zoom} ${4 / camera.zoom}`}
              pointerEvents="none"
            />
          )}

          {lockBadges.map((b) => {
            const size = 18 / camera.zoom;
            return (
              <g
                key={`lock-${b.key}`}
                transform={`translate(${b.x + b.width - size * 0.4}, ${b.y - size * 0.6}) scale(${size / 24})`}
                pointerEvents="none"
              >
                <title>{b.mine ? 'Bạn đã khoá' : 'Đã khoá bởi người tạo — chỉ xem'}</title>
                <circle cx={12} cy={12} r={12} fill={b.mine ? '#2f80ed' : '#495057'} />
                <rect x={7} y={11} width={10} height={7} rx={1.5} fill="#fff" />
                <path d="M9 11V9a3 3 0 0 1 6 0v2" fill="none" stroke="#fff" strokeWidth={2} />
              </g>
            );
          })}

          {singleArrow && !editingTextId && renderArrowHandles(singleArrow)}

          {selectionBounds && !editingTextId && (
            <SelectionOverlay
              bounds={selectionBounds}
              zoom={camera.zoom}
              rotation={selectedShapes.length === 1 ? (selectedShapes[0].rotation ?? 0) : 0}
              onStartResize={handleStartResize}
              onStartRotate={handleStartRotate}
            />
          )}
        </g>
      </svg>

      {pinEdit && pinEditScreenPos && (
        <label
          className="pin-name-editor"
          style={{
            left: pinEditScreenPos.x,
            top: pinEditScreenPos.y + 6,
            borderColor: isPin(pinEditShape) ? pinEditShape.style.stroke : undefined,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="pin-name-hash">#</span>
        <input
          ref={pinInputRef}
          placeholder={PIN_DEFAULT_TITLE}
          maxLength={80}
          value={pinEdit.draft}
          onChange={(e) => setPinEdit({ ...pinEdit, draft: e.target.value.replace(/^#+/, '') })}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') finishPinEdit();
            if (e.key === 'Escape') finishPinEdit(true);
          }}
          onBlur={() => finishPinEdit()}
        />
          <span className="pin-name-meta">
            ID: <b>{pinSlugPreview}</b>
            {pinEdit.isNew
              ? ' · cố định sau khi lưu'
              : ` · tạo bởi ${(pinEditShape as PinShape).createdBy.name}`}
          </span>
        </label>
      )}

      {editingShape && editingScreenPos && (
        <textarea
          ref={textAreaRef}
          className="inline-text-editor"
          placeholder="Nhập chữ..."
          value={editingShape.text}
          style={{
            left: editingScreenPos.x,
            top: editingScreenPos.y,
            fontSize: (editingShape.style.fontSize ?? 22) * camera.zoom,
            fontFamily: editingShape.style.fontFamily ?? DEFAULT_FONT_FAMILY,
            color: editingShape.style.stroke,
            minWidth: Math.max(150, editingShape.width * camera.zoom),
            minHeight: Math.max(38, editingShape.height * camera.zoom),
          }}
          onChange={(e) => {
            const val = e.target.value;
            const fontSize = editingShape.style.fontSize ?? 22;
            const lines = val.split('\n');
            const longest = Math.max(1, ...lines.map((l) => l.length));
            dispatch(
              updateShapes([
                {
                  id: editingShape.id,
                  patch: {
                    text: val,
                    width: Math.max(90, longest * fontSize * 0.65 + 18),
                    height: Math.max(fontSize * 1.45, lines.length * fontSize * 1.28 + 10),
                  },
                },
              ])
            );
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
              finishTextEditing();
            }
          }}
          onBlur={finishTextEditing}
        />
      )}
    </div>
  );
};
