// The Watchful Eyes: wall-mounted security cameras. Each one pans slowly
// back and forth across its arc, sweeping a red-tinted cone over the floor.
// A thief in the cone feeds the alarm; a camera never chases, but it never
// blinks either — unless a smoke puff swallows its lens or the alarm's
// lockdown briefly cuts its power.
import { CAMERA } from './config.js';
import { inVisionCone, inShadow, inVent } from './world.js';

export function createCameras(room) {
  return room.cameraMounts.map((mount, i) => ({
    id: `eye-${i + 1}`,
    x: mount.x,
    y: mount.y,
    panCenter: mount.panCenter,
    panRange: mount.panRange,
    facing: mount.panCenter - mount.panRange,
    panDirection: 1,
    disabledUntil: 0,
  }));
}

/** Can this camera see the thief right now? */
export function cameraSeesThief(state, camera, now) {
  const thief = state.thief;
  if (now < camera.disabledUntil) return false;
  if (state.lockdownUntil > now) return false;
  if (thief.inVentCrawl) return false;
  if (thief.inShadowPool) return false;
  if (state.smokeUntil > now && Math.hypot(thief.x - state.smokeX, thief.y - state.smokeY) < 95) return false;
  return inVisionCone(camera.x, camera.y, camera.facing, CAMERA.coneRange, CAMERA.coneHalfAngle, thief.x, thief.y, state.room.walls);
}

/** Step every camera one frame: sweep the pan, feed the alarm when it sees. */
export function stepCameras(state, dt, now) {
  for (const camera of state.cameras) {
    camera.facing += CAMERA.panSpeed * camera.panDirection * dt;
    if (camera.facing > camera.panCenter + camera.panRange) {
      camera.facing = camera.panCenter + camera.panRange;
      camera.panDirection = -1;
    }
    if (camera.facing < camera.panCenter - camera.panRange) {
      camera.facing = camera.panCenter - camera.panRange;
      camera.panDirection = 1;
    }
    if (cameraSeesThief(state, camera, now)) {
      state.alarm = Math.min(100, state.alarm + CAMERA.suspicionPerSecond * dt * 14);
      state.thief.timesSeen += 1;
      state.thief.ghost = false;
    }
  }
}

/** How many cameras are watching this night (for the HUD). */
export function activeCameraCount(state, now) {
  return state.cameras.filter((c) => now >= c.disabledUntil).length;
}
