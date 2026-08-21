/* Vanity Shores — the bible, written. Authored prose lives here on purpose:
   a configurable template would make every game's bible blander, so Canon
   shares the furniture and each game keeps its own voice. */
module.exports = function render(ctx, L){
  const { esc, pct, money, table, statTiles, findings, page } = L;
  const cash = money;
  const D = ctx.data, C = D.cast, R = D.rooms, load = ctx.load, sp = ctx.space;
  const castOrder = ['chip','brenda','gil','dickie','zsazsa','monte'];

  const bandClass = b => b === 'comfortable' ? 'ok' : b === 'watch' ? 'warn' : 'crit';
  const bandPct   = l => Math.min(100, Math.round((l.score / l.ceiling) * 100) + 6);

  const castCards = castOrder.map(who => {
    const c = C[who], l = load[who];
    const pays = Object.entries(D.economy.earn)
      .filter(([k]) => k.toLowerCase().startsWith(who.slice(0,4)))
      .map(([k,v]) => `<tr><th>${esc(k)}</th><td>${cash(v.base)}</td><td>${cash(v.charm)}</td>
         <td>${cash(v.money)}</td><td>${cash(v.fight)}</td></tr>`).join('');
    const beats = (D.beats[who]||[]).map((pages,i) =>
      `<li><span class="n">${i+1}</span><div class="say"><p>${
        pages.map(p=>esc(p)).join('</p><p>')}</p></div></li>`).join('');
    const owns = ctx.owners[who] || { fns:[], consts:[] };
    return `
    <article class="card" id="cast-${who}">
      <header><h3>${esc(c.name)}</h3>
        <span class="pill ${bandClass(l.band)}">${esc(l.band)}</span></header>
      <p class="role">${esc(c.role)}</p>
      <dl class="facts">
        <div><dt>Found</dt><dd>${esc(c.where)}</dd></div>
        <div><dt>Stance</dt><dd>${esc(c.pose)}</dd></div>
        <div><dt>Dialogue</dt><dd>${l.words} words across ${l.fns} scenes</dd></div>
        <div><dt>Branches</dt><dd>${l.branches} choices, ${l.gatedOpts} behind a stat gate</dd></div>
        <div><dt>Load</dt><dd>${l.score} <span class="mute">(${l.branches} &times; ${Math.max(1,l.axes.length)} axes)</span></dd></div>
      </dl>
      <div class="meter" title="authoring load ${l.score} of ~${l.ceiling}">
        <span style="width:${bandPct(l)}%" class="${bandClass(l.band)}"></span></div>
      <p class="axes">Varies on: ${l.axes.length ? l.axes.map(a=>`<code>${a}</code>`).join(' ') : '<em>nothing yet</em>'}
        &middot; <span class="mute">${esc(l.note)}</span></p>
      ${pays ? `<details><summary>What they pay</summary>${table(
        ['flow','base','charm','money','fighting'], [pays], 'pay')}</details>` : ''}
      ${beats ? `<details><summary>Optional beats (${(D.beats[who]||[]).length})</summary>
        <ol class="beats">${beats}</ol></details>` : ''}
      <details><summary>Scenes claimed (${owns.fns.length + owns.consts.length})</summary>
        <p class="axes" style="margin-top:8px">${
          owns.fns.concat(owns.consts).map(n => `<code>${esc(n)}</code>`).join(' ')}</p></details>
    </article>`;
  }).join('');

  const placeCards = Object.entries(R).map(([id, rm]) => {
    const hs = rm.hotspots.map(h => `<tr><th>${esc(h.name)}</th>
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
      <details><summary>Every hotspot</summary>${table(
        ['what','verbs','rect',''], [hs])}</details>
    </article>`;
  }).join('');

  const row = c => '<tr>' + c + '</tr>';
  const econRows = Object.entries(D.economy.earn).map(([k,v]) => row(
    `<th>${esc(k)}</th><td>${cash(v.base)}</td><td>${cash(v.charm)}</td>
     <td>${cash(v.money)}</td><td>${cash(v.fight)}</td>`)).join('')
    + row(`<th>monte stake</th><td colspan="4">${cash(-D.economy.monteStake)} to sit down</td>`);

  const balRows = Object.entries(sp.builds).map(([k,b]) =>
    `<tr class="${b.passes?'':'bad'}"><th>${esc(k)}</th>
     <td class="num">${b.split.join(' / ')}</td><td class="num">${cash(b.before)}</td>
     <td class="num">${b.encores}</td><td class="num">${cash(b.final)}</td>
     <td>${b.passes ? '<span class="pill ok">clears</span>' : '<span class="pill crit">stuck</span>'}
         ${b.mustPlay ? '' : '<span class="pill crit">skips Monte</span>'}</td></tr>`).join('');

  const gateRows = Object.entries(D.gates).map(([k,g]) => row(
    `<th>${esc(k)}</th><td class="num">${g.need}</td><td>${esc(g.stat)}</td><td>${esc(g.opens)}</td>`)).join('');

  const routeRows = ctx.gates.map(g => row(
    `<th>${esc(g.name)}</th><td>${esc(g.owner)}</td><td class="num">${g.choices}</td>
     <td class="num">${g.gated}</td><td class="num">${g.open}</td>
     <td>${g.critical ? '<span class="pill info">required</span> ' : ''}${
       g.sealed ? '<span class="pill crit">no open route</span>'
                : '<span class="pill ok">passable by anyone</span>'}</td>`)).join('');

  const itemRows = Object.entries(D.items).map(([k,it]) => row(
    `<th>${esc(it.name)}</th><td><code>${esc(k)}</code></td><td>${esc(it.desc)}</td>`)).join('');

  const deathRows = Object.entries(D.deaths).map(([k,d]) => row(
    `<th>${esc(d.head)}</th><td><code>${esc(k)}</code></td>
     <td>${esc(d.body)} <span class="mute">${esc(d.sting)}</span></td>`)).join('');

  const stateLabel = { 'live':'<span class="pill ok">live</span>',
    'awaiting-payoff':'<span class="pill warn">awaiting payoff</span>',
    'orphan-read':'<span class="pill crit">orphan read</span>' };
  const flagRows = ctx.flags.map(f => row(
    `<th><code>${esc(f.name)}</code></th><td class="num">${f.writes}</td>
     <td class="num">${f.reads}</td><td>${stateLabel[f.state]}</td>`)).join('');
  const pending = ctx.flags.filter(f => f.state === 'awaiting-payoff');

  const tierRows = D.heatTiers.slice().reverse().map(([n,label]) =>
    row(`<th class="num">${n}+</th><td>${esc(label)}</td>`)).join('');

  const traitCombos = Object.values(D.traits).reduce((a,b)=>a*b,1);
  const totalWords = castOrder.reduce((a,w)=>a+load[w].words,0);
  const totalHotspots = Object.values(R).reduce((a,r)=>a+r.hotspots.length,0);
  const errs = ctx.findings.filter(f=>f.level==='error').length;
  const warns = ctx.findings.filter(f=>f.level==='warn').length;

  const body = `
<h1>Small Change — the whole level, taken apart</h1>
<p class="sub">Generated from the shipping game, not written alongside it. Every number,
rectangle and word count below was read out of <code>index.html</code> while it ran, so
this cannot drift from what actually plays. Regenerate with <code>node tools/canon.js</code>.</p>

<section id="glance">
  <h2>At a glance</h2>
  ${statTiles([
    [Object.keys(R).length, 'locations'], [castOrder.length, 'speaking cast'],
    [totalHotspots, 'hotspots'], [Object.keys(D.items).length, 'items'],
    [totalWords.toLocaleString(), 'words spoken'], [Object.keys(D.deaths).length, 'ways to die'],
    [cash(D.economy.stakeLine), 'stake line'], [traitCombos.toLocaleString(), 'look combinations']])}
  <ul class="plain">
    <li><b>The win condition is a person, not a number.</b> Chip flicks a quarter at you in the
      opening minute, then parks where he can watch the whole strip. The level ends when you walk
      back up and make him hold a hundred dollars — five ways, by build and by heat.</li>
    <li><b>${cash(D.economy.stakeLine)} is the ticket, not the trophy.</b> Crossing it only buys
      the right to have that conversation.</li>
    <li><b>Opening purse is Money × ${cash(D.economy.startPerMoneyPoint)}.</b> Everything else is
      taken off this boardwalk.</li>
    <li><b>One hard dependency:</b> the shell game cannot be beaten without the fortune card.</li>
  </ul>
</section>

<section id="checks">
  <h2>Invariants <span>${errs ? errs + ' failing' : warns ? warns + ' to watch' : 'holding'}</span></h2>
  <p class="lede">Checked against the same read that produced this page, and wired into the deploy
  as <code>node tools/canon.js --check</code> — so these are build gates, not good intentions.
  <b>An error is a state the game cannot be in and still be correct.</b> A note is usually a
  promise a later level has not collected yet.</p>
  ${findings(ctx.findings)}
</section>

<section id="cast">
  <h2>Characters <span>${castOrder.length}</span></h2>
  <p class="lede">Each card carries what the character gates, what they pay, and how much
  hand-written dialogue they are carrying. Scene ownership is declared at the function itself with
  an <code>@owner</code> tag and read back out here — nothing about this list is maintained by hand,
  so a new scene cannot go quietly uncounted. The band is the authoring-load read; see
  <a href="#ai" style="color:var(--surf)">when to reach for AI</a>.</p>
  <div class="grid two">${castCards}</div>
</section>

<section id="places">
  <h2>Locations <span>${Object.keys(R).length}</span></h2>
  <p class="lede">Coordinates are the game's 320×200 logical space. Priority breaks ties when
  hotspots overlap — people outrank the scenery behind them.</p>
  <div class="grid two">${placeCards}</div>
</section>

<section id="items">
  <h2>Items <span>${Object.keys(D.items).length}</span></h2>
  ${table(['item','id','what it says when looked at'], [itemRows])}
</section>

<section id="economy">
  <h2>Economy</h2>
  <p class="lede">Every figure the level can move, driving the game directly. Columns are the route
  taken, not the player's lean — a charm build that picks the plain option is paid the plain rate.</p>
  ${table(['flow','base','charm','money','fighting'], [econRows], 'pay')}
  <h3 class="sub2">Balance check — every build, best available route</h3>
  ${table(['build','M / F / C','before the table','encores needed','finishes',''], [balRows])}
  <p class="lede" style="margin-top:12px"><b>"Before the table" is also the ceiling.</b> Dickie's
  take halves with every encore and he refuses to sing at all once you are holding the stake, so
  that column is the most any build can carry without sitting down. Every figure in it is under
  ${cash(D.economy.stakeLine)}, which is what makes Monte mandatory rather than optional — and the
  shell game is what buys the confrontation. The ${cash(D.economy.encoreFloor)} floor is what stops
  a lost stake becoming a dead end. All three of those properties are now asserted above rather
  than eyeballed here.</p>
</section>

<section id="gates">
  <h2>Gates &amp; odds</h2>
  <p class="lede">Every stat check in the level. <b>The rule:</b> no gate may be the only route past
  a required beat — an even split clears nothing, so every required beat needs an ungated path.</p>
  ${table(['gate','needs','stat','opens'], [gateRows])}
  ${statTiles([[pct(sp.anyGate, sp.total), 'builds clearing any gate'],
    [pct(sp.per.money, sp.total), 'clear money ' + D.GATE],
    [pct(sp.per.fight, sp.total), 'clear fighting ' + D.GATE],
    [pct(sp.per.charm, sp.total), 'clear charm ' + D.GATE]])}
  <p class="lede">Across all ${sp.total.toLocaleString()} legal 100-point splits (minimum 5 per
  stat). Raising <code>GATE</code> above ${D.GATE} narrows every one of these at once.</p>

  <h3 class="sub2">Route audit — can everyone get out of every room?</h3>
  <p class="lede">Read from the scenes themselves: a choice carrying a gate tag is gated, so a scene
  whose every choice is gated is a scene some legal builds cannot leave. The ones marked
  <b>required</b> are tagged <code>@critical</code> in the source and fail the build if they ever
  seal shut. This is the check that would have caught Level 1 being unwinnable on an even split.</p>
  ${table(['scene','owner','choices','gated','open',''], [routeRows])}
</section>

<section id="intrigue">
  <h2>Intrigue</h2>
  <p class="lede">Attraction is tracked, never resolved — nothing in Act 1 is winnable. What the
  player builds here is a number the later acts read, and a reason to talk to somebody twice when
  the puzzle does not require it. Repeat flirtation is capped so it cannot be farmed.</p>
  <div class="grid two">
    <div class="card"><header><h3>Tiers</h3></header>${table(['heat','reads as'], [tierRows])}</div>
    <div class="card"><header><h3>Where it comes from</h3></header>
      <ul class="plain">
        <li><b>Chip</b> — charm opener +18, money opener +8, three optional beats +6 each,
          the curtain +12 spoken or +16 silent.</li>
        <li><b>Brenda</b> — charm route +20, money route +12, sitting through the pitch twice +8,
          handing back the coupon +4.</li>
        <li><b>Fighting earns wariness, not heat.</b> A real build difference, not an oversight —
          and it is what locks a muscle build out of the secret.</li>
        <li><b>Heat gates content.</b> ${D.secretHeat}+ with Brenda, and no earlier intimidation,
          opens what is behind the booth.</li>
      </ul></div>
  </div>
</section>

<section id="secrets">
  <h2>Secrets <span>${Object.keys(D.secrets).length}</span></h2>
  <p class="lede">Nothing points at these. They are for the player who goes back to a place the
  puzzle has finished with, carrying something nobody asked them to carry. Payoffs happen in a
  <b>cutaway</b> — off-screen is funnier, cheaper to animate, and keeps the game shippable anywhere.</p>
  <div class="grid two">
  ${Object.entries(D.secrets).map(([k,x]) => `
    <article class="card"><header><h3>${esc(x.name)}</h3>
      <span class="pill warn">hidden</span></header>
      <dl class="facts">
        <div><dt>Where</dt><dd>${esc(x.where)}</dd></div>
        <div><dt>Needs</dt><dd>${esc(x.needs)}</dd></div>
        <div><dt>Payoff</dt><dd>${esc(x.payoff)}</dd></div>
      </dl>
      <p class="axes"><span class="mute">A build that muscled its way through Act 1 cannot reach
      this at all. That is the point of it.</span></p></article>`).join('')}
  </div>
</section>

<section id="deaths">
  <h2>Deaths <span>${Object.keys(D.deaths).length}</span></h2>
  <p class="lede">All instant-retry gags. The curtain counts them.</p>
  ${table(['card','id','copy'], [deathRows])}
</section>

<section id="flags">
  <h2>State <span>${ctx.flags.length}</span></h2>
  <p class="lede">Level 1's entire persistent memory, and the asymmetry that matters:
  <b>read but never written is a bug</b> — something branches on state nothing sets. <b>Written but
  never read is a promise</b>, not a bug: a later level has not collected it yet. Conflating those
  two is how a long game rots, so they are counted separately.</p>
  ${table(['flag','written','read',''], [flagRows])}
  <h3 class="sub2">The spine — what later levels are owed</h3>
  <p class="lede">${pending.length
    ? `${pending.length} flag${pending.length===1?'':'s'} recorded here and collected by nobody yet: `
      + pending.map(f=>`<code>${esc(f.name)}</code>`).join(' ')
      + `. That is the contract Act 2 inherits. When a later level reads one, it moves to <b>live</b>
         on its own — nothing to update by hand.`
    : 'Every flag written here is read somewhere. Nothing outstanding.'}</p>
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
                                        purse ≥ <b>${cash(D.economy.stakeLine)}</b>
                                                              │
                                <i>walk back up and give Chip his quarter back</i> ──▶ curtain</div>
</section>

<section id="ai">
  <h2>When to reach for AI</h2>
  <p class="lede">The design doc keeps goal-driven NPCs out of the MVP and names the Wildcard rival
  as the first candidate. On the evidence below that is the wrong first candidate — the pressure is
  building on Chip, because he persists across all eleven levels, flips allegiance at Level 4, and
  now carries a heat track as well as a build check.</p>
  <ul class="plain">
    <li><b>Word count is not the trigger.</b> Prose is cheap to write. The trigger is the number of
      <b>independent axes</b> a character's lines must vary on at once.</li>
    <li><b>The measure is <code>branches × axes</code></b> — multiplicative, because the matrix you
      write by hand is the product of the axes, not their sum. Adding one heat-conditioned reply to
      a character who already varies on build does not add a line, it doubles a column.</li>
    <li><b>An axis is what a line varies on</b>, never what a scene does. Paying money, giving an
      item and adding heat are effects, and effects cost nothing to author.</li>
    <li><b>Comfortable</b> — under 30. <b>Watch</b> — 30 to 80. <b>Reach for a goal-driven NPC</b> — over 80.</li>
    <li><b>The architecture is already ready for it.</b> Every scene is a plain function that calls
      <code>say()</code>, so swapping one for a generated response replaces a function body, not a rewrite.</li>
  </ul>
  ${table(['character','words','branches','axes','load','read'],
    [castOrder.slice().sort((a,b)=>load[b].score-load[a].score).map(w => row(
      `<th>${esc(C[w].name)}</th><td class="num">${load[w].words}</td>
       <td class="num">${load[w].branches}</td>
       <td class="num">${load[w].axes.length} <span class="mute">${load[w].axes.join(' ')}</span></td>
       <td class="num">${load[w].score}</td>
       <td><span class="pill ${bandClass(load[w].band)}">${load[w].band}</span></td>`)).join('')])}
</section>`;

  return page({
    title: 'Vanity Shores Bible',
    brand: ['Vanity Shores', 'Act 1 · Level 1'],
    nav: [['glance','At a glance'],['checks','Invariants'],['cast','Characters'],
          ['places','Locations'],['items','Items'],['economy','Economy'],
          ['gates','Gates & odds'],['intrigue','Intrigue'],['secrets','Secrets'],
          ['deaths','Deaths'],['flags','State'],['chain','Progression'],
          ['ai','When to reach for AI']],
    body,
    foot: `Generated from <code>index.html</code> by <code>tools/canon.js</code>.
      Change the game and regenerate; do not edit this page by hand.`
  });
};
