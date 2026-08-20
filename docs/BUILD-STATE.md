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

**Sprites are composited, not drawn straight to screen.** `drawPerson` renders into
a scratch buffer, derives a dark keyline from the buffer's alpha (`source-in` fill,
stamped at four offsets), then draws the sprite over it. That outline is what stops
a figure reading as a stack of boxes against a busy backdrop, and it is why
`drawPersonRaw` can use `clearRect` to notch shoulders and jaw — cleared pixels
change the silhouette the keyline follows. The ground shadow is drawn *outside* the
buffer on purpose, so the outline doesn't trace it. `o.pose` ('crossed', 'hold',
'pocket', 'stiff') changes the arms and is most of what distinguishes one
character from another at this size.

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
sets `flags.stake` the moment the purse crosses $100, which is the Level 1 win
line however the player got there.

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

## Testing

There is no test framework, but the Playwright scripts used during the build drive
the real game through the real DOM — worth recreating if you touch the puzzle chain.
Drive it by clicking canvas coordinates and reading state via `page.evaluate`
(`GS`, `ROOMS`, `dlgLayout` are all reachable as globals in a classic script).
Two things to watch when writing those: dialogue choices only become selectable on
the final view, and room transitions take about 600ms of fade after the player
finishes walking.
