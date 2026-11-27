import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Provider } from 'react-redux';
import { CanvasStage } from '../components/CanvasStage';
import { ShareDialog } from '../components/ShareDialog';
import { StylePanel } from '../components/StylePanel';
import { Toolbar } from '../components/Toolbar';
import { TopBar } from '../components/TopBar';
import { DrawReduxContext, createDrawStore, useAppStore } from '../store';
import { DEFAULT_STYLE, hydrate, setUser } from '../store/canvasSlice';
import type { PinShape, Point, ShapeStyle, ToolType } from '../types/canvas';
import { findPinBySlug, searchPins } from '../utils/pins';
import { getCurrentUser } from '../utils/user';
import { fitContentTarget, useFlyTo } from '../utils/useFlyTo';
import type { BoardAdapter, BoardSnapshot } from './adapters/types';
import {
  BoardContext,
  COMPACT_WIDTH,
  type BoardContextValue,
  type BoardFeatures,
  type BoardBackground,
  type BoardMode,
  type DrawUser,
  type PanelDefaults,
  type ShareConfig,
  useBoard,
} from './context';
import { attachSync } from './sync';
import { exportBoardSvg, type SvgExport } from './exportSvg';
import { ensureDrawCustomFonts } from './fonts';

/** Imperative handle passed to `onReady`. */
export interface DrawCustomApi {
  /** Fly to a pin by its slug. Returns false if no such pin. */
  flyToPin: (slug: string, opts?: { animate?: boolean }) => boolean;
  flyTo: (center: Point, zoom: number, animate?: boolean) => void;
  fitContent: (animate?: boolean) => void;
  searchPins: (query: string) => PinShape[];
  getSnapshot: () => BoardSnapshot;
  /** Save pending edits now (e.g. before navigating away). */
  flush: () => Promise<void>;
  /**
   * The drawing as a standalone SVG cropped to its content (null if empty).
   * `bounds` are board units — with a `background`, 1 unit = 1 background pixel.
   */
  exportSvg: (opts?: { padding?: number }) => SvgExport | null;
}

export interface InitialTarget {
  /** Center the view on this pin. If it doesn't exist (any more), all content is fitted. */
  pinSlug?: string | null;
  at?: { center: Point; zoom: number } | null;
  /** Fit all content first (default: true for viewer/embed). */
  fit?: boolean;
  /** Zoom used when centering on `pinSlug` (default 1.5). */
  zoom?: number;
  /**
   * Instead of a fixed zoom: how many board units should be visible across the board's
   * width. The same area then shows on every screen size (wide desktop or narrow phone).
   */
  viewWidth?: number;
  /** Glide to the pin (default: only after showing the overview in viewer/embed). */
  animate?: boolean;
}

