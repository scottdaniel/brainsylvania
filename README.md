# Brainsylvania

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
python3 -m http.server 5678
```

Then visit http://localhost:5678 . (In Claude Code, the `brainsylvania` launch
config does this for you.)

## Controls

| key | action |
| --- | --- |
| ← → / A D | move |
| ↑ / Z / Space | jump (variable height, coyote time) |
| ↓ | duck |
| E | mirror an imp (out in the level) |
| Enter | advance dialogue |
| Esc / R | restart level |

In The Editor fight, `↑ ↓ ← →` double as the four beats you play back.

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
  engine/   loop, input, camera, math
  game/     game state machine, player, level, boss (editor), imp, dialogue, hud
  content/  perfectionism.js — level geometry + all the writing, together
```

## Next

Level 2+: catastrophizing (*The Oracle of Worst-Case*), impostorism (*The Committee*),
avoidance (*The Fog*). Each is a new boss and a new verb for the mirror.
