// The curators: museum guards with lanterns. They walk a patrol of waypoints,
// pausing at each; their lantern throws a vision cone ahead of them. A thief
// caught in a cone fills the curator's suspicion; a full suspicion turns the
// patrol into a chase toward the last place the thief was seen. A chase that
// touches the thief ends the night — but the game always gives a fair grace
// beat first, shown as SPOTTED!, so a caught moment never feels cheap.
import { GUARD } from './config.js';
import { moveCircle, inVisionCone, inShadow, inVent, distance, angleTo, angleDiff } from './world.js';

export const GUARD_STATE = { PATROL: 'patrol', SUSPICIOUS: 'suspicious', CHASE: 'chase', LURED: 'lured', DAZED: 'dazed' };

const CURATOR_NAMES = ['Curator Anselm', 'Curator Brigitte', 'Curator Odo', 'Curator Mireille', 'Curator Thaddeus'];

export function createGuards(room, nightIndex, heat) {
  return room.guardSpawns.map((spawn, i) => {
    const first = spawn.points[0];
    return {
      name: CURATOR_NAMES[i % CURATOR_NAMES.length],
      x: first.x,
      y: first.y,
      radius: GUARD.radius,
      facing: angleTo(first.x, first.y, spawn.points[1].x, spawn.points[1].y),
      waypoint: 1,
      wait: 0,
      waitSeconds: spawn.waitSeconds,
      stuckTime: 0,
      state: GUARD_STATE.PATROL,
      suspicion: 0,
      lastSeen: null,
      chaseTime: 0,
      grace: 0,
      luredTo: null,
      dazedUntil: 0,
      speedBoost: 1 + heat * 0.04,
      patrol: spawn,
    };
  });
}

/** Can this guard see the thief right now? Shadow pools and vents hide them. */
export function guardSeesThief(state, guard, now) {
  const thief = state.thief;
  if (thief.inVentCrawl) return false;
  if (thief.inShadowPool) return false;
  if (now < guard.dazedUntil) return false;
  if (state.smokeUntil > now && Math.hypot(thief.x - state.smokeX, thief.y - state.smokeY) < 95) return false;
  const range = GUARD.coneRange * (thief.sneaking ? 0.72 : 1);
  return inVisionCone(guard.x, guard.y, guard.facing, range, GUARD.coneHalfAngle, thief.x, thief.y, state.room.walls);
}

function stepPatrol(state, guard, dt) {
  const target = guard.patrol.points[guard.waypoint];
  if (guard.wait > 0) {
    guard.wait -= dt;
    if (guard.wait <= 0) {
      guard.waypoint = (guard.waypoint + 1) % guard.patrol.points.length;
    }
    return;
  }
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const d = Math.hypot(dx, dy);
  if (d < 6) {
    guard.wait = guard.waitSeconds;
    return;
  }
  const speed = GUARD.patrolSpeed * guard.speedBoost;
  const next = moveCircle(guard.x, guard.y, (dx / d) * speed * dt, (dy / d) * speed * dt, guard.radius, state.room.walls);
  const moved = Math.hypot(next.x - guard.x, next.y - guard.y);
  guard.x = next.x;
  guard.y = next.y;
  guard.facing = Math.atan2(dy, dx);
  // A wall between two waypoints must never freeze a curator in place: if a
  // patrol step barely moves the guard, give up on that waypoint after a
  // beat and a half and walk to the next one instead.
  if (moved < speed * dt * 0.25) {
    guard.stuckTime += dt;
    if (guard.stuckTime > 1.5) {
      guard.waypoint = (guard.waypoint + 1) % guard.patrol.points.length;
      guard.stuckTime = 0;
    }
  } else {
    guard.stuckTime = 0;
  }
}

