import { aabb } from '../engine/math.js';
import { SFX } from './sfx.js';

// Red-pen imp. Bobs along a segment. Touch = knockback. Cannot be killed.
// While "scribbling" (telegraph), a MIRROR back makes it lose interest.
export class Imp {
  constructor(x, y, range) {
    this.x0 = x; this.y = y; this.range = range;
    this.x = x; this.w = 22; this.h = 22;
    this.t = Math.random() * 6;
    this.scribble = 0;      // >0 while telegraphing
    this.cool = 2 + Math.random() * 2;
    this.calmed = false;
    this.solid = false;
  }

  get box() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  update(dt, player) {
    this.t += dt;
    if (this.calmed) {
      this.y -= 22 * dt;                 // drift up and away
      this.x += Math.sin(this.t * 2) * 12 * dt;
      return;
    }
    this.x = this.x0 + Math.sin(this.t * 1.4) * this.range;
    this.y += Math.sin(this.t * 5) * 0.4;

    const near = Math.abs(player.x - this.x) < 120;
    this.cool -= dt;
    if (near && this.scribble <= 0 && this.cool <= 0) { this.scribble = 1.6; }
    if (this.scribble > 0) {
      this.scribble -= dt;
      if (this.scribble <= 0) this.cool = 2.4;
    }

    if (aabb(this.box, player.box) && player.hurt(this.x)) {
      this.cool = 1.5;
      SFX.hurt.play(0.5);
    }
  }

  // Returns true if this mirror attempt calmed the imp.
  tryMirror(player) {
    if (this.calmed || this.scribble <= 0) return false;
    if (Math.abs(player.x - this.x) > 130) return false;
    this.calmed = true;
    SFX.mirrorGood.play(0.6);
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y));
    const a = this.calmed ? 0.5 : 1;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#b23048';
    ctx.beginPath();
    ctx.arc(this.w / 2, this.h / 2, this.w / 2, 0, Math.PI * 2);
    ctx.fill();
    // nib
    ctx.fillStyle = '#e8dfc8';
    ctx.fillRect(this.w / 2 - 2, this.h - 3, 4, 6);
    // eyes
    ctx.fillStyle = '#1a1020';
    ctx.fillRect(5, 8, 3, 3);
    ctx.fillRect(this.w - 8, 8, 3, 3);
    ctx.restore();

    if (this.scribble > 0 && !this.calmed) {
      ctx.save();
      ctx.strokeStyle = '#ff5a75';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const yy = this.y - 14 - i * 3;
        ctx.moveTo(this.x - 10, yy);
        ctx.lineTo(this.x + this.w + 10, yy + (i % 2 ? 3 : -3));
      }
      ctx.stroke();
      ctx.restore();
    }
  }
}
