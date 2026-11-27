import React from 'react';
import type { Bounds, ResizeHandle } from '../types/canvas';

interface SelectionOverlayProps {
  bounds: Bounds;
  zoom: number;
  rotation?: number;
  onStartResize: (handle: ResizeHandle, e: React.PointerEvent) => void;
  onStartRotate: (e: React.PointerEvent) => void;
}

const HANDLES: Array<{ id: ResizeHandle; xFactor: number; yFactor: number; cursor: string }> = [
  { id: 'nw', xFactor: 0, yFactor: 0, cursor: 'nwse-resize' },
  { id: 'n', xFactor: 0.5, yFactor: 0, cursor: 'ns-resize' },
  { id: 'ne', xFactor: 1, yFactor: 0, cursor: 'nesw-resize' },
  { id: 'e', xFactor: 1, yFactor: 0.5, cursor: 'ew-resize' },
  { id: 'se', xFactor: 1, yFactor: 1, cursor: 'nwse-resize' },
  { id: 's', xFactor: 0.5, yFactor: 1, cursor: 'ns-resize' },
  { id: 'sw', xFactor: 0, yFactor: 1, cursor: 'nesw-resize' },
  { id: 'w', xFactor: 0, yFactor: 0.5, cursor: 'ew-resize' },
];

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  bounds,
  zoom,
  rotation = 0,
  onStartResize,
  onStartRotate,
}) => {
  const strokeWidth = 1.5 / zoom;
  const handleSize = 9 / zoom;
  const rotateR = 5 / zoom;
  const rotateDistance = 28 / zoom;
  const stemStroke = 1.2 / zoom;

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;

  return (
    <g transform={rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined}>
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        fill="none"
        stroke="#2f80ed"
        strokeWidth={strokeWidth}
        pointerEvents="none"
      />

      {/* Rotate stem + circle above top-center */}
      <line
        x1={cx}
        y1={bounds.y}
        x2={cx}
        y2={bounds.y - rotateDistance + rotateR}
        stroke="#2f80ed"
        strokeWidth={stemStroke}
        pointerEvents="none"
      />
      <circle
        cx={cx}
        cy={bounds.y - rotateDistance}
        r={rotateR}
        fill="#ffffff"
        stroke="#2f80ed"
        strokeWidth={strokeWidth}
        style={{ cursor: 'grab' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onStartRotate(e);
        }}
      />
      {/* Small rotate icon inside the circle */}
      <path
        d={`M ${cx - rotateR * 0.42} ${bounds.y - rotateDistance - rotateR * 0.3}
            A ${rotateR * 0.55} ${rotateR * 0.55} 0 1 1 ${cx + rotateR * 0.42} ${bounds.y - rotateDistance - rotateR * 0.3}`}
        fill="none"
        stroke="#2f80ed"
        strokeWidth={stemStroke * 1.2}
        strokeLinecap="round"
        pointerEvents="none"
      />

      {HANDLES.map((h) => {
        const hx = bounds.x + bounds.width * h.xFactor;
        const hy = bounds.y + bounds.height * h.yFactor;
        return (
          <rect
            key={h.id}
            x={hx - handleSize / 2}
            y={hy - handleSize / 2}
            width={handleSize}
            height={handleSize}
            rx={2 / zoom}
            fill="#ffffff"
            stroke="#2f80ed"
            strokeWidth={strokeWidth}
            style={{ cursor: h.cursor }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartResize(h.id, e);
            }}
          />
        );
      })}
    </g>
  );
};
