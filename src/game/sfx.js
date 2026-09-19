import { sfx, loopTrack } from '../engine/audio.js';

const url = (name) => new URL(`../assets/sfx/${name}`, import.meta.url);

export const SFX = {
  jump: sfx(url('jump.wav')),
  hurt: sfx(url('hurt.wav')),
  mirrorGood: sfx(url('mirror-good.wav'), 4),
  mirrorPerfect: sfx(url('mirror-perfect.wav')),
  dialogueBlip: sfx(url('dialogue-blip.wav'), 4),
  editorVoice: sfx(url('editor-voice.wav')),
};

export const AMBIENT = loopTrack(url('ambient.wav'), 0.25);
