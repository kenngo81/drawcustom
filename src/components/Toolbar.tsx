import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Circle,
  Diamond,
  Eraser,
  Hand,
  ImagePlus,
  MapPin,
  Minus,
  MousePointer2,
  Pencil,
  Redo2,
  Smile,
  Square,
  Type,
  Undo2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import {
  addShape,
  deleteSelected,
  duplicateWithIds,
  groupSelected,
  redo,
  selectAll,
  setSelectionLocked,
  setTool,
  undo,
  ungroupSelected,
} from '../store/canvasSlice';
import type { ToolType } from '../types/canvas';
import { screenToWorld } from '../utils/geometry';
import { createId } from '../utils/id';
import { readImageFileAsShape } from '../utils/image';
import { usePanelToggle } from '../utils/usePanelToggle';
import { useBoard } from '../lib/context';
import { StickerDrawer } from './StickerDrawer';

const TOOLS: Array<{ id: ToolType; label: string; shortcut: string; icon: React.ReactNode }> = [
  { id: 'select', label: 'Chọn (Select)', shortcut: 'V', icon: <MousePointer2 size={18} /> },
  { id: 'hand', label: 'Kéo bảng (Hand) — giữ Space để kéo nhanh', shortcut: 'Space', icon: <Hand size={18} /> },
  { id: 'draw', label: 'Cọ vẽ (Draw)', shortcut: 'D', icon: <Pencil size={18} /> },
  { id: 'eraser', label: 'Tẩy (Eraser)', shortcut: 'E', icon: <Eraser size={18} /> },
  { id: 'rect', label: 'Hình chữ nhật', shortcut: 'R', icon: <Square size={18} /> },
  { id: 'ellipse', label: 'Hình tròn / Elip', shortcut: 'O', icon: <Circle size={18} /> },
  { id: 'diamond', label: 'Hình thoi', shortcut: 'G', icon: <Diamond size={18} /> },
  { id: 'arrow', label: 'Mũi tên cong 3 điểm', shortcut: 'A', icon: <ArrowUpRight size={18} /> },
  { id: 'line', label: 'Đoạn thẳng', shortcut: 'L', icon: <Minus size={18} /> },
  { id: 'text', label: 'Viết chữ (Text)', shortcut: 'T', icon: <Type size={18} /> },
  { id: 'pin', label: 'Ghim vị trí & đặt tên (Pin)', shortcut: 'P', icon: <MapPin size={18} /> },
];

