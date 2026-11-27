/**
 * DrawCustom — embeddable infinite whiteboard with named, shareable pins.
 *
 *   import { DrawCustomBoard, createLocalStorageAdapter } from 'drawcustom';
 *   import 'drawcustom/style.css';
 *
 *   const adapter = useMemo(() => createLocalStorageAdapter(), []);
 *   <div style={{ height: 600 }}><DrawCustomBoard adapter={adapter} /></div>
 */
import '../styles/app.css';

export { DrawCustomBoard } from './DrawCustomBoard';
export type {
  DrawCustomApi,
  DrawCustomBoardProps,
  InitialTarget,
} from './DrawCustomBoard';
export { DrawCustomAnnotator } from './DrawCustomAnnotator';
export type { AnnotationResult, DrawCustomAnnotatorProps } from './DrawCustomAnnotator';
export { buildSvgDocument, getContentBounds, svgToDataUrl } from './exportSvg';
export type { SvgExport } from './exportSvg';
export type {
  BoardBackground,
  BoardFeatures,
  BoardMode,
  DrawUser,
  PanelDefaults,
  ShareConfig,
  ShareTarget,
} from './context';

export type { BoardAdapter, BoardChanges, BoardSnapshot } from './adapters/types';
export {
  createJsonUrlAdapter,
  createLocalStorageAdapter,
  createMemoryAdapter,
} from './adapters/local';
export { diffBoard } from './sync';
export { orderByZ, planZOrder } from './zorder';
export { DRAWCUSTOM_FONTS_URL, ensureDrawCustomFonts } from './fonts';

export type {
  CanvasDocument,
  CanvasShape,
  ToolType,
  PinAuthor,
  PinShape,
  Point,
} from '../types/canvas';
export {
  findPinBySlug,
  formatPinTitle,
  isPin,
  migratePins,
  searchPins,
  slugify,
} from '../utils/pins';
export { downloadDocument, fetchBoard, isCanvasDocument } from '../utils/boardIO';
export { canEdit, canLock, ownerOf } from '../utils/permissions';
export type { BoardUser } from '../utils/permissions';
export { buildShareUrl, parseLaunchParams } from '../utils/launch';
