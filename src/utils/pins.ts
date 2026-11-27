import type { Camera, CanvasShape, PinAuthor, PinShape, Point } from '../types/canvas';
import { PIN_BASE_HEIGHT, PIN_BASE_WIDTH, clampZoom } from './geometry';

export const PIN_WIDTH = PIN_BASE_WIDTH;
export const PIN_HEIGHT = PIN_BASE_HEIGHT;
export const PIN_FOCUS_ZOOM = 1.5;
export const PIN_DEFAULT_COLOR = '#e03131';
export const PIN_DEFAULT_TITLE = 'idea';
export const PIN_SLUG_MAX_LENGTH = 48;
export const UNKNOWN_AUTHOR: PinAuthor = { id: 'unknown', name: 'Không rõ' };

/** Lowercase + strip Vietnamese diacritics so "ha noi" matches "Hà Nội". */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Titles are stored without the leading "#"; it is always added when displayed. */
export function cleanPinTitle(raw: string): string {
  return raw.replace(/^[#\s]+/, '').replace(/\s+/g, ' ').trim();
}

export function formatPinTitle(title: string): string {
  return `#${cleanPinTitle(title) || PIN_DEFAULT_TITLE}`;
}

/** "Quán Cà Phê #1" → "quan-ca-phe-1". Only [a-z0-9-], safe for URLs and embeds. */
export function slugify(raw: string): string {
  const slug = normalizeSearchText(raw)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, PIN_SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');
  return slug || PIN_DEFAULT_TITLE;
}

export function formatPinSlug(slug: string): string {
  return `#${slug}`;
}

export function isPin(shape: CanvasShape | null | undefined): shape is PinShape {
  return Boolean(shape && shape.type === 'pin');
}

export function isPinSlugTaken(
  shapes: Record<string, CanvasShape>,
  slug: string,
  excludeId?: string
): boolean {
  return Object.values(shapes).some((s) => isPin(s) && s.id !== excludeId && s.slug === slug);
}

/** slugify(base), or with -2, -3, ... appended until no other pin uses it. */
export function makeUniquePinSlug(
  shapes: Record<string, CanvasShape>,
  base: string,
  excludeId?: string
): string {
  const clean = slugify(base);
  if (!isPinSlugTaken(shapes, clean, excludeId)) return clean;
  const stem = clean.replace(/-\d+$/, '') || PIN_DEFAULT_TITLE;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = stem.slice(0, PIN_SLUG_MAX_LENGTH - suffix.length) + suffix;
    if (!isPinSlugTaken(shapes, candidate, excludeId)) return candidate;
  }
}

export function findPinBySlug(
  shapes: Record<string, CanvasShape>,
  slug: string
): PinShape | undefined {
  const key = slug.replace(/^#/, '').toLowerCase();
  return Object.values(shapes).find((s): s is PinShape => isPin(s) && s.slug === key);
}

/**
 * Upgrades pins saved by older versions ({ name }) and guarantees every slug is unique
 * (e.g. after importing a hand-edited JSON). Returns the same object if nothing changed.
 */
export function migratePins(shapes: Record<string, CanvasShape>): Record<string, CanvasShape> {
  let changed = false;
  const next: Record<string, CanvasShape> = {};
  for (const [id, shape] of Object.entries(shapes)) {
    if (!isPin(shape)) {
      next[id] = shape;
      continue;
    }
    const legacy = shape as Partial<PinShape> & PinShape & { name?: string };
    const title =
      cleanPinTitle(legacy.title ?? (legacy.name ?? '').replace(/^#+/, '')) || PIN_DEFAULT_TITLE;
    const slug = makeUniquePinSlug(next, legacy.slug ? legacy.slug : title);
    const { name: _legacyName, ...rest } = legacy;
    const pin: PinShape = {
      ...rest,
      title,
      slug,
      createdBy: legacy.createdBy ?? UNKNOWN_AUTHOR,
      createdAt: legacy.createdAt ?? 0,
    };
    if (
      _legacyName !== undefined ||
      pin.slug !== legacy.slug ||
      pin.title !== legacy.title ||
      pin.createdBy !== legacy.createdBy ||
      pin.createdAt !== legacy.createdAt
    ) {
      changed = true;
    }
    next[id] = pin;
  }
  return changed ? next : shapes;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function isSubsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] === needle[i]) i++;
  }
  return i === needle.length;
}

/**
 * How well a normalized text matches a normalized query.
 * Lower is better; null = no match. Tolerates missing letters and small typos.
 */
export function pinMatchScore(text: string, query: string): number | null {
  if (!query) return null;
  if (text.startsWith(query)) return 0;
  const words = text.split(/[ -]/);
  if (words.some((w) => w.startsWith(query))) return 1;
  if (text.includes(query)) return 2;
  const tokens = query.split(' ');
  if (tokens.length > 1 && tokens.every((t) => text.includes(t))) return 3;

  const compactQuery = query.replace(/[ -]/g, '');
  if (compactQuery.length >= 3 && isSubsequence(compactQuery, text.replace(/[ -]/g, ''))) return 4;

  if (compactQuery.length >= 3) {
    const maxTypos = compactQuery.length <= 5 ? 1 : 2;
    const best = Math.min(
      ...[text, ...words].flatMap((c) => [
        levenshtein(query, c),
        levenshtein(query, c.slice(0, query.length)),
      ])
    );
    if (best <= maxTypos) return 5 + best;
  }
  return null;
}

/**
 * Pins matching the query by slug or title (empty query → no results), best first.
 * An exact slug ("#idea-2" or "idea-2") always ranks first.
 */
export function searchPins(shapes: Record<string, CanvasShape>, query: string): PinShape[] {
  const raw = query.trim().replace(/^#+/, '');
  const q = normalizeSearchText(raw);
  if (!q) return [];
  const exactSlug = raw.toLowerCase();
  const scored: Array<{ pin: PinShape; score: number }> = [];
  for (const shape of Object.values(shapes)) {
    if (!isPin(shape)) continue;
    if (shape.slug === exactSlug) {
      scored.push({ pin: shape, score: -1 });
      continue;
    }
    const scores = [
      pinMatchScore(normalizeSearchText(shape.title), q),
      pinMatchScore(shape.slug, q),
    ].filter((s): s is number => s !== null);
    if (scores.length > 0) scored.push({ pin: shape, score: Math.min(...scores) });
  }
  scored.sort((a, b) => a.score - b.score || a.pin.slug.localeCompare(b.pin.slug));
  return scored.map((r) => r.pin);
}

export function getPinCenter(pin: Pick<PinShape, 'x' | 'y' | 'width' | 'height'>): Point {
  return { x: pin.x + pin.width / 2, y: pin.y + pin.height / 2 };
}

/** Link that opens this board and flies to the pin. Base for future embeds. */
export function getPinPermalink(slug: string): string {
  if (typeof window === 'undefined') return `#pin=${slug}`;
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}#pin=${encodeURIComponent(slug)}`;
}

export function readPinSlugFromHash(hash: string): string | null {
  const m = /(?:^#|&)pin=([^&]+)/.exec(hash);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Camera that puts a world point in the middle of a viewport of the given size. */
export function cameraCenteredOn(
  worldPoint: Point,
  viewport: { width: number; height: number },
  zoom: number
): Camera {
  const z = clampZoom(zoom);
  return {
    x: viewport.width / 2 - worldPoint.x * z,
    y: viewport.height / 2 - worldPoint.y * z,
    zoom: z,
  };
}
