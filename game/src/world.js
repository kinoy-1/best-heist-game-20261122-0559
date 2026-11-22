// The world: one gallery at a time, its walls, its shadows, its routes and
// the line of sight every vision cone obeys. Walls block movement and sight;
// dark alcoves hide the thief; vents hide the thief and slow them down; the
// service corridor is sealed until its locked door opens.
import { ROOM } from './config.js';

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function circleHitsRect(cx, cy, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Slab test: does the segment cross the rectangle?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < rect.x || x1 > rect.x + rect.w) return false;
  } else {
    let t1 = (rect.x - x1) / dx;
    let t2 = (rect.x + rect.w - x1) / dx;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < rect.y || y1 > rect.y + rect.h) return false;
  } else {
    let t1 = (rect.y - y1) / dy;
    let t2 = (rect.y + rect.h - y1) / dy;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return true;
}

/** True when no wall stands between the two points. */
export function hasLineOfSight(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (segmentHitsRect(x1, y1, x2, y2, w)) return false;
  }
  return true;
}

/** True when the point stands inside any dark alcove. */
export function inShadow(x, y, alcoves) {
  for (const a of alcoves) {
    if (pointInRect(x, y, a)) return true;
  }
  return false;
}

/** True when the point crawls inside a vent. */
export function inVent(x, y, vents) {
  for (const v of vents) {
    if (pointInRect(x, y, v)) return true;
  }
  return false;
}

/**
 * Move a circle through the room, sliding along walls instead of sticking.
 * Returns the new position; the caller keeps the old one when fully blocked.
 */
export function moveCircle(x, y, dx, dy, radius, walls) {
  let nx = x + dx;
  let ny = y + dy;
  nx = Math.max(ROOM.x + radius, Math.min(ROOM.x + ROOM.width - radius, nx));
  ny = Math.max(ROOM.y + radius, Math.min(ROOM.y + ROOM.height - radius, ny));
  for (const w of walls) {
    if (circleHitsRect(nx, y, radius, w)) nx = x;
    if (circleHitsRect(nx, ny, radius, w)) ny = y;
    if (circleHitsRect(nx, ny, radius, w)) { nx = x; ny = y; }
  }
  return { x: nx, y: ny };
}

/** Is the circle standing on the room's exit door (the getaway van)? */
export function atExit(x, y, radius, exit) {
  return circleHitsRect(x, y, radius, exit);
}

/** Distance between two points. */
export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** Angle from one point to another. */
export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/** Normalise an angle to (-PI, PI]. */
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/** Is the target inside the cone (range + half-angle + line of sight)? */
export function inVisionCone(ox, oy, facing, range, halfAngle, tx, ty, walls) {
  const d = distance(ox, oy, tx, ty);
  if (d > range) return false;
  if (Math.abs(angleDiff(angleTo(ox, oy, tx, ty), facing)) > halfAngle) return false;
  return hasLineOfSight(ox, oy, tx, ty, walls);
}
