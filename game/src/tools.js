// Tools: the Fox's bag of tricks, each bought with coins at a cost, each
// used with a number key. A tool at a cost is the second criterion's demand:
// the player must choose when a puff of smoke is worth thirty coins.
//   1 Smoke Puff — a cloud no cone can see through, for a few seconds.
//   2 Decoy Music Box — dropped at the thief's feet; the nearest curator
//       walks to the lullaby instead of their patrol.
//   3 Lockpick — opens the nearest locked case or door at once.
//   4 Lantern Snuff — douses the nearest curator's lantern for a while.
import { TOOLS } from './config.js';
import { lureNearestGuard, snuffNearestLantern } from './guards.js';
import { distance } from './world.js';

export function toolCost(id, state) {
  if (id === 'smoke') return TOOLS.smoke.cost;
  if (id === 'decoy') return TOOLS.decoy.cost;
  if (id === 'lockpick') return TOOLS.lockpick.cost;
  if (id === 'snuff') return TOOLS.snuff.cost;
  return 0;
}

export function toolDuration(id, state) {
  if (id === 'smoke') return TOOLS.smoke.duration + 1.2 * (state.upgrades.smoke || 0);
  if (id === 'decoy') return TOOLS.decoy.duration;
  if (id === 'snuff') return TOOLS.snuff.duration;
  return 0;
}

/** Can the thief afford this tool right now? */
export function canAffordTool(state, id) {
  return state.thief.coins >= toolCost(id, state);
}

/** Use a tool. Returns true when it fired, false when it could not. */
export function useTool(state, id, now) {
  const cost = toolCost(id, state);
  if (state.thief.coins < cost) {
    state.events.push({ type: 'broke', text: `Not enough coins for the ${TOOLS[id].name} (${cost}).` });
    return false;
  }
  if (id === 'smoke') {
    state.thief.coins -= cost;
    state.smokeUntil = now + toolDuration(id, state);
    state.smokeX = state.thief.x;
    state.smokeY = state.thief.y;
    state.events.push({ type: 'tool', text: 'Smoke Puff! The cones lose you.' });
    return true;
  }
  if (id === 'decoy') {
    state.thief.coins -= cost;
    const ok = lureNearestGuard(state, state.thief.x, state.thief.y);
    if (!ok) { state.thief.coins += cost; return false; }
    state.decoyUntil = now + toolDuration(id, state);
    state.decoyX = state.thief.x;
    state.decoyY = state.thief.y;
    state.events.push({ type: 'tool', text: 'Decoy Music Box plays — a curator turns toward it.' });
    return true;
  }
  if (id === 'lockpick') {
    // Nearest locked door first, then the nearest sealed case.
    let bestDoor = null;
    let bestD = Infinity;
    for (const door of state.room.doors) {
      if (!door.locked) continue;
      const d = distance(state.thief.x, state.thief.y, door.x + door.w / 2, door.y + door.h / 2);
      if (d < bestD) { bestD = d; bestDoor = door; }
    }
    if (bestDoor && bestD < 90) {
      state.thief.coins -= cost;
      bestDoor.locked = false;
      bestDoor.open = true;
      state.events.push({ type: 'tool', text: 'Lockpick clicks — the service corridor is open.' });
      return true;
    }
    let bestCase = null;
    bestD = Infinity;
    for (const c of state.room.cases) {
      if (c.opened) continue;
      const d = distance(state.thief.x, state.thief.y, c.x, c.y);
      if (d < bestD) { bestD = d; bestCase = c; }
    }
    if (bestCase && bestD < 60) {
      state.thief.coins -= cost;
      bestCase.opened = true;
      state.thief.casesOpened += 1;
      const value = bestCase.tier === 'legendary' ? 320 : bestCase.tier === 'rare' ? 120 : 40;
      state.thief.coins += value;
      state.thief.score += value;
      state.events.push({ type: 'tool', text: `Lockpick pops a ${bestCase.tier} case (+${value}).` });
      return true;
    }
    state.events.push({ type: 'tool', text: 'No lock in reach for the Lockpick.' });
    return false;
  }
  if (id === 'snuff') {
    state.thief.coins -= cost;
    const ok = snuffNearestLantern(state, now, toolDuration(id, state));
    if (!ok) { state.thief.coins += cost; return false; }
    state.events.push({ type: 'tool', text: 'Lantern Snuff — the nearest lantern gutters out.' });
    return true;
  }
  return false;
}

/** The four tool buttons the HUD draws, with their keys and costs. */
export function toolButtons(state) {
  return ['smoke', 'decoy', 'lockpick', 'snuff'].map((id) => ({
    id,
    key: TOOLS[id].key,
    name: TOOLS[id].name,
    cost: toolCost(id, state),
    affordable: canAffordTool(state, id),
  }));
}
