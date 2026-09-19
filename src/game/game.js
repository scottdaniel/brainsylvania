import { Input } from '../engine/input.js';
import { Camera } from '../engine/camera.js';
import { Player } from './player.js';
import { Level } from './level.js';
import { Editor, SPRITE as EDITOR_SPRITE } from './editor.js';
import { Dialogue } from './dialogue.js';
import { Hud } from './hud.js';
import { drawAnchored } from '../engine/sprite.js';
import { SFX, AMBIENT } from './sfx.js';
import * as C from '../content/perfectionism.js';

export class Game {
  constructor(ctx, W, H) {
    this.ctx = ctx; this.W = W; this.H = H;
    this.cam = new Camera(W, H);
    this.dialogue = new Dialogue();
    this.hud = new Hud();
    this.mode = 'title';
    this._padWasConnected = false;
    this.reset();
  }

  reset() {
    this.level = new Level();
    this.player = new Player(60, this.level.groundY - 34);
    this.checkpoint = { x: 60, y: this.level.groundY - 34 };
    this.boss = new Editor(this.level.arena, this.level.groundY);
    this.bossStarted = false;
    this.sealWall = null;
    this.spiraling = false;
    this.telegraphSeen = false;
    this._checkpointHit = false;
    this._turnPending = false;
    this._turnDone = false;
    this.dialogue.queue([]);
    this.hud.toastT = 0;
  }

  start() {
    this.reset();
    this.mode = 'playing';
    this.dialogue.queue(C.OPENING);
    AMBIENT.start();
  }

  step(dt) {
    this.hud.update(dt);

    if (Input.gamepadConnected !== this._padWasConnected) {
      this._padWasConnected = Input.gamepadConnected;
      this.hud.say(Input.gamepadConnected ? '🎮 controller connected' : '🎮 controller disconnected', 2.0);
    }

    if (this.mode === 'title') {
      if (Input.pressed('confirm') || Input.pressed('jump')) this.start();
      return;
    }

    if (this.mode === 'won') {
      if (Input.pressed('restart')) { this.mode = 'playing'; this.reset(); }
      return;
    }

    if (Input.pressed('restart')) { this.reset(); return; }

    this.dialogue.update(dt);
    const bossLock = this.bossStarted && this.boss.locksPlayer && !this.dialogue.busy;
    const locked = this.dialogue.busy || this._turnPending || bossLock;

    // ---- world ----
    this.level.update(dt, this.player);

    const solids = this.level.solids.concat(this.sealWall ? [this.sealWall] : []);
    this.player.update(dt, solids, this.level.movers, locked);

    // spiral: composure emptied, or fell in a pit
    if (!this.spiraling && (this.player.composure === 0 || this.player.fell)) {
      this.spiraling = true;
      const line = C.SPIRAL_LINES[Math.floor(Math.random() * C.SPIRAL_LINES.length)];
      this.cam.kick(16);
      this.dialogue.queue([{ who: 'YOU', text: line }], () => {
        this.player.respawn(this.checkpoint);
        this.spiraling = false;
      });
    }

    // checkpoint
    const cp = this.level.checkpoint;
    if (!this._checkpointHit && this.player.x > cp.x) {
      this._checkpointHit = true;
      this.checkpoint = { x: cp.x, y: this.level.groundY - 34 };
      this.hud.say('checkpoint — the lamp is on', 2.2);
    }

    // ---- boss trigger ----
    if (!this.bossStarted && this.player.x > this.level.bossTriggerX) {
      this.bossStarted = true;
      this.sealWall = { x: this.level.arena.x0 - 24, y: 0, w: 24, h: 540 };
      const mid = (this.level.arena.x0 + this.level.arena.x1) / 2;
      this.duelX = mid - 150;                 // where the player stands for the duel
      this.player.x = this.duelX;
      this.player.vx = 0;
      this.player.face = 1;
      this.boss.wake();
      this.dialogue.queue(C.EDITOR_INTRO);
    }

    // ---- boss ----
    if (this.bossStarted && !this._turnPending && !this.dialogue.busy) {
      this.boss.update(dt, this.player, (ev, key) => this._bossEvent(ev, key));
    }

    // mirror an imp (E), only out in the level
    if (Input.pressed('mirror') && this.boss.phase === 'sleep') {
      for (const im of this.level.imps) {
        if (im.tryMirror(this.player)) {
          this.hud.say('you copy its scribble. it deflates, embarrassed.', 2.4);
          break;
        }
      }
    }

    // ---- boss defeated -> befriend sequence ----
    if (this.boss.done && !this._turnPending && !this._turnDone) {
      this._turnPending = true;
      this.dialogue.queue(C.EDITOR_TURN, () => {
        this.player.canDoubleJump = true;
        this.sealWall = null;
        this._turnPending = false;
        this._turnDone = true;
        this.dialogue.queue(C.OUTRO, () => { this.mode = 'won'; });
      });
    }

    if (bossLock) {
      // frame the duel: look at the midpoint between player and Editor
      const focus = {
        x: (this.player.x + this.boss.x) / 2 - 40,
        y: this.level.groundY - 200,
        w: 0, h: 0,
      };
      this.cam.follow(focus, this.level.world.w, this.level.world.h, dt);
    } else {
      this.cam.follow(this.player, this.level.world.w, this.level.world.h, dt);
    }
  }

