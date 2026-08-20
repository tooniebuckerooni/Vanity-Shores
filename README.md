# Vanity Shores

A browser adventure game in the Sierra / Leisure Suit Larry tradition, set in a
sun-bleached beach-casino resort city where vanity is a civic virtue and everybody
is on the make.

**This repo currently contains the intro and Act 1, Level 1 — playable end to end.**

## Play it

Open `index.html` in any modern browser. That's the whole install. There is no
build step, no bundler, no `node_modules`, and no asset folder — the entire game
is one self-contained file.

## What's in the build

| Piece | State |
|---|---|
| Title screen (placeholder nameplate, blinking START) | done |
| Character creation — name, 6 look axes, 100-point stat split | done |
| Outrun-style vector arrival sequence | done |
| Act 1, Level 1 — "Small Change", four locations | done |
| Adaptive synth score + SFX | done |
| Three comedic hard-death gags | done |
| Save/resume (browser localStorage) | done |
| Levels 2–11, paywall, blend meter | not started |

## The one unusual thing about this build

There are no art or audio assets. Every sprite, backdrop, portrait, note and
sound effect is generated in code at runtime:

- **Characters** come from one procedural renderer (`drawPerson`) driven by a
  options object — skin, hair style and colour, outfit style and colour, build,
  height, accessory. The whole cast, including the player, is that one function
  with different knobs.
- **Backdrops** are painted with canvas primitives and a seeded RNG, then baked
  once to an offscreen canvas per location.
- **Text** uses real webfonts thresholded to 1-bit, so it stays crisp pixel type
  without hand-authored font tables.
- **Music** is a Web Audio scheduler running layered stems that crossfade against
  the player's stat lean.

This sidesteps the asset-pipeline dependency in the design doc (§11) entirely.
Nothing here is blocked on an image generator.

## Layout

```
index.html              the entire game
docs/design-handoff.md  the original design document (internal)
docs/BUILD-STATE.md     architecture notes + what to build next
```

## Controls

Click a verb (LOOK / TALK / USE / TAKE), then click the world. Click an inventory
item to pick it up for USE, then click a target. Keys `1`–`4` switch verbs, space
advances dialogue, `Esc` clears a held item, and `M` / `N` toggle music and sound
effects (also the two icons at the top right of the status bar).
