import type { Point } from '../types/canvas';

/**
 * How this page was opened. Parsed once from the URL:
 *
 *   ?board=<json url>   load a published board instead of this browser's local one
 *   ?pin=<slug>         fly to a pin on open        (legacy: #pin=<slug>)
 *   ?at=<x>,<y>,<zoom>  center the view on a world point
 *   ?embed=1            minimal read-only chrome for <iframe> embeds
 *
 * Any of board/embed switches the app to read-only "viewer" mode, which never writes
 * to localStorage (so opening someone's link can't overwrite your own board).
 */
export interface LaunchParams {
  embed: boolean;
  boardUrl: string | null;
  pinSlug: string | null;
  at: { center: Point; zoom: number } | null;
  readOnly: boolean;
}

export function parseLaunchParams(search: string, hash: string): LaunchParams {
  const q = new URLSearchParams(search);
  const embed = q.get('embed') === '1' || q.get('embed') === 'true';
  const boardUrl = q.get('board')?.trim() || null;
  const hashPin = /(?:^#|&)pin=([^&]+)/.exec(hash);
  const pinSlug = q.get('pin')?.trim() || (hashPin ? decodeURIComponent(hashPin[1]) : null);

  let at: LaunchParams['at'] = null;
  const rawAt = q.get('at');
  if (rawAt) {
    const [x, y, z] = rawAt.split(',').map(Number);
    if ([x, y].every(Number.isFinite)) {
      at = { center: { x, y }, zoom: Number.isFinite(z) && z > 0 ? z : 1 };
    }
  }

  return { embed, boardUrl, pinSlug, at, readOnly: embed || Boolean(boardUrl) };
}

export const LAUNCH: LaunchParams =
  typeof window === 'undefined'
    ? { embed: false, boardUrl: null, pinSlug: null, at: null, readOnly: false }
    : parseLaunchParams(window.location.search, window.location.hash);

export interface ShareUrlOptions {
  baseUrl: string;
  boardUrl?: string | null;
  pinSlug?: string | null;
  at?: { center: Point; zoom: number } | null;
  embed?: boolean;
}

/** Builds a link/iframe src understood by parseLaunchParams. */
export function buildShareUrl(opts: ShareUrlOptions): string {
  const q = new URLSearchParams();
  if (opts.embed) q.set('embed', '1');
  if (opts.boardUrl) q.set('board', opts.boardUrl);
  if (opts.pinSlug) q.set('pin', opts.pinSlug);
  else if (opts.at) {
    const { center, zoom } = opts.at;
    q.set('at', `${Math.round(center.x)},${Math.round(center.y)},${Number(zoom.toFixed(2))}`);
  }
  const qs = q.toString();
  return qs ? `${opts.baseUrl}?${qs}` : opts.baseUrl;
}

export function getAppBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}
