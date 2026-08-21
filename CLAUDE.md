# Vanity Shores

A browser adventure game in the Sierra / Leisure Suit Larry tradition. One
self-contained `index.html`, no build step, no dependencies, no asset files —
every sprite, backdrop, portrait and note is generated in code at runtime.

**Act 1, Level 1 ships and is playable end to end.** Levels 2–11 are not built.

## Read these before changing anything

1. **`docs/BUILD-STATE.md`** — architecture, the non-obvious invariants, and
   what to build next. This is the file that stops you re-deriving decisions.
2. **`docs/game-bible.html`** — every character, location, payout, gate, secret
   and flag, **generated from the shipping game** by `node tools/canon.js`.
   Never hand-edit it; regenerate after any change to a location, character,
   payout or gate.
3. **`docs/art-and-arc.html`** — authored, not generated: the commissioning
   briefs for the entry images, the Act 2 climax plan, and which love
   interests actually pay off. Read it before writing any Act 2 content.
4. **`docs/acts-3-7.html`** — authored: per-level beats for the rest of the
   game, the cross-level payoff table, and the Level 4 quarantine.
5. `docs/design-handoff.md` — the original design document. Internal.

## Canon does the checking, so you do not have to remember

`node tools/canon.js` reads the running game and writes the bible.
`node tools/canon.js --check` asserts the rules below and **exits non-zero**, and
the deploy runs it on every push. They are build gates now, not good intentions.

Two things this changes about how you write scenes:

- **Every scene declares its owner at the declaration**, as
  `function chipBeat(){  /* @owner chip */`. A scene that talks to the player
  without a tag is reported as *unclaimed* rather than skipped — a loud gap
  beats a silent miscount. Narration that belongs to no character is
  `@owner system`.
- **A beat the player must get past is tagged `@critical`.** Canon fails the
  build if every one of its choices ends up behind a stat gate.

`node tools/canon-test.js` is Canon's own suite. It runs the generator against
`tools/fixtures/toy.html` — a tiny game with three defects planted on purpose —
and requires that all three are found. A checker that has quietly stopped
checking also reports a clean bill of health, so the suite proves it still bites
before it certifies the real game.

## The rules that are easy to break

- **The bible is generated, the design docs are authored.** Keep them separate.
  Mixing them destroys the property that the bible cannot drift.
- **No stat gate may be the only route past a progress-critical beat.** An even
  100-point split clears nothing, so every required beat needs an ungated path.
  The balance table in the bible proves it; re-run it when payouts change.
- **Two properties must survive any economy change:** no route to the win line
  that skips Monte's table, and no state the player cannot climb out of.
- **Money is in cents.** `ECONOMY` and `GATES` are the single source of truth —
  nothing hard-codes a figure or a threshold.
- **Set flags when they are earned, not in a `then` callback.** A `then` fires
  on dismissal and can be lost to a room transition.
- **Adult content is staged off-screen, in a `cutaway`.** Funnier, cheaper, and
  it keeps the build shippable without an age gate.

## Verifying a change

There is no test framework. The suites are Playwright scripts that drive the
real game in a real browser, reading state via `page.evaluate` (`GS`, `ROOMS`,
`ECONOMY`, `dlgLayout` are all reachable as globals). They live in the session
scratchpad rather than the repo — recreate them if you touch the puzzle chain.

Two things to know when writing one: dialogue choices only become selectable on
the final view of the final page, and room transitions take roughly 600ms of
fade after the player finishes walking. **Wait on game state, never on the
clock** — every false failure this project has had came from a fixed delay.

## Shipping

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push and tags
the build. Run it from the Actions tab with a `milestone` input to name one.
It refuses to deploy if `index.html` does not parse.
