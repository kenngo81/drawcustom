import React, { useRef } from 'react';
import {
  Download,
  ExternalLink,
  FileCode2,
  Grid3X3,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Trash,
  Upload,
} from 'lucide-react';
import { useBoard } from '../lib/context';
import { useAppDispatch, useAppSelector } from '../store';
import { clearCanvas, loadDocument, setCamera, toggleGrid, zoomAt } from '../store/canvasSlice';
import { downloadDocument, isCanvasDocument } from '../utils/boardIO';
import { screenToWorld } from '../utils/geometry';
import { PinSearch } from './PinSearch';

export const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shapes, shapeOrder, camera, showGrid } = useAppSelector((s) => s.canvas);
  const { mode, readOnly, features, share, openShare, getViewport } = useBoard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zoomCenter = (nextZoom: number) => {
    const vp = getViewport();
    dispatch(zoomAt({ screenPoint: { x: vp.width / 2, y: vp.height / 2 }, nextZoom }));
  };

  /** Embed → open the same board, at the same spot, as a full page in a new tab. */
  const openFullView = () => {
    if (!share) return;
    const vp = getViewport();
    const at = {
      center: screenToWorld({ x: vp.width / 2, y: vp.height / 2 }, camera),
      zoom: camera.zoom,
    };
    window.open(share.buildUrl({ at }, { embed: false }), '_blank', 'noopener');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (isCanvasDocument(parsed)) dispatch(loadDocument(parsed));
      } catch {
        // Ignore invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportSvg = (e: React.MouseEvent) => {
    // Several boards can be on one page: export the one this button belongs to
    const svgEl = (e.currentTarget as HTMLElement)
      .closest('.dc-root')
      ?.querySelector('svg.canvas-svg');
    if (!svgEl) return;
    const raw = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawcustom-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const zoomDock = (
    <div className="floating-dock bottom-left-dock" onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="icon-btn"
        title="Thu nhỏ"
        onClick={() => zoomCenter(camera.zoom / 1.2)}
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        className="zoom-readout"
        title="Về 100%"
        onClick={() => zoomCenter(1)}
      >
        {Math.round(camera.zoom * 100)}%
      </button>
      <button
        type="button"
        className="icon-btn"
        title="Phóng to"
        onClick={() => zoomCenter(camera.zoom * 1.2)}
      >
        <Plus size={16} />
      </button>
      {!readOnly && (
        <button
          type="button"
          className="icon-btn"
          title="Về gốc toạ độ"
          onClick={() => dispatch(setCamera({ x: 0, y: 0, zoom: 1 }))}
        >
          <RotateCcw size={15} />
        </button>
      )}
    </div>
  );

  const shareButton = share && (
    <button
      type="button"
      className="icon-btn"
      title="Chia sẻ link / nhúng vào bài viết"
      onClick={() => openShare()}
    >
      <Share2 size={16} />
    </button>
  );

  if (mode === 'embed') {
    return (
      <>
        <div className="floating-dock top-left-dock embed-dock" onPointerDown={(e) => e.stopPropagation()}>
          {features.pinSearch && features.pins && <PinSearch />}
          {share && (
            <button type="button" className="icon-btn" title="Mở bảng đầy đủ (tab mới)" onClick={openFullView}>
              <ExternalLink size={16} />
            </button>
          )}
        </div>
        {zoomDock}
      </>
    );
  }

  const showFileMenu = !readOnly && features.fileMenu;
  return (
    <>
      <div className="floating-dock top-left-dock" onPointerDown={(e) => e.stopPropagation()}>
        {features.brand && <span className="brand-badge">DrawCustom</span>}
        {readOnly && <span className="viewer-badge">Chỉ xem</span>}
        {(features.brand || readOnly) && <div className="dock-divider" />}
        {features.pinSearch && features.pins && <PinSearch />}
        {shareButton}
        {!readOnly && (
          <>
            <div className="dock-divider" />
            {showFileMenu && (
              <>
                <button
                  type="button"
                  className="icon-btn"
                  title="Tải về JSON"
                  onClick={() => downloadDocument({ version: 1, shapes, shapeOrder, camera })}
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Mở file JSON"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                </button>
                <button type="button" className="icon-btn" title="Xuất SVG" onClick={handleExportSvg}>
                  <FileCode2 size={16} />
                </button>
              </>
            )}
            <button
              type="button"
              className={`icon-btn ${showGrid ? 'active' : ''}`}
              title="Bật/tắt lưới chấm"
              onClick={() => dispatch(toggleGrid())}
            >
              <Grid3X3 size={16} />
            </button>
            {features.clearCanvas && (
              <button
                type="button"
                className="icon-btn danger"
                title="Xoá toàn bộ bảng"
                onClick={() => dispatch(clearCanvas())}
              >
                <Trash size={16} />
              </button>
            )}
            {showFileMenu && (
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleImportJson}
              />
            )}
          </>
        )}
      </div>
      {zoomDock}
    </>
  );
};
