import { clamp, rand, aabb } from '../engine/math.js';

const GLYPH = { stet: '~~', notes: '!!!', selectall: '[  ]' };
const ORDER = ['stet', 'notes', 'selectall'];

// The Editor. You cannot damage it. Survive a mark, mirror it back.
export class Editor {
  constructor(arena, groundY) {
    this.arena = arena;               // {x0, x1}
    this.groundY = groundY;
    this.x = arena.x1 - 220;
    this.y = 120;
    this.w = 54; this.h = 72;
    this.t = 0;
    this.phase = 'sleep';             // sleep -> idle -> telegraph -> attack -> window
    this.timer = 0;
    this.recognition = 0;
    this.attack = null;
    this.current = null;              // key of current mark
    this.gotHit = false;
    this.hazards = [];
    this.mirrorReady = false;
    this.pool = ORDER.slice();
    this.done = false;
    this.bob = 0;
  }

  wake() { if (this.phase === 'sleep') { this.phase = 'idle'; this.timer = 0.6; } }

  nextMark() {
    if (this.pool.length === 0) this.pool = ORDER.slice();
    // prefer marks not yet learned by the player, to keep progress moving
    const i = Math.floor(rand(0, this.pool.length));
    return this.pool.splice(i, 1)[0];
  }

  update(dt, player, onEvent) {
    this.t += dt;
    this.bob = Math.sin(this.t * 2) * 6;
    if (this.phase === 'sleep' || this.done) return;

    // float toward a hover spot above the player
    const homeX = clamp(player.x, this.arena.x0 + 120, this.arena.x1 - 120);
    this.x += (homeX - this.x) * Math.min(1, dt * 1.4);
    this.y += (110 - this.y) * Math.min(1, dt * 1.4);

    this.timer -= dt;

    if (this.phase === 'idle' && this.timer <= 0) {
      this.current = this.nextMark();
      this.phase = 'telegraph';
      this.timer = 0.95;
      onEvent('telegraph', this.current);
    } else if (this.phase === 'telegraph' && this.timer <= 0) {
      this.phase = 'attack';
      this.gotHit = false;
      this.hazards = this._spawn(this.current, player);
      this.timer = this._duration(this.current);
    } else if (this.phase === 'attack') {
      for (const hz of this.hazards) hz.update(dt);
      this.hazards = this.hazards.filter((hz) => !hz.dead);
      if (!player.iframes && this._touch(player)) {
        if (player.hurt(this.x)) {
          this.gotHit = true;
          this.recognition = Math.max(0, this.recognition - 10);
          onEvent('hit');
        }
      }
      if (this.timer <= 0 && this.hazards.length === 0) {
        if (this.gotHit) {
          this.phase = 'idle'; this.timer = 0.9;
        } else {
          this.phase = 'window'; this.timer = 2.4; this.mirrorReady = true;
          onEvent('window', this.current);
        }
      }
    } else if (this.phase === 'window') {
      if (this.timer <= 0) { this.mirrorReady = false; this.phase = 'idle'; this.timer = 0.7; }
    }
  }

  // Called by game when the player presses MIRROR during the window.
  mirror(player, onEvent) {
    if (!this.mirrorReady) return false;
    this.mirrorReady = false;
    player.learned.add(this.current);
    this.recognition = Math.min(100, this.recognition + 34);
    onEvent('mirror', this.current);
    if (this.recognition >= 100) { this.done = true; this.phase = 'idle'; this.hazards = []; }
    else { this.phase = 'idle'; this.timer = 0.8; }
    return true;
  }

  _duration(k) { return k === 'selectall' ? 1.6 : k === 'stet' ? 1.8 : 2.0; }

  _touch(player) {
    return this.hazards.some((hz) => hz.hits(player));
  }

  _spawn(k, player) {
    const { x0, x1 } = this.arena;
    if (k === 'stet') {
      // horizontal ink dashes that sweep across at two heights
      return [
        new Beam(x0, this.groundY - 96, x1 - x0, 14, 1, 0.55),
        new Beam(x0, this.groundY - 30, x1 - x0, 14, 1, 1.15),
      ];
    }
    if (k === 'notes') {
      const px = player.x;
      return [0, 0.35, 0.7].map((d, i) =>
        new Note(clamp(px + (i - 1) * 60, x0 + 20, x1 - 20), -40, this.groundY, d));
    }
    // selectall: box closes in, safe gap where the player currently is
    const safeX = clamp(player.x - 55, x0 + 10, x1 - 120);
    return [new Marquee(x0, x1, this.groundY, safeX, 110)];
  }

