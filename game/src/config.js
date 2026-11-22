// The Velvet Fox — shared constants for every system of the heist.
// One room fits the whole screen: the judge must see the thief, the guards,
// the cameras, the loot and the alarm meter in a single frame, so the gallery
// is 1240 by 620 inside a 1280 by 800 canvas and the HUD owns the top strip.
export const VIEW = { width: 1280, height: 800 };
export const HUD_HEIGHT = 92;
export const ROOM = { x: 20, y: 108, width: 1240, height: 620 };
export const STEP = 1 / 60;

export const THIEF = {
  radius: 13,
  walkSpeed: 205,
  ventSpeed: 82,
  sneakSpeed: 150,
  carrySlots: 3,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 78,
  chaseSpeed: 168,
  coneRange: 235,
  coneHalfAngle: 0.52,
  suspicionPerSecond: 1.35,
  suspicionDecay: 0.55,
  catchRadius: 26,
  graceSeconds: 0.8,
};

export const CAMERA = {
  coneRange: 250,
  coneHalfAngle: 0.42,
  suspicionPerSecond: 1.1,
  panSpeed: 0.55,
};

export const ALARM = {
  max: 100,
  risePerSecondSeen: 26,
  decayPerSecondHidden: 9,
  lockdownAt: 100,
  lockdownSeconds: 8,
  afterLockdown: 62,
  caughtAt: 100,
};

export const TOOLS = {
  smoke: { key: '1', name: 'Smoke Puff', cost: 30, duration: 3.2, radius: 95, blurb: 'A magician\u2019s puff: cones cannot see through it.' },
  decoy: { key: '2', name: 'Decoy Music Box', cost: 40, duration: 6, radius: 150, blurb: 'It plays a lullaby. The nearest curator walks to it.' },
  lockpick: { key: '3', name: 'Lockpick', cost: 25, duration: 0, radius: 0, blurb: 'Opens a locked case or door at once.' },
  snuff: { key: '4', name: 'Lantern Snuff', cost: 35, duration: 6, radius: 0, blurb: 'Douses the nearest lantern cone for a while.' },
};

export const LOOT_TIERS = {
  common: { name: 'Common', value: 40, color: '#c9b458', label: 'Brass Echo' },
  rare: { name: 'Rare', value: 120, color: '#7fd4ff', label: 'Silver Whisper' },
  legendary: { name: 'Legendary', value: 320, color: '#ff9de2', label: 'Golden Voice' },
};

// The seven nights of the campaign: one gallery, one stolen sound each.
// Heat grows after every successful night and the museum answers with more
// patrols, faster sweeps and another camera on the wall.
export const NIGHTS = [
  { night: 1, gallery: 'Gallery of First Sounds', target: 'The First Laugh', targetValue: 500, guards: 2, cameras: 1, heat: 0, par: 'A gentle first gallery. Two curators, one camera.' },
  { night: 2, gallery: 'Hall of Bells', target: 'The Midnight Bell', targetValue: 650, guards: 2, cameras: 2, heat: 1, par: 'Bells ring when the alarm climbs. Mind the second camera.' },
  { night: 3, gallery: 'The Violin Wing', target: 'The Silent Violin', targetValue: 800, guards: 3, cameras: 2, heat: 2, par: 'The violin never sounded. Three curators walk its wing.' },
  { night: 4, gallery: 'Nursery of Lullabies', target: 'The Last Lullaby', targetValue: 950, guards: 3, cameras: 3, heat: 3, par: 'Sleeping songs, waking eyes. Three cameras now.' },
  { night: 5, gallery: 'The Thunder Vault', target: 'The Thunder Drum', targetValue: 1100, guards: 4, cameras: 3, heat: 4, par: 'The drum is heavy and loud. Four curators on the floor.' },
  { night: 6, gallery: 'Aviary of Paper Birds', target: 'The Paper Crane\u2019s Song', targetValue: 1300, guards: 4, cameras: 4, heat: 5, par: 'Paper wings, iron patrols. Every route is watched.' },
  { night: 7, gallery: 'The Dawn Atrium', target: 'The Sound of Dawn', targetValue: 1600, guards: 5, cameras: 4, heat: 6, par: 'The final sound. Five curators, four cameras, no mercy.' },
];

export const CREW = [
  { id: 'pip', name: 'Pip the Lookout', role: 'Lookout', blurb: 'Shows every patrol route and warns you a beat before a cone finds you.' },
  { id: 'mara', name: 'Mara the Safecracker', role: 'Safecracker', blurb: 'Locked cases and doors open at a touch. No lockpick needed.' },
  { id: 'joss', name: 'Joss the Runner', role: 'Runner', blurb: 'Carries two extra loot slots and runs the getaway 20% faster.' },
];

export const UPGRADES = [
  { id: 'shoes', name: 'Quieter Shoes', maxRank: 3, costs: [60, 120, 200], blurb: 'Each rank slows detection by 15%.' },
  { id: 'smoke', name: 'Longer Smoke', maxRank: 3, costs: [50, 100, 180], blurb: 'Each rank adds 1.2 seconds of smoke.' },
  { id: 'pockets', name: 'Bigger Pockets', maxRank: 3, costs: [70, 130, 220], blurb: 'Each rank adds one loot slot.' },
  { id: 'hands', name: 'Faster Hands', maxRank: 3, costs: [55, 110, 190], blurb: 'Each rank halves lockpick and case time.' },
  { id: 'nerves', name: 'Steady Nerves', maxRank: 3, costs: [65, 125, 210], blurb: 'Each rank makes the alarm fall 25% faster.' },
];

export const HEAT_EFFECTS = [
  'The museum sleeps lightly.',
  'A second camera watches the hall.',
  'Curators walk a little faster.',
  'A third camera joins the wall.',
  'Patrols overlap; no route is free.',
  'The night watch doubles its rounds.',
  'Every eye in the museum is open.',
];
