import { runLoop } from './engine/loop.js';
import { Input } from './engine/input.js';
import { Game } from './game/game.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const game = new Game(ctx, canvas.width, canvas.height);
if (new URLSearchParams(location.search).has('debug')) window.__game = game;

runLoop({
  step: (dt) => {
    game.step(dt);
    Input.endFrame();
  },
  draw: () => game.draw(),
});
