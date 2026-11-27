import React, { useState } from 'react';
import { DrawCustomAnnotator, type AnnotationResult } from './lib';

/** Units of the result: 1000 = picture width (same convention Pleiku Stories uses). */
const BASE_WIDTH = 1000;

/**
 * Standalone playground for the image annotator (open the app with ?demo=annotate).
 * Shows the result exactly the way a host page would: picture + SVG overlay placed by `bounds`.
 */
export const AnnotateDemo: React.FC = () => {
  const [picture, setPicture] = useState<{ src: string; ratio: number } | null>(null);
  const [result, setResult] = useState<AnnotationResult | null>(null);
  const [editing, setEditing] = useState(false);

  const pick = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setPicture({ src, ratio: img.naturalHeight / img.naturalWidth });
        setResult(null);
        setEditing(true);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  if (picture && editing) {
    return (
      <DrawCustomAnnotator
        image={{ src: picture.src, width: BASE_WIDTH, height: Math.round(BASE_WIDTH * picture.ratio) }}
        initial={result?.snapshot}
        onCancel={() => setEditing(false)}
        onDone={(r) => {
          setResult(r);
          setEditing(false);
        }}
        style={{ position: 'fixed', inset: 0 }}
      />
    );
  }

  const box = result?.bounds;
  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: 16, fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Thử chế độ vẽ lên ảnh</h2>
      <p>
        <input type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} />{' '}
        {picture && (
          <button type="button" onClick={() => setEditing(true)}>
            {result ? 'Sửa lại chú thích' : 'Vẽ lên ảnh'}
          </button>
        )}
      </p>
      {picture && (
        <div style={{ position: 'relative', width: '100%', containerType: 'inline-size' }}>
          <img src={picture.src} alt="" style={{ display: 'block', width: '100%' }} />
          {box && result && (
            // Bounds are in 1/1000 of the picture width → percentages of the rendered width
            <img
              src={result.svgDataUrl}
              alt=""
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                left: `${(box.x / BASE_WIDTH) * 100}%`,
                top: `calc(${box.y / BASE_WIDTH} * 100cqw)`,
                width: `${(box.width / BASE_WIDTH) * 100}%`,
              }}
            />
          )}
        </div>
      )}
      {result && (
        <p style={{ color: '#6b7280', fontSize: 13 }}>
          Kết quả: {result.snapshot.shapeOrder.length} nét · SVG {Math.round(result.svg.length / 1024)} KB ·
          bounds = [{[box!.x, box!.y, box!.width, box!.height].map((n) => (n / BASE_WIDTH).toFixed(3)).join(', ')}]
          (đơn vị: bề rộng ảnh)
        </p>
      )}
    </div>
  );
};
