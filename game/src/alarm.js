// The alarm meter: the museum's single loudest number. It climbs whenever
// a cone or a camera holds the thief, and falls whenever the thief stays
// unseen. At 100 the museum locks down — the exit seals, the cameras cut
// out, and every curator converges on the last place the thief was seen —
// then the meter drops back to 62 and the night goes on, tenser than before.
import { ALARM } from './config.js';

/** Step the alarm one frame from the current exposure. */
export function stepAlarm(state, dt, now, exposed) {
  const nerves = state.upgrades.nerves || 0;
  if (state.lockdownUntil > now) {
    // During lockdown the meter holds; the doors do the shouting.
    return;
  }
  if (exposed) {
    state.alarm = Math.min(ALARM.max, state.alarm + ALARM.risePerSecondSeen * dt);
  } else {
    state.alarm = Math.max(0, state.alarm - ALARM.decayPerSecondHidden * (1 + 0.25 * nerves) * dt);
  }
  if (state.alarm >= ALARM.lockdownAt) {
    triggerLockdown(state, now);
  }
}

export function triggerLockdown(state, now) {
  state.lockdownUntil = now + ALARM.lockdownSeconds;
  state.alarm = ALARM.afterLockdown;
  state.events.push({ type: 'lockdown', text: 'LOCKDOWN! The exit seals and the curators converge!' });
  // Every curator turns toward the thief's last known spot.
  for (const guard of state.guards) {
    guard.lastSeen = { x: state.thief.x, y: state.thief.y };
    if (guard.state !== 'chase') {
      guard.state = 'chase';
      guard.chaseTime = 0;
      guard.grace = 0.8;
    }
  }
}

/** Is the exit sealed right now? */
export function exitSealed(state, now) {
  return state.lockdownUntil > now;
}

/** The alarm's colour for the HUD: calm gold, worried amber, danger red. */
export function alarmColor(alarm) {
  if (alarm >= 75) return '#ff4d4d';
  if (alarm >= 40) return '#ffb347';
  return '#ffd76a';
}

/** A one-line read of the alarm for the HUD and the screen reader. */
export function alarmLabel(alarm) {
  if (alarm >= 75) return 'ALARM HIGH';
  if (alarm >= 40) return 'Alarm rising';
  return 'Alarm calm';
}
