import type { PinAuthor } from '../types/canvas';
import { createId } from './id';

const STORAGE_KEY = 'drawcustom.user.v1';
let cached: PinAuthor | null = null;

/**
 * The person using this browser. Today it is an anonymous id kept in localStorage;
 * swap this function for the real auth user once the shared board has accounts.
 */
export function getCurrentUser(): PinAuthor {
  if (cached) return cached;
  const fallback: PinAuthor = {
    id: createId('user'),
    name: `Khách ${Math.floor(1000 + Math.random() * 9000)}`,
  };
  if (typeof window === 'undefined') return (cached = fallback);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as PinAuthor) : null;
    if (parsed?.id && parsed?.name) return (cached = parsed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
  } catch {
    // Storage unavailable: keep an in-memory identity for this session
  }
  return (cached = fallback);
}
