# GAME DESIGN HANDOFF DOCUMENT
### Working title: TBD (see §11) — Internal dev codename: "Money, Power, Pussy" (NEVER shown to players)
### Prepared for: one-shot build/write pass by Fable or Opus
### City: Vanity Shores

---

## 1. LOGLINE

A broke, naive newcomer washes up in **Vanity Shores** — a fictional sun-bleached beach-casino resort city where tans, bikinis, and pouty-lip glamour are the state religion — with nothing but their wits and a starting philosophy: *first you get the money, then you get the power, then you get everything else.* Styled as a modern love letter to Sierra's **Leisure Suit Larry**, rendered in 16-bit pixel-art adventure-game presentation with **Outrun**-style vector/synthwave interludes, an adaptive synth score, and a cast of rivals, mentors, and conquests who remember how you built yourself.

---

## 2. TONE & RATING GUARDRAILS

- **Baseline tone:** 50/50 hybrid, escalating raunch. Acts 1–2 (Money, Power) play as **crime-caper satire** — mocking greed, machismo, and excess. Act 3 leans hardest into classic **LSL-style romantic/sexual comedy** as the tonal payoff, once the earlier acts have built the stakes.
- **Content line:** Innuendo-heavy, cartoon-crude, never explicit. Sex and romance are punchlines and puzzle-engines, not graphic content. Comedy also mocks vanity, status, and self-importance throughout — Vanity Shores itself is a satirical target.
- **Failure states:** Mostly soft (setbacks, worse endings) — but include a **few iconic hard-death gags** as a wink to classic Sierra "you idiot, you're dead" tradition. These are comedic instant-retry moments, not narrative tragedy.
- **No literal tragic-downfall ending.** Endings range from triumphant to pathetic/humiliating, but the game never kills the protagonist as a "true" ending. Keep the tone playable-again, not bleak.

---

## 3. PROTAGONIST & CHARACTER CREATION

**Opening sequence philosophy:** Oregon Trail-simple, high-memorability, "limitless potential" framing. Zero friction, maximum flavor.

1. **Name** the protagonist (free text).
2. **Look**: choose/mix-and-match from a pool of **5–15 visual traits** (hairstyles, outfits, accessories, era-appropriate 80s/90s fashion pieces) — modular pixel-art sprite parts.
3. **Build**: allocate **100 points across three stats** —
   - **Money** (starting capital / financial hustle)
   - **Fighting Skill** (physical confrontation / intimidation)
   - **Charm** (seduction / social manipulation / talk-your-way-out)
   - This split is **locked for the entire playthrough**. NPCs — rivals, mentors, love interests, marks — **adapt their dialogue and confrontation options** based on this build. A high-Fighting build sees different options/outcomes in the same scene than a high-Charm build.

This build is the single most important replayability lever in the game — different splits should meaningfully open/close paths, especially at rival confrontations and seduction attempts.

---

## 4. WORLD: VANITY SHORES

Sun-drenched resort strip. Casino towers over a boardwalk. Palm trees, spray tans, pageant gloss, bikinis, and pouty lips as the city's whole aesthetic religion — glamorous surface over a rotten, grasping underbelly. Everyone in Vanity Shores is on the make; vanity and ambition are treated as civic virtues.

Confirmed/likely locations to populate across the 12 levels (final assignment left to level design pass): the boardwalk strip, a dive bar (Old Mentor's turf), the main casino floor, a yacht, a penthouse, back-alley hustle spots, the beach itself, a nightclub, a mansion (Legacy Heir's family estate), a media/press backdrop (for the Fame branch of the blend meter), and a finale venue for the Act 3 climax.

---

## 5. KEY BASKETS

### 5.1 Characters basket

| Role | Name (suggested — free to rename) | Function |
|---|---|---|
| Protagonist | Player-named | Fish-out-of-water newcomer; stat build drives all outcomes |
| Demo antagonist / Young mentor (post-flip) | **Chip Winthrop** ("The Legacy Heir") | Entitled scion of Vanity Shores' founding casino family. Mocks/blocks protagonist through Levels 1–3 as the demo's main antagonist. Flips to ally/mentor at Level 4 once past the paywall. |
| Old Mentor | **Marv "Pops" Delgado** | Wise dive-bar bartender/fixer. Knows everyone and everything. Appears from Level 4 onward. |
| Rival — "The Scarface" | **Duke Calvera** | Unpredictable, volatile, over-the-top crime figure. Magnetic and dangerous — classic "you never know which way he'll snap" energy. Appears post-paywall, main muscle-of-the-underworld threat. |
| Rival — "The Bait-and-Switch" | **Roxy Steele** | Introduced purely as a romance/mistress option — plays as just another conquest — then turns, using the access/intimacy she gained against the protagonist. |
| Rival — Wildcard | *TBD / emergent* | Intentionally left undefined. Design as a character whose personal agenda escalates into open rivalry organically over the course of Act 2–3, rather than being pre-scripted from the start. Trigger conditions should be defined during implementation. Flagged as the natural seed for a future AI-goal-driven NPC (see §11). |
| Love interests | 5–8 pursuable NPCs, mixed gender (male/non-binary/female) | Met across **all levels** starting Act 1, but only the **low-tier** ones are successfully seducible through Act 2. Full/high-tier conquests are gated to Act 3. Only **1–2** have a genuine "net positive" ending; the rest resolve neutral or as outright comedic failures. |
| Comic relief | Rotating "oddball" cast per location | Mix of hand-authored standouts + a template/archetype system (e.g. the sunburnt tourist, the has-been lounge act, the boardwalk psychic, the timeshare shark) + latitude for the one-shot build to improvise within tone guardrails. |

