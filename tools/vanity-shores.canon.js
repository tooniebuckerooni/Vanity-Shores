/* Vanity Shores — the Canon adapter.
 *
 * Everything in this file is specific to THIS game. The framework in
 * tools/canon/ knows none of it. Point Canon at a different config and it
 * documents a different game; see tools/fixtures/toy.canon.js, which exists to
 * prove that claim rather than assert it.
 *
 *   node tools/canon.js            ->  docs/game-bible.html
 *   node tools/canon.js --check    ->  invariants only
 */
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

/* Presentation order. Taste, so it lives in the adapter. */
const CAST_ORDER = ['chip','brenda','gil','dickie','zsazsa','monte'];

module.exports = {
  artifact: path.join(ROOT, 'index.html'),
  out:      path.join(ROOT, 'docs', 'game-bible.html'),

  /* index.html is what the browser loads; these are what the scanner reads.
     ADD A NEW LEVEL'S FILE HERE when you add one, or its dialogue is invisible
     to every measurement in the bible. */
  sources: ['core','cast','text','scenery','audio','engine','passcode','level1','level2','shell']
             .map(n => path.join(ROOT, 'js', n + '.js')),

  /* Settle on the game saying it is up, never on a clock. */
  ready: 'typeof ROOMS === "object" && typeof GS === "object" && GS.scene',

  /* What makes a function a scene here: it talks to the player. Anything
     matching this without an @owner tag gets reported as unclaimed. */
  sceneMarker: /\bsay\(|\bsayAs\(|\bcutaway\(|\bcloseup\(/,

  /* Persistent state lives on GS.flags. */
  statePattern: { source: 'GS\\.flags\\.(NAME)' },

  /* What a line can VARY ON. Effects are deliberately absent — see metrics.js. */
  axes: [
    { key:'build', re:/gated\(|S\(\)\.[a-z]+\s*>=|leanName\(/ },
    { key:'flags', re:/GS\.flags\.[A-Za-z0-9_]+(?!\s*=[^=])/ },
    { key:'heat',  re:/heatOf\(/ },
    { key:'items', re:/\bhas\(/ },
    { key:'purse', re:/GS\.cash\s*[<>=]/ }
  ],
  loadCeiling: 80,
  /* Owners that are narration, not cast: they talk to the player but belong to
     no character. Declared in the source as @owner system, so this is a label
     for the report rather than a list the tool has to be told about. */
  systemOwners: ['system'],

  /* ---- the player configuration space -------------------------------- */
  space: {
    stats: ['money','fight','charm'],
    points: 100, min: 5, gate: 38,
    builds: { 'Even 34/33/33':[34,33,33], 'Money 60':[60,20,20],
              'Fighting 60':[20,60,20], 'Charm 60':[20,20,60],
              'Money 45 / Charm 45':[45,10,45], 'Minimum lean 38':[38,31,31] },
    /* The one genuinely per-level piece: walking this level's economy for a
       given build, using the game's own numbers. */
    simulate: (D) => (b) => {
      const G = D.GATE, E = D.economy;
      const best = (key) => {
        let v = E.earn[key].base;
        if(b.charm >= G) v = Math.max(v, E.earn[key].charm);
        if(b.money >= G) v = Math.max(v, E.earn[key].money);
        if(b.fight >= G) v = Math.max(v, E.earn[key].fight);
        return v;
      };
      let cash = b.money * E.startPerMoneyPoint;
      cash += best('brendaGift') + best('gilAloe') + best('dickieSplit');
      /* Dickie's take halves each time and he refuses once you hold the stake,
         so this loop is also the ceiling on a purse that never sits down. */
      let encores = 0;
      while(cash < E.monteStake && encores < 200){
        cash += Math.max(E.encoreFloor,
                Math.round(best('dickieEncore') * Math.pow(E.encoreDecay, encores) / 25) * 25);
        encores++;
      }
      const before = cash;
      cash -= E.monteStake;
      cash += best('monteWin');
      return { before, encores, final: cash,
               passes: cash >= E.stakeLine, mustPlay: before < E.stakeLine };
    }
  },

  /* ---- read out of the running game ---------------------------------- */
  extract: () => {
    const verbKeys = ['look','talk','use','take','useItem'];
    const rooms = {};
    for(const id in ROOMS){
      const rm = ROOMS[id];
      rooms[id] = {
        walk: rm.walk, spawn: rm.spawn, hasDanger: !!rm.danger,
        npcs: rm.npcs.map(nc => ({ id:nc.id, x:nc.x, y:nc.y, conditional: !!nc.hidden })),
        hotspots: rm.hotspots.map(h => ({
          id:h.id, name:h.name, pri:h.pri||0, rect:[h.x,h.y,h.w,h.h],
          approach: h.approach||null, exit: !!h.exit, conditional: !!h.hidden,
          verbs: verbKeys.filter(k => typeof h[k] === 'function' || typeof h[k] === 'string')
        }))
      };
    }
    const cast = {};
    for(const k in CAST) cast[k] = {
      name:CAST[k].name, pose:CAST[k].pose||'default', skin:CAST[k].skin,
      hair:CAST[k].hair, acc:CAST[k].acc||'none',
      role:CAST[k].role||'', where:CAST[k].where||'' };
    const items = {};
    for(const k in ITEMS) items[k] = { name:ITEMS[k].name, desc:ITEMS[k].desc };
    const deaths = {};
    for(const k in DEATHS) deaths[k] = { head:DEATHS[k].head, body:DEATHS[k].body, sting:DEATHS[k].sting };
    return { rooms, cast, items, deaths, economy:ECONOMY, gates:GATES, GATE,
             secrets:SECRETS, secretHeat:BRENDA_SECRET_HEAT, heatTiers:HEAT_TIERS,
             traits:{ hair:TRAITS.hair.length, hairC:TRAITS.hairC.length,
                      outfit:TRAITS.outfit.length, shirtC:TRAITS.shirtC.length,
                      skin:TRAITS.skin.length, acc:TRAITS.acc.length },
             beats:{ chip:CHIP_BEATS, brenda:BRENDA_BEATS } };
  },

  /* ---- the two properties that must survive any economy change -------- */
  invariants: [
    (ctx) => {
      const skips = Object.entries(ctx.space.builds)
        .filter(([, b]) => !b.mustPlay).map(([k]) => k);
      return skips.length && { title: 'A build reaches the stake line without playing Monte.',
        detail: skips.join(', ') + ' — the shell game is what buys the confrontation, so no route may skip it.' };
    },
    (ctx) => {
      const stuck = Object.entries(ctx.space.builds)
        .filter(([, b]) => !b.passes).map(([k]) => k);
      return stuck.length && { title: 'A build cannot finish the level.',
        detail: stuck.join(', ') + ' — every legal split must be able to climb out, including after losing the stake.' };
    },
    (ctx) => {
      const E = ctx.data.economy;
      const ceiling = Math.max(...Object.values(ctx.space.builds).map(b => b.before));
      return ceiling >= E.stakeLine && { title: 'The encore exploit is open again.',
        detail: 'A build can carry ' + (ceiling/100).toFixed(2) + ' without sitting down, at or over the '
                + (E.stakeLine/100).toFixed(2) + ' stake line.' };
    }
  ],

  render: require('./vanity-shores.render.js')
};
