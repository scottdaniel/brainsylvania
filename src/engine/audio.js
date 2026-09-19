// Minimal sound playback: small HTMLAudioElement pools for overlapping
// one-shots, plus a looping track that respects the browser's autoplay
// policy (a gamepad button press doesn't count as a "user gesture" the way
// a keydown does, so a loop that fails to start retries on the next real
// keydown/click instead of just staying silent).

function pool(url, size = 3) {
  const els = Array.from({ length: size }, () => {
    const a = new Audio(url);
    a.preload = 'auto';
    return a;
  });
  let next = 0;
  return {
    play(volume = 1) {
      const el = els[next];
      next = (next + 1) % els.length;
      el.currentTime = 0;
      el.volume = volume;
      el.play().catch(() => {});
    },
  };
}

export function sfx(url, size) {
  return pool(url, size);
}

export function loopTrack(url, volume = 0.35) {
  const el = new Audio(url);
  el.loop = true;
  el.volume = volume;
  let retrying = false;

  const attempt = () => {
    el.play().then(() => {
      if (retrying) {
        retrying = false;
        removeEventListener('keydown', attempt);
        removeEventListener('pointerdown', attempt);
      }
    }).catch(() => {
      if (!retrying) {
        retrying = true;
        addEventListener('keydown', attempt);
        addEventListener('pointerdown', attempt);
      }
    });
  };

  return {
    start: attempt,
    stop: () => el.pause(),
    setVolume: (v) => { el.volume = v; },
  };
}
