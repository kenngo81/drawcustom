import type { BoardChanges, BoardSnapshot } from '../../store/canvasSlice';
import type { Camera } from '../../types/canvas';

export type { BoardChanges, BoardSnapshot };

/**
 * Where a board's data lives. DrawCustom never talks to a backend itself: the host
 * passes an adapter (localStorage, a JSON file, Firebase, your own API...).
 *
 * Minimal adapter = `load` only (read-only board). Add `save` to make it editable,
 * and `subscribe` to receive other people's changes in realtime.
 */
export interface BoardAdapter {
  /** Initial content. */
  load(): Promise<BoardSnapshot>;

  /**
   * Persist local edits. Called debounced with only what changed since the last call,
   * plus the full current board (simple adapters can just write `full`).
   * Omit to make the board read-only.
   */
  save?(changes: BoardChanges, full: BoardSnapshot): Promise<void>;

  /**
   * Push changes made elsewhere. Return an unsubscribe function.
   * Changes this client saved itself may be echoed back; that is harmless.
   */
  subscribe?(onRemoteChanges: (changes: BoardChanges) => void): () => void;

  /** Remember the camera per viewer (local adapters only; shared boards ignore it). */
  saveCamera?(camera: Camera): void;
}
