// The Velvet Fox — entry point. Boots the canvas, owns the game state and
// the frame loop, and switches between the title screen, the night-select
// screen (seven galleries, the crew, the Shadowcraft upgrades), play, and
// the caught / escaped / campaign screens. With ?shot=cover|patrol|alarm|
// nights in the URL it stages one screenshot scene from the real game state
// and renders that frame, so the screenshots are renders of the game itself.
import { VIEW, STEP, NIGHTS } from './config.js';
import { buildNight } from './levels.js';
import { createThief, stepThief, readyToEscape } from './thief.js';
import { createGuards, stepGuards, guardSeesThief } from './guards.js';
import { createCameras, stepCameras, cameraSeesThief } from './cameras.js';
import { stepAlarm, exitSealed } from './alarm.js';
import { useTool } from './tools.js';
import { crewBonusLine } from './crew.js';
import { emptyUpgrades, buyUpgrade, upgradeSummary } from './upgrades.js';
import { heatLine } from './heat.js';
import { escapeNight } from './getaway.js';
import { drawPlay, SCREEN_TITLE, SCREEN_SELECT, SCREEN_PLAY, SCREEN_CAUGHT, SCREEN_ESCAPED, SCREEN_CAMPAIGN } from './render.js';
import { drawHud, drawTitle, drawNightSelect, drawCaught, drawEscaped, drawCampaign } from './hud.js';
import { createInput, attachInput, endFrameInput } from './input.js';
import { unlockAudio, playFootstep, playLootChime, playTargetStolen, playSpotted, playLockdownBell, playCaught, playGetaway, setAlarmHum, stopAlarmHum } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '4');

function newCampaign() {
  return {
    screen: SCREEN_TITLE,
    nightIndex: 0,
    night: NIGHTS[0],
    room: null,
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
    heat: 0,
    bankedCoins: 0,
    bankedScore: 0,
    nightsDone: 0,
    totalCasesOpened: 0,
    lastBreakdown: null,
    elapsed: 0,
    nightStart: 0,
    heatLine: heatLine(0),
    upgradeLine: upgradeSummary(emptyUpgrades()),
    now: 0,
    announcedEvents: 0,
    getawayTimer: 0,
  };
}

function startNight(state, nightIndex) {
  const night = NIGHTS[nightIndex];
  state.nightIndex = nightIndex;
  state.night = night;
  state.room = buildNight(nightIndex, state.seed ?? seed);
  state.thief = createThief(state.room);
  state.thief.coins = state.bankedCoins;
  state.thief.score = 0;
  state.guards = createGuards(state.room, nightIndex, state.heat);
  state.cameras = createCameras(state.room);
  state.alarm = 0;
  state.smokeUntil = -1;
  state.decoyUntil = -1;
  state.targetStolen = false;
  state.stealProgress = 0;
  state.events = [{ type: 'brief', text: `${night.gallery} — ${night.par}` }, { type: 'brief', text: crewBonusLine(state.crew) }];
  state.caughtBy = null;
  state.lockdownUntil = -1;
  state.elapsed = 0;
  state.nightStart = state.now;
  state.screen = SCREEN_PLAY;
  state.getawayTimer = 0;
  state.announcedEvents = state.events.length;
}

function anyConeSeesThief(state, now) {
  for (const guard of state.guards) {
    if (guardSeesThief(state, guard, now)) return true;
  }
  for (const camera of state.cameras) {
    if (cameraSeesThief(state, camera, now)) return true;
  }
  return false;
}

function announceNewEvents(state) {
  const fresh = state.events.slice(state.announcedEvents);
  state.announcedEvents = state.events.length;
  for (const event of fresh) {
    if (event.type === 'loot') playLootChime('common');
    if (event.type === 'target') playTargetStolen();
    if (event.type === 'spotted') playSpotted();
    if (event.type === 'lockdown') playLockdownBell();
    if (event.type === 'escape') playGetaway();
  }
  if (fresh.length > 0) {
    statusEl.textContent = fresh[fresh.length - 1].text;
  }
}

