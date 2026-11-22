// Input: keyboard and mouse, the two ways the bounty says the game is
// played. WASD or the arrow keys walk; Shift sneaks; click a floor tile to
// walk there; 1-4 spend coins on tools; Q/W/E pick a crew member on the
// night-select screen; Z/X/C/V/B buy Shadowcraft upgrades; Enter advances;
// R retries a night.
export function createInput() {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    sneak: false,
    pressed: new Set(),
  };
}

const KEYMAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ShiftLeft: 'sneak',
  ShiftRight: 'sneak',
};

export function attachInput(input, canvas, callbacks) {
  window.addEventListener('keydown', (event) => {
    const field = KEYMAP[event.code];
    if (field) {
      input[field] = true;
      event.preventDefault();
    }
    if (!event.repeat) {
      input.pressed.add(event.code);
      if (callbacks.onKey) callbacks.onKey(event.code);
    }
  });
  window.addEventListener('keyup', (event) => {
    const field = KEYMAP[event.code];
    if (field) input[field] = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    if (callbacks.onClick) callbacks.onClick(x, y);
  });
  window.addEventListener('blur', () => {
    input.left = false;
    input.right = false;
    input.up = false;
    input.down = false;
    input.sneak = false;
  });
}

/** Was this key pressed since the last frame? Consumes the press. */
export function consumePress(input, code) {
  if (input.pressed.has(code)) {
    input.pressed.delete(code);
    return true;
  }
  return false;
}

/** Clear the pressed set at the end of a frame. */
export function endFrameInput(input) {
  input.pressed.clear();
}
