// Keyboard + gamepad input: held state + "pressed this frame" edge detection.
// Both sources feed the same action set, so game code never checks a device
// directly — it only ever asks "is 'jump' held/pressed".

const HELD = new Set();      // keyboard-held actions
const PRESSED = new Set();   // actions that went down this frame, either source

const MAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', KeyZ: 'jump', Space: 'jump',
  ArrowDown: 'duck', KeyS: 'duck',
  KeyE: 'mirror', KeyJ: 'mirror',
  Enter: 'confirm', KeyX: 'confirm',
  Escape: 'restart', KeyR: 'restart',
};

addEventListener('keydown', (e) => {
  const a = MAP[e.code];
  if (!a) return;
  e.preventDefault();
  if (!HELD.has(a)) PRESSED.add(a);
  HELD.add(a);
});

addEventListener('keyup', (e) => {
  const a = MAP[e.code];
  if (!a) return;
  e.preventDefault();
  HELD.delete(a);
});

addEventListener('blur', () => { HELD.clear(); PRESSED.clear(); });

// ---- Gamepad (Xbox-style / 8BitDo in X-input mode uses this layout) ------
// The Gamepad API has no press events — poll() is called once per frame and
// diffs against last frame's state. Standard-mapping button indices:
//   0 A  1 B  2 X  3 Y   4 LB  5 RB   8 Back/View  9 Start/Menu
//   12-15 D-pad Up/Down/Left/Right     axes 0/1 = left stick X/Y
const PAD_BUTTONS = {
  0: ['jump'],
  1: ['mirror'],
  2: ['mirror'],
  3: ['duck'],
  4: ['mirror'],
  5: ['mirror'],
  8: ['restart'],
  9: ['confirm'],
  12: ['jump'],
  13: ['duck'],
  14: ['left'],
  15: ['right'],
};
const STICK_DEADZONE = 0.35;

const PAD_HELD = new Set();
let padPrevHeld = new Set();
let padConnected = false;

function poll() {
  const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
  const pad = Array.from(pads).find((p) => p && p.connected);
  padConnected = !!pad;
  PAD_HELD.clear();

  if (pad) {
    pad.buttons.forEach((b, i) => {
      if (b.pressed && PAD_BUTTONS[i]) PAD_BUTTONS[i].forEach((a) => PAD_HELD.add(a));
    });
    const ax0 = pad.axes[0] || 0;
    const ax1 = pad.axes[1] || 0;
    if (ax0 < -STICK_DEADZONE) PAD_HELD.add('left');
    if (ax0 > STICK_DEADZONE) PAD_HELD.add('right');
    if (ax1 < -STICK_DEADZONE) PAD_HELD.add('jump');
    if (ax1 > STICK_DEADZONE) PAD_HELD.add('duck');
  }

  for (const a of PAD_HELD) if (!padPrevHeld.has(a)) PRESSED.add(a);
  padPrevHeld = new Set(PAD_HELD);
}

export const Input = {
  held: (a) => HELD.has(a) || PAD_HELD.has(a),
  pressed: (a) => PRESSED.has(a),
  get gamepadConnected() { return padConnected; },
  // Call once per frame, before reading input.
  poll,
  // Call once at the end of every frame.
  endFrame: () => PRESSED.clear(),
};
