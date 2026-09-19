# Asset candidates — not wired in yet

Curated picks from Scott's Humble Bundle asset library
(`/Users/scott/game_creation_assets_HB/`), pulled out of a one-time survey so they
survive past `/tmp` getting cleared. **Nothing here is used by the game yet** —
this is a shortlist to choose from, not a finished art pass. See
`src/assets/` for what's actually wired in (currently just the hand-drawn
player/editor sprites).

## What's here

- `tilesets/` — castle/dungeon backgrounds. `DMA-C.png`/`DMA-D.png` (gothic
  windows, armor, turrets) and the `*Masoleum*`/`Ground_Stone*`/`*Gate*` graveyard
  parallax set are the closest palette matches to the game's existing
  `#241a30`/`#05040a` scheme.
- `characters/` — monster/boss portrait candidates (`demon_*`, `dark_knight_01`,
  `bone_beast`, `crystal_golem_01`, `ancient_vampire`, `banshee`) and an animated
  orc attack sheet (`Attack01/02.png`) kept mainly as an animation-timing
  reference. Note: painted/shaded style, doesn't match the hand-drawn line-art
  player/editor sprites — best used for tone/background, not a direct swap.
- `ui/grunge-style01/` and `ui/fantasy-style05/` — two dialogue-box skins to
  consider in place of the hand-drawn Canvas dialogue box. `page_left/right.png`
  are parchment pages for a journal/menu screen.
- `sound/` — the actual gap-filler (game currently has zero audio). Rough mapping:
  `Bite_01` / `Big_Hit` / `Attack_With_Blood_01` → hit feedback candidates (no
  pack anywhere had a literal "jump" sound — genuine gap);
  `Dark_Hit_01/02` / `Dark_Resurrection` → mirror/recognition chime candidates;
  `Notification_01/03`, `Click_Fantasy_RPG_01`, `Click_Elegant_01` → UI/dialogue
  blips; `Dark_Fantasy_01/02_Loop`, `Ambience_Dungeon_01_Loop`, `Ominous_Loop`,
  `Opressive_Eerie_Loop` → ambient castle drone; `Magician_Attack_Shout_01/03`,
  `Magician_Cough_01` → The Editor's voice; `Imp_Attack_01/02`, `Imp_Hurt_01/02` →
  literal imp sounds (exact name match in the source pack).
- `licenses/` — the actual license/terms documents found for the two sources
  below, kept alongside the assets they cover.

## Licensing — check before shipping

Only two sources here have an explicit commercial-use grant:

- **Khron Studio / Jorge Guillén** (`Dark_Hit_*`, `Dark_Resurrection`) — plain
  royalty-free commercial grant, no attribution required.
- **Ricardo Machado / "Beowulf"** (itch.io / gamedevmarket.net) — formal license
  agreement, commercial use permitted, **requires crediting the artist**.

**Resolved 2026-09-19 — commercial use confirmed for nearly everything in the
pile.** The bundle was Humble's ["The Complete RPG Creator Bundle — 2D, GUI &
Audio Assets"](https://www.humblebundle.com/software/complete-rpg-creator-bundle-2d-gui-audio-assets-software)
(live Aug 15–Sep 19, 2026; confirmed via the Wayback Machine since the live page
is gone now that the sale ended). All 79 items — which is essentially everything
in `/Users/scott/game_creation_assets_HB/` — list **Publisher: GameDev Market**,
and each item's page explicitly links its governing license to
**gamedevmarket.net/terms-conditions#pro-licence** ("Licence (A)"). That's the
same license already read in full: perpetual, non-exclusive, unlimited projects,
works in monetized products, assets "may be distributed, sold and supplied... for
any fee." Only real restrictions: no logo/trademark/service-mark use, and don't
redistribute/sell the raw asset by itself outside the shipped game (end users of
the game can't extract it either). **This covers a Steam release.**

Exceptions — a few packs in the folder are NOT part of this bundle / not
GameDevMarket, so the Khron Studio and Beowulf terms noted above still apply to
those specifically (Beowulf's own itch.io-style agreement, which additionally
**requires artist credit**, is stricter than GDM's, so keep crediting Ricardo
Machado where his packs are used even though GDM's blanket permission also
covers him as a GDM seller).

## If you want more than what's here

The full survey (~35 packs, 1.1GB, everything considered and why) extracted to
`/tmp/hb_survey/` — that's OS temp space and may already be gone. The original
zips are still at `/Users/scott/game_creation_assets_HB/`.
