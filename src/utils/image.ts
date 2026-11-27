import type { ImageShape, Point, ShapeStyle } from '../types/canvas';
import { createId } from './id';

const MAX_INITIAL_DIM = 420;

export function readImageFileAsShape(
  file: File,
  worldCenter: Point,
  style: ShapeStyle
): Promise<ImageShape> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image data'));
      img.onload = () => {
        const nw = img.naturalWidth || 300;
        const nh = img.naturalHeight || 200;
        const scale = Math.min(1, MAX_INITIAL_DIM / Math.max(nw, nh));
        const width = Math.max(24, Math.round(nw * scale));
        const height = Math.max(24, Math.round(nh * scale));
        resolve({
          id: createId('img'),
          type: 'image',
          x: worldCenter.x - width / 2,
          y: worldCenter.y - height / 2,
          width,
          height,
          src,
          aspectRatio: nw / nh,
          style: { ...style },
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
