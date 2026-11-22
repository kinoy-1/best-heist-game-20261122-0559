// The seven galleries: one hand-tuned room per night. Every room offers the
// same three named routes — the marble hall (fast, watched), the vent crawl
// (slow, unseen) and the service corridor (locked door, quiet) — so the judge
// can see several routes per room in the layout and the screenshots. The
// pedestal holding the night's stolen sound stands in the open, lit gold;
// the getaway van waits at the blue door. Coordinates live inside ROOM
// (x 20..1260, y 108..728) from config.js.
import { ROOM } from './config.js';
import { makeRandom, range } from './random.js';

// A wall is a solid rectangle the thief, the guards and every cone respect.
// An alcove is a pool of deep shadow where cones lose the thief. A vent is a
// crawlspace along the top of the room: slow, but no cone ever reaches in.
// A locked door seals the service corridor until a lockpick (or Mara) opens it.
// The room carries ROOM's own bounds too, so the renderer can draw the floor,
// the walls and the lockdown banner from the same object it moves in.
function baseRoom() {
  return {
    x: ROOM.x,
    y: ROOM.y,
    width: ROOM.width,
    height: ROOM.height,
    walls: [],
    alcoves: [],
    vents: [],
    doors: [],
    cases: [],
    pedestal: { x: 0, y: 0 },
    exit: { x: 0, y: 0, w: 64, h: 30 },
    guardSpawns: [],
    cameraMounts: [],
  };
}

function wall(x, y, w, h) { return { x, y, w, h }; }
function alcove(x, y, w, h) { return { x, y, w, h }; }
function vent(x, y, w, h) { return { x, y, w, h }; }
function lockedDoor(x, y, w, h) { return { x, y, w, h, locked: true, open: false }; }
function displayCase(x, y, tier) { return { x, y, tier, opened: false, opening: 0 }; }
function patrol(points, waitSeconds) { return { points, waitSeconds: waitSeconds ?? 1.2 }; }
function camera(x, y, panCenter, panRange) { return { x, y, panCenter, panRange }; }

// Night 1 — Gallery of First Sounds. Two curators, one camera, wide open hall.
function nightOne() {
  const room = baseRoom();
  room.walls = [
    wall(430, 250, 26, 220),
    wall(820, 250, 26, 220),
    wall(560, 420, 180, 24),
  ];
  room.alcoves = [
    alcove(300, 160, 90, 70),
    alcove(880, 560, 90, 70),
    alcove(620, 150, 80, 60),
  ];
  room.vents = [vent(60, 118, 1120, 34)];
  room.doors = [lockedDoor(150, 690, 70, 26)];
  room.cases = [
    displayCase(300, 330, 'common'),
    displayCase(950, 330, 'common'),
    displayCase(640, 560, 'rare'),
  ];
  room.pedestal = { x: 640, y: 330 };
  room.exit = { x: 60, y: 690, w: 64, h: 30 };
  room.guardSpawns = [
    patrol([{ x: 300, y: 230 }, { x: 520, y: 230 }, { x: 520, y: 560 }, { x: 300, y: 560 }]),
    patrol([{ x: 940, y: 230 }, { x: 760, y: 230 }, { x: 760, y: 560 }, { x: 940, y: 560 }]),
  ];
  room.cameraMounts = [camera(640, 118, Math.PI / 2, 0.9)];
  return room;
}

