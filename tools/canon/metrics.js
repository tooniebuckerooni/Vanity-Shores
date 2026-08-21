/* Canon — the measurements.
 *
 * Three analyses, none of which know what game they are looking at.
 */
const { stringsIn, proseWords } = require('./scan');

/* ---- 1. authoring load ---------------------------------------------------
   The question this answers: when does a character stop being writable by hand?
   Not at a word count — prose is cheap. It is the number of INDEPENDENT AXES
   the lines must vary on at once, because the matrix you write by hand is the
   product of the axes, not their sum. Adding one heat-conditioned reply to a
   character who already varies on build does not add a line, it doubles a
   column. So the score is multiplicative.

   An axis is what a line VARIES ON. Effects — pay, give, addHeat — are what the
   scene DOES, and they cost nothing to author. Keeping those out is the whole
   reason the number means anything. */
const DEFAULT_BANDS = [
  { over: 80, band: 'consider goal-driven',
    note: 'The matrix is a cross-product now. Writing it by hand means repeating yourself.' },
  { over: 30, band: 'watch',
    note: 'Still writable by hand, but the seams will start to show.' },
  { over: -1, band: 'comfortable',
    note: 'Well inside hand-authored territory.' }
];

function authoringLoad(cfg){
  const { src, owners, axes, bodyOf, ceiling = 110, bands = DEFAULT_BANDS } = cfg;
  const load = {};
  for(const who in owners){
    let body = '';
    for(const fn of owners[who].fns)    body += bodyOf(src, fn, 'fn');
    for(const cn of owners[who].consts) body += bodyOf(src, cn, 'const');
    const words     = proseWords(stringsIn(body));
    const branches  = (body.match(/\btext:/g) || []).length;
    const gatedOpts = (body.match(/\btag:/g) || []).length;
    const on        = axes.filter(a => a.re.test(body)).map(a => a.key);
    const score     = branches * Math.max(1, on.length);
    const hit       = bands.find(b => score > b.over);
    load[who] = { words, branches, gatedOpts, axes: on, score, ceiling,
                  band: hit.band, note: hit.note,
                  fns: owners[who].fns.length + owners[who].consts.length };
  }
  return load;
}

/* ---- 2. state ledger -----------------------------------------------------
   Every persistent flag, and the asymmetry that matters: read-but-never-written
   is a live bug — something branches on state nothing sets. Written-but-never-
   read is NOT a bug in a multi-level game; it is a promise a later level has
   not collected yet. Conflating the two is why this distinction is drawn here
   instead of in the report. */
function stateLedger(src, pattern){
  const re = new RegExp(pattern.source.replace('(NAME)', '([A-Za-z0-9_]+)'), 'g');
  const names = [...new Set([...src.matchAll(re)].map(m => m[1]))].sort();
  const prefix = pattern.source.split('(NAME)')[0];
  return names.map(name => {
    const all    = (src.match(new RegExp(prefix + name + '\\b', 'g')) || []).length;
    const writes = (src.match(new RegExp(prefix + name + '\\s*=[^=]', 'g')) || []).length;
    const reads  = all - writes;
    return { name, writes, reads,
             state: reads && !writes ? 'orphan-read'
                  : writes && !reads ? 'awaiting-payoff' : 'live' };
  });
}

/* ---- 3. gate audit -------------------------------------------------------
   The invariant: no stat gate may be the only route past a beat the player has
   to get past. An even split clears nothing, so a scene where EVERY choice is
   gated is a scene some legal builds cannot leave.

   Derived from the scenes themselves rather than from a table somebody keeps by
   hand — a choice carrying a gate tag is gated, and that is readable in the
   source. Scenes marked @critical are the ones this is allowed to fail on. */
function gateAudit(scenes){
  const rows = [];
  for(const name in scenes){
    const s = scenes[name];
    const choices = (s.body.match(/\btext:/g) || []).length;
    const gated   = (s.body.match(/\btag:/g)  || []).length;
    if(!choices) continue;
    rows.push({ name, owner: s.owner, critical: s.critical, choices, gated,
                open: choices - gated, sealed: gated >= choices });
  }
  return rows.sort((a, b) => (b.critical - a.critical) || (a.open - b.open));
}

/* ---- 4. configuration sweep ---------------------------------------------
   Walk every legal split of the player's points and ask the game's own economy
   what happens. The simulate() is supplied per game; what is general is the
   enumeration and the "does anything fail" question. */
function sweep(cfg){
  const { stats, points, min, gate, simulate, builds } = cfg;
  let total = 0, anyGate = 0;
  const per = {}; stats.forEach(s => per[s] = 0);
  const walk = (i, left, acc) => {
    if(i === stats.length - 1){
      if(left < min) return;
      const split = acc.concat(left);
      total++;
      let any = false;
      split.forEach((v, k) => { if(v >= gate){ per[stats[k]]++; any = true; } });
      if(any) anyGate++;
      return;
    }
    for(let v = min; v <= left - min * (stats.length - i - 1); v++)
      walk(i + 1, left - v, acc.concat(v));
  };
  walk(0, points, []);

  const named = {};
  for(const k in builds){
    const split = builds[k];
    const obj = {}; stats.forEach((s, i) => obj[s] = split[i]);
    named[k] = Object.assign({ split }, simulate(obj));
  }
  return { total, anyGate, per, builds: named };
}

module.exports = { authoringLoad, stateLedger, gateAudit, sweep, DEFAULT_BANDS };
