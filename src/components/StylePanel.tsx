import React from 'react';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronsRight,
  Copy,
  Group,
  Lock,
  LockOpen,
  Palette,
  Plus,
  Trash2,
  Ungroup,
} from 'lucide-react';
import { usePanelToggle } from '../utils/usePanelToggle';
import { useBoard } from '../lib/context';
import { DEFAULT_FONT_FAMILY, FONT_OPTIONS } from '../data/fonts';
import { useAppDispatch, useAppSelector } from '../store';
import {
  bringToFront,
  deleteSelected,
  duplicateWithIds,
  groupSelected,
  sendToBack,
  setSelectionLocked,
  setStyle,
  ungroupSelected,
} from '../store/canvasSlice';
import { canLock } from '../utils/permissions';
import type { BrushType, DashStyle, FillStyle } from '../types/canvas';
import { createId } from '../utils/id';

const PALETTE_COLORS = [
  '#1e1e1e',
  '#9ca3af',
  '#c084fc',
  '#9333ea',
  '#2563eb',
  '#38bdf8',
  '#f59e0b',
  '#ea580c',
  '#16a34a',
  '#4ade80',
  '#f87171',
  '#dc2626',
];

const FILL_OPTIONS: Array<{ id: FillStyle; label: string }> = [
  { id: 'none', label: 'Không tô' },
  { id: 'semi', label: 'Tô mờ' },
  { id: 'solid', label: 'Tô đặc' },
  { id: 'pattern', label: 'Gạch chéo' },
];

const DASH_OPTIONS: Array<{ id: DashStyle; label: string }> = [
  { id: 'solid', label: 'Nét liền' },
  { id: 'dashed', label: 'Nét đứt' },
  { id: 'dotted', label: 'Nét chấm' },
];

const BRUSH_OPTIONS: Array<{ id: BrushType; label: string; short: string }> = [
  { id: 'pen', label: 'Cọ nhỏ (Pen)', short: 'Nhỏ' },
  { id: 'soft', label: 'Cọ mềm (Soft Brush)', short: 'Mềm' },
  { id: 'marker', label: 'Cọ vừa (Marker)', short: 'Dạ' },
  { id: 'highlighter', label: 'Bút highlight', short: 'Sáng' },
];

const FillIcon: React.FC<{ kind: FillStyle }> = ({ kind }) => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    {kind === 'pattern' && (
      <defs>
        <pattern id="ui-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1.5" />
        </pattern>
      </defs>
    )}
    <rect
      x="3"
      y="3"
      width="12"
      height="12"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.6"
      fill={
        kind === 'none'
          ? 'none'
          : kind === 'semi'
            ? 'currentColor'
            : kind === 'solid'
              ? 'currentColor'
              : 'url(#ui-hatch)'
      }
      fillOpacity={kind === 'semi' ? 0.25 : 1}
    />
  </svg>
);

const DashIcon: React.FC<{ kind: DashStyle }> = ({ kind }) => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <circle
      cx="9"
      cy="9"
      r="5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray={
        kind === 'solid' ? undefined : kind === 'dashed' ? '4 3.5' : '0.01 3.4'
      }
    />
  </svg>
);

