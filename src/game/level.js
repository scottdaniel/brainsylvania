import * as L from '../content/perfectionism.js';
import { Imp } from './imp.js';
import { aabb } from '../engine/math.js';

function wrapWords(text, max) {
  const out = [];
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? line + ' ' + w : w;
    if (t.length > max && line) { out.push(line); line = w; }
    else line = t;
  }
  if (line) out.push(line);
  return out;
}

class Crumble {
  constructor(def) {
    Object.assign(this, def);
    this.ox = def.x; this.oy = def.y;
    this.state = 'idle';   // idle -> shaking -> falling -> gone
    this.t = 0;
    this.solid = true;
  }
  onLand() { if (this.state === 'idle') { this.state = 'shaking'; this.t = 0; } }
  update(dt) {
    this.t += dt;
    if (this.state === 'shaking') {
      this.x = this.ox + Math.sin(this.t * 40) * 2;
      if (this.t > 0.9) { this.state = 'falling'; this.t = 0; this.solid = false; this.vy = 0; }
    } else if (this.state === 'falling') {
      this.vy = (this.vy || 0) + 1800 * dt;
      this.y += this.vy * dt;
      if (this.y > 900) { this.state = 'gone'; this.t = 0; }
    } else if (this.state === 'gone') {
      if (this.t > 2.5) { this.x = this.ox; this.y = this.oy; this.state = 'idle'; this.solid = true; }
    }
  }
  draw(ctx) {
    if (this.state === 'gone') return;
    ctx.fillStyle = this.state === 'idle' ? '#5b4a2e' : '#7a5330';
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.w, this.h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(Math.round(this.x), Math.round(this.y) + this.h - 4, this.w, 4);
  }
}

export class Level {
  constructor() {
    this.world = L.WORLD;
    this.groundY = L.GROUND_Y;
    this.solids = L.SOLIDS.map((s) => ({ ...s }));
    this.crumbles = L.CRUMBLING.map((c) => new Crumble(c));
    this.imps = L.IMPS.map((i) => new Imp(i.x, i.y, i.range));
    this.pages = L.PAGES.map((p) => ({ ...p, w: 16, h: 20, got: false }));
    this.signs = L.SIGNS;
    this.checkpoint = L.CHECKPOINT;
    this.arena = L.ARENA;
    this.bossTriggerX = L.BOSS_TRIGGER_X;
    this.candles = Array.from({ length: 26 }, (_, i) => ({
      x: 120 + i * 165 + (i % 3) * 40, y: 120 + (i % 4) * 70,
    }));
  }

  get movers() { return this.crumbles; }

  update(dt, player) {
    for (const c of this.crumbles) c.update(dt);
    for (const im of this.imps) im.update(dt, player);
    for (const pg of this.pages) {
      if (!pg.got && aabb(pg, player.box)) { pg.got = true; player.pages++; }
    }
  }

  drawBack(ctx, cam) {
    // parallax wall
    const par = -cam.x * 0.35;
    ctx.fillStyle = '#120c1e';
    ctx.fillRect(0, 0, this.world.w, this.world.h);
    ctx.save();
    ctx.translate(par, 0);
    ctx.fillStyle = '#1b1330';
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(i * 200, 40, 90, 260);           // gothic windows
    }
    ctx.fillStyle = '#0d0918';
    for (let i = 0; i < 40; i++) ctx.fillRect(i * 200 + 12, 60, 66, 210);
    ctx.restore();

    // candles (mid layer)
    const mid = -cam.x * 0.6;
    ctx.save();
    ctx.translate(mid, 0);
    for (const c of this.candles) {
      ctx.fillStyle = '#2a2138';
      ctx.fillRect(c.x, c.y, 6, 20);
      const f = 3 + Math.sin(performance.now() / 120 + c.x) * 1.2;
      ctx.fillStyle = '#ffb347';
      ctx.beginPath();
      ctx.arc(c.x + 3, c.y - 3, f, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,150,60,0.12)';
      ctx.beginPath();
      ctx.arc(c.x + 3, c.y - 3, f * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawWorld(ctx) {
    // solids
    for (const s of this.solids) {
      if (s.h > 300) {
        ctx.fillStyle = '#241a30';
        ctx.fillRect(s.x, s.y, s.w, s.h);
      }
      ctx.fillStyle = '#3a2f1e';
      ctx.fillRect(s.x, s.y, s.w, Math.min(s.h, 24));
      ctx.fillStyle = '#4c3d26';
      ctx.fillRect(s.x, s.y, s.w, 6);
    }
    for (const c of this.crumbles) c.draw(ctx);

    // signs
    ctx.textAlign = 'center';
    for (const sg of this.signs) {
      const rows = sg.text.toUpperCase().split('\n').flatMap((t) => wrapWords(t, 16));
      const boxW = 150;
      const boxH = 14 + rows.length * 10;
      ctx.fillStyle = '#2a2038';
      ctx.fillRect(sg.x - 4, sg.y, 8, 60);
      ctx.fillStyle = '#e7dfc8';
      ctx.fillRect(sg.x - boxW / 2, sg.y - boxH, boxW, boxH);
      ctx.fillStyle = '#3a2c1e';
      ctx.font = '8px ui-monospace, monospace';
      rows.forEach((t, i) => ctx.fillText(t, sg.x, sg.y - boxH + 12 + i * 10));
    }
    ctx.textAlign = 'left';

    // checkpoint lamp
    const cp = this.checkpoint;
    ctx.fillStyle = '#3a2f1e';
    ctx.fillRect(cp.x, cp.y, 6, 60);
    ctx.fillStyle = '#ffd27a';
    ctx.beginPath();
    ctx.arc(cp.x + 3, cp.y - 4, 8, 0, Math.PI * 2);
    ctx.fill();

    // pages
    for (const pg of this.pages) {
      if (pg.got) continue;
      ctx.fillStyle = '#efe7d0';
      ctx.fillRect(pg.x, pg.y + Math.sin(performance.now() / 300 + pg.x) * 2, pg.w, pg.h);
      ctx.fillStyle = '#b98a5a';
      ctx.fillRect(pg.x + 3, pg.y + 4, 8, 2);
    }

    for (const im of this.imps) im.draw(ctx);
  }
}
