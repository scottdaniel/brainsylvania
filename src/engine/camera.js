import { clamp, lerp } from './math.js';

export class Camera {
  constructor(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
    this.shake = 0;
  }

  follow(target, worldW, worldH, dt) {
    const wantX = target.x + target.w / 2 - this.viewW / 2;
    const wantY = target.y + target.h / 2 - this.viewH / 2;
    this.x = lerp(this.x, clamp(wantX, 0, Math.max(0, worldW - this.viewW)), 1 - Math.pow(0.001, dt));
    this.y = lerp(this.y, clamp(wantY, 0, Math.max(0, worldH - this.viewH)), 1 - Math.pow(0.001, dt));
    this.shake = Math.max(0, this.shake - dt * 60);
  }

  kick(amount) { this.shake = Math.min(24, this.shake + amount); }

  begin(ctx) {
    ctx.save();
    const sx = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    const sy = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    ctx.translate(Math.round(-this.x + sx), Math.round(-this.y + sy));
  }

  end(ctx) { ctx.restore(); }
}