  _bossEvent(ev, key) {
    if (ev === 'call') {
      SFX.editorVoice.play(0.4);
      if (!this.telegraphSeen) {
        this.telegraphSeen = true;
        this.hud.say(C.MIRROR_FIRST_HINT, 3.4);
      }
    } else if (ev === 'good') {
      this.cam.kick(3);
      SFX.mirrorGood.play(0.45);
    } else if (ev === 'bad') {
      this.cam.kick(6);
    } else if (ev === 'phrase') {
      const pool = C.MIRROR_LINES[key] || [];
      if (pool.length) this.hud.say(pool[(Math.random() * pool.length) | 0], 2.6);
      if (key === 'perfect') { this.cam.kick(9); SFX.mirrorPerfect.play(0.5); }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, this.W, this.H);

    if (this.mode === 'title') return this._drawTitle(ctx);

    this.level.drawBack(ctx, this.cam);
    this.cam.begin(ctx);
    this.level.drawWorld(ctx);
    if (this.bossStarted) this.boss.draw(ctx);
    if (this.sealWall) {
      ctx.fillStyle = 'rgba(255,90,117,0.15)';
      ctx.fillRect(this.sealWall.x, 0, this.sealWall.w, 540);
    }
    this.player.draw(ctx);
    // companion after befriending — a small echo of the Editor, drifting along
    if (this._turnDone) {
      const cx = this.player.x - 34 * this.player.face;
      const cy = this.player.y + this.player.h + Math.sin(performance.now() / 300) * 4;
      ctx.save();
      ctx.globalAlpha = 0.75;
      if (EDITOR_SPRITE.ready) {
        drawAnchored(ctx, EDITOR_SPRITE, { x: cx, bottomY: cy, height: 34, flip: this.player.face > 0 });
      } else {
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(cx - 10, cy - 30, 20, 30);
      }
      ctx.restore();
    }
    this.cam.end(ctx);

    // vignette
    const g = ctx.createRadialGradient(this.W / 2, this.H / 2, this.H / 3, this.W / 2, this.H / 2, this.H);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, this.H);

    this.hud.draw(ctx, this.W, this.H, this.player, this.bossStarted ? this.boss : null);
    this.dialogue.draw(ctx, this.W, this.H);

    if (this.mode === 'won') this._drawWin(ctx);
  }

  _drawTitle(ctx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e0728a';
    ctx.font = 'bold 54px ui-monospace, monospace';
    ctx.fillText('BRAINSYLVANIA', this.W / 2, this.H / 2 - 30);
    ctx.fillStyle = '#8a7fae';
    ctx.font = '15px ui-monospace, monospace';
    ctx.fillText('LEVEL 1 — PERFECTIONISM', this.W / 2, this.H / 2 + 6);
    ctx.fillText('they don’t stay dead. so you might as well make friends.', this.W / 2, this.H / 2 + 30);
    if ((performance.now() / 500) % 2 < 1) {
      ctx.fillStyle = '#ffd27a';
      ctx.fillText('press ↑ to begin', this.W / 2, this.H / 2 + 80);
    }
    ctx.textAlign = 'left';
  }

  _drawWin(ctx) {
    ctx.fillStyle = 'rgba(5,4,10,0.82)';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8fd6c4';
    ctx.font = 'bold 30px ui-monospace, monospace';
    ctx.fillText('PERFECTIONISM — BEFRIENDED', this.W / 2, 170);
    ctx.fillStyle = '#d8d2e8';
    ctx.font = '14px ui-monospace, monospace';
    ctx.fillText(`phrases mirrored: ${this.boss.successes}   ·   good enoughs kept: ${this.player.pages}/6`, this.W / 2, 210);
    ctx.fillText(`composure remaining: ${this.player.composure}/${this.player.maxComposure}`, this.W / 2, 232);
    ctx.fillStyle = '#8a7fae';
    ctx.fillText('next: catastrophizing · impostorism · avoidance  (coming)', this.W / 2, 300);
    ctx.fillStyle = '#ffd27a';
    ctx.fillText('press Esc to replay', this.W / 2, 350);
    ctx.textAlign = 'left';
  }
}
