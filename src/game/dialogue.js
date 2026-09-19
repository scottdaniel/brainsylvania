import { Input } from '../engine/input.js';
import { clamp } from '../engine/math.js';
import { SFX } from './sfx.js';
import { loadImage } from '../engine/sprite.js';

const asset = (name) => new URL(`../assets/ui/${name}`, import.meta.url);
const PANEL = loadImage(asset('dialogue-panel.png'));
const CONTINUE = loadImage(asset('continue.png'));
const CONTINUE_HL = loadImage(asset('continue-hl.png'));

// A tiny typewriter dialogue box. queue([{who, text}, ...], onDone).
export class Dialogue {
  constructor() {
    this.lines = [];
    this.i = 0;
    this.chars = 0;
    this.onDone = null;
    this.active = false;
  }

  get busy() { return this.active; }

  queue(lines, onDone) {
    this.lines = lines.slice();
    this.i = 0;
    this.chars = 0;
    this.onDone = onDone || null;
    this.active = this.lines.length > 0;
    if (this.active) SFX.dialogueBlip.play(0.3);
  }

  update(dt) {
    if (!this.active) return;
    const full = this.lines[this.i].text;
    if (this.chars < full.length) {
      this.chars = Math.min(full.length, this.chars + dt * 42);
      if (Input.pressed('confirm') || Input.pressed('mirror')) this.chars = full.length;
      return;
    }
    if (Input.pressed('confirm') || Input.pressed('jump') || Input.pressed('mirror')) {
      this.i++;
      this.chars = 0;
      if (this.i >= this.lines.length) {
        this.active = false;
        const cb = this.onDone;
        this.onDone = null;
        if (cb) cb();
      } else {
        SFX.dialogueBlip.play(0.3);
      }
    }
  }

  draw(ctx, W, H) {
    if (!this.active) return;
    const line = this.lines[this.i];
    const boxH = 120;
    const y = H - boxH - 18;
    ctx.save();
    if (PANEL.ready) {
      ctx.drawImage(PANEL, 24, y, W - 48, boxH);
    } else {
      ctx.fillStyle = 'rgba(8, 5, 14, 0.92)';
      ctx.strokeStyle = '#5a3d78';
      ctx.lineWidth = 2;
      roundRect(ctx, 24, y, W - 48, boxH, 8);
      ctx.fill();
      ctx.stroke();
    }

    if (line.who) {
      ctx.fillStyle = line.who === 'YOU' ? '#8fd6c4' : '#e0728a';
      ctx.font = '13px ui-monospace, monospace';
      ctx.fillText(line.who, 40, y + 34);
    }

    ctx.fillStyle = '#e9e4f5';
    ctx.font = '16px ui-monospace, monospace';
    const shown = line.text.slice(0, Math.floor(this.chars));
    wrapText(ctx, shown, 40, y + (line.who ? 58 : 40), W - 96, 22);

    const done = this.chars >= line.text.length;
    if (done) {
      const pulse = (performance.now() / 400) % 2 < 1;
      if (CONTINUE.ready && CONTINUE_HL.ready) {
        const icon = pulse ? CONTINUE_HL : CONTINUE;
        const iw = 30, ih = 30 * (icon.naturalHeight / icon.naturalWidth);
        ctx.drawImage(icon, W - 56, y + boxH - 16 - ih, iw, ih);
      } else if (pulse) {
        ctx.fillStyle = '#8a7fae';
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillText('▶  Enter', W - 120, y + boxH - 14);
      }
    }
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lh) {
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        y += lh;
        line = word;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, y);
    y += lh;
  }
}

export { clamp };
