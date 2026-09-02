import { Input } from '../engine/input.js';
import { clamp } from '../engine/math.js';

// The Editor — a call-and-response boss. You cannot damage it. It performs a
// short phrase of moves; you play the same phrase back on the beat. Matching
// its phrases fills RECOGNITION until it recognises itself in you and stops.
//
// Beat vocabulary maps straight onto the player's own verbs:
//   ▲ up = jump    ▼ down = duck    ◀ left = step left    ▶ right = step right

export const GLYPH = { up: '▲', down: '▼', left: '◀', right: '▶' };
const BEATS = ['up', 'down', 'left', 'right'];
const INPUT_FOR = { jump: 'up', duck: 'down', left: 'left', right: 'right' };

const WIN = 100;
const PERFECT_GAIN = 26;

export class Editor {
  constructor(arena, groundY) {
    this.arena = arena;
    this.groundY = groundY;
    this.x = (arena.x0 + arena.x1) / 2 - 27;
    this.y = 150;
    this.w = 54;
    this.h = 72;
    this.t = 0;
    this.bob = 0;

    this.phase = 'sleep';       // sleep · ready · call · answerReady · answer · resolve
    this.timer = 0;
    this.recognition = 0;
    this.done = false;

    this.phrase = [];
    this.phraseLen = 3;
    this.successes = 0;
    this.beatSec = 0.62;
    this.beatIdx = 0;           // during call: glyphs revealed. during answer: beat cursor.
    this.beatClock = 0;
    this.hits = [];             // per beat: 'hit' | 'miss' | null
    this.missedThisPhrase = false;
    this.pose = null;           // the Editor's current demonstrated move
    this.poseT = 0;
    this.lastResult = null;     // 'perfect' | 'partial' | 'whiff'
    this.flinch = 0;
  }

  get locksPlayer() {
    return this.phase !== 'sleep' && !this.done;
  }

  wake() {
    if (this.phase !== 'sleep') return;
    this._roll();
    this.phase = 'ready';
    this.timer = 1.1;
  }

  _roll() {
    const p = [];
    for (let i = 0; i < this.phraseLen; i++) {
      let b = BEATS[(Math.random() * 4) | 0];
      // avoid three identical beats in a row — keeps phrases readable
      if (i >= 2 && p[i - 1] === p[i - 2] && b === p[i - 1]) {
        b = BEATS[(BEATS.indexOf(b) + 1) % 4];
      }
      p.push(b);
    }
    this.phrase = p;
    this.hits = new Array(p.length).fill(null);
    this.beatIdx = 0;
    this.beatClock = 0;
    this.missedThisPhrase = false;
  }

