# Build state & architecture

Written so a later session can pick this up cold. Everything lives in `index.html`.

## Why one file

The game is published as a Claude Artifact (a hosted, private web page), which
requires a single self-contained document — no external scripts, styles, images
or audio. That constraint also happens to make the thing trivially portable:
the same file runs from a local `file://`, a static host, or an itch.io upload.

## Section map

`index.html` is ordered and commented as numbered sections:

| § | Contents |
|---|---|
| 0 | Core — canvas, palette, `r()`/`px()` draw helpers, seeded RNG, offscreen targets |
| 1 | Art — `drawPerson`, `drawPortrait`, `hairShape` |
| 1b | Text — webfonts thresholded to 1-bit, wrapping, measurement, cache |
| 2 | Backdrops — sky, sun, skyline, ocean, palms, planks, railing, neon |
| 2b | Props — shelter, arch, convertible, booths, bandshell, tent, monte table |
| 2c | Rooms — `ROOMART`, each with a baked static layer and a live layer |
| 3 | Audio — adaptive stem scheduler + synthesized SFX |
| 4 | Engine — state, save, items, messages, movement |
| 4b | Interface — verb bar, dialogue layout, cursor |
| 4c | Room render + hotspot resolution |
| 4d | Action dispatch |
| 5 | Content — cast, deaths, rooms, scripted scenes |
| 5e | Front of house — title, character creation, vector interlude, cards |
| 6 | Input, loop, boot |

## The bits worth knowing before you edit

**Rendering target is swappable.** `g` is a `let`. `withTarget(ctx, fn)` retargets
every draw helper, which is how rooms bake to offscreen canvases. Don't turn `g`
back into a `const`.

**Art resolution and type resolution are deliberately different.** The world is
authored in a 320x200 logical space — that is the pixel art, and it should stay
that way. `SC` is how many real pixels each logical pixel gets on the main canvas
(2-4, chosen by `fitScreen`); the frame loop sets `setTransform(SC,0,0,SC,0,0)` so
every existing 320-space coordinate still works untouched. `TXSC` is the same
factor applied to *text*: `textCanvas` bakes glyphs at `fontSize * TXSC` and
`text()` draws them back down into logical space, so type carries SC times the
detail while rects and sprites stay chunky. `withTarget` forces `TXSC = 1` during
offscreen bakes, which is why painted signs inside the scenery stay lo-fi pixel art
and only the interface gets the sharp treatment. `textW` returns **logical** width.
If you change `SC`, clear `_tcache` — the baked glyphs are resolution-specific.

**Two characters are hand-drawn now.** `BESPOKE` maps `larue` and `chip`. Chip is
deliberately drawn harder than the generic painter allows: angular jaw polygon
rather than an ellipse, oversized eyes with a catchlight and a hard upper lash,
a flat-brim cap built as crown + separate brim, and a mesh shirt drawn as a
modulo grid with the chest left open. Two things to check on any new portrait —
the fringe must clear the brows at y≈17-20, and hair has to stay light enough to
separate from the dark backing plate.

**Portraits are where a character gets to look like somebody.** A 40px world
sprite has no room for a face, so the portraits carry the casting. They are
drawn into a 44x52 buffer at 1:1 using real curves — `ell()` and `ring()`, which
rectangles cannot fake — then every edge is hardened to full alpha and every
colour is snapped to a fixed palette by `quantize()`. Smooth tools,
limited-palette pixel-art output, cached per expression so the per-frame cost is
one blit. `BESPOKE` maps a `portrait:` key on a cast entry to a hand-drawn
painter (Madame LaRue is the first); everyone else falls through to
`paintGeneric`, which builds a face from the same look parameters the sprite
uses. Adding a hand-drawn portrait is one function plus a palette — no engine
change. Two things to watch when drawing one: the fringe ellipse must clear the
brows (they sit at y=17), and the hair has to stay light enough to separate from
the backing plate, which is dark.

**Bodies are built from curves and are height-parameterised.** Every proportion in
`charMetrics` is a fraction of `CHAR_H`, so **Level 2 ships at 72px by calling
`setCharHeight(72)`** — buffers resize and the sprite cache clears automatically.
Nothing else in the renderer needs touching; what needs touching is the four
backdrops, whose props and walk bands are composed for a 40px cast.

`drawPersonRaw` draws the torso as one path (shoulder to waist to hip), limbs as
tapered shapes via `limbShape`, and the head and hair from ellipses. The buffer's
alpha is then hardened to 1-bit — without that, curves read as smudges once
scaled 3x — and a dark keyline is stamped at four offsets. `spriteBuffer` caches
the finished composite per look and per animation frame (walk bucket, bob, blink,
sequin shimmer), so the per-frame cost is a blit: 60fps with the cache holding
~22 frames. The ground shadow is drawn *outside* the buffer on purpose so the
keyline doesn't trace it.

