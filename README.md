# Brainsylvania

A Castlevania-style side-scroller where every level is a different *-ism*. You don't
kill your inner demons — turns out they don't stay dead. You learn their moves until
they recognize themselves in you, and then they walk with you instead.

**Level 1 — Perfectionism.** The boss is *The Editor*. You cannot damage it. Survive a
mark cleanly, then mirror it back. Three mirrored marks and it stands down.

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
| J | mirror — copy a mark you just survived |
| Enter | advance dialogue |
| R | restart level |

## Design notes

- **Composure, not health.** Five pips. Empty it and you *spiral* — a short line, then
  back to the last lamp. No lives, no game over.
- **Keep moving.** Platforms crumble if you stand on them (analysis paralysis). Red-pen
  imps only bite when you stop.
- **"Good enough" pages** are optional collectibles. Getting all of them is its own joke.
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