function stepPlay(state, dt, input) {
  const now = state.now;
  stepThief(state, dt, input);
  stepGuards(state, dt, now);
  if (state.screen !== SCREEN_PLAY) return;
  stepCameras(state, dt, now);
  const exposed = anyConeSeesThief(state, now);
  stepAlarm(state, dt, now, exposed);
  setAlarmHum(state.alarm);
  if (state.thief.moving && Math.random() < dt * 4) playFootstep(state.thief.sneaking);
  if (readyToEscape(state) && !exitSealed(state, now)) {
    state.getawayTimer += dt;
    if (state.getawayTimer > 0.4) {
      stopAlarmHum();
      escapeNight(state, state.elapsed);
    }
  } else {
    state.getawayTimer = 0;
  }
  announceNewEvents(state);
}

const input = createInput();
attachInput(input, canvas, {
  onClick(x, y) {
    unlockAudio();
    if (state.screen === SCREEN_PLAY && state.thief) {
      state.thief.target = { x, y };
    }
  },
  onKey(code) {
    unlockAudio();
    if (state.screen === SCREEN_TITLE && (code === 'Enter' || code === 'Space')) {
      state.screen = SCREEN_SELECT;
      return;
    }
    if (state.screen === SCREEN_SELECT) {
      const nightNumber = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'].indexOf(code);
      if (nightNumber >= 0 && nightNumber <= state.nightsDone) {
        startNight(state, nightNumber);
        return;
      }
      if (code === 'KeyQ') { state.crew = 'pip'; return; }
      if (code === 'KeyW') { state.crew = 'mara'; return; }
      if (code === 'KeyE') { state.crew = 'joss'; return; }
      const upgradeKey = { KeyZ: 'shoes', KeyX: 'smoke', KeyC: 'pockets', KeyV: 'hands', KeyB: 'nerves' }[code];
      if (upgradeKey) {
        if (buyUpgrade(state, upgradeKey)) state.upgradeLine = upgradeSummary(state.upgrades);
        return;
      }
      return;
    }
    if (state.screen === SCREEN_PLAY) {
      const toolKey = { Digit1: 'smoke', Digit2: 'decoy', Digit3: 'lockpick', Digit4: 'snuff' }[code];
      if (toolKey) {
        useTool(state, toolKey, state.now);
        announceNewEvents(state);
      }
      return;
    }
    if (state.screen === SCREEN_CAUGHT && code === 'KeyR') {
      startNight(state, state.nightIndex);
      return;
    }
    if (state.screen === SCREEN_ESCAPED && code === 'Enter') {
      state.screen = SCREEN_SELECT;
      return;
    }
    if (state.screen === SCREEN_CAMPAIGN && code === 'KeyR') {
      const keep = { crew: state.crew, upgrades: state.upgrades };
      const fresh = newCampaign();
      fresh.crew = keep.crew;
      fresh.upgrades = keep.upgrades;
      fresh.upgradeLine = upgradeSummary(keep.upgrades);
      Object.assign(state, fresh);
      state.screen = SCREEN_SELECT;
    }
  },
});

let state = newCampaign();
state.seed = seed;

function draw(now) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  if (state.screen === SCREEN_TITLE) {
    drawTitle(ctx, state, now);
  } else if (state.screen === SCREEN_SELECT) {
    drawNightSelect(ctx, state);
  } else if (state.screen === SCREEN_PLAY) {
    drawPlay(ctx, state, now);
    drawHud(ctx, state, now);
  } else if (state.screen === SCREEN_CAUGHT) {
    drawPlay(ctx, state, now);
    drawCaught(ctx, state);
    stopAlarmHum();
  } else if (state.screen === SCREEN_ESCAPED) {
    drawEscaped(ctx, state);
  } else if (state.screen === SCREEN_CAMPAIGN) {
    drawCampaign(ctx, state);
  }
}

let last = performance.now();
function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  state.now += dt;
  if (state.screen === SCREEN_PLAY) {
    state.elapsed += dt;
    stepPlay(state, dt, input);
  }
  draw(state.now);
  endFrameInput(input);
  requestAnimationFrame(frame);
}

if (shotName) {
  // Screenshot mode: stage the scene from the real game and render one
  // frame. The loop keeps drawing the same frame so headless Chrome can
  // capture it whenever it is ready.
  const staged = stageShot(shotName, 0, seed);
  state = staged.state;
  state.screen = staged.screen;
  state.now = 5;
  draw(state.now);
  document.title = 'shot-ready';
  requestAnimationFrame(function still() {
    draw(state.now);
    requestAnimationFrame(still);
  });
} else {
  requestAnimationFrame(frame);
}
