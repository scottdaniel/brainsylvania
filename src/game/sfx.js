import { sfx, loopTrack } from '../engine/audio.js';

const url = (name) => new URL(`../assets/sfx/${name}`, import.meta.url);

// Cycles through several takes in order so the same line doesn't repeat
// back-to-back — used for The Editor's voice.
function cycle(...pools) {
  let next = 0;
  return {
    play(volume) {
      pools[next].play(volume);
      next = (next + 1) % pools.length;
    },
  };
}

export const SFX = {
  jump: sfx(url('jump.wav')),
  doubleJump: sfx(url('double-jump.wav')),
  hurt: sfx(url('hurt.wav')),
  mirrorGood: sfx(url('mirror-good.wav'), 4),
  mirrorPerfect: sfx(url('mirror-perfect.wav')),
  dialogueBlip: sfx(url('dialogue-blip.wav'), 4),
  editorVoice: cycle(
    sfx(url('editor-voice-1.wav')),
    sfx(url('editor-voice-2.wav')),
    sfx(url('editor-voice-3.wav')),
  ),
};

export const AMBIENT = loopTrack(url('ambient.wav'), 0.55);
