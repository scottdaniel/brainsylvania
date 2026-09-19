// Level 1 — Perfectionism. Geometry + writing live together so the level
// reads as one authored thing.
//
// Movement budget (see player.js): a running jump clears ~215px across and
// ~128px up. Keep gaps <= 165px and height steps <= 100px on the main path.

export const WORLD = { w: 4600, h: 540 };
export const GROUND_Y = 474;

// Static solids the player stands on / bumps into. {x,y,w,h}
export const SOLIDS = [
  { x: -40, y: GROUND_Y, w: 1260, h: 140 },        // opening ground  (ends 1220)
  { x: 1370, y: GROUND_Y, w: 720, h: 140 },         // middle ground   (1370–2090)  gap 150
  { x: 2650, y: GROUND_Y, w: 1950, h: 140 },        // run-up + boss arena (2650–4600)

  // optional high route over the opening ground -> a page
  { x: 360, y: 360, w: 110, h: 18 },
  { x: 540, y: 292, w: 110, h: 18 },

  // stepping stones across the middle pit (2090 -> 2650)
  { x: 2170, y: 432, w: 104, h: 18 },               // gap 80, down 42
  { x: 2350, y: 398, w: 104, h: 18 },               // gap 76, up 34
  { x: 2510, y: 432, w: 104, h: 18 },               // gap 56

  { x: 4580, y: 0, w: 40, h: 540 },                 // arena back wall
];

// Platforms that fall ~0.9s after you land. "Analysis paralysis." These sit
// over solid ground, so falling through just drops you back on the floor —
// the lesson costs noise, not progress.
export const CRUMBLING = [
  { x: 760, y: 396, w: 96, h: 16 },
  { x: 900, y: 344, w: 96, h: 16 },
  { x: 1040, y: 396, w: 96, h: 16 },
];

// Red-pen imps: drift on a segment, knock you back on touch, can't be killed.
// Mirror one while it is "scribbling" (telegraph) and it loses interest.
export const IMPS = [
  { x: 980, y: GROUND_Y - 34, range: 130 },
  { x: 1750, y: GROUND_Y - 34, range: 150 },
  { x: 3050, y: GROUND_Y - 34, range: 210 },
];

// "Good enough" pages. Optional. Collecting them all earns a wry line.
// All six sit before BOSS_TRIGGER_X (3420) — past that the player is snapped
// to the duel spot, sealed in, and (after the win) frozen for the end card,
// so nothing past the trigger is ever actually reachable.
export const PAGES = [
  { x: 410, y: 320 }, { x: 585, y: 252 }, { x: 1180, y: 300 },
  { x: 2360, y: 356, }, { x: 3250, y: GROUND_Y - 40 }, { x: 3340, y: GROUND_Y - 40 },
];

export const SIGNS = [
  { x: 200, y: GROUND_Y - 96, text: 'DONE IS BETTER THAN PERFECT' },
  { x: 1470, y: GROUND_Y - 96, text: 'the imps only bite if you stop' },
  { x: 2860, y: GROUND_Y - 96, text: 'the editor is in. it is always in.' },
];

export const CHECKPOINT = { x: 2760, y: GROUND_Y - 60 };
export const BOSS_TRIGGER_X = 3420;    // crossing this seals the arena
export const ARENA = { x0: 3260, x1: 4560 };

// ---- Writing -------------------------------------------------------------

export const OPENING = [
  { who: 'YOU', text: 'It just needs one more pass.' },
  { who: 'YOU', text: 'It always needs one more pass.' },
  { who: '', text: 'Move with ← →.  Jump with ↑ or Z.  Nothing here holds still for long — keep going.' },
];

export const EDITOR_INTRO = [
  { who: 'THE EDITOR', text: 'Oh good. You brought a draft.' },
  { who: 'THE EDITOR', text: "Let's fix it. All of it. Watch my hand." },
  { who: '', text: 'You cannot damage The Editor. It shows you a phrase of moves — then you play the same phrase back.' },
  { who: '', text: '▲ = jump   ▼ = duck   ◀ ▶ = step.  Hit each beat in time. Match its phrases and it recognises itself in you.' },
];

// Shown after a phrase, keyed by how it went.
export const MIRROR_LINES = {
  perfect: [
    "Clean. The Editor watches its own gesture come back and falters.",
    "'...that's exactly how I do it,' it says, unsettled.",
    "It sees the phrase land on your hands. Something in it loosens.",
  ],
  partial: [
    "Most of it lands. The Editor tilts its head.",
    "'Close. Closer than I expected.'",
  ],
  whiff: [
    "The phrase scatters. The Editor tidies it away and starts again. No harm.",
    "'Again. From the top. We have time.'",
  ],
};

export const MIRROR_FIRST_HINT =
  "Watch the row of marks fill in — then play it back: ▲ jump, ▼ duck, ◀ ▶ step, one per beat.";

export const EDITOR_TURN = [
  { who: 'THE EDITOR', text: 'Stop. Stop, stop. Those are my marks.' },
  { who: 'THE EDITOR', text: 'I have been doing this since you were nine and the poem rhymed wrong.' },
  { who: 'YOU', text: 'I know. I could never tell where you ended and I started.' },
  { who: 'THE EDITOR', text: '...' },
  { who: 'THE EDITOR', text: "The red pen was pointed the wrong way this whole time, wasn't it." },
  { who: 'THE EDITOR', text: "Fine. New deal. I edit. I don't erase. And you get to publish before you die." },
  { who: '', text: 'THE EDITOR joins you. You can now REVISE your jump once in mid-air (press jump again).' },
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