### 5.2 Locations basket
Boardwalk strip · dive bar · casino floor · yacht · penthouse · back-alley hustle spots · beach · nightclub · Winthrop family mansion · press/media backdrop · Act 3 finale venue. (12 levels need location assignment during build.)

### 5.3 Plot beats / events basket
See §6 for the full level-by-level map. Key beat types to reuse across levels: small-time hustle/con, stat-gated confrontation (resolved by Money/Fighting/Charm), rival sabotage event, blend-meter-shifting choice, seduction attempt (success/fail branching), mentor check-in, "welcome to the big leagues" escalation beat, act-climax showdown.

### 5.4 Systems / mechanics basket
- **Stat build** (Money/Fighting/Charm, 100-point split, locked at start, gates dialogue/options everywhere)
- **Blend meter** (Underworld ↔ Legit spectrum, shifts via Act 2+ choices — not exclusive discrete paths — determines which rivals engage and which endings are reachable)
- **Seduction gating** (met anytime; low-tier winnable from Act 2; high-tier only in Act 3)
- **Paywall**: one-time unlock purchase, gates Level 4 onward (shareware model — Levels 1–3 free)
- **Fail states**: mostly soft (setback/worse-ending), plus a handful of iconic hard-death comedic gags
- **Adaptive score**: music shifts with stat-lean and blend-meter position, not just per-scene
- **Level/act display**: player-facing label format is `Act [N], Level [N] — [Level Title]`, where the level title winks at the underlying "money/power/conquest" theme without ever stating it crudely. Internal act codenames (Money/Power/Pussy) are never shown to players.

### 5.5 Endings basket
Multiple endings, generated from **blend-meter position × romance outcome**. Design guidance:
- Most endings are **neutral** — deliberately replay-enticing rather than definitive.
- **1–2 endings** are clear, satisfying "winner" outcomes.
- **At least 1 ending** should explicitly foreshadow a sequel / "Part 2."
- No literal tragic-death "true ending" — worst outcomes are humiliation/failure, played for comedy.

---

## 6. LEVEL-BY-LEVEL STRUCTURE (~12 levels)

**Prologue — "Arrival":** Character creation (name, look, 100pt stat split). Ends with the protagonist stepping off the bus/boat into Vanity Shores broke and unknown.

### ACT 1 — MONEY (Levels 1–3, FREE DEMO)
- **L1:** Land broke in Vanity Shores. Meet the rotating cast of local oddballs. First small hustle. Chip Winthrop mocks the newcomer as beneath notice.
- **L2:** String of small-time cons/jobs to build a stake. Chip Winthrop actively competes/sabotages.
- **L3:** Public hustle-off/contest vs. Chip Winthrop, resolved by the player's stat build. Winning draws the attention of the city's real power players → **"welcome to the big leagues" escalation beat** (not a defeat of the rival — an invitation upward) → **PAYWALL**.

### ACT 2 — POWER (Levels 4–8, PAID)
- **L4:** Meet Marv "Pops" Delgado. Chip Winthrop flips to ally. Blend meter (Underworld ↔ Legit) unlocks.
- **L5–L7:** Player builds power via blend-meter choices — muscle into rackets, launder into legit business, or buy fame/influence (or blend all three). Crosses paths with Duke Calvera and Roxy Steele. Low-tier love interests become winnable starting here.
- **L8:** Power-act climax — direct clash with Duke Calvera.

### ACT 3 — CONQUEST (Levels 9–11, PAID)
- **L9–L10:** Full love-interest roster opens for high-tier conquest. Roxy Steele's true colors are revealed (if not already). Wildcard rival may surface here, organically, based on player behavior.
- **L11:** Final climax — all threads (Money/Power/Conquest, remaining rivals, blend-meter position) converge and resolve.

**Denouement:** Ending slide selected from the endings matrix (§5.5).

---

## 7. VISUAL DIRECTION