Outfits are painted **inside a clip of the torso path**, which is why they can
stay rect-based and still take the silhouette's shape. Add a new one to the
switch and it gets the body for free.

**The keyline sets a hard floor on silhouette detail.** It is 1px on each side,
so any gap narrower than ~3px closes up. At `CHAR_H = 40` an hourglass waist is
about 1.5px of gap, which means it *cannot* survive in the outline — measured, not
guessed. So the waist is painted instead: a dark wedge inside the torso clip that
reads as a cinch at any size. At 72 the geometry starts doing the work by itself
and the wedge just reinforces it. If you change arm placement, re-run
`silh.js` in the scratch harness, which measures the contiguous torso run at
shoulder, waist and hip.

`o.pose` ('crossed', 'hold', 'pocket', 'stiff') changes the arms. `o.figure`
('straight', 'curved', 'hourglass', 'broad') sets shoulder/waist/hip ratios;
combine with `build:-1` for the narrowest figure available — that is Madame LaRue. Outfits run masculine through feminine (blazer, tank,
hawaiian, polo, sequins, bikini, lingerie, slip, corset, halter); the last five
set `skirt` in `ccLook()` so the hip reads, and mark themselves bare-shouldered
in `paintGeneric` so the portrait agrees with the sprite.

**Rooms are two layers.** `ROOMART[id].bake()` draws everything static, once, into
an offscreen canvas cached in `_baked`. `ROOMART[id].live(t)` draws per frame —
animation and anything state-dependent (the FREE GIFT sign is in `live` precisely
because it can be taken). If you make a baked thing state-dependent, move it to
`live` or the cache will lie to you.

**Hotspots resolve by priority, then by area.** `hotspotAt` picks the highest
`pri`, breaking ties with the smallest rectangle. People get `pri:2`, loose objects
`pri:3`, scenery defaults to 0. Without this a bench wins over the man sitting on it.

**Exits are a hotspot shape, not a verb.** `{ exit:true, desc, go }`. LOOK shows
`desc` then travels on dismiss; any other verb travels immediately.

**Dialogue lays itself out once.** `dlgLayout(m)` is the single source of truth for
the box geometry and is used by both the renderer and the click hit test — never
recompute that geometry separately. It flows long pages onto extra views
(`m.sub`), wraps choice rows, and shrinks the body until the box fits between the
status bar and the verb bar. This is what keeps the layout intact when the
webfonts are slow, blocked, or substituted.

**Choices belong to the last view.** `chooseOption` refuses to fire until the
reader has reached the final view of the final page, matching what's drawn.

**Money is in cents.** `GS.cash` is an integer; `money()` formats it. `pay()` also
sets `flags.stake` the moment the purse crosses `ECONOMY.stakeLine`.

**The level is won against a person, not a number.** `stakeLine` is the *ticket*:
crossing it only earns the right to walk back up to Chip and make him hold a
hundred dollars. Under it he needles you in three escalating registers; over it,
talking to him is the showdown, which resolves five ways (four build/heat routes
plus one anyone can take) and records `flags.chipEnding` for later acts. Nothing
completes the level except that conversation — do not put an automatic finale
back on a room's `onEnter`, which is where it used to live and where it robbed
the player of the last move.

**A face can take the whole screen.** `closeup(look, pages, then)` reuses the
cutaway state but paints full-bleed: speed lines out of frame centre, the
portrait buffer at 2x, captions under it. `drawCutaway` branches on
`GS.cut.look` — set means close-up, absent means framed vignette. Use it when
the scene *is* somebody's expression.

**The grind path is capped by refusal, not by exhaustion.** Dickie's encore
halves each time (`encoreDecay`) and floors at `encoreFloor`, and he refuses to
sing at all once the purse holds the shell-game stake. Those two rules together
mean no build can reach the win line without sitting at Monte's table — verified
in the bible's balance table, where "before the table" doubles as the ceiling —
while the floor keeps a lost stake recoverable, so there is still no dead end. A
Monte loss resets the encore count, because hours pass and the pier gets a new
crowd. If you change any of this, re-check both properties: **no route to the
win line that skips Monte**, and **no state the player cannot climb out of**.

**The economy is a table, not prose.** Every figure the level can move lives in
`ECONOMY` — opening purse, win line, the shell-game stake, and a payout row per
income source with a column per route (`base` / `charm` / `money` / `fight`).
Scenes call `earn(key, route)`; nothing hard-codes a number any more. Likewise
every stat check is a named entry in `GATES`, read through `gated(name, stat)`,
so checks can be listed and tuned individually instead of hunted through
dialogue. Change a number in either table and the game, the docs and the balance
simulation all move together.

