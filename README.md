# Brainsylvania

Human note: This idea for a game has probably been pinging around in my brain ever
since I struggled with mental illness as a kid. Never got around to making it ...
because, well, mental illness. Thanks to Claude doing the heavy lifting of implementation, 
this is finally a reality. So, most of the code is Claude. All of the inspiration
is me. I've also hand-drawn (badly) some of the characters in the game. Sounds and some
UI-elements are human-created and are sourced from GameDevMarket.net via a Humble
Bundle. See [CREDITS.md](CREDITS.md) for more details.

A Castlevania-style side-scroller where every level is a different *-ism*. You don't
kill your inner demons — turns out they don't stay dead. You learn their moves until
they recognize themselves in you, and then they walk with you instead.

**Level 1 — Perfectionism.** The boss is *The Editor*. You cannot damage it — it's
you. The fight is **call and response**: The Editor performs a short phrase of moves
(`▲` jump, `▼` duck, `◀ ▶` step), shown beat by beat in a row at the top of the
screen. Then it's your turn — play the same phrase back on the beat with your own
keys. Your character physically does each move as you hit it, so you *see* yourself
mirroring the phrase. Matching phrases fills RECOGNITION; phrases get longer and
faster as it rises. At full RECOGNITION The Editor recognises itself in you and
stands down. Missing a beat costs nothing but the phrase — it just tries another.

## Run it

No build step — it's plain ES modules. Serve the folder and open it:

```bash
python3 devserver.py 5678
```

Then visit http://localhost:5678 . (In Claude Code, the `brainsylvania` launch
config does this for you.) It's `http.server` with `Cache-Control: no-store` on
every response — plain `python3 -m http.server` will happily serve you a stale
cached module after an edit, even past a hard-reload or in a brand-new tab.

## Controls

| keyboard | controller (Xbox-style) | action |
| --- | --- | --- |
| ← → / A D | left stick / D-pad | move |
| ↑ / Z / Space | A / D-pad up / stick up | jump (variable height, coyote time) |
| ↓ | Y / D-pad down / stick down | duck |
| E / J | B / X / LB / RB | mirror an imp (out in the level) |
| Enter | Start | advance dialogue |
| Esc / R | Back | restart level |

In The Editor fight, `↑ ↓ ← →` (or the stick/D-pad/A/Y above) double as the four
beats you play back.

**Controller:** any Xbox-layout gamepad works out of the box via the browser's
Gamepad API — tested with an 8BitDo Ultimate 2 in X-input mode. It merges into the
same input as keyboard, so nothing else has to know which one you're using. Press
any button once with the controller on for the browser to notice it (a Gamepad-API
quirk, not ours) — a toast confirms the connection.

## Design notes

- **Composure, not health.** Five pips. Empty it and you *spiral* — a short line, then
  back to the last lamp. No lives, no game over.
- **Keep moving.** Platforms crumble if you stand on them (analysis paralysis). Red-pen
  imps only bite when you stop.
- **"Good enough" pages** are optional collectibles. Getting all of them is its own joke.
- **The boss can't be lost.** A botched phrase just isn't scored — no fail state, no
  timer, no damage. The point is the exchange, not the challenge.
- The befriended *-ism* still hovers near you afterward, muttering — gentler now.

## Layout

```
src/
  engine/   loop, input, camera, math, sprite (image drawing), audio (sound pools)
  game/     game state machine, player, level, boss (editor), imp, dialogue, hud, sfx
  content/  perfectionism.js — level geometry + all the writing, together
  assets/   player.png, editor.png (hand-drawn sprites) + sfx/ (sound) + ui/ (dialogue box)
assets/
  candidates/  surveyed third-party art/audio, not wired into the game yet
```

## Sound

Jump, imp hits, mirror hits/phrases, dialogue blips, and a looping castle drone —
all in `src/assets/sfx/`, played through `src/engine/audio.js`. Third-party,
licensed for commercial use — see [CREDITS.md](CREDITS.md).

## Next

See [TODO.md](TODO.md).

## Credits

See [CREDITS.md](CREDITS.md).
