// Keyboard input: held state + "pressed this frame" edge detection.

const HELD = new Set();
const PRESSED = new Set();

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

export const Input = {
  held: (a) => HELD.has(a),
  pressed: (a) => PRESSED.has(a),
  // Call once at the end of every frame.
  endFrame: () => PRESSED.clear(),
};
