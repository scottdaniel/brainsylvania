// Fixed-timestep game loop with a render interpolation-free draw.
// step(dt) is called at a fixed 60 Hz; draw() as often as the browser paints.

export function runLoop({ step, draw }) {
  const HZ = 1 / 60;
  let acc = 0;
  let last = performance.now();

  function frame(now) {
    let delta = (now - last) / 1000;
    last = now;
    if (delta > 0.25) delta = 0.25; // avoid spiral-of-death after a tab stall
    acc += delta;
    while (acc >= HZ) {
      step(HZ);
      acc -= HZ;
    }
    draw();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
