export type ToolType =
  | 'select'
  | 'hand'
  | 'draw'
  | 'rect'
  | 'ellipse'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'text'
  | 'pin'
  | 'eraser';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export type DashStyle = 'solid' | 'dashed' | 'dotted';
export type BrushType = 'pen' | 'soft' | 'marker' | 'highlighter';
export type FillStyle = 'none' | 'semi' | 'solid' | 'pattern';

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface ShapeStyle {
  stroke: string;
  fill: string;
  fillStyle: FillStyle;
  dash: DashStyle;
  brushType: BrushType;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
}

export interface BaseShape {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style: ShapeStyle;
  /** User id of whoever created it (missing on shapes from older versions = unowned). */
  ownerId?: string;
  /** Shapes sharing a groupId are selected / moved together. */
  groupId?: string;
  /** Locked by its owner: everyone else can only look at it. */
  locked?: boolean;
}

export interface RectShape extends BaseShape {
  type: 'rect';
}

export interface EllipseShape extends BaseShape {
  type: 'ellipse';
}

export interface DiamondShape extends BaseShape {
  type: 'diamond';
}

export interface DrawShape extends BaseShape {
  type: 'draw';
  points: Point[];
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  /** [start, control, end] relative to (x, y). Supports 2-point legacy arrays as well. */
  points: [Point, Point, Point] | [Point, Point];
}

export interface LineShape extends BaseShape {
  type: 'line';
  points: [Point, Point];
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
}

export interface ImageShape extends BaseShape {
  type: 'image';
  src: string;
  aspectRatio: number;
}

export interface StickerShape extends BaseShape {
  type: 'sticker';
  iconId?: string;
  svgMarkup: string;
  viewBox: string;
}

/** Who created something on the board. Placeholder until real auth exists. */
export interface PinAuthor {
  id: string;
  name: string;
}

/**
 * Named location marker. (x, y) is the icon's top-left.
 * - `id`    internal shape id (random, never shown)
 * - `slug`  public primary key: unique on the board, URL-safe, IMMUTABLE once the pin is
 *           first saved — used for the search index, deep links (#pin=slug) and embeds
 * - `title` display text, free to rename, may repeat across pins
 */
export interface PinShape extends BaseShape {
  type: 'pin';
  slug: string;
  title: string;
  createdBy: PinAuthor;
  createdAt: number;
}

export type CanvasShape =
  | PinShape
  | RectShape
  | EllipseShape
  | DiamondShape
  | DrawShape
  | ArrowShape
  | LineShape
  | TextShape
  | ImageShape
  | StickerShape;

export interface CanvasDocument {
  version: 1;
  shapes: Record<string, CanvasShape>;
  shapeOrder: string[];
  camera: Camera;
}