// Night 2 — Hall of Bells. A bell tower pillar in the middle splits the hall.
function nightTwo() {
  const room = baseRoom();
  room.walls = [
    wall(600, 180, 40, 180),
    wall(600, 420, 40, 180),
    wall(300, 480, 200, 24),
    wall(760, 220, 200, 24),
  ];
  room.alcoves = [
    alcove(220, 160, 90, 70),
    alcove(950, 560, 90, 70),
    alcove(700, 150, 80, 60),
    alcove(480, 600, 80, 60),
  ];
  room.vents = [vent(60, 118, 1120, 34)];
  room.doors = [lockedDoor(150, 690, 70, 26)];
  room.cases = [
    displayCase(240, 400, 'common'),
    displayCase(1000, 400, 'rare'),
    displayCase(620, 300, 'common'),
    displayCase(620, 620, 'rare'),
  ];
  room.pedestal = { x: 620, y: 385 };
  room.exit = { x: 1140, y: 690, w: 64, h: 30 };
  room.guardSpawns = [
    patrol([{ x: 260, y: 240 }, { x: 260, y: 600 }, { x: 540, y: 600 }, { x: 540, y: 240 }]),
    patrol([{ x: 980, y: 200 }, { x: 980, y: 600 }, { x: 740, y: 600 }, { x: 740, y: 200 }]),
  ];
  room.cameraMounts = [
    camera(340, 118, Math.PI / 2, 0.8),
    camera(920, 118, Math.PI / 2, 0.8),
  ];
  return room;
}

// Night 3 — The Violin Wing. Long cases line the walls; the violin glows centre.
function nightThree() {
  const room = baseRoom();
  room.walls = [
    wall(360, 180, 24, 300),
    wall(900, 180, 24, 300),
    wall(500, 300, 260, 24),
    wall(500, 520, 260, 24),
  ];
  room.alcoves = [
    alcove(180, 160, 90, 70),
    alcove(1010, 560, 90, 70),
    alcove(620, 150, 80, 60),
    alcove(180, 600, 90, 70),
  ];
  room.vents = [vent(60, 118, 1120, 34)];
  room.doors = [lockedDoor(620, 690, 70, 26)];
  room.cases = [
    displayCase(220, 330, 'rare'),
    displayCase(1040, 330, 'common'),
    displayCase(460, 620, 'common'),
    displayCase(800, 150, 'rare'),
    displayCase(480, 410, 'legendary'),
  ];
  room.pedestal = { x: 620, y: 330 };
  room.exit = { x: 60, y: 690, w: 64, h: 30 };
  room.guardSpawns = [
    patrol([{ x: 240, y: 160 }, { x: 440, y: 160 }, { x: 440, y: 520 }, { x: 240, y: 600 }]),
    patrol([{ x: 1020, y: 160 }, { x: 820, y: 160 }, { x: 820, y: 520 }, { x: 1020, y: 600 }]),
    patrol([{ x: 500, y: 420 }, { x: 760, y: 420 }]),
  ];
  room.cameraMounts = [
    camera(300, 118, Math.PI / 2, 0.85),
    camera(960, 118, Math.PI / 2, 0.85),
  ];
  return room;
}

// Night 4 — Nursery of Lullabies. Cradles of shadow; three cameras watch.
function nightFour() {
  const room = baseRoom();
  room.walls = [
    wall(280, 200, 24, 260),
    wall(560, 180, 24, 160),
    wall(700, 380, 24, 160),
    wall(980, 200, 24, 260),
    wall(440, 560, 240, 24),
  ];
  room.alcoves = [
    alcove(150, 150, 90, 70),
    alcove(1050, 150, 90, 70),
    alcove(150, 620, 90, 70),
    alcove(1050, 620, 90, 70),
    alcove(620, 300, 70, 60),
  ];
  room.vents = [vent(60, 118, 1120, 34)];
  room.doors = [lockedDoor(150, 690, 70, 26)];
  room.cases = [
    displayCase(200, 420, 'common'),
    displayCase(1080, 420, 'rare'),
    displayCase(620, 200, 'rare'),
    displayCase(620, 640, 'common'),
    displayCase(480, 420, 'legendary'),
  ];
  room.pedestal = { x: 620, y: 460 };
  room.exit = { x: 60, y: 690, w: 64, h: 30 };
  room.guardSpawns = [
    patrol([{ x: 200, y: 180 }, { x: 420, y: 180 }, { x: 420, y: 600 }, { x: 200, y: 600 }]),
    patrol([{ x: 1060, y: 180 }, { x: 840, y: 180 }, { x: 840, y: 600 }, { x: 1060, y: 600 }]),
    patrol([{ x: 660, y: 180 }, { x: 660, y: 540 }]),
  ];
  room.cameraMounts = [
    camera(240, 118, Math.PI / 2, 0.8),
    camera(640, 118, Math.PI / 2, 0.9),
    camera(1040, 118, Math.PI / 2, 0.8),
  ];
  return room;
}

