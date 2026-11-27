import { createContext, useContext, type ReactNode } from 'react';
import type { PinAuthor, PinShape, Point } from '../types/canvas';

export type BoardMode = 'editor' | 'viewer' | 'embed';

/** The person drawing. `id` is used as owner of pins (and, later, locks). */
export interface DrawUser extends PinAuthor {
  isAdmin?: boolean;
}

/** Where the share dialog sends people. */
export type ShareTarget =
  | { pinSlug: string; at?: undefined }
  | { pinSlug?: undefined; at: { center: Point; zoom: number } };

export interface ShareConfig {
  /** Link that opens the board at the target. `embed` = URL for an <iframe>. */
  buildUrl: (target: ShareTarget, opts: { embed: boolean }) => string;
  /** Extra host-specific controls shown in the share dialog (e.g. where the board is published). */
  settings?: ReactNode;
}

export interface BoardFeatures {
  /** Export / import JSON, export SVG. */
  fileMenu: boolean;
  /** "Clear canvas" button. */
  clearCanvas: boolean;
  /** Pin search in the top bar. */
  pinSearch: boolean;
  /** "DrawCustom" label in the top bar. */
  brand: boolean;
  /** Pin tool + pin search. */
  pins: boolean;
  /** Inserting / pasting / dropping images. */
  images: boolean;
}

/**
 * A fixed picture under the drawing (e.g. a photo being annotated). It sits at world
 * (0, 0) with the given size, can't be selected or edited, and is never exported.
 */
export interface BoardBackground {
  src: string;
  width: number;
  height: number;
}

export interface BoardContextValue {
  mode: BoardMode;
  readOnly: boolean;
  user: DrawUser;
  features: BoardFeatures;
  share: ShareConfig | null;
  /** Size of the board element in px (the "screen" for camera maths). */
  viewport: { width: number; height: number };
  /** Read the current size at call time (for event handlers / animations). */
  getViewport: () => { width: number; height: number };
  /** Narrow board (phone, or a small panel in the host page). */
  isCompact: boolean;
  /**
   * Whether window-level keyboard shortcuts / paste belong to this board right now.
   * With several boards on a page, only the one last interacted with reacts.
   */
  isKeyboardActive: () => boolean;
  /** Host callback when a reader opens a pin (viewer/embed click, search result). */
  onPinOpen?: (pin: PinShape) => void;
  openShare: (pinId?: string | null) => void;
  background: BoardBackground | null;
  /** The board's root element (for exporting what is drawn). */
  getRoot: () => HTMLDivElement | null;
  /** First-visit open state of the side panels (a visitor's own choice is remembered after). */
  panelDefaults: PanelDefaults;
}

export interface PanelDefaults {
  /** Colours / stroke panel on the right. Default: open (closed on compact boards). */
  style?: boolean;
  /** Tool dock at the bottom. Default: open. */
  tools?: boolean;
}

export const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoard(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('DrawCustom components must be rendered inside <DrawCustomBoard>');
  return ctx;
}

export const COMPACT_WIDTH = 768;
