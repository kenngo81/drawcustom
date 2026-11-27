import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { CUTE_ICON_PACKS, type CuteIconItem, type IconPackName } from '../data/iconPacks';
import { useAppDispatch, useAppSelector } from '../store';
import { useBoard } from '../lib/context';
import { addShape, setTool } from '../store/canvasSlice';
import type { StickerShape } from '../types/canvas';
import { screenToWorld } from '../utils/geometry';
import { createId } from '../utils/id';

interface StickerDrawerProps {
  onClose: () => void;
}

const PACKS: Array<'Tất cả' | IconPackName> = [
  'Tất cả',
  'Thú cưng & Đồ chơi',
  'Nét màu Marker',
  'Doodle Pastel',
  'Cảm xúc & Trang trí',
];

export const StickerDrawer: React.FC<StickerDrawerProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { camera, currentStyle } = useAppSelector((s) => s.canvas);
  const { getViewport } = useBoard();
  const [activePack, setActivePack] = useState<'Tất cả' | IconPackName>('Tất cả');
  const [query, setQuery] = useState('');
  const svgInputRef = useRef<HTMLInputElement>(null);

  const visibleIcons = CUTE_ICON_PACKS.filter((item) => {
    const matchPack = activePack === 'Tất cả' || item.pack === activePack;
    const matchQuery =
      query.trim() === '' || item.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchPack && matchQuery;
  });

  const insertSticker = (viewBox: string, svgMarkup: string, iconId?: string) => {
    const center = screenToWorld(
      { x: getViewport().width / 2, y: getViewport().height / 2 },
      camera
    );
    const size = 96;
    const shape: StickerShape = {
      id: createId('sticker'),
      type: 'sticker',
      x: center.x - size / 2,
      y: center.y - size / 2,
      width: size,
      height: size,
      iconId,
      viewBox,
      svgMarkup,
      style: { ...currentStyle },
    };
    dispatch(addShape({ shape, record: true, select: true }));
    dispatch(setTool('select'));
    onClose();
  };

  const handleUploadCustomSvg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result);
        const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) return;
        const viewBox = svgEl.getAttribute('viewBox') || '0 0 64 64';
        insertSticker(viewBox, svgEl.innerHTML);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  return (
    <div className="sticker-drawer" onPointerDown={(e) => e.stopPropagation()}>
      <div className="sticker-header">
        <span className="panel-label">Sticker & Icon Dễ Thương ({visibleIcons.length})</span>
        <button
          type="button"
          className="upload-svg-btn"
          title="Tải file .svg bên ngoài vào"
          onClick={() => svgInputRef.current?.click()}
        >
          <Upload size={13} />
          <span>+ SVG</span>
        </button>
        <input
          ref={svgInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          style={{ display: 'none' }}
          onChange={handleUploadCustomSvg}
        />
      </div>

      <input
        type="text"
        className="sticker-search"
        placeholder="Tìm icon (vd: cún, mèo, dưa hấu, tên lửa)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="sticker-tabs">
        {PACKS.map((pack) => (
          <button
            key={pack}
            type="button"
            className={`sticker-tab ${activePack === pack ? 'active' : ''}`}
            onClick={() => setActivePack(pack)}
          >
            {pack}
          </button>
        ))}
      </div>

      <div className="sticker-grid">
        {visibleIcons.map((item: CuteIconItem) => (
          <button
            key={item.id}
            type="button"
            className="sticker-cell"
            title={item.name}
            onClick={() => insertSticker(item.viewBox, item.svgMarkup, item.id)}
          >
            <svg
              width="40"
              height="40"
              viewBox={item.viewBox}
              dangerouslySetInnerHTML={{ __html: item.svgMarkup }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