export const StylePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStyle, selectedIds, shapes } = useAppSelector((s) => s.canvas);

  const firstSelected = selectedIds.length > 0 ? shapes[selectedIds[0]] : undefined;
  const activeStyle = firstSelected?.style ?? currentStyle;
  const activeFillStyle = activeStyle.fillStyle ?? 'none';
  const activeDash = activeStyle.dash ?? 'solid';
  const activeBrush = activeStyle.brushType ?? 'pen';
  const activeStrokeWidth = activeStyle.strokeWidth ?? 3;
  const activeFontSize = activeStyle.fontSize ?? 22;
  const activeFontFamily = activeStyle.fontFamily ?? DEFAULT_FONT_FAMILY;
  const { user, isCompact, panelDefaults } = useBoard();
  const selectedShapes = selectedIds.map((id) => shapes[id]).filter(Boolean);
  const groupIds = new Set(selectedShapes.map((sh) => sh.groupId).filter(Boolean));
  const hasGroup = groupIds.size > 0;
  const isOneGroup = groupIds.size === 1 && selectedShapes.every((sh) => sh.groupId);
  const lockable = selectedShapes.length > 0 && selectedShapes.every((sh) => canLock(sh, user));
  const allLocked = selectedShapes.length > 0 && selectedShapes.every((sh) => sh.locked);
  const [open, toggleOpen] = usePanelToggle('style', isCompact, false, panelDefaults.style);

  if (!open) {
    return (
      <button
        type="button"
        className="panel-reopen-btn"
        title="Hiện bảng màu & kiểu nét"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={toggleOpen}
      >
        <Palette size={18} />
        <span className="panel-reopen-dot" style={{ backgroundColor: activeStyle.stroke }} />
      </button>
    );
  }

  return (
    <div className="floating-panel style-panel" onPointerDown={(e) => e.stopPropagation()}>
      <div className="panel-section">
        <div className="panel-header-row">
          <span className="panel-label">Màu sắc</span>
          <div className="panel-header-actions">
            <label className="custom-color-trigger" title="Chọn màu bất kỳ">
              <input
                type="color"
                value={activeStyle.stroke}
                onChange={(e) => dispatch(setStyle({ stroke: e.target.value }))}
              />
              <Plus size={13} strokeWidth={2.5} />
            </label>
            <button
              type="button"
              className="panel-collapse-btn"
              title="Ẩn bảng"
              onClick={toggleOpen}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
        <div className="swatch-grid">
          {PALETTE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-swatch ${activeStyle.stroke.toLowerCase() === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              title={color}
              onClick={() => dispatch(setStyle({ stroke: color }))}
            />
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header-row">
          <span className="panel-label">Cỡ nét vẽ</span>
          <span className="value-pill">{activeStrokeWidth}px</span>
        </div>
        <input
          type="range"
          min={1}
          max={32}
          step={0.5}
          value={activeStrokeWidth}
          onChange={(e) => dispatch(setStyle({ strokeWidth: Number(e.target.value) }))}
        />
      </div>

      <div className="panel-section">
        <div className="panel-header-row">
          <span className="panel-label">Độ mờ</span>
          <span className="value-pill">{Math.round(activeStyle.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={activeStyle.opacity}
          onChange={(e) => dispatch(setStyle({ opacity: Number(e.target.value) }))}
        />
      </div>

      <div className="panel-section">
        <span className="panel-label">Kiểu tô nền</span>
        <div className="btn-group">
          {FILL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`mini-btn icon-mini-btn ${activeFillStyle === opt.id ? 'active' : ''}`}
              title={opt.label}
              onClick={() => dispatch(setStyle({ fillStyle: opt.id }))}
            >
              <FillIcon kind={opt.id} />
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <span className="panel-label">Kiểu nét</span>
        <div className="btn-group three-col">
          {DASH_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`mini-btn icon-mini-btn ${activeDash === opt.id ? 'active' : ''}`}
              title={opt.label}
              onClick={() => dispatch(setStyle({ dash: opt.id }))}
            >
              <DashIcon kind={opt.id} />
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <span className="panel-label">Dạng cọ</span>
        <div className="btn-group">
          {BRUSH_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`mini-btn ${activeBrush === opt.id ? 'active' : ''}`}
              title={opt.label}
              onClick={() => dispatch(setStyle({ brushType: opt.id }))}
            >
              {opt.short}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header-row">
          <span className="panel-label">Font & Cỡ chữ</span>
          <span className="value-pill">{activeFontSize}px</span>
        </div>
        <select
          className="font-select"
          style={{ fontFamily: activeFontFamily }}
          value={activeFontFamily}
          onChange={(e) => dispatch(setStyle({ fontFamily: e.target.value }))}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.id} value={f.cssFamily} style={{ fontFamily: f.cssFamily }}>
              [{f.category}] {f.label}
            </option>
          ))}
        </select>
        <input
          type="range"
          min={8}
          max={200}
          step={1}
          value={activeFontSize}
          onChange={(e) => dispatch(setStyle({ fontSize: Number(e.target.value) }))}
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="panel-section">
          <span className="panel-label">Đang chọn ({selectedIds.length})</span>
          <div className="action-row">
            <button
              type="button"
              className="icon-btn"
              title="Đưa lên trên"
              onClick={() => dispatch(bringToFront())}
            >
              <ArrowUpToLine size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              title="Đưa xuống dưới"
              onClick={() => dispatch(sendToBack())}
            >
              <ArrowDownToLine size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              title="Nhân đôi (Ctrl+D)"
              onClick={() =>
                dispatch(
                  duplicateWithIds(
                    selectedIds.map((sourceId) => ({ sourceId, newId: createId('copy') }))
                  )
                )
              }
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              className="icon-btn danger"
              title="Xóa (Del)"
              onClick={() => dispatch(deleteSelected())}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="action-row">
            <button
              type="button"
              className="icon-btn"
              title="Gom nhóm (Ctrl+G) — chọn & di chuyển cùng nhau"
              disabled={selectedIds.length < 2 || isOneGroup}
              onClick={() => dispatch(groupSelected({ groupId: createId('grp') }))}
            >
              <Group size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              title="Rã nhóm (Ctrl+Shift+G)"
              disabled={!hasGroup}
              onClick={() => dispatch(ungroupSelected())}
            >
              <Ungroup size={16} />
            </button>
            <button
              type="button"
              className={`icon-btn ${allLocked ? 'active' : ''}`}
              title={
                !lockable
                  ? 'Chỉ người tạo (hoặc admin) mới khoá / mở khoá được'
                  : allLocked
                    ? 'Mở khoá (Ctrl+Shift+L)'
                    : 'Khoá (Ctrl+Shift+L) — người khác chỉ xem, không sửa được'
              }
              disabled={!lockable}
              onClick={() => dispatch(setSelectionLocked(!allLocked))}
            >
              {allLocked ? <Lock size={16} /> : <LockOpen size={16} />}
            </button>
          </div>
          {allLocked && (
            <span className="panel-hint">Đã khoá: người khác chỉ xem được.</span>
          )}
        </div>
      )}
    </div>
  );
};
