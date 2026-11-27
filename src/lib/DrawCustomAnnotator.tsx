import React, { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import type { Bounds, ShapeStyle } from '../types/canvas';
import { createMemoryAdapter } from './adapters/local';
import type { BoardSnapshot } from './adapters/types';
import type { BoardFeatures, DrawUser } from './context';
import { DrawCustomBoard, type DrawCustomApi } from './DrawCustomBoard';
import { svgToDataUrl } from './exportSvg';

export interface AnnotationResult {
  /** The drawing only (no picture), as a standalone SVG document. */
  svg: string;
  /** Same SVG as a base64 data URL — ready for <img src>. */
  svgDataUrl: string;
  /**
   * Where the drawing sits relative to the picture, in picture units
   * (0,0 = picture top-left; the picture is `image.width` × `image.height`).
   * It may extend outside the picture.
   */
  bounds: Bounds;
  /** Everything needed to edit the drawing again later: pass it back as `initial`. */
  snapshot: BoardSnapshot;
}

export interface DrawCustomAnnotatorProps {
  /**
   * The picture to draw on. `width`/`height` set the coordinate system of the result —
   * e.g. pass width 1000 and a proportional height to get bounds in 1/1000 of the width.
   */
  image: { src: string; width: number; height: number };
  /** A previous result's `snapshot`, to keep editing it. */
  initial?: BoardSnapshot | null;
  user?: DrawUser;
  title?: string;
  hint?: string;
  /** Pen defaults; annotation-friendly (red, bold) unless overridden. */
  defaultStyle?: Partial<ShapeStyle>;
  features?: Partial<BoardFeatures>;
  onCancel: () => void;
  /** null = everything was erased (remove the annotation). */
  onDone: (result: AnnotationResult | null) => void | Promise<void>;
  className?: string;
  style?: CSSProperties;
}

const ANNOTATION_STYLE: Partial<ShapeStyle> = {
  stroke: '#e03131',
  strokeWidth: 4,
  fontSize: 40,
};

const ANNOTATION_FEATURES: Partial<BoardFeatures> = {
  fileMenu: false,
  pinSearch: false,
  pins: false,
  brand: false,
  images: false,
};

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Draw arrows / notes / highlights on top of a picture. The picture is locked in place;
 * drawings may extend outside it. Fills its container — the host decides whether it is
 * a full-screen modal, a side panel, etc.
 */
export const DrawCustomAnnotator: React.FC<DrawCustomAnnotatorProps> = ({
  image,
  initial,
  user,
  title = 'Vẽ & chú thích lên ảnh',
  hint = 'Nét vẽ được phép tràn ra ngoài ảnh. Bấm "Xong" để lưu.',
  defaultStyle,
  features,
  onCancel,
  onDone,
  className,
  style,
}) => {
  // The editor works on a private in-memory copy until "Done"
  const adapter = useMemo(
    () => createMemoryAdapter({ shapes: initial?.shapes ?? {}, shapeOrder: initial?.shapeOrder ?? [] }),
    // Only the first `initial` matters: later changes must not reset the drawing
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const background = useMemo(
    () => ({ src: image.src, width: image.width, height: image.height }),
    [image.src, image.width, image.height]
  );
  const mergedFeatures = useMemo(() => ({ ...ANNOTATION_FEATURES, ...features }), [features]);
  const mergedStyle = useMemo(() => ({ ...ANNOTATION_STYLE, ...defaultStyle }), [defaultStyle]);
  const apiRef = useRef<DrawCustomApi | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onReady = useCallback((api: DrawCustomApi) => {
    apiRef.current = api;
  }, []);

  const handleDone = async () => {
    const api = apiRef.current;
    if (!api || saving) return;
    setSaving(true);
    setError('');
    try {
      // Commit a text / pin being typed, then let the board re-render before exporting
      (document.activeElement as HTMLElement | null)?.blur?.();
      await nextFrame();
      await nextFrame();
      const snap = api.getSnapshot();
      if (snap.shapeOrder.length === 0) {
        await onDone(null);
        return;
      }
      const exported = api.exportSvg();
      if (!exported) throw new Error('Không xuất được nét vẽ');
      await onDone({
        svg: exported.svg,
        svgDataUrl: svgToDataUrl(exported.svg),
        bounds: exported.bounds,
        snapshot: { shapes: snap.shapes, shapeOrder: snap.shapeOrder },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`dc-annotator${className ? ` ${className}` : ''}`} style={style}>
      <div className="dc-annotator-header">
        <div className="dc-annotator-titles">
          <div className="dc-annotator-title">{title}</div>
          {hint && <div className="dc-annotator-hint">{hint}</div>}
        </div>
        <div className="dc-annotator-actions">
          {error && <span className="dc-annotator-error">{error}</span>}
          <button type="button" className="dc-annotator-btn" onClick={onCancel} disabled={saving}>
            <X size={16} /> Huỷ
          </button>
          <button
            type="button"
            className="dc-annotator-btn primary"
            onClick={() => void handleDone()}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className="dc-spin" /> : <Check size={16} />} Xong
          </button>
        </div>
      </div>
      <div className="dc-annotator-canvas">
        <DrawCustomBoard
          adapter={adapter}
          user={user}
          background={background}
          defaultStyle={mergedStyle}
          features={mergedFeatures}
          keyboard="global"
          onReady={onReady}
          onError={(e) => setError(e instanceof Error ? e.message : String(e))}
        />
      </div>
    </div>
  );
};