**Intrigue is tracked, never resolved.** `GS.heat[who]` is a 0-100 number seeded
in Act 1 for later acts to read — §5.4 gates low-tier conquests to Act 2 and the
rest to Act 3, so nothing here is winnable. `addHeat` writes it, `heatTier` turns
it into prose for the ending card, and `flirtBeat(who, beats, perBeat)` serves
optional repeat dialogue from a capped list so heat cannot be farmed by clicking
the same person forever. Fighting routes deliberately earn wariness instead of
heat — that is a real build difference, not an oversight.

**Payoffs happen off-screen, in a cutaway.** `cutaway(paint, pages, then)` takes
over the screen with a framed vignette and captions, then hands control back.
This is the grammar the genre actually runs on, and it is the answer to how
adult material gets staged here: the camera looks at the outside of the tent.
It is funnier than showing it, it costs four pixels of animation instead of a
sprite sheet, and it keeps the build shippable on storefronts that would
otherwise need an age gate. When you add crude content, add it as a cutaway
first and only reach for on-screen animation if the joke genuinely needs it.

**Secrets are for players who go back.** `SECRETS` registers them, `GS.secrets`
records them, and the curtain counts them. The rule that makes one worth finding:
it must use an object the puzzle has already finished with, in a place the puzzle
has already left, and it must be closed off to somebody. Brenda's requires
retrieving the FREE GIFT sign from the bandshell after the show and handing it
back — and a muscle build that intimidated her in the pitch can never open it,
which is the point. Heat is what gates it, so the intrigue track now has teeth.

**Set flags when they are earned, not in a `then` callback.** A `then` fires on
dismissal; if the message is replaced by a room transition first, the flag never
lands. `brendaWary` had this bug.

## Level 1 puzzle chain

```
Chip mocks you ──▶ flicks a quarter ──▶ TAKE quarter
                                            │
Brenda's pitch ──▶ aloe  (4 routes: charm / money / fighting / sit through it twice)
      │                │
      │                └──▶ give aloe to Gil ──▶ $20–30
      └──▶ TAKE the FREE GIFT sign
                   │
                   └──▶ plant at the bandshell ──▶ crowd ──▶ Dickie splits the jar ──▶ $25–45
                                                                    │
quarter ──▶ LaRue's reading ──▶ fortune card (the tell) ────────────┤
                                                                    ▼
                                              Monte's shell game — $50 to sit
                                              with the tell: $100 for anyone, or
                                              $120/$150/$175 by build
                                              without it: lose the $50 (soft fail,
                                              grind Dickie encores at $15–20)
                                                                    │
                                              purse ≥ $100 ──▶ Chip finale ──▶ level complete
```

