#!/usr/bin/env python3
"""Make a recorded loop seamless and game-ready.

    python3 tools/loopify.py "Organ variation 1.wav" src/assets/sfx/organ-1.wav

1. Optionally drops --trim-tail seconds from the end first. Bouncing a loop
   region leaves a note-release tail there; crossfading a *fading* tail into
   the next attack leaves a hole in the level, so cut the release off and
   crossfade sustained audio instead.
2. Equal-power crossfades the last --crossfade seconds into the first
   --crossfade seconds. The output is that much shorter, and its last sample
   flows straight into its first, so a gapless looper (Web Audio, loop=true)
   has no click at the seam.
3. Peak-normalizes (default -3 dBFS) so playback volume constants mean
   something — raw bounces from a keyboard/GarageBand are often very quiet.

For rhythmic loops, don't crossfade (it shortens the loop, which shifts the
bar grid): use --edge-fade MS instead, which only ramps the first/last few
milliseconds to remove the click and keeps the exact length.

It then prints how deep and how long the level dips across the seam.

16-bit PCM WAV in, 16-bit PCM WAV out. Standard library only.
"""
import argparse
import array
import math
import sys
import wave


def read_wav(path):
    with wave.open(path, 'rb') as w:
        if w.getsampwidth() != 2:
            sys.exit('expected 16-bit PCM WAV')
        ch, rate, n = w.getnchannels(), w.getframerate(), w.getnframes()
        data = array.array('h')
        data.frombytes(w.readframes(n))
    if sys.byteorder == 'big':
        data.byteswap()
    return ch, rate, data


def write_wav(path, ch, rate, floats, gain):
    out = array.array('h', (max(-32768, min(32767, round(x * gain))) for x in floats))
    if sys.byteorder == 'big':
        out.byteswap()
    with wave.open(path, 'wb') as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(out.tobytes())


def crossfade_loop(data, ch, frames):
    n = len(data) // ch
    out = [float(x) for x in data[: (n - frames) * ch]]
    for i in range(frames):
        t = i / frames
        w_in, w_out = math.sin(t * math.pi / 2), math.cos(t * math.pi / 2)
        for c in range(ch):
            out[i * ch + c] = data[i * ch + c] * w_in + data[(n - frames + i) * ch + c] * w_out
    return out


def edge_fade(data, ch, frames):
    out = [float(x) for x in data]
    n = len(out) // ch
    for i in range(frames):
        g = math.sin(i / frames * math.pi / 2) ** 2     # 0 -> 1, raised cosine
        for c in range(ch):
            out[i * ch + c] *= g
            out[(n - 1 - i) * ch + c] *= g
    return out


def seam_report(out, ch, rate):
    """Loop the audio twice and measure the level around the seam: how far the
    quietest 25 ms dips below typical, and how long it stays under 10% of
    typical (so a rhythmic loop's lead-in silence shows up as milliseconds)."""
    n = len(out) // ch
    mono = [sum(out[i * ch:(i + 1) * ch]) / ch for i in range(n)]
    mono = mono + mono
    span = int(rate * 0.6)

    def rms(a, b):
        seg = mono[a:b]
        return math.sqrt(sum(x * x for x in seg) / len(seg))

    win = int(rate * 0.025)
    env = [rms(n + k * win, n + (k + 1) * win) for k in range(-24, 24)]
    typical = sorted(env)[len(env) // 2]
    dip_db = 20 * math.log10(max(min(env), typical * 1e-3) / typical)   # floor at -60 dB

    step = int(rate * 0.003)
    quiet = [rms(n + i, n + i + step) < typical * 0.1 for i in range(-span, span, step)]
    run = best = 0
    for q in quiet:
        run = run + 1 if q else 0
        best = max(best, run)
    return dip_db, best * 3


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('src')
    p.add_argument('dst')
    p.add_argument('--trim-tail', type=float, default=0.0, help='seconds to drop from the end first (default 0)')
    p.add_argument('--crossfade', type=float, default=0.3, help='seconds (default 0.3)')
    p.add_argument('--edge-fade', type=float, default=None, metavar='MS',
                   help='instead of crossfading, just fade the first/last MS milliseconds (keeps exact length)')
    p.add_argument('--peak', type=float, default=-3.0, help='normalize to this dBFS (default -3)')
    a = p.parse_args()

    ch, rate, data = read_wav(a.src)
    trim = round(a.trim_tail * rate)
    data = data[: (len(data) // ch - trim) * ch]
    if a.edge_fade is not None:
        out = edge_fade(data, ch, round(a.edge_fade / 1000 * rate))
        how = f'edge fade {a.edge_fade}ms'
    else:
        out = crossfade_loop(data, ch, round(a.crossfade * rate))
        how = f'crossfade {a.crossfade}s'
    peak = max(abs(x) for x in out)
    gain = (10 ** (a.peak / 20)) * 32767 / peak
    write_wav(a.dst, ch, rate, out, gain)

    print(f'{a.src} -> {a.dst}: {len(out) // ch / rate:.3f}s '
          f'(trimmed {a.trim_tail}s, {how}, gain {20 * math.log10(gain):+.1f} dB)')
    dip, gap_ms = seam_report(out, ch, rate)
    print(f'across the loop seam: deepest 25 ms dip {dip:+.1f} dB, quiet gap ~{gap_ms} ms '
          f'(below 10% of typical level; 0 dB / 0 ms = seamless)')


if __name__ == '__main__':
    main()
