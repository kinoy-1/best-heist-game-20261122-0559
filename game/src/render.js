// Render: every pixel the judge sees. The museum at night — deep indigo
// marble, warm lantern pools, velvet ropes, glass cases and one gold-lit
// pedestal — drawn so safe cover, danger and loot are obvious at a glance:
// shadow pools are dark, vision cones are amber wedges, camera cones are
// red, the target glows gold and the van door is blue. Cones are drawn
// under the walls, so a wall reads as blocking the light.
import { VIEW, ROOM, HUD_HEIGHT, GUARD, CAMERA, NIGHTS } from './config.js';
import { tierColor } from './loot.js';
import { alarmColor } from './alarm.js';
import { showPatrolRoutes } from './crew.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_SELECT = 'select';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_ESCAPED = 'escaped';
export const SCREEN_CAMPAIGN = 'campaign';

function floorPattern(ctx, room) {
  ctx.save();
  ctx.fillStyle = '#191430';
  ctx.fillRect(room.x, room.y, room.width, room.height);
  const tile = 62;
  for (let y = room.y; y < room.y + room.height; y += tile) {
    for (let x = room.x; x < room.x + room.width; x += tile) {
      const even = ((x - room.x) / tile + (y - room.y) / tile) % 2 === 0;
      ctx.fillStyle = even ? '#1d1838' : '#171228';
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
    }
  }
  // A crimson carpet runner down the middle of the hall.
  ctx.fillStyle = '#5a1f2b';
  ctx.fillRect(room.x + 60, room.y + 70, room.width - 120, 26);
  ctx.fillStyle = '#7a2a38';
  ctx.fillRect(room.x + 60, room.y + 70, room.width - 120, 4);
  ctx.fillStyle = '#5a1f2b';
  ctx.fillRect(room.x + 60, room.y + room.height - 96, room.width - 120, 26);
  ctx.restore();
}

function drawWalls(ctx, room) {
  ctx.save();
  ctx.strokeStyle = '#0a0616';
  ctx.lineWidth = 4;
  ctx.strokeRect(room.x - 2, room.y - 2, room.width + 4, room.height + 4);
  ctx.fillStyle = '#2b1d12';
  ctx.fillRect(room.x - 10, room.y - 10, room.width + 20, 12);
  ctx.fillRect(room.x - 10, room.y + room.height - 2, room.width + 20, 12);
  ctx.fillRect(room.x - 10, room.y - 10, 12, room.height + 20);
  ctx.fillRect(room.x + room.width - 2, room.y - 10, 12, room.height + 20);
  for (const w of room.walls) {
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#54401f';
    ctx.fillRect(w.x, w.y, w.w, 5);
    ctx.fillStyle = '#241a10';
    ctx.fillRect(w.x, w.y + w.h - 5, w.w, 5);
  }
  ctx.restore();
}

