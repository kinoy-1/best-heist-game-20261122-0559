// The crew: three named accomplices, one per night. The Fox never works
// alone — Pip watches the patrols, Mara opens what is locked, Joss carries
// the heavy loot and drives the getaway faster. Picking a crew member is the
// night's first decision, and each one changes how the room is played.
import { CREW } from './config.js';

export function crewById(id) {
  return CREW.find((c) => c.id === id) || CREW[0];
}

/** What the chosen crew member does for this night, in one line. */
export function crewBonusLine(crewId) {
  if (crewId === 'pip') return 'Pip marks every patrol route on the floor.';
  if (crewId === 'mara') return 'Mara opens every case and door at a touch.';
  if (crewId === 'joss') return 'Joss carries +2 loot and the van leaves faster.';
  return '';
}

/** The lookout's warning: is any cone about to find the thief? */
export function lookoutWarning(state) {
  if (state.crew !== 'pip') return null;
  for (const guard of state.guards) {
    if (guard.suspicion > 0.3) return `${guard.name} is getting suspicious!`;
  }
  for (const camera of state.cameras) {
    const dx = state.thief.x - camera.x;
    const dy = state.thief.y - camera.y;
    if (Math.hypot(dx, dy) < 280) return 'A Watchful Eye is sweeping near you.';
  }
  return null;
}

/** Should patrol routes be drawn on the floor this night? */
export function showPatrolRoutes(state) {
  return state.crew === 'pip';
}

/** The getaway speed multiplier from the runner. */
export function getawaySpeed(state) {
  return state.crew === 'joss' ? 1.2 : 1;
}
