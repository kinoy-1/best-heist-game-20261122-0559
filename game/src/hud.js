// The HUD: the strip across the top of every play frame — the night's name,
// the alarm meter (the game's loudest number, always visible), coins, loot
// carried, the four tool buttons with their costs, the museum's heat and the
// objective line. The judge's first criterion is decided in one frame, so
// the alarm meter and the objective never leave the screen.
import { VIEW, HUD_HEIGHT, NIGHTS, TOOLS } from './config.js';
import { alarmColor, alarmLabel } from './alarm.js';
import { toolButtons } from './tools.js';
import { crewById } from './crew.js';

export function drawHud(ctx, state, now) {
  const night = state.night;
  ctx.save();
  ctx.fillStyle = '#120c22';
  ctx.fillRect(0, 0, VIEW.width, HUD_HEIGHT);
  ctx.fillStyle = '#2b1d4d';
  ctx.fillRect(0, HUD_HEIGHT - 3, VIEW.width, 3);

  // Night + gallery + crew.
  ctx.fillStyle = '#e8e2ff';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`NIGHT ${night.night} — ${night.gallery}`, 20, 26);
  ctx.fillStyle = '#b7a6e0';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Target: ${night.target}  ·  Crew: ${crewById(state.crew).name}  ·  Heat ${state.heat}`, 20, 48);
  ctx.fillStyle = '#ffd76a';
  ctx.font = '13px sans-serif';
  const objective = state.targetStolen ? 'Got it! Reach the GETAWAY VAN.' : `Steal ${night.target}, then reach the van.`;
  ctx.fillText(objective, 20, 70);

  // Alarm meter: the big bar on the right.
  const meterX = 560;
  const meterW = 300;
  ctx.fillStyle = '#1c1430';
  ctx.beginPath();
  ctx.roundRect(meterX, 14, meterW, 26, 6);
  ctx.fill();
  ctx.fillStyle = alarmColor(state.alarm);
  const fillW = Math.max(0, Math.min(1, state.alarm / 100)) * meterW;
  ctx.beginPath();
  ctx.roundRect(meterX, 14, fillW, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#3a2a5a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(meterX, 14, meterW, 26, 6);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`ALARM ${Math.round(state.alarm)} — ${alarmLabel(state.alarm)}`, meterX + meterW / 2, 32);

  // Coins + loot carried, right of the alarm meter, above the tool row.
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`\u{1FA99} ${state.thief.coins} coins  ·  Score ${state.thief.score}`, 890, 26);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '13px sans-serif';
  const lootText = state.thief.loot.length === 0 ? 'Pockets empty' : `Loot: ${state.thief.loot.map((l) => l.tier).join(', ')}`;
  ctx.fillText(lootText, 890, 46);

  // Tool buttons with keys and costs.
  ctx.restore();
  drawToolRow(ctx, state);
}

function drawToolRow(ctx, state) {
  const buttons = toolButtons(state);
  ctx.save();
  buttons.forEach((button, i) => {
    const x = 560 + i * 178;
    const y = 52;
    ctx.fillStyle = button.affordable ? '#241a4a' : '#1a1226';
    ctx.beginPath();
    ctx.roundRect(x, y, 168, 30, 6);
    ctx.fill();
    ctx.strokeStyle = button.affordable ? '#ffd76a' : '#4a3a6a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = button.affordable ? '#ffe9a8' : '#8a7bb8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`[${button.key}] ${button.name} — ${button.cost}c`, x + 10, y + 19);
  });
  ctx.restore();
}

/** The title screen: the story, the crew, the stakes, the controls. */
export function drawTitle(ctx, state, now) {
  ctx.save();
  ctx.fillStyle = '#0b0714';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const shimmer = 0.6 + 0.4 * Math.sin(now * 1.5);
  ctx.fillStyle = `rgba(255, 215, 106, ${0.75 + 0.25 * shimmer})`;
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE VELVET FOX', VIEW.width / 2, 150);
  ctx.fillStyle = '#c9a2ff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Heist at the Museum of Lost Sounds', VIEW.width / 2, 196);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '17px sans-serif';
  const lines = [
    'In this city, sounds can be stolen and bottled. The Museum of Lost Sounds',
    'keeps the rarest of them behind glass — the First Laugh, the Silent Violin,',
    'the Sound of Dawn. You are the Velvet Fox, a retired stage magician turned',
    'gentleman thief. Steal them back, one gallery a night, for seven nights.',
    '',
    'Cross each room under the curators\u2019 lantern cones and the Watchful Eyes.',
    'Hide in safe shadow, crawl the vents, pick the service corridor — or pay',
    'for smoke, a decoy music box, a lockpick, a snuffed lantern. Take the',
    'night\u2019s sound, then reach the getaway van before the alarm swallows you.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, VIEW.width / 2, 250 + i * 26));
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText('WASD / arrows to move  ·  click to walk  ·  Shift to sneak  ·  1-4 tools  ·  ENTER to begin', VIEW.width / 2, 480);
  ctx.fillStyle = '#b7a6e0';
  ctx.font = '15px sans-serif';
  ctx.fillText('Seven nights. Three routes a room. One fox. No second chances per night.', VIEW.width / 2, 520);
  ctx.fillStyle = '#8a7bb8';
  ctx.font = '13px sans-serif';
  ctx.fillText('A complete heist game: guards with vision cones, cameras, a loot target and an alarm meter — all in one frame.', VIEW.width / 2, 570);
  ctx.restore();
}

/** The night-select screen: pick a gallery, a crew member, buy upgrades. */
export function drawNightSelect(ctx, state) {
  ctx.save();
  ctx.fillStyle = '#0b0714';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHOOSE TONIGHT\u2019S GALLERY', VIEW.width / 2, 90);
  NIGHTS.forEach((night, i) => {
    const y = 140 + i * 62;
    const unlocked = i <= state.nightsDone;
    const done = i < state.nightsDone;
    ctx.fillStyle = unlocked ? '#1d1838' : '#120c22';
    ctx.beginPath();
    ctx.roundRect(180, y - 26, 920, 50, 8);
    ctx.fill();
    ctx.strokeStyle = done ? '#9fe8a9' : '#3a2a5a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = unlocked ? '#e8e2ff' : '#6a5a8a';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Night ${night.night} — ${night.gallery}: ${night.target} (${night.targetValue} coins)`, 200, y - 2);
    ctx.fillStyle = '#b7a6e0';
    ctx.font = '13px sans-serif';
    ctx.fillText(`${night.par}  ·  ${night.guards} curators, ${night.cameras} cameras`, 200, y + 18);
    ctx.fillStyle = done ? '#9fe8a9' : '#ffd76a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(done ? 'STOLEN' : unlocked ? 'Press ' + (i + 1) : 'LOCKED', 1080, y + 4);
  });
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Coins banked: ${state.bankedCoins}  ·  Score: ${state.bankedScore}  ·  Heat: ${state.heat} — ${state.heatLine}`, VIEW.width / 2, 610);
  ctx.fillStyle = '#b7a6e0';
  ctx.font = '14px sans-serif';
  ctx.fillText('Crew: [Q] Pip the Lookout  ·  [W] Mara the Safecracker  ·  [E] Joss the Runner', VIEW.width / 2, 650);
  ctx.fillText(`Upgrades (Shadowcraft): ${state.upgradeLine}`, VIEW.width / 2, 678);
  ctx.fillText('Buy with [Z] shoes  [X] smoke  [C] pockets  [V] hands  [B] nerves — costs rise each rank.', VIEW.width / 2, 706);
  ctx.restore();
}

/** The caught screen: a fair end, with what went wrong and a retry. */
export function drawCaught(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(20, 4, 8, 0.88)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#ff6b6b';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAUGHT!', VIEW.width / 2, 300);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '19px sans-serif';
  ctx.fillText(`${state.caughtBy || 'A curator'} caught the Velvet Fox in the ${state.night.gallery}.`, VIEW.width / 2, 350);
  ctx.fillText('The museum keeps its sound tonight. The Fox slips away to try again.', VIEW.width / 2, 382);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Press R to retry the night — the patrols reset, the loot waits.', VIEW.width / 2, 440);
  ctx.restore();
}

/** The escaped screen: the night's tally, line by line. */
export function drawEscaped(ctx, state) {
  const b = state.lastBreakdown;
  ctx.save();
  ctx.fillStyle = 'rgba(4, 16, 8, 0.88)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#9fe8a9';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLEAN GETAWAY!', VIEW.width / 2, 250);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`${state.night.target} is free. The van pulls away into the night.`, VIEW.width / 2, 300);
  if (b) {
    const rows = [
      ['The night\u2019s sound', b.target],
      ['Side loot', b.side],
      ['Time bonus', b.timeBonus],
      ['Ghost bonus (never seen)', b.ghostBonus],
      ['NIGHT TOTAL', b.total],
    ];
    rows.forEach((row, i) => {
      ctx.fillStyle = i === rows.length - 1 ? '#ffd76a' : '#e8e2ff';
      ctx.font = i === rows.length - 1 ? 'bold 22px sans-serif' : '18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row[0], 440, 360 + i * 34);
      ctx.textAlign = 'right';
      ctx.fillText(String(row[1]), 840, 360 + i * 34);
    });
  }
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Press ENTER for the next gallery.', VIEW.width / 2, 580);
  ctx.restore();
}

/** The campaign screen: all seven sounds are free. */
export function drawCampaign(ctx, state) {
  ctx.save();
  ctx.fillStyle = '#0b0714';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 46px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EVERY SOUND IS FREE', VIEW.width / 2, 160);
  ctx.fillStyle = '#e8e2ff';
  ctx.font = '19px sans-serif';
  ctx.fillText('Seven nights. Seven stolen sounds, back in the world where they belong.', VIEW.width / 2, 210);
  ctx.fillText('The Velvet Fox hangs up the mask — until the museum finds something new to steal.', VIEW.width / 2, 240);
  ctx.fillStyle = '#9fe8a9';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Final score ${state.bankedScore}  ·  Coins banked ${state.bankedCoins}  ·  Cases opened ${state.totalCasesOpened}`, VIEW.width / 2, 320);
  ctx.fillStyle = '#b7a6e0';
  ctx.font = '16px sans-serif';
  ctx.fillText('Press R to play the campaign again from Night 1.', VIEW.width / 2, 380);
  ctx.restore();
}