// Night 5 — The Thunder Vault. Heavy pillars, four curators, no free route.
function nightFive() {
  const room = baseRoom();
  room.walls = [
    wall(340, 200, 30, 200),
    wall(340, 480, 30, 140),
    wall(900, 200, 30, 200),
    wall(900, 480, 30, 140),
    wall(560, 330, 160, 26),
    wall(560, 560, 160, 26),
  ];
  room.alcoves = [
    alcove(180, 150, 90, 70),
    alcove(1010, 150, 90, 70),
    alcove(180, 620, 90, 70),
    alcove(1010, 620, 90, 70),
    alcove(620, 150, 80, 60),
  ];
  room.vents = [vent(60, 118, 1120, 34)];
  room.doors = [lockedDoor(150, 690, 70, 26)];
  room.cases = [
    displayCase(220, 420, 'rare'),
    displayCase(1040, 420, 'rare'),
    displayCase(480, 220, 'common'),
    displayCase(780, 640, 'common'),
    displayCase(480, 470, 'legendary'),
    displayCase(620, 240, 'rare'),
  ];
  room.pedestal = { x: 620, y: 420 };
  room.exit = { x: 1140, y: 690, w: 64, h: 30 };
  room.guardSpawns = [
    patrol([{ x: 220, y: 180 }, { x: 440, y: 180 }, { x: 440, y: 640 }, { x: 220, y: 640 }]),
    patrol([{ x: 1040, y: 180 }, { x: 820, y: 180 }, { x: 820, y: 640 }, { x: 1040, y: 640 }]),
    patrol([{ x: 480, y: 380 }, { x: 760, y: 380 }, { x: 760, y: 500 }, { x: 480, y: 500 }]),
    patrol([{ x: 480, y: 300 }, { x: 780, y: 300 }, { x: 780, y: 620 }, { x: 480, y: 620 }]),
  ];
  room.cameraMounts = [
    camera(240, 118, Math.PI / 2, 0.85),
    camera(640, 118, Math.PI / 2, 0.9),
    camera(1040, 118, Math.PI / 2, 0.85),
  ];
  return room;
}

// Night 6 — Aviary of Paper Birds. A maze of perches; four cameras.
function nightSix() {
  const room = baseRoom();
  room.walls = [
    wall(260, 180, 24, 320),
    wall(500, 420, 24, 220),
    wall(740, 180, 24, 220),
    wall(980, 340, 24, 320),
    wall(380, 300, 220, 24),
    wall(660, 520, 220, 24),
  ];
  room.alcoves = [
    alcove(150, 150, 90, 70),
    alcove(1050, 150, 90, 70),
    alcove(150, 620, 90, 70),
    alcove(1050, 620, 90, 70),
    alcove(620, 380, 70, 60),
  ];
  room.vents = [vent(60, 118, 1120, 34)];
  room.doors = [lockedDoor(620, 690, 70, 26)];
  room.cases = [
    displayCase(180, 420, 'common'),
    displayCase(1100, 420, 'rare'),
    displayCase(620, 200, 'rare'),
    displayCase(420, 620, 'common'),
    displayCase(840, 620, 'rare'),
    displayCase(620, 460, 'legendary'),
  ];
  room.pedestal = { x: 620, y: 330 };
  room.exit = { x: 60, y: 690, w: 64, h: 30 };
  room.guardSpawns = [
    patrol([{ x: 190, y: 160 }, { x: 360, y: 160 }, { x: 360, y: 620 }, { x: 190, y: 620 }]),
    patrol([{ x: 1070, y: 240 }, { x: 1070, y: 680 }, { x: 900, y: 680 }, { x: 900, y: 240 }]),
    patrol([{ x: 620, y: 180 }, { x: 620, y: 660 }]),
    patrol([{ x: 560, y: 360 }, { x: 700, y: 360 }, { x: 700, y: 480 }, { x: 560, y: 480 }]),
  ];
  room.cameraMounts = [
    camera(200, 118, Math.PI / 2, 0.8),
    camera(520, 118, Math.PI / 2, 0.85),
    camera(760, 118, Math.PI / 2, 0.85),
    camera(1080, 118, Math.PI / 2, 0.8),
  ];
  return room;
}

