import type { CanvasShape } from '../types/canvas';

/** Who is acting on the board. */
export interface BoardUser {
  id: string;
  name: string;
  isAdmin?: boolean;
}

/** Owner of a shape; pins from before `ownerId` existed fall back to their author. */
export function ownerOf(shape: CanvasShape): string | undefined {
  if (shape.ownerId) return shape.ownerId;
  if (shape.type === 'pin' && shape.createdBy?.id && shape.createdBy.id !== 'unknown') {
    return shape.createdBy.id;
  }
  return undefined;
}

/**
 * Default board rule: everyone can edit everything, except shapes their owner locked.
 * Owners and admins can always edit.
 */
export function canEdit(shape: CanvasShape | undefined, user: BoardUser): boolean {
  if (!shape) return false;
  if (!shape.locked) return true;
  return Boolean(user.isAdmin) || ownerOf(shape) === user.id;
}

/**
 * Only the owner (or an admin) can lock / unlock. Unowned shapes (older boards)
 * can be claimed by whoever locks them first.
 */
export function canLock(shape: CanvasShape | undefined, user: BoardUser): boolean {
  if (!shape) return false;
  if (user.isAdmin) return true;
  const owner = ownerOf(shape);
  return !owner || owner === user.id;
}