function stepChase(state, guard, dt) {
  const goal = guard.lastSeen || { x: state.thief.x, y: state.thief.y };
  const dx = goal.x - guard.x;
  const dy = goal.y - guard.y;
  const d = Math.hypot(dx, dy);
  if (d > 8) {
    const speed = GUARD.chaseSpeed * guard.speedBoost;
    const next = moveCircle(guard.x, guard.y, (dx / d) * speed * dt, (dy / d) * speed * dt, guard.radius, state.room.walls);
    guard.x = next.x;
    guard.y = next.y;
    guard.facing = Math.atan2(dy, dx);
  }
  guard.chaseTime += dt;
  if (guard.chaseTime > 6) {
    guard.state = GUARD_STATE.PATROL;
    guard.suspicion = 0.4;
    guard.chaseTime = 0;
    guard.lastSeen = null;
  }
}

/** Step every curator one frame: patrol, suspicion, chase, lure, daze. */
export function stepGuards(state, dt, now) {
  for (const guard of state.guards) {
    const sees = guardSeesThief(state, guard, now);
    if (sees) {
      guard.suspicion += GUARD.suspicionPerSecond * dt * (1 - 0.15 * (state.upgrades.shoes || 0));
      guard.lastSeen = { x: state.thief.x, y: state.thief.y };
      state.thief.timesSeen += 1;
      state.thief.ghost = false;
      if (guard.suspicion >= 1 && guard.state !== GUARD_STATE.CHASE) {
        guard.state = GUARD_STATE.CHASE;
        guard.chaseTime = 0;
        guard.grace = GUARD.graceSeconds;
        state.events.push({ type: 'spotted', text: `${guard.name} spotted you!` });
      } else if (guard.suspicion >= 0.45 && guard.state === GUARD_STATE.PATROL) {
        guard.state = GUARD_STATE.SUSPICIOUS;
      }
    } else {
      guard.suspicion = Math.max(0, guard.suspicion - GUARD.suspicionDecay * dt);
      if (guard.state === GUARD_STATE.SUSPICIOUS && guard.suspicion < 0.2) {
        guard.state = GUARD_STATE.PATROL;
      }
    }
    if (guard.grace > 0) guard.grace -= dt;
    if (guard.state === GUARD_STATE.LURED && guard.luredTo) {
      const dx = guard.luredTo.x - guard.x;
      const dy = guard.luredTo.y - guard.y;
      const d = Math.hypot(dx, dy);
      if (d < 10) {
        guard.state = GUARD_STATE.PATROL;
        guard.luredTo = null;
      } else {
        const speed = GUARD.patrolSpeed * 1.4;
        const next = moveCircle(guard.x, guard.y, (dx / d) * speed * dt, (dy / d) * speed * dt, guard.radius, state.room.walls);
        guard.x = next.x;
        guard.y = next.y;
        guard.facing = Math.atan2(dy, dx);
      }
      continue;
    }
    if (now < guard.dazedUntil) continue;
    if (guard.state === GUARD_STATE.CHASE) {
      stepChase(state, guard, dt);
    } else {
      stepPatrol(state, guard, dt);
    }
    // A chase that touches the thief ends the night, after the grace beat.
    if (guard.state === GUARD_STATE.CHASE && guard.grace <= 0) {
      if (distance(guard.x, guard.y, state.thief.x, state.thief.y) < GUARD.catchRadius + state.thief.radius) {
        state.caughtBy = guard.name;
        state.screen = 'caught';
      }
    }
  }
}

/** The decoy music box lures the nearest curator to a spot. */
export function lureNearestGuard(state, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const guard of state.guards) {
    const d = distance(guard.x, guard.y, x, y);
    if (d < bestD) { bestD = d; best = guard; }
  }
  if (!best) return false;
  best.state = GUARD_STATE.LURED;
  best.luredTo = { x, y };
  best.suspicion = 0;
  return true;
}

/** The lantern snuff dazes the nearest curator's lantern for a while. */
export function snuffNearestLantern(state, now, seconds) {
  let best = null;
  let bestD = Infinity;
  for (const guard of state.guards) {
    const d = distance(guard.x, guard.y, state.thief.x, state.thief.y);
    if (d < bestD) { bestD = d; best = guard; }
  }
  if (!best) return false;
  best.dazedUntil = now + seconds;
  best.suspicion = 0;
  if (best.state === GUARD_STATE.CHASE) best.state = GUARD_STATE.PATROL;
  return true;
}
