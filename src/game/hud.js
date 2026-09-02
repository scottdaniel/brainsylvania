// Composure pips, recognition meter, mirror prompt, transient toasts.

export class Hud {
  constructor() { this.toast = null; this.toastT = 0; }

  say(text, dur = 2.6) { this.toast = text; this.toastT = dur; }

  update(dt) { if (this.toastT > 0) this.toastT -= dt; }

  draw(ctx, W, H, player, boss, showMirror) {
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

    // recognition meter (boss)
    if (boss && boss.phase !== 'sleep') {
      const bw = W - 260, bx = 130, by = H - 30;
      ctx.fillStyle = '#2a2038';
      ctx.fillRect(bx, by, bw, 10);
      ctx.fillStyle = '#e0728a';
      ctx.fillRect(bx, by, bw * (boss.recognition / 100), 10);
      ctx.fillStyle = '#8a7fae';
      ctx.fillText('RECOGNITION', bx, by - 6);
    }

    if (showMirror) {
      const pulse = 0.6 + Math.sin(performance.now() / 90) * 0.4;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd27a';
      ctx.font = 'bold 20px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MIRROR  ▸  press J', W / 2, 70);
      ctx.restore();
      ctx.textAlign = 'left';
    }

    if (this.toastT > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.toastT);
      ctx.fillStyle = '#0b0712';
      ctx.fillRect(0, H / 2 - 26, W, 40);
      ctx.fillStyle = '#e9e4f5';
      ctx.font = '15px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.toast, W / 2, H / 2);
      ctx.restore();
      ctx.textAlign = 'left';
    }
  }
}