  update(dt, player, onEvent) {
    this.t += dt;
    this.bob = Math.sin(this.t * 2) * 5;
    this.flinch = Math.max(0, this.flinch - dt * 3);
    if (this.pose) this.poseT += dt;
    if (this.phase === 'sleep' || this.done) return;

    // drift toward arena centre, a touch above head height
    const cx = (this.arena.x0 + this.arena.x1) / 2 - this.w / 2;
    this.x += (cx - this.x) * Math.min(1, dt * 2);
    this.y += (150 - this.y) * Math.min(1, dt * 2);

    this.timer -= dt;

    if (this.phase === 'ready') {
      if (this.timer <= 0) {
        this.phase = 'call';
        this.beatIdx = 0;
        this.beatClock = 0;
        this.pose = null;
        onEvent('call');
      }
      return;
    }

    if (this.phase === 'call') {
      this.beatClock += dt;
      if (this.beatClock >= this.beatSec) {
        this.beatClock -= this.beatSec;
        if (this.beatIdx < this.phrase.length) {
          this.pose = this.phrase[this.beatIdx];
          this.poseT = 0;
          this.beatIdx++;
          onEvent('callbeat', this.pose);
        } else {
          // one rest beat, then hand it over
          this.phase = 'answerReady';
          this.timer = 0.55;
          this.pose = null;
        }
      }
      return;
    }

    if (this.phase === 'answerReady') {
      if (this.timer <= 0) {
        this.phase = 'answer';
        this.beatIdx = 0;
        this.beatClock = 0;
        this.pose = null;
        onEvent('answer');
      }
      return;
    }

    if (this.phase === 'answer') {
      const expected = this.phrase[this.beatIdx];
      const got = this._readDir();
      if (got && this.hits[this.beatIdx] == null) {
        if (got === expected) {
          this.hits[this.beatIdx] = 'hit';
          player.doEcho(got);
          onEvent('good');
        } else {
          this.hits[this.beatIdx] = 'miss';
          this._miss(player, onEvent);
        }
      }

      this.beatClock += dt;
      if (this.beatClock >= this.beatSec) {
        this.beatClock -= this.beatSec;
        if (this.hits[this.beatIdx] == null) {
          this.hits[this.beatIdx] = 'miss';
          this._miss(player, onEvent);
        }
        this.beatIdx++;
        if (this.beatIdx >= this.phrase.length) {
          this._score(onEvent);
          this.phase = 'resolve';
          this.timer = 1.2;
        }
      }
      return;
    }

    if (this.phase === 'resolve') {
      if (this.timer <= 0) {
        if (this.recognition >= WIN) {
          this.done = true;
          this.pose = null;
        } else {
          this._next();
          this.phase = 'ready';
          this.timer = 1.0;
        }
      }
    }
  }

  _readDir() {
    for (const key of ['jump', 'duck', 'left', 'right']) {
      if (Input.pressed(key)) return INPUT_FOR[key];
    }
    return null;
  }

  _miss(player, onEvent) {
    // Gentle: a missed beat costs nothing but the beat itself — the phrase
    // just won't score, and the Editor tries another.
    if (!this.missedThisPhrase) this.missedThisPhrase = true;
    onEvent('bad');
  }

  _score(onEvent) {
    const hits = this.hits.filter((h) => h === 'hit').length;
    const n = this.phrase.length;
    if (hits === n) {
      this.recognition = Math.min(WIN, this.recognition + PERFECT_GAIN);
      this.successes++;
      this.lastResult = 'perfect';
      this.flinch = 1;
    } else if (hits >= 1) {
      this.recognition = Math.min(WIN, this.recognition + (hits >= n - 1 ? 12 : 6));
      this.lastResult = 'partial';
      this.flinch = 0.5;
    } else {
      this.lastResult = 'whiff';
    }
    onEvent('phrase', this.lastResult);
  }

  _next() {
    if (this.successes > 0 && this.successes % 2 === 0 && this.phraseLen < 5) this.phraseLen++;
    this.beatSec = Math.max(0.40, 0.62 - this.successes * 0.04);
    this._roll();
  }

  // ---- draw ----

  draw(ctx) {
    const y = this.y + this.bob;
    const sh = this.flinch ? (Math.random() - 0.5) * this.flinch * 10 : 0;
    ctx.save();
    ctx.translate(Math.round(this.x + sh), Math.round(y));

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

    // demonstrated move: a big glyph pulsing beside the Editor during 'call'
    if (this.pose && (this.phase === 'call')) {
      const a = clamp(1 - this.poseT * 1.6, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.35 + a * 0.65;
      ctx.fillStyle = '#ff5a75';
      ctx.font = 'bold 52px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(GLYPH[this.pose], this.x + this.w / 2, y - 16);
      ctx.restore();
      ctx.textAlign = 'left';
    }

    // tempo ring while a phrase is in play
    if (this.phase === 'call' || this.phase === 'answer') {
      const beatP = this.beatClock / this.beatSec;
      ctx.save();
      ctx.strokeStyle = this.phase === 'answer' ? 'rgba(143,214,196,0.7)' : 'rgba(255,90,117,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2, y + this.h / 2, 46 - beatP * 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
