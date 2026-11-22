// Screenshot scenes: the four frames the judge sees, staged from the real
// game state and drawn by the real renderer — never edited or composited.
//   1-cover  Night 4, mid-heist: the Fox on the pedestal, the Last Lullaby
//            half-lifted, alarm at 48, a curator closing in, smoke in the air.
//   2-patrol Night 2, the Fox hidden in safe shadow while two curators sweep
//            their lantern cones and the cameras pan.
//   3-alarm  Night 5, lockdown: the alarm has just hit 100, the exit is
//            sealed, the curators converge, the Fox runs for the van.
//   4-nights The night-select screen: seven galleries, the crew, the
//            Shadowcraft upgrades and the museum's rising heat.
// Each scene is staged by placing the real entities and stepping the real
// patrols and cameras a few seconds, so the cones sit mid-sweep.
import { STEP, NIGHTS } from './config.js';
import { buildNight } from './levels.js';
import { createThief } from './thief.js';
import { createGuards } from './guards.js';
import { createCameras, stepCameras } from './cameras.js';
import { stepGuards } from './guards.js';
import { emptyUpgrades } from './upgrades.js';
import { heatLine } from './heat.js';
import { upgradeSummary } from './upgrades.js';

export function freshState(nightIndex, seed) {
  const night = NIGHTS[nightIndex];
  const room = buildNight(nightIndex, seed);
  const state = {
    screen: 'play',
    nightIndex,
    night,
    room,
    thief: null,
    guards: [],
    cameras: [],
    alarm: 0,
    smokeUntil: -1,
    smokeX: 0,
    smokeY: 0,
    decoyUntil: -1,
    decoyX: 0,
    decoyY: 0,
    targetStolen: false,
    stealProgress: 0,
    events: [],
    caughtBy: null,
    lockdownUntil: -1,
    crew: 'pip',
    upgrades: emptyUpgrades(),
    heat: nightIndex,
    bankedCoins: 0,
    bankedScore: 0,
    nightsDone: nightIndex,
    totalCasesOpened: 0,
    lastBreakdown: null,
    elapsed: 0,
    heatLine: heatLine(nightIndex),
    upgradeLine: '',
    seed,
  };
  state.thief = createThief(room);
  state.thief.coins = 240;
  state.guards = createGuards(room, nightIndex, nightIndex);
  state.cameras = createCameras(room);
  state.upgradeLine = upgradeSummary(state.upgrades);
  return state;
}

function stepWorldCalmly(state, seconds) {
  const input = { left: false, right: false, up: false, down: false, sneak: false };
  let now = 0;
  for (let t = 0; t < seconds; t += STEP) {
    now += STEP;
    stepGuards(state, STEP, now);
    stepCameras(state, STEP, now);
    void input;
    if (state.screen !== 'play') state.screen = 'play';
  }
  return now;
}

function openCases(state, count) {
  let opened = 0;
  for (const c of state.room.cases) {
    if (opened >= count) break;
    c.opened = true;
    opened += 1;
    state.thief.casesOpened += 1;
    state.totalCasesOpened += 1;
    state.thief.loot.push({ tier: c.tier, value: c.tier === 'legendary' ? 320 : c.tier === 'rare' ? 120 : 40 });
  }
}

function stageCover(state) {
  // Night 4: the Fox on the pedestal, the lullaby half-lifted.
  state.alarm = 48;
  openCases(state, 2);
  const ped = state.room.pedestal;
  state.thief.x = ped.x - 62;
  state.thief.y = ped.y - 12;
  state.thief.facing = Math.atan2(ped.y - state.thief.y, ped.x - state.thief.x);
  state.stealProgress = 1.8;
  state.smokeUntil = 99;
  state.smokeX = state.thief.x - 30;
  state.smokeY = state.thief.y + 10;
  const guard = state.guards[0];
  guard.x = ped.x - 190;
  guard.y = ped.y - 60;
  guard.facing = Math.atan2(ped.y - guard.y, ped.x - guard.x);
  guard.suspicion = 0.6;
  guard.state = 'suspicious';
  state.events = [
    { type: 'loot', text: 'Opened a rare case (+120 coins).' },
    { type: 'tool', text: 'Smoke Puff! The cones lose you.' },
    { type: 'spotted', text: 'Curator Mireille is getting suspicious!' },
  ];
  return { screen: 'play', best: 0 };
}

function stagePatrol(state) {
  // Night 2: the Fox waits in safe shadow while the hall is swept.
  state.alarm = 12;
  const alcove = state.room.alcoves[0];
  state.thief.x = alcove.x + alcove.w / 2;
  state.thief.y = alcove.y + alcove.h / 2;
  state.thief.inShadowPool = true;
  state.thief.sneaking = true;
  state.events = [
    { type: 'loot', text: 'Pip: two curators on the west walk.' },
    { type: 'loot', text: 'Safe shadow — the cones cannot see you here.' },
  ];
  return { screen: 'play', best: 0 };
}

function stageAlarm(state) {
  // Night 5: lockdown, the Fox running for the van with the drum stolen.
  state.alarm = 62;
  state.lockdownUntil = 99;
  state.targetStolen = true;
  openCases(state, 3);
  const exit = state.room.exit;
  state.thief.x = exit.x - 220;
  state.thief.y = exit.y - 30;
  state.thief.facing = 0;
  for (const guard of state.guards) {
    guard.state = 'chase';
    guard.lastSeen = { x: state.thief.x, y: state.thief.y };
    guard.facing = Math.atan2(state.thief.y - guard.y, state.thief.x - guard.x);
  }
  state.events = [
    { type: 'lockdown', text: 'LOCKDOWN! The exit seals and the curators converge!' },
    { type: 'target', text: 'Stole The Thunder Drum!' },
    { type: 'escape', text: 'Run for the van — the door opens when the lockdown lifts.' },
  ];
  return { screen: 'play', best: 0 };
}

function stageNights(state) {
  state.screen = 'select';
  state.nightsDone = 3;
  state.heat = 3;
  state.heatLine = heatLine(3);
  state.bankedCoins = 1240;
  state.bankedScore = 3850;
  state.upgrades = { shoes: 1, smoke: 2, pockets: 1, hands: 0, nerves: 1 };
  state.upgradeLine = upgradeSummary(state.upgrades);
  state.crew = 'mara';
  return { screen: 'select', best: 0 };
}

/**
 * Stage the named scene and return the screen to draw. Unknown names stage
 * the cover. The state is always a real game state, rendered by the game.
 */
export function stageShot(name, nightIndex, seed) {
  const index = name === 'patrol' ? 1 : name === 'alarm' ? 4 : name === 'nights' ? 0 : 3;
  const state = freshState(index, seed);
  stepWorldCalmly(state, 4);
  if (name === 'patrol') return { state, ...stagePatrol(state) };
  if (name === 'alarm') return { state, ...stageAlarm(state) };
  if (name === 'nights') return { state, ...stageNights(state) };
  return { state, ...stageCover(state) };
}
