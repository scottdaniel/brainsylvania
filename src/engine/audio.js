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

// ---- Web Audio: one shared context for all looping layers ----------------

let ac = null;
const waiting = [];   // callbacks waiting for the context to be allowed to run

function context() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    ac.onstatechange = flush;
  }
  return ac;
}

function flush() {
  if (ac.state !== 'running') return;
  removeEventListener('keydown', unlock);
  removeEventListener('pointerdown', unlock);
  while (waiting.length) waiting.shift()();
}

function unlock() { ac.resume().then(flush).catch(() => {}); }

// Run fn once the context is allowed to play. Same autoplay story as
// loopTrack: if it can't start yet (a gamepad press isn't a user gesture),
// retry on the next real keydown/click.
function whenRunning(fn) {
  const c = context();
  if (c.state === 'running') { fn(); return; }
  waiting.push(fn);
  addEventListener('keydown', unlock);
  addEventListener('pointerdown', unlock);
  unlock();
}

// A gapless looping layer. <audio loop> restarts by seeking, which leaves an
// audible hiccup at the seam; a Web Audio buffer source loops sample-
// accurately, so a loop prepared with tools/loopify.py really is seamless.
//
// start({ fadeIn }) always begins from the top of the loop, so music enters on
// its downbeat; stop({ fadeOut }) fades and releases it. Two layers can
// crossfade by stopping one while starting the other. preload() fetches and
// decodes ahead of time so a later start() has no delay.
export function loopLayer(url, { volume = 0.3 } = {}) {
  let buffer = null;
  let loading = null;
  let current = null;   // the playing (or about-to-play) instance

  const preload = () => {
    const c = context();   // created synchronously, while we may still be inside a user gesture
    if (!loading) {
      loading = fetch(url)
        .then((r) => r.arrayBuffer())
        .then((data) => c.decodeAudioData(data))
        .then((b) => { buffer = b; })
        .catch(() => {});
    }
    return loading;
  };

  return {
    preload,
    start({ fadeIn = 0 } = {}) {
      if (current) return;
      const mine = current = {};   // claim the slot so repeat calls don't stack copies
      preload().then(() => whenRunning(() => {
        if (current !== mine || !buffer) return;   // stopped (or failed to load) while waiting
        const c = context();
        const source = c.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = c.createGain();
        const t = c.currentTime;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + fadeIn);
        source.connect(gain);
        gain.connect(c.destination);
        source.start();
        mine.source = source;
        mine.gain = gain;
      }));
    },
    stop({ fadeOut = 0 } = {}) {
      const leaving = current;
      current = null;
      if (!leaving || !leaving.source) return;
      const t = context().currentTime;
      const g = leaving.gain.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0, t + fadeOut);
      leaving.source.stop(t + fadeOut + 0.05);
    },
    setVolume(v) {
      volume = v;
      if (current && current.gain) current.gain.gain.setTargetAtTime(v, context().currentTime, 0.05);
    },
    get playing() { return !!(current && current.source); },
  };
}
