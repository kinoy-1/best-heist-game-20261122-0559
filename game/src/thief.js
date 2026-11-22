// The thief: the Velvet Fox. Walks with WASD or the arrow keys, or clicks a
// spot to walk there; crawls slowly through vents; sneaks (Shift) to halve
// the noise they make; carries loot in a limited number of slots; opens
// display cases by standing beside them and holding still.
import { ROOM, THIEF } from './config.js';
import { moveCircle, inVent, inShadow, pointInRect } from './world.js';

export function createThief(room) {
  return {
    x: ROOM.x + 70,
    y: ROOM.y + ROOM.height - 70,
    radius: THIEF.radius,
    facing: -Math.PI / 2,
    moving: false,
    sneaking: false,
    inVentCrawl: false,
    inShadowPool: false,
    target: null,
    loot: [],
    coins: 0,
    score: 0,
    casesOpened: 0,
    timesSeen: 0,
    ghost: true,
  };
}

/** How many loot slots the thief has, after crew and upgrades. */
export function lootSlots(state) {
  let slots = THIEF.carrySlots;
  if (state.crew === 'joss') slots += 2;
  slots += (state.upgrades.pockets || 0);
  return slots;
}

export function thiefSpeed(state) {
  const thief = state.thief;
  if (thief.inVentCrawl) return THIEF.ventSpeed;
  if (thief.sneaking) return THIEF.sneakSpeed;
  return THIEF.walkSpeed;
}

/** Step the thief one frame from keyboard input and a click target. */
export function stepThief(state, dt, input) {
  const thief = state.thief;
  const room = state.room;
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  if (mx !== 0 || my !== 0) {
    thief.target = null;
  } else if (thief.target) {
    const dx = thief.target.x - thief.x;
    const dy = thief.target.y - thief.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      thief.target = null;
    } else {
      mx = dx / d;
      my = dy / d;
    }
  }
  thief.sneaking = !!input.sneak;
  const length = Math.hypot(mx, my);
  thief.moving = length > 0;
  if (length > 0) {
    const speed = thiefSpeed(state);
    const nx = (mx / length) * speed * dt;
    const ny = (my / length) * speed * dt;
    const next = moveCircle(thief.x, thief.y, nx, ny, thief.radius, room.walls);
    thief.x = next.x;
    thief.y = next.y;
    thief.facing = Math.atan2(ny, nx);
  }
  thief.inVentCrawl = inVent(thief.x, thief.y, room.vents);
  thief.inShadowPool = inShadow(thief.x, thief.y, room.alcoves);
  // Standing still beside a case cracks it open; Mara does it at a touch.
  const hands = 1 + (state.upgrades.hands || 0);
  for (const c of room.cases) {
    if (c.opened) continue;
    const near = Math.hypot(c.x - thief.x, c.y - thief.y) < 54;
    if (!near) { c.opening = 0; continue; }
    if (state.crew === 'mara') {
      openCase(state, c);
    } else {
      c.opening += dt * hands * (thief.moving ? 0.35 : 1);
      if (c.opening >= 1.6) openCase(state, c);
    }
  }
  // The night's target: hold still on the pedestal to lift the sound.
  const ped = room.pedestal;
  const nearPedestal = Math.hypot(ped.x - thief.x, ped.y - thief.y) < 58;
  if (nearPedestal && !state.targetStolen) {
    state.stealProgress += dt * hands;
    if (state.stealProgress >= 2.2) {
      state.targetStolen = true;
      state.thief.score += state.night.targetValue;
      state.thief.coins += state.night.targetValue;
      state.events.push({ type: 'target', text: `Stole ${state.night.target}!` });
    }
  } else {
    state.stealProgress = Math.max(0, state.stealProgress - dt * 2);
  }
}

function openCase(state, c) {
  c.opened = true;
  c.opening = 0;
  state.thief.casesOpened += 1;
  const tier = c.tier;
  const value = tier === 'legendary' ? 320 : tier === 'rare' ? 120 : 40;
  state.thief.coins += value;
  state.thief.score += value;
  if (state.thief.loot.length < lootSlots(state)) {
    state.thief.loot.push({ tier, value });
  } else {
    state.events.push({ type: 'pockets', text: 'Pockets full — the case spills its coins instead.' });
  }
  state.events.push({ type: 'loot', text: `Opened a ${tier} case (+${value} coins).` });
}

/** The thief stands on the exit with the night's sound in hand. */
export function readyToEscape(state) {
  return state.targetStolen && pointInRect(state.thief.x, state.thief.y, state.room.exit);
}
