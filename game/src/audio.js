// Sound: every effect is synthesised with WebAudio — no audio files, no
// network. Footsteps tick softly, a loot chime rings when a case opens, the
// alarm swells as the meter climbs, a low bell tolls on lockdown, and the
// getaway van's engine hums the Fox away. Audio starts on the first user
// gesture, as browsers require.
let audioContext = null;
let alarmOscillator = null;
let alarmGain = null;

function context() {
  if (audioContext) return audioContext;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  audioContext = new AC();
  return audioContext;
}

export function unlockAudio() {
  const ctx = context();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(frequency, duration, type, volume, when) {
  const ctx = context();
  if (!ctx) return;
  const start = when ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playFootstep(sneaking) {
  tone(sneaking ? 140 : 190, 0.05, 'triangle', sneaking ? 0.03 : 0.06);
}

export function playLootChime(tier) {
  const base = tier === 'legendary' ? 880 : tier === 'rare' ? 660 : 520;
  tone(base, 0.25, 'sine', 0.12);
  tone(base * 1.5, 0.3, 'sine', 0.1, (context() ? context().currentTime : 0) + 0.08);
}

export function playTargetStolen() {
  const ctx = context();
  if (!ctx) return;
  [523, 659, 784, 1047].forEach((freq, i) => tone(freq, 0.4, 'sine', 0.12, ctx.currentTime + i * 0.09));
}

export function playSpotted() {
  tone(220, 0.2, 'sawtooth', 0.1);
  tone(185, 0.3, 'sawtooth', 0.1, (context() ? context().currentTime : 0) + 0.12);
}

export function playLockdownBell() {
  tone(98, 1.4, 'sine', 0.22);
  tone(147, 1.2, 'sine', 0.1, (context() ? context().currentTime : 0) + 0.05);
}

export function playCaught() {
  tone(110, 0.5, 'sawtooth', 0.14);
  tone(82, 0.8, 'sawtooth', 0.14, (context() ? context().currentTime : 0) + 0.2);
}

export function playGetaway() {
  const ctx = context();
  if (!ctx) return;
  const start = ctx.currentTime;
  tone(65, 2.2, 'triangle', 0.14, start);
  tone(98, 2.2, 'triangle', 0.08, start + 0.3);
  tone(131, 1.6, 'triangle', 0.08, start + 0.8);
}

/** The alarm's swell follows the meter: silent when calm, humming when hot. */
export function setAlarmHum(alarm) {
  const ctx = context();
  if (!ctx) return;
  if (alarm < 40) {
    if (alarmOscillator) {
      alarmOscillator.stop();
      alarmOscillator = null;
      alarmGain = null;
    }
    return;
  }
  if (!alarmOscillator) {
    alarmOscillator = ctx.createOscillator();
    alarmGain = ctx.createGain();
    alarmOscillator.type = 'sine';
    alarmOscillator.frequency.setValueAtTime(55, ctx.currentTime);
    alarmGain.gain.setValueAtTime(0, ctx.currentTime);
    alarmOscillator.connect(alarmGain);
    alarmGain.connect(ctx.destination);
    alarmOscillator.start();
  }
  alarmOscillator.frequency.setTargetAtTime(55 + alarm * 0.4, ctx.currentTime, 0.2);
  alarmGain.gain.setTargetAtTime(0.02 + (alarm / 100) * 0.05, ctx.currentTime, 0.2);
}

export function stopAlarmHum() {
  if (alarmOscillator) {
    alarmOscillator.stop();
    alarmOscillator = null;
    alarmGain = null;
  }
}
