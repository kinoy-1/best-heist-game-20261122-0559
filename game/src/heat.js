// Heat: the museum remembers. Every sound the Fox steals makes the next
// night harder — the curators walk faster, the cameras sweep wider, and the
// night's briefing says so out loud. Heat is the campaign's meta-pressure:
// play clean and the museum stays sleepy; trip every alarm and the Dawn
// Atrium becomes a gauntlet.
import { HEAT_EFFECTS, NIGHTS } from './config.js';

/** Heat after a number of successful nights. */
export function heatAfterNights(nightsDone) {
  return Math.min(6, nightsDone);
}

/** The briefing line for a night's heat. */
export function heatLine(heat) {
  return HEAT_EFFECTS[Math.max(0, Math.min(HEAT_EFFECTS.length - 1, heat))];
}

/** Guard speed multiplier from heat. */
export function guardSpeedFromHeat(heat) {
  return 1 + heat * 0.04;
}

/** Camera pan speed multiplier from heat. */
export function cameraSpeedFromHeat(heat) {
  return 1 + heat * 0.06;
}

/** How many nights are left after this one. */
export function nightsLeft(nightIndex) {
  return NIGHTS.length - nightIndex - 1;
}

/** Is this the final night of the campaign? */
export function isFinalNight(nightIndex) {
  return nightIndex >= NIGHTS.length - 1;
}
