import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Search, Share2, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setTool } from '../store/canvasSlice';
import type { PinShape } from '../types/canvas';
import { useBoard } from '../lib/context';
import { formatPinTitle, normalizeSearchText, searchPins } from '../utils/pins';
import { useFlyTo } from '../utils/useFlyTo';

const MAX_RESULTS = 50;

export const PinSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const shapes = useAppSelector((s) => s.canvas.shapes);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { flyToPin } = useFlyTo();
  const { readOnly, isKeyboardActive, onPinOpen, share, openShare } = useBoard();

  const results = useMemo(() => (open ? searchPins(shapes, query) : []), [open, shapes, query]);
  const visible = results.slice(0, MAX_RESULTS);
  const hasQuery = normalizeSearchText(query.replace(/^\s*#+/, '')).length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Ctrl/Cmd+F opens the pin search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && isKeyboardActive()) {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.select());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isKeyboardActive]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const choose = (pin: PinShape | undefined) => {
    if (!pin) return;
    if (!readOnly) dispatch(setTool('select'));
    flyToPin(pin, { select: !readOnly });
    onPinOpen?.(pin);
    setOpen(false);
  };

  return (
    <div className="pin-search" ref={rootRef}>
      <button
        type="button"
        className={`icon-btn ${open ? 'active' : ''}`}
        title="Tìm theo Pin (Ctrl+F)"
        onClick={() => setOpen((v) => !v)}
      >
        <Search size={16} />
      </button>

      {open && (
        <div className="pin-search-popover">
          <div className="pin-search-input-row">
            <Search size={14} className="pin-search-icon" />
            <input
              ref={inputRef}
              className="pin-search-input"
              placeholder="Tìm theo tiêu đề hoặc ID, vd: #idea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.min(visible.length - 1, i + 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(0, i - 1));
                } else if (e.key === 'Enter') {
                  choose(visible[activeIndex]);
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
            />
            {query && (
              <button
                type="button"
                className="pin-search-clear"
                title="Xoá"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {hasQuery && (
          <div className="pin-search-results">
            {visible.length === 0 ? (
              <div className="pin-search-empty">Không tìm thấy pin nào</div>
            ) : (
              visible.map((pin, idx) => (
                <div
                  key={pin.id}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`pin-search-item ${idx === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => choose(pin)}
                >
                  <MapPin size={14} className="pin-search-item-icon" style={{ color: pin.style.stroke }} />
                  <span className="pin-search-item-text">
                    <span className="pin-search-item-name">{formatPinTitle(pin.title)}</span>
                    <span className="pin-search-item-meta">
                      ID: {pin.slug} · {pin.createdBy.name}
                    </span>
                  </span>
                  {share && (
                    <button
                      type="button"
                      className="pin-search-copy"
                      title="Chia sẻ / nhúng pin này vào bài viết"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        openShare(pin.id);
                      }}
                    >
                      <Share2 size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
            {results.length > MAX_RESULTS && (
              <div className="pin-search-more">
                +{results.length - MAX_RESULTS} pin khác — gõ cụ thể hơn để thu hẹp
              </div>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  );
};