  draw(ctx) {
    const y = this.y + this.bob;
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(y));
    // robe
    ctx.fillStyle = this.done ? '#4a3a2a' : '#241a30';
    ctx.beginPath();
    ctx.moveTo(this.w / 2, -6);
    ctx.lineTo(this.w + 6, this.h);
    ctx.lineTo(-6, this.h);
    ctx.closePath();
    ctx.fill();
    // hood void
    ctx.fillStyle = '#0c0812';
    ctx.beginPath();
    ctx.arc(this.w / 2, 10, 15, 0, Math.PI * 2);
    ctx.fill();
    // the pen
    ctx.strokeStyle = this.done ? '#8fd6c4' : '#ff4d68';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.w + 2, this.h - 20);
    ctx.lineTo(this.w + 22, this.h - 4);
    ctx.stroke();
    // eyes
    ctx.fillStyle = this.done ? '#9fe8d6' : '#ff5a75';
    ctx.fillRect(this.w / 2 - 8, 8, 4, 4);
    ctx.fillRect(this.w / 2 + 4, 8, 4, 4);
    ctx.restore();

    for (const hz of this.hazards) hz.draw(ctx);

    // telegraph glyph
    if (this.phase === 'telegraph') {
      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(this.t * 30) * 0.4;
      ctx.fillStyle = '#ff5a75';
      ctx.font = 'bold 44px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(GLYPH[this.current], this.x + this.w / 2, y - 18);
      ctx.restore();
    }
  }
}

// ---- hazards ----

class Beam {
  constructor(x, y, w, h, dir, warn) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.warn = warn; this.live = 0.42; this.dead = false; this.t = 0;
  }
  update(dt) {
    this.t += dt;
    if (this.t > this.warn + this.live) this.dead = true;
  }
  get active() { return this.t >= this.warn && this.t < this.warn + this.live; }
  hits(p) { return this.active && aabb({ x: this.x, y: this.y, w: this.w, h: this.h }, p.box); }
  draw(ctx) {
    ctx.save();
    if (this.active) {
      ctx.fillStyle = '#ff4d68';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    } else {
      ctx.strokeStyle = 'rgba(255,90,117,0.5)';
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(this.x, this.y + this.h / 2, this.w, 1);
    }
    ctx.restore();
  }
}

class Note {
  constructor(x, y, groundY, delay) {
    this.x = x; this.y = y; this.groundY = groundY; this.delay = delay;
    this.vy = 0; this.t = 0; this.dead = false; this.w = 16; this.h = 26;
  }
  update(dt) {
    this.t += dt;
    if (this.t < this.delay) return;
    this.vy += 1600 * dt;
    this.y += this.vy * dt;
    if (this.y > this.groundY) { this.y = this.groundY; this.rest = (this.rest || 0) + dt; }
    if (this.rest > 0.5) this.dead = true;
  }
  hits(p) {
    return this.t >= this.delay && aabb({ x: this.x - 8, y: this.y, w: this.w, h: this.h }, p.box);
  }
  draw(ctx) {
    if (this.t < this.delay) {
      ctx.fillStyle = 'rgba(255,120,140,0.5)';
      ctx.fillRect(this.x - 2, 0, 4, this.groundY);
      return;
    }
    ctx.fillStyle = '#ff6b84';
    ctx.font = 'bold 26px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', this.x, this.y + 20);
  }
}

class Marquee {
  constructor(x0, x1, groundY, safeX, safeW) {
    this.x0 = x0; this.x1 = x1; this.groundY = groundY;
    this.safeX = safeX; this.safeW = safeW;
    this.t = 0; this.warn = 0.5; this.close = 0.5; this.hold = 0.5; this.dead = false;
  }
  update(dt) {
    this.t += dt;
    if (this.t > this.warn + this.close + this.hold) this.dead = true;
  }
  get k() { return clamp((this.t - this.warn) / this.close, 0, 1); }
  hits(p) {
    if (this.t < this.warn) return false;
    const leftW = (this.safeX - this.x0) * this.k;
    const rightW = (this.x1 - (this.safeX + this.safeW)) * this.k;
    const inLeft = aabb({ x: this.x0, y: 0, w: leftW, h: this.groundY + 40 }, p.box);
    const inRight = aabb({ x: this.x1 - rightW, y: 0, w: rightW, h: this.groundY + 40 }, p.box);
    return inLeft || inRight;
  }
  draw(ctx) {
    ctx.save();
    if (this.t < this.warn) {
      ctx.strokeStyle = 'rgba(255,90,117,0.7)';
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(this.safeX, 8, this.safeW, this.groundY - 8);
    } else {
      const leftW = (this.safeX - this.x0) * this.k;
      const rightW = (this.x1 - (this.safeX + this.safeW)) * this.k;
      ctx.fillStyle = 'rgba(255,77,104,0.85)';
      ctx.fillRect(this.x0, 0, leftW, this.groundY + 40);
      ctx.fillRect(this.x1 - rightW, 0, rightW, this.groundY + 40);
    }
    ctx.restore();
  }
}
