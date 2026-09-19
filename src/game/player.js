import { Input } from '../engine/input.js';
import { clamp, aabb } from '../engine/math.js';
import { loadImage, drawAnchored } from '../engine/sprite.js';
import { SFX } from './sfx.js';

const SPRITE = loadImage(new URL('../assets/player.png', import.meta.url));

// Tuned so a running jump clears ~215px horizontally and ~128px vertically.
const GRAV = 1900;
const RUN = 288;
const ACCEL = 3200;
const FRICTION = 2600;
const JUMP_V = 700;
const COYOTE = 0.11;
const BUFFER = 0.13;

export class Player {
  constructor(x, y) {
    this.spawn = { x, y };
    this.reset(x, y);
    this.composure = 5;
    this.maxComposure = 5;
    this.learned = new Set();      // 'stet' | 'notes' | 'selectall'
    this.canDoubleJump = false;
    this.pages = 0;
  }

  reset(x, y) {
    this.x = x; this.y = y;
    this.w = 24; this.h = 34;
    this.vx = 0; this.vy = 0;
    this.face = 1;
    this.onGround = false;
    this.ducking = false;
    this.coyote = 0;
    this.buffer = 0;
    this.usedDouble = false;
    this.iframes = 0;
    this.animT = 0;
    this.fell = false;
    this.echoDir = null;
    this.echoT = 0;
  }

  // Called when the player nails a beat in the Editor's call-and-response:
  // the body performs the move so you *see* yourself mirroring the phrase.
  doEcho(dir) {
    this.echoDir = dir;
    this.echoT = 0.34;
    if (dir === 'left') this.face = -1;
    if (dir === 'right') this.face = 1;
  }

  get box() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  hurt(fromX) {
    if (this.iframes > 0) return false;
    this.composure = Math.max(0, this.composure - 1);
    this.iframes = 1.0;
    this.vx = (this.x < fromX ? -1 : 1) * 260;
    this.vy = -260;
    return true;
  }

  respawn(pt) {
    const c = this.composure;
    this.reset(pt.x, pt.y);
    this.composure = Math.max(3, c); // spirals don't cost you the whole bar
    this.iframes = 1.2;
  }

  update(dt, solids, movers, locked) {
    this.animT += dt;
    this.iframes = Math.max(0, this.iframes - dt);
    this.echoT = Math.max(0, this.echoT - dt);
    if (this.echoT === 0) this.echoDir = null;

    const wantLeft = !locked && Input.held('left');
    const wantRight = !locked && Input.held('right');
    this.ducking = !locked && this.onGround && Input.held('duck');

    const target = (wantRight - wantLeft) * RUN * (this.ducking ? 0.35 : 1);
    if (target !== 0) {
      this.vx += Math.sign(target - this.vx) * ACCEL * dt;
      if ((target > 0 && this.vx > target) || (target < 0 && this.vx < target)) this.vx = target;
      this.face = Math.sign(target);
    } else {
      this.vx += Math.sign(-this.vx) * FRICTION * dt;
      if (Math.abs(this.vx) < 6) this.vx = 0;
    }

    if (!locked && Input.pressed('jump')) this.buffer = BUFFER;
    this.buffer = Math.max(0, this.buffer - dt);
    this.coyote = this.onGround ? COYOTE : Math.max(0, this.coyote - dt);

    if (this.buffer > 0) {
      if (this.coyote > 0) {
        this.vy = -JUMP_V; this.buffer = 0; this.coyote = 0; this.onGround = false;
        SFX.jump.play(0.25);
      } else if (this.canDoubleJump && !this.usedDouble && !this.onGround) {
        this.vy = -JUMP_V * 0.92; this.usedDouble = true; this.buffer = 0;
        SFX.doubleJump.play(0.275);
      }
    }
    // Variable jump height.
    if (this.vy < 0 && !Input.held('jump')) this.vy += GRAV * 1.6 * dt;

    this.vy = clamp(this.vy + GRAV * dt, -JUMP_V, 1400);

    const h = this.ducking ? 20 : 34;
    if (h !== this.h) { this.y += this.h - h; this.h = h; }

    // ---- Move + collide, axis at a time ----
    const all = solids.concat(movers.filter((m) => m.solid));
    this.x += this.vx * dt;
    for (const s of all) {
      if (!aabb(this.box, s)) continue;
      if (this.vx > 0) this.x = s.x - this.w;
      else if (this.vx < 0) this.x = s.x + s.w;
      this.vx = 0;
    }

    this.onGround = false;
    this.y += this.vy * dt;
    for (const s of all) {
      if (!aabb(this.box, s)) continue;
      if (this.vy > 0) {
        this.y = s.y - this.h;
        this.onGround = true;
        this.usedDouble = false;
        if (s.onLand) s.onLand();
      } else if (this.vy < 0) {
        this.y = s.y + s.h;
      }
      this.vy = 0;
    }

    if (this.y > 900) { this.fell = true; }
  }

  draw(ctx) {
    const blink = this.iframes > 0 && Math.floor(this.iframes * 20) % 2 === 0;
    // echo pose — a brief lunge/hop/crouch when mirroring a beat
    const e = this.echoT / 0.34;
    let ex = 0, ey = 0, squash = 0;
    if (this.echoDir === 'up') ey = -14 * Math.sin(e * Math.PI);
    else if (this.echoDir === 'down') squash = 10 * Math.sin(e * Math.PI);
    else if (this.echoDir === 'left') ex = -12 * Math.sin(e * Math.PI);
    else if (this.echoDir === 'right') ex = 12 * Math.sin(e * Math.PI);
    ctx.save();
    ctx.translate(Math.round(this.x + ex), Math.round(this.y + ey + squash));
    if (squash) ctx.scale(1.15, (this.h - squash) / this.h);
    if (!blink && SPRITE.ready) {
      const running = this.onGround && Math.abs(this.vx) > 20;
      const bob = running ? Math.abs(Math.sin(this.animT * 12)) * 3 : 0;
      drawAnchored(ctx, SPRITE, {
        x: this.w / 2,
        bottomY: this.h - bob,
        height: 52,
        flip: this.face < 0,
      });
    } else if (!blink) {
      // vector placeholder — shows only until player.png decodes
      ctx.fillStyle = '#3a2c56';
      ctx.fillRect(0, 4, this.w, this.h - 4);
      ctx.fillStyle = '#e7dfc8';
      ctx.fillRect(5, -2, this.w - 10, 12);
      ctx.fillStyle = '#1a1226';
      ctx.fillRect(this.face > 0 ? this.w - 9 : 5, 2, 4, 4);
    }
    ctx.restore();
  }
}