Every stat build can finish. The build changes the route, the flavour, and the
size of the win — never whether you can win. The one soft fail (losing at Monte's)
has a grind path back, so the player is never stuck.

Stat gate is `GATE = 38`. With 100 points across three stats, that's reachable by
anyone who leans at all, and unreachable for a flat 33/33/33 spread — which is the
intended trade.

That trade has one hard rule attached: **no gate may be the only route past a
progress-critical beat.** An even split clears no gate anywhere, so every required
beat needs an ungated path or the level is unwinnable for that build. Monte's table
violated this at first — the win options were all gated — which left an even split
unable to beat the shells at all. The ungated "watch only his left hand" option
($100 flat, versus $120/$150/$175 by lean) fixes it. Verified income by build:

| build | before the table | encores needed | finishes |
|---|---|---|---|
| 34/33/33 | $63.40 | 1 | $113.40 |
| money 60 | $76.00 | 0 | $176.00 |
| fight 60 | $52.00 | 0 | $122.00 |
| charm 60 | $82.00 | 0 | $207.00 |

Re-run that arithmetic whenever a payout changes. Dickie's encore is uncapped on
purpose: it is the grind path that guarantees no dead end.

## Where the design doc is only partly served

- **Vector/synthwave mode** exists as the arrival interlude and the title/complete
  backdrops. A real driving *set-piece* with obstacles and failure belongs to a
  later level.
- **Adaptive score** responds to stat lean and scene. The blend-meter axis has no
  input yet because the blend meter unlocks at Level 4.

The music runs an eight-bar progression (Am F C G / Am F Dm E) under a four-section
cycle — statement, melody, breathe, push — that advances every time round the loop
and re-mixes the stems. Arp patterns rotate from a table, the lead plays an actual
eight-bar phrase rather than a stab, and bar 8 takes a drum fill. Music and sound
effects sit on separate gain nodes (`musicGain`, `sfxGain`), toggled from the two
icons at the top right of the status bar, the buttons under the cabinet, or the
`M` / `N` keys.
- **Love interests, blend meter, paywall, rivals Duke and Roxy** are Act 2+ and
  deliberately absent.

## Next session — suggested order

1. **Level 2, "Other People's Money"** — Chip switches from mocking to competing.
   Reuse boardwalk/pier/arrival, add one or two locations (the dive bar, back alley).
   The room/hotspot/dialogue shapes are all data; a new level is mostly content.
2. **Level 3** — the public hustle-off against Chip, resolved by build, ending on
   the "welcome to the big leagues" beat.
3. **Paywall gate** at Level 4 — the unlock screen only; don't wire a payment
   processor into the artifact build.
4. Then Act 2 systems: blend meter, Pops, Duke, Roxy.

Content scales fine, but `index.html` will not stay comfortable much past ~5000
lines. When Level 3 lands, split content out into a `LEVELS` array of modules and
concatenate at build time, keeping the single-file output.

## Canon, and the game bible

`node tools/canon.js` drives the real `index.html` in a headless browser, reads
the live game objects, scans the source for dialogue volume and flag traffic,
and writes `docs/game-bible.html`. It is the answer to "what is in this game
now" and it is generated, never hand-maintained — a written breakdown would
drift the first time a payout changed.

The generator itself is now general. `tools/canon/` contains nothing about this
game: it knows how to drive an artifact, scan JavaScript without being fooled by
braces inside dialogue, measure authoring load, keep a state ledger and sweep a
configuration space. Everything specific lives in one adapter,
`tools/vanity-shores.canon.js`. Pointing Canon at another config documents
another game — `tools/fixtures/toy.canon.js` does exactly that, for a two-stat
game that shares no identifier with this one.

**The map of scene → character used to live inside the tool as a hand-kept
table, which was the exact drift the tool exists to prevent.** It had already
gone wrong: `brendaSecret` was missing from it, so Brenda's authoring load had
been under-reported since the day that scene was written. Ownership is now
declared at the declaration — `function brendaSecret(){  /* @owner brenda */` —
and any scene that talks to the player without a tag is *reported as unclaimed*
rather than skipped.

### The invariants are checked, not just displayed

`node tools/canon.js --check` exits non-zero, and the deploy runs it on every
push. It fails the build on: a required beat (`@critical`) whose every choice is
gated; a build that cannot finish the level; a build that reaches the stake line
without sitting down at Monte; a purse ceiling that reopens the encore exploit;
and a flag that is read but never written. It distinguishes that last case from
a flag *written* but never read, which is not a bug in a multi-level game — it is
a promise a later level has not collected yet, and the bible lists those as the
spine Act 2 inherits.

`node tools/canon-test.js` is Canon's own suite: 16 checks, run against a fixture
with three defects planted on purpose. A checker that has silently stopped
checking also reports clean, so the suite proves it still bites before it
certifies the real game.

It carries an **authoring-load** read per character: `branches × axes`, where an
axis is something a line *varies on* (build, flags, heat, items, purse) and not
something a scene *does* (`give`, `addHeat`, `pay` cost nothing to author). The
measure is multiplicative because the matrix you write by hand is the product of
the axes, not their sum. Under 30 is comfortable, 30-80 is worth watching, over
80 is where a goal-driven NPC starts earning its keep. Everyone is currently
comfortable; Chip is highest at 30, right on the boundary.

Regenerate it whenever you add a location, a character, a payout or a gate. You
no longer have to remember to read the balance table afterwards — `--check` reads
it for you and fails if it stopped holding.

## Shipping

`.github/workflows/deploy.yml` publishes the repo to GitHub Pages on every push
and tags the result, so there is always a named build to hand a tester and
always a known-good commit to go back to. Run it from the Actions tab with a
`milestone` input to name a build (`level-1-testers`); leave it blank and it
tags `build-YYYYMMDD-HHMM`. It refuses to deploy if `index.html` does not parse.

One-time setup, in the repo: **Settings → Pages → Source: GitHub Actions.**

## Testing

There is no test framework, but the Playwright scripts used during the build drive
the real game through the real DOM — worth recreating if you touch the puzzle chain.
Drive it by clicking canvas coordinates and reading state via `page.evaluate`
(`GS`, `ROOMS`, `dlgLayout` are all reachable as globals in a classic script).
Two things to watch when writing those: dialogue choices only become selectable on
the final view, and room transitions take about 600ms of fade after the player
finishes walking.
