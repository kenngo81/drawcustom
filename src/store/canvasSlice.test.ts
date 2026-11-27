import { describe, expect, it } from 'vitest';
import reducer, {
  addShape,
  DEFAULT_STYLE,
  deleteSelected,
  duplicateWithIds,
  redo,
  selectShapes,
  setStyle,
  undo,
} from './canvasSlice';
import type { RectShape } from '../types/canvas';

describe('canvasSlice RTK store', () => {
  const sampleRect: RectShape = {
    id: 'rect_1',
    type: 'rect',
    x: 10,
    y: 20,
    width: 100,
    height: 80,
    style: { ...DEFAULT_STYLE },
  };

  it('adds, updates style, deletes, and supports undo/redo', () => {
    let state = reducer(undefined, { type: '@@INIT' });
    state = reducer(state, addShape({ shape: sampleRect, record: true, select: true }));

    expect(state.shapeOrder).toEqual(['rect_1']);
    expect(state.selectedIds).toEqual(['rect_1']);

    state = reducer(
      state,
      setStyle({
        stroke: '#e03131',
        dash: 'dotted',
        brushType: 'soft',
        strokeWidth: 14,
        fontSize: 32,
        fontFamily: "'Mali', cursive",
      })
    );
    expect(state.shapes.rect_1.style.stroke).toBe('#e03131');
    expect(state.shapes.rect_1.style.dash).toBe('dotted');
    expect(state.shapes.rect_1.style.brushType).toBe('soft');
    expect(state.shapes.rect_1.style.strokeWidth).toBe(14);
    expect(state.shapes.rect_1.style.fontFamily).toBe("'Mali', cursive");

    state = reducer(state, deleteSelected());
    expect(state.shapeOrder).toEqual([]);
    expect(state.shapes.rect_1).toBeUndefined();

    state = reducer(state, undo());
    expect(state.shapeOrder).toEqual(['rect_1']);
    expect(state.shapes.rect_1.style.stroke).toBe('#e03131');

    state = reducer(state, redo());
    expect(state.shapeOrder).toEqual([]);
  });

  it('selects only existing shapes and duplicates safely', () => {
    let state = reducer(undefined, { type: '@@INIT' });
    state = reducer(state, addShape({ shape: sampleRect }));
    state = reducer(state, selectShapes(['rect_1', 'missing_id']));
    expect(state.selectedIds).toEqual(['rect_1']);

    state = reducer(state, duplicateWithIds([{ sourceId: 'rect_1', newId: 'rect_copy' }]));
    expect(state.shapeOrder).toEqual(['rect_1', 'rect_copy']);
    expect(state.shapes.rect_copy.x).toBe(34);
    expect(state.selectedIds).toEqual(['rect_copy']);
  });
});
