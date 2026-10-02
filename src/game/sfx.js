import { sfx, loopTrack, loopLayer } from '../engine/audio.js';

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

// Scott's organ loops, layered under the ambience. Both files are normalized
// to about -3 dBFS, so these volumes are comparable: the calm one sits a few
// dB under the ambience; the faster, triplet-driven one is a touch louder for
// the boss fight.
export const ORGAN = loopLayer(url('organ-1.wav'), { volume: 0.15 });
export const ORGAN_BOSS = loopLayer(url('organ-2.wav'), { volume: 0.2 });