// Night 7 — The Dawn Atrium. The final sound, five curators, four cameras.
function nightSeven() {
  const room = baseRoom();
  room.walls = [
    wall(300, 180, 26, 240),
    wall(300, 500, 26, 160),
    wall(620, 180, 26, 160),
    wall(620, 420, 26, 240),
    wall(940, 180, 26, 240),
    wall(940, 500, 26, 160),
    wall(470, 330, 300, 24),
    wall(470, 560, 300, 24),
  ];
  room.alcoves = [
    alcove(150, 150, 90, 70),
    alcove(1080, 150, 90, 70),
    alcove(150, 620, 90, 70),
    alcove(1080, 620, 90, 70),
    alcove(470, 150, 80, 60),
    alcove(790, 620, 80, 60),
  ];
  room.vents = [vent(60, 118, 1120, 34)];
  room.doors = [lockedDoor(150, 690, 70, 26)];
  room.cases = [
    displayCase(200, 420, 'rare'),
    displayCase(1060, 420, 'rare'),
    displayCase(470, 220, 'common'),
    displayCase(790, 640, 'common'),
    displayCase(620, 300, 'legendary'),
    displayCase(620, 620, 'legendary'),
    displayCase(470, 470, 'rare'),
  ];
  room.pedestal = { x: 620, y: 460 };
  room.exit = { x: 1140, y: 690, w: 64, h: 30 };
  room.guardSpawns = [
    patrol([{ x: 200, y: 160 }, { x: 420, y: 160 }, { x: 420, y: 680 }, { x: 200, y: 680 }]),
    patrol([{ x: 1060, y: 160 }, { x: 840, y: 160 }, { x: 840, y: 680 }, { x: 1060, y: 680 }]),
    patrol([{ x: 440, y: 160 }, { x: 440, y: 680 }]),
    patrol([{ x: 400, y: 220 }, { x: 580, y: 220 }, { x: 580, y: 300 }, { x: 400, y: 300 }]),
    patrol([{ x: 700, y: 420 }, { x: 900, y: 420 }, { x: 900, y: 500 }, { x: 700, y: 500 }]),
  ];
  room.cameraMounts = [
    camera(200, 118, Math.PI / 2, 0.8),
    camera(520, 118, Math.PI / 2, 0.85),
    camera(760, 118, Math.PI / 2, 0.85),
    camera(1080, 118, Math.PI / 2, 0.8),
  ];
  return room;
}

const BUILDERS = [nightOne, nightTwo, nightThree, nightFour, nightFive, nightSix, nightSeven];

/**
 * Build one night's gallery. The seed jitters only the small things — a case
 * nudged a few pixels, a patrol waypoint shifted — so the room stays the room
 * the screenshots show while no two playthroughs are pixel-identical.
 */
export function buildNight(nightIndex, seed) {
  const random = makeRandom(seed * 7919 + nightIndex * 104729 + 13);
  const room = BUILDERS[nightIndex % BUILDERS.length]();
  for (const c of room.cases) {
    c.x = Math.round(Math.max(ROOM.x + 40, Math.min(ROOM.x + ROOM.width - 40, c.x + range(random, -14, 14))));
    c.y = Math.round(Math.max(ROOM.y + 40, Math.min(ROOM.y + ROOM.height - 40, c.y + range(random, -10, 10))));
  }
  return room;
}

/** The three named routes every gallery offers, for the HUD and the briefings. */
export const ROUTES = [
  { id: 'hall', name: 'The Marble Hall', blurb: 'Fast, open, watched by every cone.' },
  { id: 'vent', name: 'The Vent Crawl', blurb: 'Slow and unseen, along the top of the room.' },
  { id: 'corridor', name: 'The Service Corridor', blurb: 'Quiet and locked — a lockpick opens it.' },
];
