/* Vanity Shores — game bible generator.
 *
 * Reads the SHIPPING GAME rather than a parallel document: runtime data comes
 * from the live objects (ROOMS, CAST, ITEMS, ECONOMY, GATES, DEATHS), and
 * authoring volume comes from scanning the source. Nothing here is maintained
 * by hand, so the breakdown cannot drift from what actually ships.
 *
 *   node tools/bible.js        ->  docs/game-bible.html
 */
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) {
  console.error('This generator drives the real game in a browser, so it needs Playwright:');
  console.error('  npm install --no-save playwright');
  console.error('(the game itself has no dependencies — this is a tooling-only requirement)');
  process.exit(1);
}
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'index.html');
const OUT  = path.join(ROOT, 'docs', 'game-bible.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* ---- which scripted scenes belong to whom ---- */
const OWNS = {
  chip:   { fns:['chipIntro','chipBeat','chipFinale','chipCrack'], consts:['CHIP_BEATS'] },
  brenda: { fns:['brendaTalk','brendaOut','takeSign'],             consts:['BRENDA_BEATS'] },
  gil:    { fns:['gilTalk','gilPayoff','gilPay'],                  consts:[] },
  dickie: { fns:['dickieTalk','plantSign','dickiePay','dickieEncore'], consts:[] },
  zsazsa: { fns:['zsaTalk','zsaReading'],                          consts:[] },
  monte:  { fns:['monteTalk','monteLose','monteWin'],              consts:[] }
};
const ROLE = {
  chip:'Demo antagonist. Legacy heir; flips to ally at Level 4.',
  brenda:'Timeshare shark. Gatekeeper for the aloe and the sign.',
  gil:'Sunburnt tourist. Your first customer.',
  dickie:'Has-been lounge act. Repeatable income.',
  zsazsa:'Boardwalk psychic. Sells the tell that beats the table.',
  monte:'Shell game. The level’s boss fight.'
};
const WHERE = { chip:'Bus stop, then the boardwalk', brenda:'Timeshare booth, boardwalk',
  gil:'Bench, boardwalk', dickie:'Bandshell, pier', zsazsa:'Fortune tent, pier',
  monte:'Folding table, under the pier' };

/* ---- source scanning: brace-match while skipping string literals ---- */
function blockFrom(src, openIdx, open, close){
  let depth = 0, q = null, esc = false;
  for(let i = openIdx; i < src.length; i++){
    const c = src[i];
    if(esc){ esc = false; continue; }
    if(q){ if(c === '\\') esc = true; else if(c === q) q = null; continue; }
    if(c === '"' || c === "'" || c === '`'){ q = c; continue; }
    if(c === open) depth++;
    else if(c === close){ depth--; if(depth === 0) return src.slice(openIdx, i+1); }
  }
  return '';
}
function fnBody(src, name){
  const i = src.indexOf('function ' + name + '(');
  if(i < 0) return '';
  const j = src.indexOf('{', i);
  return j < 0 ? '' : blockFrom(src, j, '{', '}');
}
function constBody(src, name){
  const i = src.indexOf('const ' + name + ' =');
  if(i < 0) return '';
  const j = src.indexOf('[', i);
  return j < 0 ? '' : blockFrom(src, j, '[', ']');
}
function stringsIn(body){
  const out = [];
  let q = null, esc = false, cur = '';
  for(let i = 0; i < body.length; i++){
    const c = body[i];
    if(esc){ cur += c; esc = false; continue; }
    if(q){
      if(c === '\\'){ esc = true; continue; }
      if(c === q){ out.push(cur); cur = ''; q = null; continue; }
      cur += c; continue;
    }
    if(c === '"' || c === "'"){ q = c; cur = ''; }
  }
  return out;
}
/* Prose only: skip identifiers, colours, verb keys and other machinery. */
function proseWords(strings){
  let w = 0;
  for(const s of strings){
    if(s.length < 12) continue;
    if(/^#[0-9a-f]{3,8}$/i.test(s)) continue;
    if(!/\s/.test(s)) continue;
    w += s.trim().split(/\s+/).length;
  }
  return w;
}
/* An axis is something a line VARIES ON. Effects (give, addHeat, pay) are not
   axes — they are what the scene does, and they cost nothing to author. */
const AXES = [
  { key:'build', re:/gated\(|S\(\)\.[a-z]+\s*>=|leanName\(/ },
  { key:'flags', re:/GS\.flags\.[A-Za-z0-9_]+(?!\s*=[^=])/ },
  { key:'heat',  re:/heatOf\(/ },
  { key:'items', re:/\bhas\(/ },
  { key:'purse', re:/GS\.cash\s*[<>=]/ }
];

(async () => {
  const src = fs.readFileSync(GAME, 'utf8');

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + GAME);
  await page.waitForTimeout(900);

  const D = await page.evaluate(() => {
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
    for(const k in CAST) cast[k] = { name:CAST[k].name, pose:CAST[k].pose||'default',
                                     skin:CAST[k].skin, hair:CAST[k].hair, acc:CAST[k].acc||'none' };
    const items = {};
    for(const k in ITEMS) items[k] = { name:ITEMS[k].name, desc:ITEMS[k].desc };
    const deaths = {};
    for(const k in DEATHS) deaths[k] = { head:DEATHS[k].head, body:DEATHS[k].body, sting:DEATHS[k].sting };

    /* every build's full income, simulated against the real table */
    const G = GATE, E = ECONOMY;
    const sim = (m,f,c) => {
      const best = (key) => {
        let v = E.earn[key].base;
        if(c >= G) v = Math.max(v, E.earn[key].charm);
        if(m >= G) v = Math.max(v, E.earn[key].money);
        if(f >= G) v = Math.max(v, E.earn[key].fight);
        return v;
      };
      let cash = m * E.startPerMoneyPoint;
      cash += best('brendaGift') + best('gilAloe') + best('dickieSplit');
      /* Dickie's take halves each time and he refuses once you hold the stake,
         so this loop is also the ceiling on a purse that never sits at the table. */
      let encores = 0;
      while(cash < E.monteStake && encores < 200){
        cash += Math.max(E.encoreFloor,
                Math.round(best('dickieEncore') * Math.pow(E.encoreDecay, encores) / 25) * 25);
        encores++;
      }
      const before = cash;
      cash -= E.monteStake;
      cash += best('monteWin');
      return { before, encores, final: cash, passes: cash >= E.winLine,
               mustPlay: before < E.winLine };
    };
    const builds = { 'Even 34/33/33':[34,33,33], 'Money 60':[60,20,20],
                     'Fighting 60':[20,60,20], 'Charm 60':[20,20,60],
                     'Money 45 / Charm 45':[45,10,45], 'Minimum lean 38':[38,31,31] };
    const balance = {};
    for(const k in builds) balance[k] = Object.assign({ split: builds[k] },
                                                      sim.apply(null, builds[k]));

    /* how many legal 100-point splits clear a gate at all */
    let total = 0, anyGate = 0, per = { money:0, fight:0, charm:0 };
    for(let m = 5; m <= 90; m++) for(let f = 5; m + f <= 95; f++){
      const c = 100 - m - f; if(c < 5) continue;
      total++;
      if(m >= G || f >= G || c >= G) anyGate++;
      if(m >= G) per.money++; if(f >= G) per.fight++; if(c >= G) per.charm++;
    }
    return { rooms, cast, items, deaths, economy:ECONOMY, gates:GATES, GATE,
             heatTiers:HEAT_TIERS, balance,
             coverage:{ total, anyGate, per },
             traits:{ hair:TRAITS.hair.length, hairC:TRAITS.hairC.length,
                      outfit:TRAITS.outfit.length, shirtC:TRAITS.shirtC.length,
                      skin:TRAITS.skin.length, acc:TRAITS.acc.length },
             beats:{ chip:CHIP_BEATS, brenda:BRENDA_BEATS } };
  });
  await browser.close();
  if(errors.length){ console.error('Game threw while loading:\n' + errors.join('\n')); process.exit(1); }

  /* ---- authoring load per character ---- */
  const load = {};
  for(const who in OWNS){
    let body = '';
    for(const fn of OWNS[who].fns) body += fnBody(src, fn);
    for(const cn of OWNS[who].consts) body += constBody(src, cn);
    const strings = stringsIn(body);
    const words = proseWords(strings);
    const branches = (body.match(/\btext:/g) || []).length;
    const gatedOpts = (body.match(/\btag:/g) || []).length;
    const axes = AXES.filter(a => a.re.test(body)).map(a => a.key);
    /* Authoring load is multiplicative: the matrix you write by hand is the
       product of the axes, not their sum. */
    const score = branches * Math.max(1, axes.length);
    let band, note;
    if(score > 80){ band = 'consider goal-driven';
      note = 'The matrix is a cross-product now. Writing it by hand means repeating yourself.'; }
    else if(score > 30){ band = 'watch';
      note = 'Still writable by hand, but the seams will start to show.'; }
    else { band = 'comfortable'; note = 'Well inside hand-authored territory.'; }
    load[who] = { words, branches, gatedOpts, axes, score, band, note,
                  fns: OWNS[who].fns.length + OWNS[who].consts.length };
  }

  /* ---- flags: who writes, who reads ---- */
  const flagNames = [...new Set((src.match(/GS\.flags\.([A-Za-z0-9_]+)/g) || [])
    .map(m => m.split('.')[2]))].sort();
  const flags = flagNames.map(f => {
    const writes = (src.match(new RegExp('GS\\.flags\\.' + f + '\\s*=', 'g')) || []).length;
    const all    = (src.match(new RegExp('GS\\.flags\\.' + f + '\\b', 'g')) || []).length;
    return { name:f, writes, reads: all - writes };
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, render(D, load, flags));
  console.log('wrote ' + path.relative(ROOT, OUT));
  console.log('  ' + Object.keys(D.cast).length + ' cast entries, ' +
              Object.keys(D.rooms).length + ' locations, ' +
              Object.keys(D.items).length + ' items, ' + flags.length + ' flags');
  for(const who in load)
    console.log('  ' + who.padEnd(7) + load[who].words.toString().padStart(5) + ' words  ' +
                load[who].branches.toString().padStart(2) + ' branches  axes[' +
                load[who].axes.join(',') + ']  ' + load[who].band);
})();

/* ------------------------------------------------------------------ render */
const esc = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const cash = c => (c < 0 ? '-' : '') + '$' + Math.abs(c/100).toFixed(2);
const pct  = (a,b) => (a/b*100).toFixed(1) + '%';

function render(D, load, flags){
  const C = D.cast, L = D.rooms;
  const castOrder = ['chip','brenda','gil','dickie','zsazsa','monte'];

  const nav = [['glance','At a glance'],['cast','Characters'],['places','Locations'],
               ['items','Items'],['economy','Economy'],['gates','Gates & odds'],
               ['intrigue','Intrigue'],['deaths','Deaths'],['flags','Flags'],
               ['chain','Progression'],['ai','When to reach for AI']];

  const bandClass = b => b === 'comfortable' ? 'ok' : b === 'watch' ? 'warn' : 'crit';
  const bandPct   = l => Math.min(100, Math.round((l.score / 110) * 100) + 6);

  const castCards = castOrder.map(who => {
    const c = C[who], l = load[who];
    const pays = Object.entries(D.economy.earn)
      .filter(([k]) => k.toLowerCase().startsWith(who.slice(0,4)))
      .map(([k,v]) => `<tr><th>${esc(k)}</th><td>${cash(v.base)}</td><td>${cash(v.charm)}</td>
         <td>${cash(v.money)}</td><td>${cash(v.fight)}</td></tr>`).join('');
    const beats = (D.beats[who]||[]).map((pages,i) =>
      `<li><span class="n">${i+1}</span><div class="say"><p>${
        pages.map(p=>esc(p)).join('</p><p>')}</p></div></li>`).join('');
    return `
    <article class="card" id="cast-${who}">
      <header>
        <h3>${esc(c.name)}</h3>
        <span class="pill ${bandClass(l.band)}">${esc(l.band)}</span>
      </header>
      <p class="role">${esc(ROLE[who])}</p>
      <dl class="facts">
        <div><dt>Found</dt><dd>${esc(WHERE[who])}</dd></div>
        <div><dt>Stance</dt><dd>${esc(c.pose)}</dd></div>
        <div><dt>Dialogue</dt><dd>${l.words} words across ${l.fns} scenes</dd></div>
        <div><dt>Branches</dt><dd>${l.branches} choices, ${l.gatedOpts} behind a stat gate</dd></div>
        <div><dt>Load</dt><dd>${l.score} <span class="mute">(${l.branches} &times; ${Math.max(1,l.axes.length)} axes)</span></dd></div>
      </dl>
      <div class="meter" title="authoring load ${l.score} of ~110">
        <span style="width:${bandPct(l)}%" class="${bandClass(l.band)}"></span>
      </div>
      <p class="axes">Varies on: ${l.axes.length ? l.axes.map(a=>`<code>${a}</code>`).join(' ') : '<em>nothing yet</em>'}
        &middot; <span class="mute">${esc(l.note)}</span></p>
      ${pays ? `<details><summary>What they pay</summary>
        <div class="scroll"><table class="pay"><thead><tr><th>flow</th><th>base</th>
        <th>charm</th><th>money</th><th>fighting</th></tr></thead><tbody>${pays}</tbody></table></div>
        </details>` : ''}
      ${beats ? `<details><summary>Optional beats (${(D.beats[who]||[]).length})</summary>
        <ol class="beats">${beats}</ol></details>` : ''}
    </article>`;
  }).join('');

  const placeCards = Object.entries(L).map(([id, rm]) => {
    const hs = rm.hotspots.map(h => `<tr>
        <th>${esc(h.name)}</th>
        <td>${h.exit ? '<span class="tag exit">exit</span>' :
             h.verbs.map(v=>`<span class="tag">${v}</span>`).join(' ') || '&mdash;'}</td>
        <td class="num">${h.rect.join(', ')}</td>
        <td>${h.conditional ? 'conditional' : ''}${h.pri ? (h.conditional?' &middot; ':'') + 'pri ' + h.pri : ''}</td>
      </tr>`).join('');
    return `
    <article class="card" id="place-${id}">
      <header><h3>${esc(id)}</h3>
        ${rm.hasDanger ? '<span class="pill crit">lethal ground</span>' : ''}</header>
      <dl class="facts">
        <div><dt>Walkable</dt><dd>x ${rm.walk.x0}&ndash;${rm.walk.x1}, y ${rm.walk.y0}&ndash;${rm.walk.y1}</dd></div>
        <div><dt>Entry</dt><dd>${rm.spawn.join(', ')}</dd></div>
        <div><dt>Standing here</dt><dd>${rm.npcs.length ? rm.npcs.map(nc=>esc(nc.id)).join(', ') : 'nobody'}</dd></div>
        <div><dt>Hotspots</dt><dd>${rm.hotspots.length}</dd></div>
      </dl>
      <details><summary>Every hotspot</summary>
        <div class="scroll"><table><thead><tr><th>what</th><th>verbs</th>
        <th>rect</th><th></th></tr></thead><tbody>${hs}</tbody></table></div></details>
    </article>`;
  }).join('');

  const econRows = Object.entries(D.economy.earn).map(([k,v]) =>
    `<tr><th>${esc(k)}</th><td>${cash(v.base)}</td><td>${cash(v.charm)}</td>
     <td>${cash(v.money)}</td><td>${cash(v.fight)}</td></tr>`).join('');

  const balRows = Object.entries(D.balance).map(([k,b]) =>
    `<tr class="${b.passes?'':'bad'}"><th>${esc(k)}</th>
     <td class="num">${b.split.join(' / ')}</td>
     <td class="num">${cash(b.before)}</td>
     <td class="num">${b.encores}</td>
     <td class="num">${cash(b.final)}</td>
     <td>${b.passes ? '<span class="pill ok">clears</span>' : '<span class="pill crit">stuck</span>'}
         ${b.mustPlay ? '' : '<span class="pill crit">skips Monte</span>'}</td></tr>`).join('');

  const gateRows = Object.entries(D.gates).map(([k,g]) =>
    `<tr><th>${esc(k)}</th><td class="num">${g.need}</td><td>${esc(g.stat)}</td>
     <td>${esc(g.opens)}</td></tr>`).join('');

  const itemRows = Object.entries(D.items).map(([k,it]) =>
    `<tr><th>${esc(it.name)}</th><td><code>${esc(k)}</code></td><td>${esc(it.desc)}</td></tr>`).join('');

  const deathRows = Object.entries(D.deaths).map(([k,d]) =>
    `<tr><th>${esc(d.head)}</th><td><code>${esc(k)}</code></td>
     <td>${esc(d.body)} <span class="mute">${esc(d.sting)}</span></td></tr>`).join('');

  const flagRows = flags.map(f =>
    `<tr><th><code>${esc(f.name)}</code></th><td class="num">${f.writes}</td>
     <td class="num">${f.reads}</td></tr>`).join('');

  const tierRows = D.heatTiers.slice().reverse().map(([n,label]) =>
    `<tr><th class="num">${n}+</th><td>${esc(label)}</td></tr>`).join('');

  const cov = D.coverage;
  const traitCombos = Object.values(D.traits).reduce((a,b)=>a*b,1);
  const totalWords = castOrder.reduce((a,w)=>a+load[w].words,0);
  const totalHotspots = Object.values(L).reduce((a,r)=>a+r.hotspots.length,0);

  return `<title>Vanity Shores Bible</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Silkscreen:wght@400;700&family=VT323&display=swap">
<style>
:root{
  --void:#10071c; --panel:#1a0d2c; --panel2:#221237; --edge:#33204a;
  --bone:#f0e4d4; --mute:#a08cb4; --dim:#6f5a8c;
  --hot:#ff2e88; --surf:#21e0d6; --gold:#ffc23d; --bad:#ff5f6d; --good:#4de0a0;
  --ui:"Silkscreen",ui-monospace,monospace;
  --body:"Archivo",system-ui,sans-serif;
  --game:"VT323",ui-monospace,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  background:var(--void); color:var(--bone); font-family:var(--body);
  font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased;
}
.wrap{display:grid; grid-template-columns:210px minmax(0,1fr); gap:44px;
  max-width:1120px; margin:0 auto; padding:40px 24px 96px}
@media (max-width:820px){ .wrap{grid-template-columns:1fr; gap:24px} nav.side{position:static !important} }

nav.side{position:sticky; top:40px; align-self:start}
nav.side .brand{font-family:var(--ui); font-size:11px; letter-spacing:.16em;
  color:var(--hot); text-transform:uppercase; line-height:1.7; margin-bottom:18px}
nav.side .brand b{display:block; color:var(--bone); font-weight:400}
nav.side ol{list-style:none; counter-reset:s; border-left:1px solid var(--edge)}
nav.side a{display:block; padding:5px 0 5px 14px; margin-left:-1px;
  border-left:1px solid transparent; color:var(--mute); text-decoration:none; font-size:13.5px}
nav.side a:hover{color:var(--bone); border-left-color:var(--hot)}
nav.side a:focus-visible{outline:2px solid var(--surf); outline-offset:2px}

h1{font-family:var(--ui); font-size:25px; line-height:1.35; letter-spacing:.01em; color:var(--bone);
  text-wrap:balance; margin-bottom:8px}
.sub{color:var(--mute); max-width:64ch; margin-bottom:34px}
section{margin-bottom:52px; scroll-margin-top:24px}
h2{font-family:var(--ui); font-size:13px; letter-spacing:.16em; text-transform:uppercase;
  color:var(--surf); padding-bottom:8px; border-bottom:1px solid var(--edge); margin-bottom:18px}
h2 span{color:var(--dim); float:right; letter-spacing:.1em}
p.lede{color:var(--mute); max-width:66ch; margin-bottom:18px}

.grid{display:grid; gap:14px}
@media (min-width:700px){ .grid.two{grid-template-columns:1fr 1fr} }
.card{background:var(--panel); border:1px solid var(--edge); border-radius:3px; padding:16px 18px}
.card header{display:flex; align-items:center; gap:10px; margin-bottom:6px}
.card h3{font-family:var(--ui); font-size:14px; letter-spacing:.04em; color:var(--bone); flex:1}
.role{color:var(--mute); font-size:14px; margin-bottom:12px}

.pill{font-family:var(--ui); font-size:9px; letter-spacing:.1em; text-transform:uppercase;
  padding:3px 7px; border-radius:2px; white-space:nowrap}
.pill.ok{background:rgba(77,224,160,.14); color:var(--good)}
.pill.warn{background:rgba(255,194,61,.14); color:var(--gold)}
.pill.crit{background:rgba(255,95,109,.14); color:var(--bad)}

dl.facts{display:grid; gap:2px; margin-bottom:12px}
dl.facts div{display:flex; gap:10px; font-size:13.5px; padding:4px 0;
  border-bottom:1px solid rgba(51,32,74,.55)}
dt{font-family:var(--ui); font-size:9px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--dim); min-width:78px; padding-top:3px}
dd{color:var(--bone)}

.meter{height:4px; background:var(--panel2); border-radius:2px; overflow:hidden; margin-bottom:10px}
.meter span{display:block; height:100%}
.meter .ok{background:var(--good)} .meter .warn{background:var(--gold)} .meter .crit{background:var(--bad)}
.axes{font-size:13px; color:var(--mute)}
.mute{color:var(--dim)}
code{font-family:var(--ui); font-size:10px; letter-spacing:.04em; color:var(--surf);
  background:var(--panel2); padding:2px 5px; border-radius:2px}

details{margin-top:12px; border-top:1px solid var(--edge); padding-top:10px}
summary{font-family:var(--ui); font-size:10px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--hot); cursor:pointer; list-style:none}
summary::-webkit-details-marker{display:none}
summary::before{content:"+ "; color:var(--dim)}
details[open] summary::before{content:"– "}
summary:focus-visible{outline:2px solid var(--surf); outline-offset:3px}

.scroll{overflow-x:auto; margin-top:10px}
table{border-collapse:collapse; width:100%; font-size:13.5px}
th,td{text-align:left; padding:7px 12px 7px 0; border-bottom:1px solid rgba(51,32,74,.6);
  vertical-align:top}
thead th{font-family:var(--ui); font-size:9px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--dim); border-bottom-color:var(--edge)}
tbody th{font-weight:600; color:var(--bone); white-space:nowrap; padding-right:18px}
td.num,th.num{font-variant-numeric:tabular-nums; white-space:nowrap}
tr.bad th{color:var(--bad)}
table.pay td{font-variant-numeric:tabular-nums; color:var(--gold)}

.tag{font-family:var(--ui); font-size:9px; letter-spacing:.06em; padding:2px 5px;
  border:1px solid var(--edge); border-radius:2px; color:var(--mute)}
.tag.exit{border-color:var(--surf); color:var(--surf)}

ol.beats{list-style:none; margin-top:12px; display:grid; gap:12px}
ol.beats li{display:grid; grid-template-columns:20px minmax(0,1fr); gap:10px; align-items:start}
ol.beats .n{font-family:var(--ui); font-size:10px; color:var(--hot); padding-top:4px}
ol.beats .say{min-width:0}
ol.beats p{font-family:var(--game); font-size:17px; line-height:1.32; color:var(--bone);
  margin-bottom:6px}
ol.beats p:last-child{margin-bottom:0}

ul.plain{list-style:none; display:grid; gap:9px; max-width:68ch}
ul.plain li{padding-left:15px; position:relative; color:var(--mute); font-size:14.5px}
ul.plain li::before{content:""; position:absolute; left:0; top:.62em;
  width:5px; height:5px; background:var(--hot); border-radius:1px}
ul.plain b{color:var(--bone); font-weight:600}

.stats{display:grid; grid-template-columns:repeat(4,1fr); gap:1px;
  background:var(--edge); border:1px solid var(--edge); border-radius:3px; overflow:hidden;
  margin-bottom:20px}
.stat{background:var(--panel); padding:13px 14px}
.stat b{display:block; font-family:var(--ui); font-size:19px; color:var(--gold);
  font-variant-numeric:tabular-nums; font-weight:400; line-height:1.2}
.stat span{font-family:var(--ui); font-size:9px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--dim)}
.chain{font-family:var(--ui); font-size:11px; line-height:2; color:var(--mute);
  background:var(--panel); border:1px solid var(--edge); border-radius:3px;
  padding:16px 18px; overflow-x:auto; white-space:pre}
.chain b{color:var(--gold); font-weight:400}
.chain i{color:var(--surf); font-style:normal}
@media (max-width:620px){ .stats{grid-template-columns:repeat(2,1fr)} }
footer{border-top:1px solid var(--edge); padding-top:16px; color:var(--dim); font-size:13px}
</style>

<div class="wrap">
<nav class="side">
  <div class="brand">Vanity Shores<b>Act 1 · Level 1</b></div>
  <ol>${nav.map(([id,label]) => `<li><a href="#${id}">${label}</a></li>`).join('')}</ol>
</nav>

<main>
<h1>Small Change — the whole level, taken apart</h1>
<p class="sub">Generated from the shipping game, not written alongside it. Every number,
rectangle and word count below was read out of <code>index.html</code> at build time, so
this cannot drift from what actually plays. Regenerate with <code>node tools/bible.js</code>.</p>

<section id="glance">
  <h2>At a glance</h2>
  <div class="stats">
    <div class="stat"><b>${Object.keys(D.rooms).length}</b><span>locations</span></div>
    <div class="stat"><b>${castOrder.length}</b><span>speaking cast</span></div>
    <div class="stat"><b>${totalHotspots}</b><span>hotspots</span></div>
    <div class="stat"><b>${Object.keys(D.items).length}</b><span>items</span></div>
    <div class="stat"><b>${totalWords.toLocaleString()}</b><span>words spoken</span></div>
    <div class="stat"><b>${Object.keys(D.deaths).length}</b><span>ways to die</span></div>
    <div class="stat"><b>${cash(D.economy.winLine)}</b><span>win line</span></div>
    <div class="stat"><b>${traitCombos.toLocaleString()}</b><span>look combinations</span></div>
  </div>
  <ul class="plain">
    <li><b>The win condition is one number.</b> Cross ${cash(D.economy.winLine)} and walking onto
      the boardwalk fires the curtain. There is no other exit.</li>
    <li><b>Opening purse is Money × ${cash(D.economy.startPerMoneyPoint)}.</b> Everything else is
      taken off this boardwalk.</li>
    <li><b>One hard dependency:</b> the shell game cannot be beaten without the fortune card.
      Without it the stake is simply lost.</li>
  </ul>
</section>

<section id="cast">
  <h2>Characters <span>${castOrder.length}</span></h2>
  <p class="lede">Each card carries what the character gates, what they pay, and how much
  hand-written dialogue they are now carrying. The band is the authoring-load read — see
  <a href="#ai" style="color:var(--surf)">when to reach for AI</a>.</p>
  <div class="grid two">${castCards}</div>
</section>

<section id="places">
  <h2>Locations <span>${Object.keys(D.rooms).length}</span></h2>
  <p class="lede">Coordinates are the game's 320×200 logical space. Priority breaks ties when
  hotspots overlap — people outrank the scenery behind them.</p>
  <div class="grid two">${placeCards}</div>
</section>

<section id="items">
  <h2>Items <span>${Object.keys(D.items).length}</span></h2>
  <div class="scroll"><table><thead><tr><th>item</th><th>id</th><th>what it says when looked at</th>
  </tr></thead><tbody>${itemRows}</tbody></table></div>
</section>

<section id="economy">
  <h2>Economy</h2>
  <p class="lede">Every figure the level can move, in one table, driving the game directly.
  Columns are the route taken, not the player's lean — a charm build that picks the plain
  option is paid the plain rate.</p>
  <div class="scroll"><table class="pay"><thead><tr><th>flow</th><th>base</th><th>charm</th>
  <th>money</th><th>fighting</th></tr></thead><tbody>${econRows}
  <tr><th>monte stake</th><td colspan="4">${cash(-D.economy.monteStake)} to sit down</td></tr>
  </tbody></table></div>

  <h3 style="font-family:var(--ui);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin:26px 0 8px">Balance check — every build, best available route</h3>
  <div class="scroll"><table><thead><tr><th>build</th><th>M / F / C</th><th>before the table</th>
  <th>encores needed</th><th>finishes</th><th></th></tr></thead><tbody>${balRows}</tbody></table></div>
  <p class="lede" style="margin-top:12px"><b style="color:var(--bone)">"Before the table" is also the
  ceiling.</b> Dickie's take halves with every encore and he refuses to sing at all once you are
  holding the stake, so that column is the most any build can carry without sitting down at the
  shell game. Every figure in it is under ${cash(D.economy.winLine)}, which is what makes Monte
  mandatory rather than optional. The ${cash(D.economy.encoreFloor)} floor is what stops a lost
  stake becoming a dead end. Re-run this whenever a payout changes.</p>
</section>

<section id="gates">
  <h2>Gates &amp; odds</h2>
  <p class="lede">Every stat check in the level. <b style="color:var(--bone)">The rule:</b> no gate
  may be the only route past a required beat — an even split clears nothing, so every required
  beat needs an ungated path.</p>
  <div class="scroll"><table><thead><tr><th>gate</th><th>needs</th><th>stat</th><th>opens</th>
  </tr></thead><tbody>${gateRows}</tbody></table></div>
  <div class="stats" style="margin-top:18px">
    <div class="stat"><b>${pct(cov.anyGate, cov.total)}</b><span>builds clearing any gate</span></div>
    <div class="stat"><b>${pct(cov.per.money, cov.total)}</b><span>clear money ${D.GATE}</span></div>
    <div class="stat"><b>${pct(cov.per.fight, cov.total)}</b><span>clear fighting ${D.GATE}</span></div>
    <div class="stat"><b>${pct(cov.per.charm, cov.total)}</b><span>clear charm ${D.GATE}</span></div>
  </div>
  <p class="lede" style="margin-top:12px">Across all ${cov.total.toLocaleString()} legal
  100-point splits (minimum 5 per stat). Raising <code>GATE</code> above ${D.GATE} narrows
  every one of these at once.</p>
</section>

<section id="intrigue">
  <h2>Intrigue</h2>
  <p class="lede">Attraction is tracked, never resolved — nothing in Act 1 is winnable. What the
  player builds here is a number the later acts read, and a reason to talk to somebody twice when
  the puzzle does not require it. Repeat flirtation is capped so it cannot be farmed.</p>
  <div class="grid two">
    <div class="card"><header><h3>Tiers</h3></header>
      <div class="scroll"><table><thead><tr><th>heat</th><th>reads as</th></tr></thead>
      <tbody>${tierRows}</tbody></table></div></div>
    <div class="card"><header><h3>Where it comes from</h3></header>
      <ul class="plain">
        <li><b>Chip</b> — charm opener +18, money opener +8, three optional beats +6 each,
          the curtain +12 spoken or +16 silent.</li>
        <li><b>Brenda</b> — charm route +20, money route +12, sitting through the pitch twice +8,
          handing back the coupon +4.</li>
        <li><b>Fighting earns wariness, not heat.</b> That is a real build difference, not an
          oversight.</li>
      </ul></div>
  </div>
</section>

<section id="deaths">
  <h2>Deaths <span>${Object.keys(D.deaths).length}</span></h2>
  <p class="lede">All instant-retry gags. The curtain counts them.</p>
  <div class="scroll"><table><thead><tr><th>card</th><th>id</th><th>copy</th></tr></thead>
  <tbody>${deathRows}</tbody></table></div>
</section>

<section id="flags">
  <h2>Flags <span>${flags.length}</span></h2>
  <p class="lede">Level 1's entire persistent state. A flag with reads but no writes, or writes but
  no reads, is a bug worth chasing.</p>
  <div class="scroll"><table><thead><tr><th>flag</th><th>written</th><th>read</th></tr></thead>
  <tbody>${flagRows}</tbody></table></div>
</section>

<section id="chain">
  <h2>Progression</h2>
  <div class="chain">Chip mocks you ──▶ flicks a quarter ──▶ <i>TAKE quarter</i>
                                 │
Brenda's pitch ──▶ <b>aloe</b>   <span class="mute">(charm / money / fighting / sit through it twice)</span>
      │              │
      │              └──▶ <i>USE aloe on Gil</i> ──▶ <b>${cash(D.economy.earn.gilAloe.base)}–${cash(D.economy.earn.gilAloe.charm)}</b>
      └──▶ <i>TAKE the FREE GIFT sign</i>
                 │
                 └──▶ <i>USE sign on the bandshell</i> ──▶ crowd ──▶ <b>${cash(D.economy.earn.dickieSplit.base)}–${cash(D.economy.earn.dickieSplit.charm)}</b>
                                                              │
quarter ──▶ LaRue's reading ──▶ <b>fortune card</b> ──────────┤
                                                              ▼
                                        Monte's table — <b>${cash(D.economy.monteStake)}</b> to sit
                                        with the card: <b>${cash(D.economy.earn.monteWin.base)}–${cash(D.economy.earn.monteWin.charm)}</b>
                                        without it: the stake is gone
                                                              │
                                        purse ≥ <b>${cash(D.economy.winLine)}</b> ──▶ curtain</div>
</section>

<section id="ai">
  <h2>When to reach for AI</h2>
  <p class="lede">The design doc keeps goal-driven NPCs out of the MVP and names the Wildcard rival
  as the first candidate. On the evidence below that is the wrong first candidate — the pressure is
  building on Chip, because he is the one who persists across all eleven levels, flips allegiance at
  Level 4, and now carries a heat track as well as a build check.</p>
  <ul class="plain">
    <li><b>Word count is not the trigger.</b> Prose is cheap to write. The trigger is the number of
      <b>independent axes</b> a character's lines must vary on at once, because the hand-authored
      matrix is their product, not their sum.</li>
    <li><b>The measure used here</b> is <code>branches × axes</code> — multiplicative, because the
      matrix you write by hand is the product of the axes, not their sum. Adding one
      heat-conditioned reply to a character who already varies on build does not add a line, it
      doubles a column.</li>
    <li><b>Comfortable</b> — under 30. The tree stays readable and every branch can be written well.</li>
    <li><b>Watch</b> — 30 to 80. Still writable, but you begin repeating yourself and the seams show.</li>
    <li><b>Reach for a goal-driven NPC</b> — over 80.</li>
    <li><b>The architecture is already ready for it.</b> Every scene is a plain function that calls
      <code>say()</code>. Swapping one for a generated response means replacing a function body,
      not a rewrite — which is exactly the modularity §11 asks for.</li>
  </ul>
  <div class="scroll" style="margin-top:18px"><table><thead><tr><th>character</th><th>words</th>
  <th>branches</th><th>axes</th><th>load</th><th>read</th></tr></thead><tbody>
  ${castOrder.slice().sort((a,b)=>load[b].score-load[a].score).map(w =>
    `<tr><th>${esc(C[w].name)}</th><td class="num">${load[w].words}</td>
    <td class="num">${load[w].branches}</td>
    <td class="num">${load[w].axes.length} <span class="mute">${load[w].axes.join(' ')}</span></td>
    <td class="num">${load[w].score}</td>
    <td><span class="pill ${bandClass(load[w].band)}">${load[w].band}</span></td></tr>`).join('')}
  </tbody></table></div>
</section>

<footer>Generated from <code>index.html</code> by <code>tools/bible.js</code>.
Change the game and regenerate; do not edit this page by hand.</footer>
</main>
</div>`;
}