export interface DrawCustomBoardProps {
  /** Where the data lives. Keep it stable (useMemo) — a new adapter reloads the board. */
  adapter: BoardAdapter;
  /** editor (default) · viewer = read-only page · embed = read-only, minimal chrome. */
  mode?: BoardMode;
  /** Current person; defaults to an anonymous id remembered in this browser. */
  user?: DrawUser;
  initialTarget?: InitialTarget;
  /**
   * 'focus' (default): shortcuts only after the user interacts with this board —
   * right for boards inside a page. 'global': always (full-screen apps).
   */
  keyboard?: 'focus' | 'global';
  features?: Partial<BoardFeatures>;
  /** Enables the share dialog. */
  share?: ShareConfig | null;
  onPinOpen?: (pin: PinShape) => void;
  /**
   * Load the board's text fonts (Google Fonts) automatically. Default true; set false if
   * the host page already provides them (or must not contact Google).
   */
  loadFonts?: boolean;
  /**
   * Tool selected when the board opens. Use 'hand' on public boards so visitors pan around
   * instead of accidentally moving things; they press V (select) to edit.
   */
  defaultTool?: ToolType;
  /** Whether the side panels start open on a visitor's first visit. */
  panels?: PanelDefaults;
  /** Initial pen / text style (colour, width, font size...). */
  defaultStyle?: Partial<ShapeStyle>;
  /** Fixed picture under the drawing (image annotation). See BoardBackground. */
  background?: BoardBackground | null;
  onReady?: (api: DrawCustomApi) => void;
  onError?: (error: unknown) => void;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_FEATURES: BoardFeatures = {
  fileMenu: true,
  clearCanvas: true,
  pinSearch: true,
  brand: true,
  pins: true,
  images: true,
};

type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

export const DrawCustomBoard: React.FC<DrawCustomBoardProps> = (props) => {
  const {
    adapter,
    mode = 'editor',
    keyboard = 'focus',
    share = null,
    onError,
    className,
    style,
  } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [shareFor, setShareFor] = useState<{ pinId: string | null } | null>(null);
  const activeRef = useRef(keyboard === 'global');
  const syncRef = useRef<ReturnType<typeof attachSync> | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const readOnly = mode !== 'editor' || !adapter.save;
  const user = useMemo<DrawUser>(() => props.user ?? getCurrentUser(), [props.user]);
  // Ownership / lock checks run inside the store, so it must always know who is editing
  const [store] = useState(() =>
    createDrawStore({
      user,
      ...(props.defaultTool ? { activeTool: props.defaultTool } : {}),
      ...(props.defaultStyle ? { currentStyle: { ...DEFAULT_STYLE, ...props.defaultStyle } } : {}),
    })
  );
  useLayoutEffect(() => {
    if (store.getState().canvas.user !== user) store.dispatch(setUser(user));
  }, [store, user]);
  const features = useMemo<BoardFeatures>(
    () => ({ ...DEFAULT_FEATURES, ...props.features }),
    [props.features]
  );

  // Text on the board uses its own fonts: make sure they exist on whatever page hosts it
  useEffect(() => {
    if (props.loadFonts !== false) ensureDrawCustomFonts();
  }, [props.loadFonts]);

  // Board size = the "screen" for all camera maths
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setViewport((v) =>
        v.width === Math.round(r.width) && v.height === Math.round(r.height)
          ? v
          : { width: Math.round(r.width), height: Math.round(r.height) }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keyboard scope: the board the user last pressed / focused owns the shortcuts
  useEffect(() => {
    if (keyboard === 'global') {
      activeRef.current = true;
      return;
    }
    const update = (e: Event) => {
      activeRef.current = Boolean(rootRef.current?.contains(e.target as Node));
    };
    window.addEventListener('pointerdown', update, true);
    window.addEventListener('focusin', update, true);
    return () => {
      window.removeEventListener('pointerdown', update, true);
      window.removeEventListener('focusin', update, true);
    };
  }, [keyboard]);

  // Load from the adapter, then keep it in sync
  useEffect(() => {
    let cancelled = false;
    setLoad({ status: 'loading' });
    adapter
      .load()
      .then((snapshot) => {
        if (cancelled) return;
        store.dispatch(hydrate(snapshot));
        // Read-only boards may still receive live updates, but never write
        const effective: BoardAdapter = readOnly
          ? { load: adapter.load, subscribe: adapter.subscribe?.bind(adapter) }
          : adapter;
        syncRef.current = attachSync(store, effective, {
          onError: (e) => onErrorRef.current?.(e),
        });
        setLoad({ status: 'ready' });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        onErrorRef.current?.(e);
        setLoad({ status: 'error', message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      cancelled = true;
      syncRef.current?.dispose();
      syncRef.current = null;
    };
  }, [adapter, readOnly, store]);

  // Save pending edits when the tab is hidden / closed
  useEffect(() => {
    const onHide = () => void syncRef.current?.flush();
    window.addEventListener('pagehide', onHide);
    const onVisibility = () => document.visibilityState === 'hidden' && onHide();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const getViewport = useCallback(() => {
    const el = rootRef.current;
    return el
      ? { width: el.clientWidth, height: el.clientHeight }
      : { width: window.innerWidth, height: window.innerHeight };
  }, []);

  const ctx = useMemo<BoardContextValue>(
    () => ({
      mode,
      readOnly,
      user,
      features,
      share,
      viewport,
      getViewport,
      isCompact: viewport.width > 0 && viewport.width < COMPACT_WIDTH,
      isKeyboardActive: () => activeRef.current,
      onPinOpen: props.onPinOpen,
      openShare: (pinId = null) => setShareFor({ pinId }),
      background: props.background ?? null,
      getRoot: () => rootRef.current,
      panelDefaults: props.panels ?? {},
    }),
    [mode, readOnly, user, features, share, viewport, getViewport, props.onPinOpen, props.background, props.panels]
  );

  return (
    <div
      ref={rootRef}
      className={`dc-root mode-${mode}${ctx.isCompact ? ' is-compact' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {viewport.width > 0 && (
        <Provider store={store} context={DrawReduxContext}>
          <BoardContext.Provider value={ctx}>
            <CanvasStage />
            <TopBar />
            {!readOnly && <StylePanel />}
            {!readOnly && <Toolbar />}
            {load.status === 'ready' && (
              <BoardLifecycle
                initialTarget={props.initialTarget}
                onReady={props.onReady}
                flush={() => syncRef.current?.flush() ?? Promise.resolve()}
              />
            )}
            {load.status !== 'ready' && (
              <div className="board-status">
                {load.status === 'loading' ? (
                  'Đang tải bảng…'
                ) : (
                  <>
                    <b>Không tải được bảng</b>
                    <span>{load.message}</span>
                  </>
                )}
              </div>
            )}
            {shareFor && share && (
              <ShareDialog initialPinId={shareFor.pinId} onClose={() => setShareFor(null)} />
            )}
          </BoardContext.Provider>
        </Provider>
      )}
    </div>
  );
};

/** Runs once the board is loaded: initial camera, then hands the API to the host. */
const BoardLifecycle: React.FC<{
  initialTarget?: InitialTarget;
  onReady?: (api: DrawCustomApi) => void;
  flush: () => Promise<void>;
}> = ({ initialTarget, onReady, flush }) => {
  const store = useAppStore();
  const { mode, getViewport, background, getRoot } = useBoard();
  const { flyTo, flyToPin } = useFlyTo();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const select = mode === 'editor';
    const shapes = () => store.getState().canvas.shapes;

    const backgroundBox = background
      ? { x: 0, y: 0, width: background.width, height: background.height }
      : null;
    const fitContent = (animate = false) => {
      const fit = fitContentTarget(Object.values(shapes()), getViewport(), {
        extra: backgroundBox,
        // Annotating: keep a margin around the picture to draw outside it
        fill: backgroundBox ? 0.8 : 1,
      });
      if (fit) flyTo(fit.center, fit.zoom, animate);
      return Boolean(fit);
    };

    const shouldFit = initialTarget?.fit ?? (mode !== 'editor' || Boolean(background));
    const fitted = shouldFit ? fitContent(false) : false;
    const pin = initialTarget?.pinSlug ? findPinBySlug(shapes(), initialTarget.pinSlug) : undefined;
    if (pin) {
      const vp = getViewport();
      const zoom = initialTarget?.viewWidth
        ? vp.width / initialTarget.viewWidth
        : initialTarget?.zoom;
      const animate = initialTarget?.animate ?? fitted;
      // Viewer/embed: start from the overview, then glide to the pin so readers see where it is
      window.setTimeout(
        () => flyToPin(pin, { select: select && !initialTarget?.viewWidth, zoom, animate }),
        animate && fitted ? 350 : 0
      );
    } else if (initialTarget?.at) {
      flyTo(initialTarget.at.center, initialTarget.at.zoom, false);
    } else if (initialTarget?.pinSlug && !fitted) {
      // The requested pin is gone: show everything rather than an empty corner
      fitContent(false);
    }

    onReady?.({
      flyToPin: (slug, opts) => {
        const p = findPinBySlug(shapes(), slug);
        if (p) flyToPin(p, { select, animate: opts?.animate });
        return Boolean(p);
      },
      flyTo,
      fitContent: (animate = true) => void fitContent(animate),
      searchPins: (query) => searchPins(shapes(), query),
      getSnapshot: () => {
        const s = store.getState().canvas;
        return { shapes: s.shapes, shapeOrder: s.shapeOrder, camera: s.camera };
      },
      flush,
      exportSvg: (opts) => {
        const root = getRoot();
        const s = store.getState().canvas;
        const list = s.shapeOrder.map((id) => s.shapes[id]).filter(Boolean);
        return root ? exportBoardSvg(root, list, opts) : null;
      },
    });
  }, [store, mode, getViewport, flyTo, flyToPin, initialTarget, onReady, flush, background, getRoot]);

  return null;
};