export const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTool, selectedIds, editingTextId, past, future, camera, currentStyle } =
    useAppSelector((s) => s.canvas);
  const [stickerOpen, setStickerOpen] = useState(false);
  // Open by default on mobile too: drawing needs the tools; users can hide it to see more board
  const { isCompact, getViewport, isKeyboardActive, features, panelDefaults } = useBoard();
  const tools = useMemo(
    () => TOOLS.filter((t) => features.pins || t.id !== 'pin'),
    [features.pins]
  );
  const store = useAppStore();
  const [toolsOpen, toggleTools] = usePanelToggle('tools', isCompact, true, panelDefaults.tools);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleInsertImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const center = screenToWorld(
      { x: getViewport().width / 2, y: getViewport().height / 2 },
      camera
    );
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const shape = await readImageFileAsShape(
          file,
          { x: center.x + i * 24, y: center.y + i * 24 },
          currentStyle
        );
        dispatch(addShape({ shape, record: true, select: true }));
        dispatch(setTool('select'));
      } catch {
        // Ignore invalid image
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Read live state: right after a text box opens, this listener may still hold the
      // previous render's values, and the first keystroke must not switch tools
      if (store.getState().canvas.editingTextId || !isKeyboardActive()) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        dispatch(e.shiftKey ? redo() : undo());
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        dispatch(redo());
        return;
      }
      if (mod && key === 'a') {
        e.preventDefault();
        dispatch(selectAll());
        return;
      }
      if (mod && key === 'g') {
        e.preventDefault();
        dispatch(e.shiftKey ? ungroupSelected() : groupSelected({ groupId: createId('grp') }));
        return;
      }
      if (mod && e.shiftKey && key === 'l') {
        e.preventDefault();
        const allLocked =
          selectedIds.length > 0 && selectedIds.every((id) => store.getState().canvas.shapes[id]?.locked);
        dispatch(setSelectionLocked(!allLocked));
        return;
      }
      if (mod && key === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) {
          dispatch(
            duplicateWithIds(
              selectedIds.map((sourceId) => ({ sourceId, newId: createId('copy') }))
            )
          );
        }
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          dispatch(deleteSelected());
        }
        return;
      }

      if (mod) return;
      if (key === 'i') {
        if (features.images) imageInputRef.current?.click();
        return;
      }
      if (key === 'k') {
        setStickerOpen((v) => !v);
        return;
      }
      // Space (hold-to-pan) is handled by CanvasStage; only single letters switch tools here
      if (key.length !== 1) return;
      const matched = tools.find(
        (t) => t.shortcut.length === 1 && t.shortcut.toLowerCase() === key
      );
      if (matched) {
        setStickerOpen(false);
        dispatch(setTool(matched.id));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, editingTextId, selectedIds, isKeyboardActive, store, tools, features.images]);

  return (
    <>
      {stickerOpen && <StickerDrawer onClose={() => setStickerOpen(false)} />}
      {!toolsOpen && (
        <button
          type="button"
          className="floating-dock bottom-dock dock-reopen-btn"
          title="Hiện thanh công cụ"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={toggleTools}
        >
          <span className="icon-btn active">
            {TOOLS.find((t) => t.id === activeTool)?.icon ?? <MousePointer2 size={18} />}
          </span>
          <ChevronUp size={18} />
        </button>
      )}
      {toolsOpen && (
      <div className="floating-dock bottom-dock" onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="icon-btn"
          title="Hoàn tác (Ctrl+Z)"
          disabled={past.length === 0}
          onClick={() => dispatch(undo())}
        >
          <Undo2 size={18} />
        </button>
        <button
          type="button"
          className="icon-btn"
          title="Làm lại (Ctrl+Shift+Z)"
          disabled={future.length === 0}
          onClick={() => dispatch(redo())}
        >
          <Redo2 size={18} />
        </button>

        <div className="dock-divider" />

        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`icon-btn ${activeTool === tool.id ? 'active' : ''}`}
            title={`${tool.label} (${tool.shortcut})`}
            onClick={() => {
              setStickerOpen(false);
              dispatch(setTool(tool.id));
            }}
          >
            {tool.icon}
            <span className="shortcut-hint">{tool.shortcut === 'Space' ? '␣' : tool.shortcut}</span>
          </button>
        ))}

        <div className="dock-divider" />

        <button
          type="button"
          className={`icon-btn ${stickerOpen ? 'active' : ''}`}
          title="Bộ Sticker & Icon dễ thương (K)"
          onClick={() => setStickerOpen((v) => !v)}
        >
          <Smile size={18} />
          <span className="shortcut-hint">K</span>
        </button>

        {features.images && (
          <button
            type="button"
            className="icon-btn"
            title="Chèn ảnh (I) — hoặc kéo thả / Ctrl+V"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImagePlus size={18} />
            <span className="shortcut-hint">I</span>
          </button>
        )}

        <div className="dock-divider" />

        <button
          type="button"
          className="icon-btn"
          title="Ẩn thanh công cụ"
          onClick={toggleTools}
        >
          <ChevronDown size={18} />
        </button>
      </div>
      )}
        {/* Kept mounted even when the dock is hidden so the "I" shortcut still works */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            void handleInsertImageFiles(e.target.files);
            e.target.value = '';
          }}
        />
    </>
  );
};
