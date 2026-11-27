import React from 'react';
import { DEFAULT_FONT_FAMILY } from '../data/fonts';
import { BRUSH_MULTIPLIER } from '../store/canvasSlice';
import type { CanvasShape, DashStyle, ShapeStyle } from '../types/canvas';
import { getArrowPoints, getPinLayout, pointsToSmoothSvgPath } from '../utils/geometry';
import { stickerImageHref } from '../utils/normalize';

interface ShapeRendererProps {
  shape: CanvasShape;
  isEditing?: boolean;
}

function getStrokeDasharray(dash: DashStyle | undefined, strokeWidth: number): string | undefined {
  switch (dash) {
    case 'dashed':
      return `${Math.max(6, strokeWidth * 2.6)} ${Math.max(5, strokeWidth * 2.1)}`;
    case 'dotted':
      return `0.01 ${Math.max(4, strokeWidth * 2.1)}`;
    default:
      return undefined;
  }
}

function getFillProps(
  shapeId: string,
  style: ShapeStyle
): { fill: string; fillOpacity: number } {
  const fillStyle = style.fillStyle ?? 'none';
  switch (fillStyle) {
    case 'semi':
      return { fill: style.stroke, fillOpacity: 0.18 };
    case 'solid':
      return { fill: style.stroke, fillOpacity: 0.85 };
    case 'pattern':
      return { fill: `url(#hatch-${shapeId})`, fillOpacity: 1 };
    default:
      return { fill: 'transparent', fillOpacity: 1 };
  }
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = React.memo(({ shape, isEditing }) => {
  const { x, y, width, height, style } = shape;
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const rotation = shape.rotation ?? 0;
  const groupTransform = rotation
    ? `translate(${x}, ${y}) rotate(${rotation}, ${w / 2}, ${h / 2})`
    : `translate(${x}, ${y})`;

  const brushType = style.brushType ?? 'pen';
  const baseWidth = style.strokeWidth ?? 3;
  const effectiveWidth =
    shape.type === 'draw' ? baseWidth * (BRUSH_MULTIPLIER[brushType] ?? 1) : baseWidth;

  const dashArray = getStrokeDasharray(style.dash, effectiveWidth);
  const fillProps = getFillProps(shape.id, style);

  const strokeOpacity =
    shape.type === 'draw' && brushType === 'highlighter'
      ? style.opacity * 0.38
      : shape.type === 'draw' && brushType === 'soft'
        ? style.opacity * 0.78
        : shape.type === 'draw' && brushType === 'marker'
          ? style.opacity * 0.9
          : style.opacity;

  const commonStroke = {
    stroke: style.stroke,
    strokeWidth: effectiveWidth,
    strokeDasharray: dashArray,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    opacity: strokeOpacity,
  };

  const renderHatchDef = () =>
    (style.fillStyle ?? 'none') === 'pattern' ? (
      <defs>
        <pattern
          id={`hatch-${shape.id}`}
          width={10}
          height={10}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={10}
            stroke={style.stroke}
            strokeWidth={2}
            strokeOpacity={0.38}
          />
        </pattern>
      </defs>
    ) : null;

  switch (shape.type) {
    case 'rect':
      return (
        <g transform={groupTransform}>
          {renderHatchDef()}
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            rx={6}
            ry={6}
            {...commonStroke}
            fill={fillProps.fill}
            fillOpacity={fillProps.fillOpacity}
          />
        </g>
      );

    case 'ellipse':
      return (
        <g transform={groupTransform}>
          {renderHatchDef()}
          <ellipse
            cx={w / 2}
            cy={h / 2}
            rx={w / 2}
            ry={h / 2}
            {...commonStroke}
            fill={fillProps.fill}
            fillOpacity={fillProps.fillOpacity}
          />
        </g>
      );

    case 'diamond': {
      const points = `${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`;
      return (
        <g transform={groupTransform}>
          {renderHatchDef()}
          <polygon
            points={points}
            {...commonStroke}
            fill={fillProps.fill}
            fillOpacity={fillProps.fillOpacity}
          />
        </g>
      );
    }

    case 'draw': {
      const d = pointsToSmoothSvgPath(shape.points);
      const filter = brushType === 'soft' ? 'url(#soft-brush-filter)' : undefined;
      const mixBlendMode = brushType === 'highlighter' ? 'multiply' : undefined;
      return (
        <g transform={groupTransform} style={mixBlendMode ? { mixBlendMode } : undefined}>
          <path d={d} {...commonStroke} fill="none" filter={filter} />
        </g>
      );
    }

    case 'line': {
      const [p1, p2] = shape.points;
      return (
        <g transform={groupTransform}>
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} {...commonStroke} fill="none" />
        </g>
      );
    }

    case 'arrow': {
      const [p0, p1, p2] = getArrowPoints(shape);
      const tx = Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y) > 0.5 ? p2.x - p1.x : p2.x - p0.x;
      const ty = Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y) > 0.5 ? p2.y - p1.y : p2.y - p0.y;
      const angle = Math.atan2(ty, tx);
      const headLen = Math.max(10, effectiveWidth * 3.2);
      const wingAngle = Math.PI / 6;
      const hx1 = p2.x - headLen * Math.cos(angle - wingAngle);
      const hy1 = p2.y - headLen * Math.sin(angle - wingAngle);
      const hx2 = p2.x - headLen * Math.cos(angle + wingAngle);
      const hy2 = p2.y - headLen * Math.sin(angle + wingAngle);

      return (
        <g transform={groupTransform}>
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
            {...commonStroke}
            fill="none"
          />
          <path
            d={`M ${hx1} ${hy1} L ${p2.x} ${p2.y} L ${hx2} ${hy2}`}
            stroke={style.stroke}
            strokeWidth={effectiveWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={strokeOpacity}
            fill="none"
          />
        </g>
      );
    }

    case 'text': {
      if (isEditing) return null;
      const fontSize = style.fontSize ?? 22;
      const fontFamily = style.fontFamily ?? DEFAULT_FONT_FAMILY;
      const lines = (shape.text || '').split('\n');
      return (
        <g transform={groupTransform} opacity={style.opacity}>
          <text
            x={4}
            y={fontSize}
            fill={style.stroke}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontWeight={500}
            style={{ userSelect: 'none' }}
          >
            {lines.map((line, idx) => (
              <tspan key={idx} x={4} dy={idx === 0 ? 0 : fontSize * 1.28}>
                {line || ' '}
              </tspan>
            ))}
          </text>
        </g>
      );
    }

    case 'image':
      return (
        <g transform={groupTransform} opacity={style.opacity}>
          <image
            href={shape.src}
            x={0}
            y={0}
            width={w}
            height={h}
            preserveAspectRatio="none"
          />
        </g>
      );

    case 'pin': {
      const pinColor = style.stroke;
      const { art, label, scale } = getPinLayout(shape);
      return (
        <g transform={groupTransform} opacity={style.opacity}>
          <title>{`${label.text} — ID: ${shape.slug} · tạo bởi ${shape.createdBy?.name ?? '?'}`}</title>
          {/* Teardrop marker (viewBox 0 0 24 30), uniformly scaled so it never distorts */}
          <g transform={`translate(${art.x}, ${art.y}) scale(${art.scale})`}>
            <path
              d="M12 29 C12 29 2 17.5 2 11 A10 10 0 0 1 22 11 C22 17.5 12 29 12 29 Z"
              fill={pinColor}
              stroke="#ffffff"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
            <circle cx={12} cy={11} r={3.8} fill="#ffffff" />
          </g>
          {!isEditing && (
            <g transform={`translate(${label.x}, ${label.y})`}>
              <rect
                width={label.width}
                height={label.height}
                rx={6 * scale}
                fill="#ffffff"
                stroke={pinColor}
                strokeWidth={1.4 * scale}
              />
              <text
                x={label.width / 2}
                y={label.height / 2}
                dominantBaseline="central"
                textAnchor="middle"
                fontSize={label.fontSize}
                fontWeight={600}
                fill={pinColor}
                fontFamily="Inter, system-ui, sans-serif"
                style={{ userSelect: 'none' }}
              >
                {label.text}
              </text>
            </g>
          )}
        </g>
      );
    }

    case 'sticker':
      return (
        <g transform={groupTransform} opacity={style.opacity}>
          {/* Drawn as an image so sticker SVG can never run script (shared boards) */}
          <image
            href={stickerImageHref(shape.viewBox, shape.svgMarkup)}
            x={0}
            y={0}
            width={w}
            height={h}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      );
  }
});

ShapeRenderer.displayName = 'ShapeRenderer';
