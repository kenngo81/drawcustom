import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { useAppSelector } from '../store';
import type { PinShape } from '../types/canvas';
import { screenToWorld } from '../utils/geometry';
import { useBoard, type ShareTarget } from '../lib/context';
import { formatPinTitle, isPin } from '../utils/pins';

const SIZE_PRESETS = [
  { id: 'sm', label: 'Nhỏ', width: '480', height: 320 },
  { id: 'md', label: 'Vừa', width: '800', height: 500 },
  { id: 'lg', label: 'Lớn', width: '1200', height: 700 },
  { id: 'full', label: 'Rộng 100%', width: '100%', height: 500 },
] as const;

const VIEW_TARGET = '__view__';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const CopyBox: React.FC<{ label: string; value: string; multiline?: boolean }> = ({
  label,
  value,
  multiline,
}) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the text is still selectable in the box
    }
  };
  return (
    <div className="share-copy">
      <div className="share-copy-head">
        <span className="panel-label">{label}</span>
        <button type="button" className="share-copy-btn" onClick={() => void copy()}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Đã copy' : 'Copy'}
        </button>
      </div>
      {multiline ? (
        <textarea readOnly value={value} rows={3} onFocus={(e) => e.currentTarget.select()} />
      ) : (
        <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} />
      )}
    </div>
  );
};

export const ShareDialog: React.FC<{ initialPinId: string | null; onClose: () => void }> = ({
  initialPinId,
  onClose,
}) => {
  const { shapes, camera, selectedIds } = useAppSelector((s) => s.canvas);
  const { share, getViewport } = useBoard();
  const pins = useMemo(
    () =>
      Object.values(shapes)
        .filter(isPin)
        .sort((a, b) => a.slug.localeCompare(b.slug)),
    [shapes]
  );

  const selectedPinId = selectedIds.find((id) => isPin(shapes[id]));
  const [targetId, setTargetId] = useState<string>(
    initialPinId ?? selectedPinId ?? pins[0]?.id ?? VIEW_TARGET
  );
  const [sizeId, setSizeId] = useState<string>('md');
  const [customW, setCustomW] = useState('800');
  const [customH, setCustomH] = useState(500);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // The view target is frozen when the dialog opens (what the user is looking at now)
  const [viewAt] = useState(() => {
    const vp = getViewport();
    return {
      center: screenToWorld({ x: vp.width / 2, y: vp.height / 2 }, camera),
      zoom: camera.zoom,
    };
  });

  const pin: PinShape | undefined = targetId === VIEW_TARGET ? undefined : (shapes[targetId] as PinShape);
  const preset = SIZE_PRESETS.find((p) => p.id === sizeId);
  const width = preset ? preset.width : customW.trim() || '800';
  const height = preset ? preset.height : Math.max(120, customH || 500);

  const target: ShareTarget = pin ? { pinSlug: pin.slug } : { at: viewAt };
  const linkUrl = share ? share.buildUrl(target, { embed: false }) : '';
  const embedUrl = share ? share.buildUrl(target, { embed: true }) : '';

  const titleText = pin ? formatPinTitle(pin.title) : 'Bản vẽ DrawCustom';
  const linkHtml = `<a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;border:1.5px solid ${pin?.style.stroke ?? '#e03131'};color:${pin?.style.stroke ?? '#e03131'};font-weight:600;text-decoration:none">📍 ${escapeHtml(titleText)}</a>`;
  const widthAttr = /^\d+$/.test(width) ? width : escapeHtml(width);
  const iframeHtml = `<iframe src="${escapeHtml(embedUrl)}" width="${widthAttr}" height="${height}" style="border:0;border-radius:12px;max-width:100%" loading="lazy" allowfullscreen title="${escapeHtml(titleText)}"></iframe>`;

  // Preview: every size is drawn at the SAME scale, so a small embed really looks smaller
  // than a large one. 100% width is shown as a typical article column.
  const previewMaxW = 440;
  const REFERENCE_WIDTH = 1200; // the largest preset fills the preview area
  const ARTICLE_COLUMN = 760;
  const isPercent = !/^\d+$/.test(width);
  const numericW = isPercent ? ARTICLE_COLUMN : Number(width);
  const previewScale = previewMaxW / Math.max(REFERENCE_WIDTH, numericW);
  const realSize = `${isPercent ? `${width} bề rộng bài viết` : `${width}px`} × ${height}px`;

  return (
    <div className="share-backdrop" onPointerDown={onClose}>
      <div
        className="share-dialog"
        role="dialog"
        aria-label="Chia sẻ & nhúng"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="share-header">
          <b>Chia sẻ & nhúng vào bài viết</b>
          <button type="button" className="panel-collapse-btn" title="Đóng (Esc)" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="share-body">
          <div className="share-settings">
            <label className="share-field">
              <span className="panel-label">Đưa người xem tới</span>
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                <option value={VIEW_TARGET}>Khung nhìn hiện tại của bạn</option>
                {pins.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatPinTitle(p.title)} — ID: {p.slug}
                  </option>
                ))}
              </select>
            </label>

            <div className="share-field">
              <span className="panel-label">Kích thước khung nhúng</span>
              <div className="share-sizes">
                {SIZE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`share-chip ${sizeId === p.id ? 'active' : ''}`}
                    onClick={() => setSizeId(p.id)}
                  >
                    {p.label}
                    <small>
                      {p.width === '100%' ? '100%' : p.width}×{p.height}
                    </small>
                  </button>
                ))}
                <button
                  type="button"
                  className={`share-chip ${sizeId === 'custom' ? 'active' : ''}`}
                  onClick={() => setSizeId('custom')}
                >
                  Tuỳ chỉnh
                </button>
              </div>
              {sizeId === 'custom' && (
                <div className="share-custom-size">
                  <input
                    value={customW}
                    onChange={(e) => setCustomW(e.target.value)}
                    placeholder="800 hoặc 100%"
                    aria-label="Chiều rộng"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    min={120}
                    value={customH}
                    onChange={(e) => setCustomH(Number(e.target.value))}
                    aria-label="Chiều cao (px)"
                  />
                  <span>px</span>
                </div>
              )}
            </div>

            {share?.settings}
          </div>

          <div className="share-output">
            <CopyBox label="Link (mở bảng & bay tới đích)" value={linkUrl} />
            <CopyBox label="Nút link cho bài viết (HTML)" value={linkHtml} multiline />
            <CopyBox label="Mã nhúng iframe" value={iframeHtml} multiline />

            <div className="share-preview">
              <span className="panel-label">Xem trước khung nhúng</span>
              <span className="share-preview-size">
                Kích thước thật: {realSize} · thu nhỏ cùng tỉ lệ để so sánh
              </span>
              <div
                className="share-preview-frame"
                style={{
                  width: numericW * previewScale,
                  height: height * previewScale,
                }}
              >
                <iframe
                  key={embedUrl + width + height}
                  src={embedUrl}
                  title="Xem trước"
                  style={{
                    width: numericW,
                    height,
                    transform: `scale(${previewScale})`,
                    transformOrigin: '0 0',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