- **Primary style, used from the very first frame:** flat 16-bit-era pixel art, in the lineage of Sierra/LucasArts point-and-click adventure games (King's Quest-adjacent presentation, SNES/Genesis-era character and background rendering).
- **Secondary/special-sequence style:** vector/gradient synthwave — bold flat shapes, sunset gradients, chrome/neon linework — reserved for **Outrun-style driving/chase set-pieces** mixed in for spectacle and pacing breaks. These should feel like a deliberate visual "mode switch," not the default.
- Character creation needs a modular sprite system: swappable hair/outfit/accessory layers matching the 5–15 trait pool.

---

## 8. AUDIO DIRECTION

- **Adaptive synthwave score** — not static per-scene, but responsive to the player's stat-lean (Money/Fighting/Charm) and blend-meter position (Underworld/Legit). Design as layered stems that crossfade rather than hard-cut tracks.
- Location-specific ambience (boardwalk, casino floor, dive bar, nightclub, yacht, mansion).
- A dedicated high-energy synthwave driving track for the vector-style chase sequences.
- SFX needs: slot machine/chips, cash register, fight impacts, seduction success/fail stingers, paywall-unlock fanfare, comedic hard-death stinger, UI clicks.

---

## 9. PRODUCT / MONETIZATION

- **Format:** playable browser game (HTML/JS), self-contained.
- **Demo scope:** Levels 1–3 (Act 1: Money) fully free and playable.
- **Paywall:** one-time unlock purchase gates Level 4 onward. Do not design around subscriptions or per-act IAP — single unlock only.

---

## 10. REQUIRED ASSETS LIST

### Art
- Modular pixel-art protagonist sprite (hair/outfit/accessory layers matching the 5–15 trait pool)
- Portrait/sprite sets for: Chip Winthrop, Marv "Pops" Delgado, Duke Calvera, Roxy Steele, Wildcard rival (placeholder), 5–8 love interests, 5–8 recurring oddball archetype templates (+ recolor/variant sets)
- Unique background art per location (boardwalk, dive bar, casino floor, yacht, penthouse, back-alley spots, beach, nightclub, Winthrop mansion, press backdrop, finale venue) — 11 location backdrops minimum
- UI: character-creation trait picker, 100pt stat-allocation control, dialogue box, HUD, blend-meter gauge, paywall unlock screen, level-title card overlay, ending-slide cards (one per ending variant), title screen with blinking "START" placeholder nameplate
- Vector/synthwave chase-sequence assets: gradient sunset horizon, palm silhouettes, chrome car sprite, obstacle sprites, transition effects between pixel-art and vector modes
- Iconography: Money/Fighting/Charm stat icons, Underworld/Legit blend-meter icons

### Audio
- Adaptive score stems (per stat-lean: Money/Fighting/Charm; per blend-meter position: Underworld/Legit) designed to crossfade/layer
- Location ambience tracks
- Vector chase-scene driving track
- SFX: slot machine, cash register/chips, fight impacts, seduction success/fail stingers, paywall unlock fanfare, hard-death comedic stinger, UI clicks

### Text/content
- Full hand-scripted dialogue trees for all named NPCs (no AI-goal system at MVP — see §11)
- 12 level titles in the format `Act N, Level N — [Title]` (winking, never crude)
- Ending-slide copy for every ending in the matrix
- Bios/flavor text for the love-interest roster and oddball archetype templates

---

## 11. OPEN ITEMS / NOTES FOR FABLE OR OPUS

- **Game title is intentionally TBD.** Build the title screen as a placeholder nameplate with a blinking, ominous "START" button. Title naming happens last, after the full build.
- **AI-driven NPC "Goals" system is explicitly OUT OF SCOPE for the MVP.** Ship with fully hand-scripted dialogue for every character, including all rivals. Only add live goal-driven AI behavior later, and only for specific characters where pre-scripted dialogue trees prove too complex to author by hand — the Wildcard rival is the most natural first candidate. Leave the dialogue/decision architecture modular enough to swap a scripted NPC for a goal-driven one later without a rewrite.
- **Asset generation dependency:** no current MCP connector for AI image generation (checked the registry — nothing suitable found, e.g. Higgsfield is not currently connected/available). Treat art asset production as a separate pipeline step; don't assume a generator is wired in for the one-shot pass.
- **Wildcard rival** is deliberately underspecified — build the hook/trigger conditions but leave room for it to emerge from player behavior rather than being front-loaded.
- **Rival/character names** in §5.1 are suggested, not locked — free to refine as long as the roles/arcs are preserved.
- **Sequel hook:** at least one ending must clearly gesture at a "Part 2" without resolving it, since the paid unlock model may support future episodic content.

---

## 12. BUILD INSTRUCTION SUMMARY (for the one-shot pass)

Build a single self-contained playable browser game (HTML/JS) implementing:
1. Title screen (placeholder nameplate + blinking START)
2. Character creation (name, mix/match visual traits, 100pt Money/Fighting/Charm allocation)
3. Levels 1–3 (Act 1: Money) fully playable as a free demo, ending on the Level 3 "welcome to the big leagues" cliffhanger
4. A paywall gate at Level 4
5. Levels 4–11 (Acts 2–3: Power, Conquest) behind the paywall, implementing the blend meter, rival arcs, and love-interest roster per §5–6
6. The endings matrix (§5.5) as the game's resolution layer
7. Pixel-art presentation by default, with at least one vector/synthwave chase sequence as a stylistic set-piece
8. Adaptive audio responding to stat-lean and blend-meter position
9. Mostly soft fail states, with a small number of comedic hard-death gags

Tone throughout: Sierra/LSL-style innuendo-heavy comedy escalating from crime-caper satire (Acts 1–2) into full romantic/sexual comedy payoff (Act 3), cartoon-crude but never explicit.