function drawAlcoves(ctx, room) {
  ctx.save();
  for (const a of room.alcoves) {
    ctx.fillStyle = 'rgba(4, 2, 12, 0.78)';
    ctx.beginPath();
    ctx.roundRect(a.x, a.y, a.w, a.h, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 120, 220, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(180, 160, 255, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAFE SHADOW', a.x + a.w / 2, a.y + 15);
  }
  ctx.restore();
}

function drawVents(ctx, room) {
  ctx.save();
  for (const v of room.vents) {
    ctx.fillStyle = '#0e0a1e';
    ctx.fillRect(v.x, v.y, v.w, v.h);
    ctx.strokeStyle = '#6b5a8a';
    ctx.lineWidth = 2;
    for (let x = v.x + 8; x < v.x + v.w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, v.y + 4);
      ctx.lineTo(x, v.y + v.h - 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#b7a6e0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VENT CRAWL — slow, unseen', v.x + 14, v.y + v.h / 2 + 4);
  }
  ctx.restore();
}

function drawDoors(ctx, room, now) {
  ctx.save();
  for (const door of room.doors) {
    ctx.fillStyle = door.locked ? '#4a2c14' : '#2c4a2c';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.fillStyle = door.locked ? '#ffd76a' : '#9fe8a9';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(door.locked ? 'LOCKED' : 'OPEN', door.x + door.w / 2, door.y + door.h / 2 + 4);
    ctx.fillStyle = '#b7a6e0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SERVICE CORRIDOR', door.x + door.w + 6, door.y + door.h / 2 + 3);
  }
  ctx.restore();
}

function drawCone(ctx, x, y, facing, range, halfAngle, color) {
  ctx.save();
  const gradient = ctx.createRadialGradient(x, y, 10, x, y, range);
  gradient.addColorStop(0, color.replace('A', '0.42'));
  gradient.addColorStop(1, color.replace('A', '0.0'));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCones(ctx, state, now) {
  for (const guard of state.guards) {
    if (now < guard.dazedUntil) continue;
    const color = guard.state === 'chase' ? 'rgba(255, 60, 60, A)' : 'rgba(255, 190, 90, A)';
    drawCone(ctx, guard.x, guard.y, guard.facing, GUARD.coneRange, GUARD.coneHalfAngle, color);
  }
  for (const camera of state.cameras) {
    if (now < camera.disabledUntil) continue;
    if (state.lockdownUntil > now) continue;
    drawCone(ctx, camera.x, camera.y, camera.facing, CAMERA.coneRange, CAMERA.coneHalfAngle, 'rgba(255, 80, 110, A)');
  }
}

function drawCases(ctx, room) {
  ctx.save();
  room.cases.forEach((c, i) => {
    const color = tierColor(c.tier);
    ctx.fillStyle = c.opened ? '#241d33' : '#2c2350';
    ctx.beginPath();
    ctx.roundRect(c.x - 26, c.y - 20, 52, 40, 8);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!c.opened) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b0714';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u266A', c.x, c.y + 4);
      if (c.opening > 0) {
        ctx.fillStyle = 'rgba(255, 215, 106, 0.85)';
        ctx.fillRect(c.x - 20, c.y - 30, 40 * Math.min(1, c.opening / 1.6), 4);
      }
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EMPTY', c.x, c.y + 3);
    }
  });
  ctx.restore();
}

function drawPedestal(ctx, room, state, now) {
  const p = room.pedestal;
  ctx.save();
  const pulse = 0.55 + 0.25 * Math.sin(now * 2.4);
  const glow = ctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, 120);
  glow.addColorStop(0, `rgba(255, 215, 106, ${state.targetStolen ? 0.12 : pulse})`);
  glow.addColorStop(1, 'rgba(255, 215, 106, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a3410';
  ctx.beginPath();
  ctx.roundRect(p.x - 30, p.y - 8, 60, 44, 6);
  ctx.fill();
  ctx.fillStyle = '#6b4d1a';
  ctx.fillRect(p.x - 34, p.y - 14, 68, 10);
  if (!state.targetStolen) {
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u266B', p.x, p.y - 22);
  }
  if (state.stealProgress > 0 && !state.targetStolen) {
    ctx.fillStyle = 'rgba(255, 215, 106, 0.9)';
    ctx.fillRect(p.x - 30, p.y - 44, 60 * Math.min(1, state.stealProgress / 2.2), 5);
  }
  ctx.restore();
}

// The pedestal's name, drawn after the walls so a wall never cuts the label
// in half (the night-2 pedestal stands between two wall segments).
function drawPedestalLabel(ctx, room, state) {
  const p = room.pedestal;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px sans-serif';
  if (!state.targetStolen) {
    ctx.fillStyle = '#ffd76a';
    ctx.fillText(state.night.target.toUpperCase(), p.x, p.y + 58);
  } else {
    ctx.fillStyle = '#9fe8a9';
    ctx.fillText('STOLEN', p.x, p.y + 58);
  }
  ctx.restore();
}

