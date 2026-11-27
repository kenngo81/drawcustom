import type { CanvasDocument } from '../types/canvas';

export function isCanvasDocument(value: unknown): value is CanvasDocument {
  const v = value as CanvasDocument | null;
  return Boolean(
    v && v.version === 1 && v.shapes && typeof v.shapes === 'object' && Array.isArray(v.shapeOrder)
  );
}

/** Downloads the board as JSON — the same file a ?board=<url> link loads. */
export function downloadDocument(doc: CanvasDocument, fileName = `drawcustom-${Date.now()}.json`): void {
  const blob = new Blob([JSON.stringify(doc)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** Loads a published board. The host must allow CORS for the page's origin. */
export async function fetchBoard(url: string): Promise<CanvasDocument> {
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  if (!isCanvasDocument(data)) throw new Error('File không phải board DrawCustom hợp lệ');
  return data;
}
