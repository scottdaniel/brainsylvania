import { GLYPH } from './editor.js';

// Composure pips, recognition meter, the call-and-response phrase row, toasts.

export class Hud {
  constructor() { this.toast = null; this.toastT = 0; }

  say(text, dur = 2.6) { this.toast = text; this.toastT = dur; }

  update(dt) { if (this.toastT > 0) this.toastT -= dt; }

  draw(ctx, W, H, player, boss) {
    // composure
    for (let i = 0; i < player.maxComposure; i++) {
      const on = i < player.composure;
      ctx.fillStyle = on ? '#8fd6c4' : '#2f2a3d';
      ctx.beginPath();
      ctx.arc(28 + i * 20, 26, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5a5273';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('COMPOSURE', 18, 46);

    if (player.pages > 0) {
      ctx.fillStyle = '#c9be8f';
      ctx.textAlign = 'right';
      ctx.fillText(`good enoughs  ${player.pages}/6`, W - 18, 26);
      ctx.textAlign = 'left';
    }

    if (boss && boss.phase !== 'sleep') this._boss(ctx, W, H, boss);

    if (this.toastT > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.toastT);
      ctx.fillStyle = '#0b0712';
      ctx.fillRect(0, H / 2 - 22, W, 36);
      ctx.fillStyle = '#e9e4f5';
      ctx.font = '14px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.toast, W / 2, H / 2 + 1);
      ctx.restore();
      ctx.textAlign = 'left';
    }
  }

  _boss(ctx, W, H, boss) {
    // recognition meter
    const bw = W - 260, bx = 130, by = H - 30;
    ctx.fillStyle = '#2a2038';
    ctx.fillRect(bx, by, bw, 10);
    ctx.fillStyle = '#e0728a';
    ctx.fillRect(bx, by, bw * (boss.recognition / 100), 10);
    ctx.fillStyle = '#8a7fae';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('RECOGNITION', bx, by - 6);

    // phase banner
    const banner = { call: 'WATCH THE PHRASE', answer: 'PLAY IT BACK', answerReady: 'YOUR TURN…', ready: '', resolve: '' }[boss.phase];
    if (banner) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = boss.phase === 'answer' ? '#8fd6c4' : '#ffd27a';
      ctx.font = 'bold 15px ui-monospace, monospace';
      ctx.fillText(banner, W / 2, 40);
      ctx.restore();
      ctx.textAlign = 'left';
    }

    // the phrase row
    if (!boss.phrase || boss.phrase.length === 0) return;
    const n = boss.phrase.length;
    const cell = 46;
    const totalW = n * cell;
    const x0 = W / 2 - totalW / 2;
    const y = 58;

    for (let i = 0; i < n; i++) {
      const cx = x0 + i * cell + cell / 2;
      const revealed = boss.phase === 'call' ? i < boss.beatIdx : true;
      const hit = boss.hits && boss.hits[i];
      const cursor = boss.phase === 'answer' && i === boss.beatIdx;

      // cell
      ctx.fillStyle = cursor ? 'rgba(143,214,196,0.22)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(cx - 19, y - 2, 38, 40);
      if (cursor) {
        ctx.strokeStyle = '#8fd6c4';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 19, y - 2, 38, 40);
      }

      // glyph
      let col = '#6a5f88';
      if (revealed) col = '#ff5a75';
      if (hit === 'hit') col = '#8fd6c4';
      if (hit === 'miss') col = '#7a4a58';
      ctx.fillStyle = col;
      ctx.font = 'bold 26px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(revealed ? GLYPH[boss.phrase[i]] : '·', cx, y + 26);
      if (hit === 'miss') {
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, y + 30);
        ctx.lineTo(cx + 12, y + 6);
        ctx.stroke();
      }
      ctx.textAlign = 'left';
    }

    // input legend during the answer
    if (boss.phase === 'answer' || boss.phase === 'answerReady') {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6a5f88';
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillText('▲ jump/A    ▼ duck/Y    ◀ ▶ step/D-pad', W / 2, y + 58);
      ctx.restore();
      ctx.textAlign = 'left';
    }
  }
}