function drawExit(ctx, room, state, now) {
  const e = room.exit;
  const sealed = state.lockdownUntil > now;
  ctx.save();
  ctx.fillStyle = sealed ? '#3a0d0d' : '#0d2b4a';
  ctx.beginPath();
  ctx.roundRect(e.x, e.y, e.w, e.h, 6);
  ctx.fill();
  ctx.strokeStyle = sealed ? '#ff4d4d' : '#7fd4ff';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = sealed ? '#ff8080' : '#bfe9ff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAN', e.x + e.w / 2, e.y + e.h / 2 + 4);
  ctx.fillStyle = sealed ? '#ff8080' : '#bfe9ff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sealed ? 'SEALED' : 'GETAWAY VAN', e.x + e.w / 2, e.y - 7);
  if (!sealed && state.targetStolen) {
    const blink = 0.5 + 0.5 * Math.sin(now * 5);
    ctx.strokeStyle = `rgba(127, 212, 255, ${0.4 + 0.6 * blink})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(e.x - 6, e.y - 6, e.w + 12, e.h + 12, 9);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPatrolRoutes(ctx, state) {
  if (!showPatrolRoutes(state)) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(127, 212, 255, 0.4)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  for (const guard of state.guards) {
    ctx.beginPath();
    guard.patrol.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCameras(ctx, state, now) {
  ctx.save();
  for (const camera of state.cameras) {
    const disabled = now < camera.disabledUntil || state.lockdownUntil > now;
    ctx.fillStyle = '#1c1c26';
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = disabled ? '#666' : '#ff506e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = disabled ? '#777' : '#ff506e';
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = disabled ? '#888' : '#ff8ba0';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(disabled ? 'OFF' : 'WATCHFUL EYE', camera.x, camera.y - 18);
  }
  ctx.restore();
}

function drawGuards(ctx, state, now) {
  ctx.save();
  for (const guard of state.guards) {
    const dazed = now < guard.dazedUntil;
    ctx.fillStyle = '#232030';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, guard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = guard.state === 'chase' ? '#ff4d4d' : '#8a7bb8';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Lantern: a warm dot ahead of the curator.
    if (!dazed) {
      ctx.fillStyle = '#ffcf6e';
      ctx.beginPath();
      ctx.arc(guard.x + Math.cos(guard.facing) * 20, guard.y + Math.sin(guard.facing) * 20, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e8e2ff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(guard.name.split(' ')[1].toUpperCase(), guard.x, guard.y + guard.radius + 14);
    if (guard.state === 'chase') {
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('!', guard.x, guard.y - guard.radius - 8);
    } else if (guard.suspicion > 0.45) {
      ctx.fillStyle = '#ffb347';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('?', guard.x, guard.y - guard.radius - 8);
    }
    if (dazed) {
      ctx.fillStyle = '#9fb4ff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('z z', guard.x, guard.y - guard.radius - 8);
    }
  }
  ctx.restore();
}

function drawThief(ctx, state) {
  const t = state.thief;
  ctx.save();
  // Cloak: a violet circle with a fox mask.
  ctx.fillStyle = '#5b2a86';
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a2ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Fox ears.
  ctx.fillStyle = '#ff8c42';
  const fx = Math.cos(t.facing);
  const fy = Math.sin(t.facing);
  const px = -fy;
  const py = fx;
  ctx.beginPath();
  ctx.moveTo(t.x + fx * 8 + px * 8, t.y + fy * 8 + py * 8);
  ctx.lineTo(t.x + fx * 16 + px * 4, t.y + fy * 16 + py * 4);
  ctx.lineTo(t.x + fx * 12, t.y + fy * 12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(t.x + fx * 8 - px * 8, t.y + fy * 8 - py * 8);
  ctx.lineTo(t.x + fx * 16 - px * 4, t.y + fy * 16 - py * 4);
  ctx.lineTo(t.x + fx * 12, t.y + fy * 12);
  ctx.closePath();
  ctx.fill();
  // Mask: a pale sliver across the face.
  ctx.fillStyle = '#ffe9d0';
  ctx.beginPath();
  ctx.arc(t.x + fx * 4, t.y + fy * 4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b0714';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FOX', t.x, t.y + t.radius + 13);
  if (t.inShadowPool) {
    ctx.fillStyle = 'rgba(180, 160, 255, 0.8)';
    ctx.font = '10px sans-serif';
    ctx.fillText('HIDDEN', t.x, t.y + t.radius + 26);
  }
  if (t.inVentCrawl) {
    ctx.fillStyle = 'rgba(180, 160, 255, 0.8)';
    ctx.font = '10px sans-serif';
    ctx.fillText('IN VENT', t.x, t.y + t.radius + 26);
  }
  ctx.restore();
}

function drawSmoke(ctx, state, now) {
  if (state.smokeUntil <= now) return;
  ctx.save();
  const alpha = Math.min(1, (state.smokeUntil - now) / 1.2) * 0.55;
  const gradient = ctx.createRadialGradient(state.smokeX, state.smokeY, 8, state.smokeX, state.smokeY, 95);
  gradient.addColorStop(0, `rgba(220, 220, 235, ${alpha})`);
  gradient.addColorStop(1, 'rgba(220, 220, 235, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(state.smokeX, state.smokeY, 95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDecoy(ctx, state, now) {
  if (state.decoyUntil <= now) return;
  ctx.save();
  ctx.fillStyle = '#8a6d2f';
  ctx.beginPath();
  ctx.roundRect(state.decoyX - 12, state.decoyY - 10, 24, 20, 4);
  ctx.fill();
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u266A', state.decoyX, state.decoyY + 4);
  ctx.restore();
}

function drawEventFeed(ctx, state) {
  const recent = state.events.slice(-3);
  ctx.save();
  ctx.textAlign = 'left';
  recent.forEach((event, i) => {
    const y = 700 + i * 22;
    ctx.fillStyle = 'rgba(11, 7, 20, 0.72)';
    ctx.fillRect(400, y, 480, 20);
    ctx.fillStyle = event.type === 'spotted' || event.type === 'lockdown' ? '#ff8080' : '#e8e2ff';
    ctx.font = '13px sans-serif';
    ctx.fillText(event.text, 408, y + 15);
  });
  ctx.restore();
}

/** Draw the whole play screen: HUD is drawn by hud.js; this draws the room. */
export function drawPlay(ctx, state, now) {
  const room = state.room;
  floorPattern(ctx, room);
  drawAlcoves(ctx, room);
  drawVents(ctx, room);
  if (state.lockdownUntil > now) {
    ctx.save();
    ctx.fillStyle = 'rgba(120, 0, 0, 0.22)';
    ctx.fillRect(room.x, room.y, room.width, room.height);
    ctx.fillStyle = '#5a0d0d';
    ctx.fillRect(room.x, room.y, room.width, 36);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(room.x + 1, room.y + 1, room.width - 2, 34);
    ctx.fillStyle = '#ffd7d7';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOCKDOWN — THE EXIT IS SEALED', VIEW.width / 2, room.y + 25);
    ctx.restore();
  }
  drawPatrolRoutes(ctx, state);
  drawCones(ctx, state, now);
  drawCases(ctx, room);
  drawPedestal(ctx, room, state, now);
  drawExit(ctx, room, state, now);
  drawDoors(ctx, room, now);
  drawWalls(ctx, room);
  drawPedestalLabel(ctx, room, state);
  drawCameras(ctx, state, now);
  drawSmoke(ctx, state, now);
  drawDecoy(ctx, state, now);
  drawGuards(ctx, state, now);
  drawThief(ctx, state);
  drawEventFeed(ctx, state);
}
