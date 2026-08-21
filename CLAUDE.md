# Vanity Shores

A browser adventure game in the Sierra / Leisure Suit Larry tradition. One
self-contained `index.html`, no build step, no dependencies, no asset files —
every sprite, backdrop, portrait and note is generated in code at runtime.

**Act 1, Level 1 ships and is playable end to end.** Levels 2–11 are not built.

## Read these before changing anything

1. **`docs/BUILD-STATE.md`** — architecture, the non-obvious invariants, and
   what to build next. This is the file that stops you re-deriving decisions.
2. **`docs/game-bible.html`** — every character, location, payout, gate, secret
   and flag, **generated from the shipping game** by `node tools/bible.js`.
   Never hand-edit it; regenerate after any change to a location, character,
   payout or gate.
3. `docs/design-handoff.md` — the original design document. Internal.

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
