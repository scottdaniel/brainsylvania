// Level 1 — Perfectionism. Geometry + writing live together so the level
// reads as one authored thing.

export const WORLD = { w: 4400, h: 540 };
export const GROUND_Y = 474;

// Static solids the player stands on / bumps into. {x,y,w,h}
export const SOLIDS = [
  { x: -40, y: GROUND_Y, w: 1200, h: 120 },      // opening ground
  { x: 1360, y: GROUND_Y, w: 520, h: 120 },       // after first gap
  { x: 2680, y: GROUND_Y, w: 1760, h: 120 },      // run-up + boss arena floor

  { x: 360, y: 372, w: 120, h: 20 },              // tutorial step
  { x: 560, y: 300, w: 120, h: 20 },
  { x: 980, y: 320, w: 90, h: 20 },               // hop to the gap edge

  { x: 1980, y: 356, w: 90, h: 18 },              // stepping stones over the pit
  { x: 2200, y: 300, w: 90, h: 18 },
  { x: 2430, y: 356, w: 90, h: 18 },

  { x: 4400, y: 0, w: 40, h: 540 },               // arena back wall
];

// Platforms that fall ~1.2s after you land on them. "Analysis paralysis."
export const CRUMBLING = [
  { x: 1180, y: 380, w: 96, h: 18 },
  { x: 1300, y: 340, w: 96, h: 18 },
  { x: 1160, y: 264, w: 96, h: 18 },
];

// Red-pen imps: drift on a segment, knock you back on touch, can't be killed.
// Mirror one while it is "scribbling" and it loses interest.
export const IMPS = [
  { x: 700, y: GROUND_Y - 34, range: 150 },
  { x: 1600, y: GROUND_Y - 34, range: 120 },
  { x: 3000, y: GROUND_Y - 34, range: 200 },
];

// "Good enough" pages. Optional. Collecting them all earns a wry line.
export const PAGES = [
  { x: 430, y: 330 }, { x: 610, y: 258 }, { x: 1230, y: 300 },
  { x: 2210, y: 250 }, { x: 2460, y: 314 }, { x: 3200, y: GROUND_Y - 40 },
];

export const SIGNS = [
  { x: 180, y: GROUND_Y - 96, text: 'DONE IS BETTER THAN PERFECT' },
  { x: 1440, y: GROUND_Y - 96, text: 'the imps only bite\nif you stop' },
  { x: 2760, y: GROUND_Y - 96, text: 'the editor is in.\nit is always in.' },
];

export const CHECKPOINT = { x: 2620, y: GROUND_Y - 60 };
export const BOSS_TRIGGER_X = 3360;    // crossing this seals the arena
export const ARENA = { x0: 3200, x1: 4360 };

// ---- Writing -------------------------------------------------------------

export const OPENING = [
  { who: 'YOU', text: 'It just needs one more pass.' },
  { who: 'YOU', text: 'It always needs one more pass.' },
  { who: '', text: 'Move with ← →.  Jump with ↑ or Z.  Keep moving — nothing here holds still for long.' },
];

export const EDITOR_INTRO = [
  { who: 'THE EDITOR', text: 'Oh good. You brought a draft.' },
  { who: 'THE EDITOR', text: "Let's fix it. All of it. Hold still." },
  { who: '', text: "You can't hurt The Editor. Survive a mark cleanly, then press J to MIRROR it back." },
];

// Lines shown the moment the player mirrors each mark.
export const MIRROR_LINES = {
  stet: "You draw the strike-through in the air. The Editor pauses. 'Hm. Deliberate.'",
  notes: "You scatter the same notes back. 'Those are... not wrong,' it admits.",
  selectall: "You box the whole page, the way it does. It stares at its own gesture on your hands.",
};

export const EDITOR_TURN = [
  { who: 'THE EDITOR', text: 'Stop. Stop, stop. Those are my marks.' },
  { who: 'THE EDITOR', text: 'I have been doing this since you were nine and the poem rhymed wrong.' },
  { who: 'YOU', text: 'I know. I could never tell where you ended and I started.' },
  { who: 'THE EDITOR', text: '...' },
  { who: 'THE EDITOR', text: "The red pen was pointed the wrong way this whole time, wasn't it." },
  { who: 'THE EDITOR', text: "Fine. New deal. I edit. I don't erase. And you get to publish before you die." },
  { who: '', text: 'THE EDITOR joins you. You may now REVISE your jump once in mid-air (double jump).' },
];

export const OUTRO = [
  { who: '', text: 'PERFECTIONISM — befriended.' },
  { who: 'THE EDITOR', text: "That ending's a little wordy. But it's yours. Ship it." },
  { who: '', text: "It doesn't stay gone. None of them do. It just travels lighter now." },
];

export const SPIRAL_LINES = [
  'Okay. That happened. Back up a bit.',
  'A spiral is just a circle that admits it.',
  "Nobody's grading the retries.",
];
