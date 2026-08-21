/* Canon — page primitives.
 *
 * Deliberately NOT a template engine. Each game writes its own report, because
 * the prose is where the judgement lives and a configurable template would make
 * every bible blander. What is shared is the furniture: escaping, money, a
 * stylesheet driven by tokens, and the handful of blocks every report wants.
 */
const esc  = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const pct  = (a, b) => b ? (a / b * 100).toFixed(1) + '%' : '—';
const money = (c, unit = '$') =>
  (c < 0 ? '-' : '') + unit + Math.abs(c / 100).toFixed(2);

const DEFAULT_THEME = {
  void:'#10071c', panel:'#1a0d2c', panel2:'#221237', edge:'#33204a',
  bone:'#f0e4d4', mute:'#a08cb4', dim:'#6f5a8c',
  hot:'#ff2e88', surf:'#21e0d6', gold:'#ffc23d', bad:'#ff5f6d', good:'#4de0a0',
  ui:'"Silkscreen",ui-monospace,monospace',
  body:'"Archivo",system-ui,sans-serif',
  game:'"VT323",ui-monospace,monospace',
  fonts:'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Silkscreen:wght@400;700&family=VT323&display=swap'
};

/* One committed visual world rather than two half-considered ones: the report
   looks like the thing it documents. Every colour is painted explicitly, so it
   holds on any host background. */
const stylesheet = (t) => `
:root{
${Object.entries(t).filter(([k]) => k !== 'fonts')
   .map(([k,v]) => `  --${k}:${v};`).join('\n')}
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--void); color:var(--bone); font-family:var(--body);
  font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased}
.wrap{display:grid; grid-template-columns:210px minmax(0,1fr); gap:44px;
  max-width:1120px; margin:0 auto; padding:40px 24px 96px}
@media (max-width:820px){ .wrap{grid-template-columns:1fr; gap:24px} nav.side{position:static !important} }
nav.side{position:sticky; top:40px; align-self:start}
nav.side .brand{font-family:var(--ui); font-size:11px; letter-spacing:.16em;
  color:var(--hot); text-transform:uppercase; line-height:1.7; margin-bottom:18px}
nav.side .brand b{display:block; color:var(--bone); font-weight:400}
nav.side ol{list-style:none; border-left:1px solid var(--edge)}
nav.side a{display:block; padding:5px 0 5px 14px; margin-left:-1px;
  border-left:1px solid transparent; color:var(--mute); text-decoration:none; font-size:13.5px}
nav.side a:hover{color:var(--bone); border-left-color:var(--hot)}
nav.side a:focus-visible{outline:2px solid var(--surf); outline-offset:2px}
h1{font-family:var(--ui); font-size:25px; line-height:1.35; color:var(--bone);
  text-wrap:balance; margin-bottom:8px}
.sub{color:var(--mute); max-width:64ch; margin-bottom:34px}
section{margin-bottom:52px; scroll-margin-top:24px}
h2{font-family:var(--ui); font-size:13px; letter-spacing:.16em; text-transform:uppercase;
  color:var(--surf); padding-bottom:8px; border-bottom:1px solid var(--edge); margin-bottom:18px}
h2 span{color:var(--dim); float:right; letter-spacing:.1em}
h3.sub2{font-family:var(--ui); font-size:11px; letter-spacing:.12em; text-transform:uppercase;
  color:var(--dim); margin:26px 0 8px}
p.lede{color:var(--mute); max-width:66ch; margin-bottom:18px}
p.lede b{color:var(--bone)}
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
.pill.info{background:rgba(33,224,214,.13); color:var(--surf)}
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
ol.beats p{font-family:var(--game); font-size:17px; line-height:1.32; color:var(--bone); margin-bottom:6px}
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
.stat span{font-family:var(--ui); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--dim)}
@media (max-width:620px){ .stats{grid-template-columns:repeat(2,1fr)} }
.chain{font-family:var(--ui); font-size:11px; line-height:2; color:var(--mute);
  background:var(--panel); border:1px solid var(--edge); border-radius:3px;
  padding:16px 18px; overflow-x:auto; white-space:pre}
.chain b{color:var(--gold); font-weight:400}
.chain i{color:var(--surf); font-style:normal}
.finding{display:grid; grid-template-columns:auto minmax(0,1fr); gap:12px; align-items:start;
  padding:11px 0; border-bottom:1px solid rgba(51,32,74,.6)}
.finding:last-child{border-bottom:none}
.finding p{font-size:14px; color:var(--mute)}
.finding b{color:var(--bone); font-weight:600}
footer{border-top:1px solid var(--edge); padding-top:16px; color:var(--dim); font-size:13px}
`;

/* Blocks worth sharing because getting them wrong is a bug, not a taste call. */
const table = (heads, rows, cls = '') => rows.length ? `<div class="scroll">
  <table${cls ? ' class="' + cls + '"' : ''}><thead><tr>${
    heads.map(h => `<th${/^#/.test(h) ? ' class="num"' : ''}>${esc(h.replace(/^#/,''))}</th>`).join('')
  }</tr></thead><tbody>${rows.join('')}</tbody></table></div>` : '';

const statTiles = pairs => `<div class="stats">${
  pairs.map(([v, label]) => `<div class="stat"><b>${v}</b><span>${esc(label)}</span></div>`).join('')
}</div>`;

const findings = list => list.length ? list.map(f => `<div class="finding">
    <span class="pill ${f.level === 'error' ? 'crit' : f.level === 'warn' ? 'warn' : 'info'}">${esc(f.level)}</span>
    <p><b>${esc(f.title)}</b> ${esc(f.detail)}</p></div>`).join('')
  : `<div class="finding"><span class="pill ok">clear</span>
     <p><b>Every invariant holds.</b> Nothing to chase.</p></div>`;

const page = ({ title, theme = DEFAULT_THEME, brand, sub, nav, body, foot }) =>
`<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${theme.fonts}">
<style>${stylesheet(theme)}</style>

<div class="wrap">
<nav class="side">
  <div class="brand">${esc(brand[0])}<b>${esc(brand[1])}</b></div>
  <ol>${nav.map(([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`).join('')}</ol>
</nav>
<main>
${body}
<footer>${foot}</footer>
</main>
</div>`;

module.exports = { esc, pct, money, table, statTiles, findings, page,
                   stylesheet, DEFAULT_THEME };
