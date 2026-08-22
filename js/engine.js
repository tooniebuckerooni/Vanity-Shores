/* Vanity Shores — engine.js
 *
   State, money, items, movement, the interface, room render and the verb
      dispatch. The machinery every level runs on.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
/* ---------- 4. ENGINE ---------------------------------------------------- */
const SAVE_KEY = 'vanityshores.act1.l1';

const GS = {
  scene:'title',
  name:'', look:{ skin:'tan', hair:'blowout', hairC:'#3b2416', hairC2:'#6b4426', figure:'straight',
                  shirtStyle:'blazer', shirt:'#e94f6a', shirtD:'#b8324a', inner:'#f5e6d3',
                  pants:'#2f3a6b', pantsD:'#1e2648', acc:'none', eyes:'#3a5a8c',
                  marks:'' },
  stats:{ money:34, fight:33, charm:33 },
  cash:0,                                     // cents
  room:'boardwalk',
  inv:[], flags:{}, heat:{}, secrets:{}, cut:null, verb:'look', sel:null,
  player:{ x:60, y:150, tx:60, ty:150, walking:false, phase:0 },
  msg:null, invOpen:false, deaths:0, hustleTries:0,
  tally:{}                                  // the run ledger; see TALLY
};

function saveGame(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
    name:GS.name, look:GS.look, stats:GS.stats, cash:GS.cash, room:GS.room,
    inv:GS.inv, flags:GS.flags, heat:GS.heat, secrets:GS.secrets, deaths:GS.deaths,
    tally:GS.tally, v:1 })); }catch(e){}
}
function loadGame(){
  try{ const s = JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(s && s.v===1 && s.name){ Object.assign(GS, {
      name:s.name, look:s.look, stats:s.stats, cash:s.cash, room:s.room,
      inv:s.inv||[], flags:s.flags||{}, heat:s.heat||{}, secrets:s.secrets||{},
      deaths:s.deaths||0, tally:s.tally||{} });
      if(!GS.look.marks) GS.look.marks = '';        // saves from before marks existed
      return true; }
  }catch(e){}
  return false;
}
function wipeSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }

/* ---- money & items ---- */
const money = () => '$' + (GS.cash/100).toFixed(2);
function pay(cents, sfx){
  GS.cash += cents;
  if(cents > 0) tick('earned', cents);
  if(sfx!==false) Audio_.sfx(cents>0?'cash':'deny');
  if(GS.cash >= ECONOMY.stakeLine && !GS.flags.stake) GS.flags.stake = true;
  saveGame();
}
/* ---- the run ledger ------------------------------------------------------
   Counters that outlive the level. The end card, the save file and Canon all
   read this one table, so adding a ticker is a single entry here rather than
   four edits in four places. Levels 2 onward keep ticking the same counters —
   the closing card of the whole game is this list, totalled. */
const TALLY = {
  deaths:   { label:'Died',                              short:'DIED' },
  laid:     { label:'Got somewhere',                     short:'GOT SOMEWHERE' },
  pocketed: { label:'Pocketed something nobody offered', short:'POCKETED' },
  leaned:   { label:'Leaned on somebody',                short:'LEANED' },
  flirted:  { label:'Tried it on',                       short:'TRIED IT ON' },
  encores:  { label:'Made Dickie sing again',            short:'ENCORES' },
  earned:   { label:'Earned',                            short:'TOOK IN',  cash:true },
  dropped:  { label:'Lost to your own stupidity',        short:'DROPPED',  cash:true }
};
function tick(k, n){
  GS.tally[k] = (GS.tally[k] || 0) + (n === undefined ? 1 : n);
  saveGame();
}
const tallied = k => GS.tally[k] || 0;

/* ---- marks ---------------------------------------------------------------
   Deliberately unremarked. Nothing in the world reacts to these; they are on
   the sprite and in the save, and they travel to the next level with you. */
const MARKS = {
  flushed:  'high colour that has not gone down',
  lipstick: 'a print on the collar, not your shade',
  stain:    'something on the front you have decided not to look at',
  dishevel: 'hair that has given up'
};
function mark(id){
  const set = (GS.look.marks || '').split(',').filter(Boolean);
  if(set.indexOf(id) < 0) set.push(id);
  GS.look.marks = set.sort().join(',');
  saveGame();
}
function unmark(id){
  GS.look.marks = (GS.look.marks || '').split(',')
    .filter(x => x && x !== id).join(',');
  saveGame();
}
const marked = id => (GS.look.marks || '').indexOf(id) >= 0;
const markCount = () => (GS.look.marks || '').split(',').filter(Boolean).length;

function has(id){ return GS.inv.indexOf(id) >= 0; }
function give(id){ if(!has(id)){ GS.inv.push(id); Audio_.sfx('pickup'); } saveGame(); }
function drop(id){ const i=GS.inv.indexOf(id); if(i>=0) GS.inv.splice(i,1);
  if(GS.sel===id) GS.sel=null; saveGame(); }

const ITEMS = {
  quarter:{ name:'a quarter', desc:'Twenty-five cents. Chip Winthrop flicked it at you like you were a fountain.' },
  tote:{ name:'a canvas tote', desc:'"SHORELINE RESIDENCES — OWN THE SUNSET." It smells faintly of a rented conference room.' },
  spf:{ name:'Coco Blast SPF 2', desc:'SPF two. That is not sun protection, that is a marinade. Warning label: DO NOT DRINK. Sure.' },
  aloe:{ name:'aloe gel', desc:'Ice-blue, medical-grade, aggressively soothing. Somewhere out there is a man who would pay real money for this.' },
  coupon:{ name:'a drink coupon', desc:'One (1) complimentary Sunset Cooler at any participating Shoreline property. Participating properties: none.' },
  fortune:{ name:'a fortune card', desc:'Madame LaRue\'s spidery handwriting: "THE PEA IS NEVER UNDER A SHELL. WATCH THE LEFT HAND, NOT THE SHELLS."' },
  sign:{ name:'a FREE GIFT sign', desc:'Two feet of laminated hot pink promising something for nothing. The most powerful object in Vanity Shores.' },
  churro:{ name:'a churro', desc:'Cinnamon, sugar, and structural regret. Still warm.' }
};
function drawItemIcon(id, x, y){
  switch(id){
    case 'quarter': r(x+4,y+4,10,10,'#c8c8d4'); r(x+5,y+3,8,12,'#c8c8d4');
                    r(x+3,y+5,12,8,'#c8c8d4'); r(x+6,y+6,6,6,'#9a9aa8');
                    px(x+6,y+5,'#e8e8f0'); break;
    case 'tote':    r(x+3,y+6,12,10,'#e8dcc0'); r(x+3,y+6,12,1,'#c8b898');
                    r(x+5,y+2,2,5,'#c8b898'); r(x+11,y+2,2,5,'#c8b898');
                    r(x+5,y+9,8,4,P.surf); break;
    case 'spf':     r(x+6,y+4,6,12,'#ff8a3d'); r(x+7,y+1,4,3,'#f0e2c8');
                    r(x+6,y+4,6,1,'#ffb37a'); r(x+7,y+8,4,5,'#f0e2c8');
                    px(x+8,y+9,'#ff8a3d'); break;
    case 'aloe':    r(x+6,y+3,6,13,'#3ec98a'); r(x+7,y+1,4,3,'#e8f0ec');
                    r(x+6,y+3,6,1,'#6ee8b0'); r(x+7,y+7,4,6,'#e8f0ec');
                    px(x+8,y+9,'#3ec98a'); px(x+9,y+11,'#3ec98a'); break;
    case 'coupon':  r(x+2,y+5,14,9,'#f0e2a8'); r(x+2,y+5,14,1,'#d8c880');
                    r(x+4,y+7,6,1,'#8a7040'); r(x+4,y+9,9,1,'#8a7040');
                    r(x+11,y+5,1,9,'#d8c880'); break;
    case 'fortune': r(x+3,y+4,13,11,'#f5e6d3'); r(x+3,y+4,13,1,'#d8c4a8');
                    r(x+5,y+7,9,1,'#5b2a8a'); r(x+5,y+9,7,1,'#5b2a8a');
                    r(x+5,y+11,8,1,'#5b2a8a'); px(x+14,y+6,P.hot); break;
    case 'sign':    r(x+2,y+3,14,9,P.gold); r(x+3,y+4,12,7,P.hot);
                    r(x+8,y+12,2,5,'#7a5230'); break;
    case 'churro':  r(x+3,y+8,13,4,'#c8862a'); r(x+3,y+8,13,1,'#e8a850');
                    for(let i=0;i<4;i++) px(x+5+i*3, y+9, '#8a5a18'); break;
    default:        r(x+4,y+4,10,10,P.dim);
  }
}

/* ---- messages ---- */
function say(pages, opts){
  opts = opts||{};
  const arr = Array.isArray(pages) ? pages : [pages];
  GS.msg = { pages:arr, i:0, sub:0, speaker:opts.speaker||null, look:opts.look||null,
             choices:opts.choices||null, then:opts.then||null, hover:-1 };
  GS.invOpen = false;
}
function narrate(t, opts){ say(t, opts||{}); }  /* @owner system */
function advanceMsg(){
  const m = GS.msg; if(!m) return;
  if(dlgHasMore(m)){ m.sub = (m.sub||0)+1; Audio_.sfx('click'); return; }
  if(m.i < m.pages.length-1){ m.i++; m.sub = 0; Audio_.sfx('click'); return; }
  if(m.choices) return;                      // choices wait for a pick
  GS.msg = null;
  if(m.then) m.then();
}
function chooseOption(idx){
  const m = GS.msg; if(!m || !m.choices) return;
  if(dlgHasMore(m) || m.i < m.pages.length-1) return;   // choices belong to the last view
  const c = m.choices[idx]; if(!c) return;
  if(c.enabled === false){ Audio_.sfx('deny'); return; }
  Audio_.sfx('click'); GS.msg = null;
  if(c.fn) c.fn();
}

/* ---- stat helpers: the build gates everything (§3) ---- */
const S = () => GS.stats;
const leanName = () => { const s=S();
  if(s.money>=s.fight && s.money>=s.charm) return 'money';
  if(s.fight>=s.charm) return 'fight'; return 'charm'; };
function statCheck(stat, need){ return S()[stat] >= need; }

/* ---- player movement ---- */
function walkTo(x, y, then){
  const p = GS.player, rm = ROOMS[GS.room];
  p.tx = clamp(x, rm.walk.x0, rm.walk.x1);
  p.ty = clamp(y, rm.walk.y0, rm.walk.y1);
  p.walking = true; p.then = then||null;
}
function updatePlayer(dt){
  const p = GS.player;
  if(!p.walking) { p.phase = 0; return; }
  const dx = p.tx-p.x, dy = p.ty-p.y, d = Math.hypot(dx,dy);
  const spd = 80 * dt;
  if(d <= spd){
    p.x = p.tx; p.y = p.ty; p.walking = false; p.phase = 0;
    const f = p.then; p.then = null; if(f) f();
  } else {
    p.x += dx/d*spd; p.y += dy/d*spd;
    p.phase += dt*11;
    if(Math.floor(p.phase/2.4) !== Math.floor((p.phase-dt*11)/2.4)) Audio_.sfx('walk');
  }
}
function playerDepth(){                       // a little depth scaling
  const rm = ROOMS[GS.room], t = (GS.player.y - rm.walk.y0)/Math.max(1,(rm.walk.y1-rm.walk.y0));
  return Math.round(t*5) - 2;
}

/* ---------- 4b. INTERFACE ------------------------------------------------ */
const VERBS = [ {id:'look',label:'LOOK'}, {id:'talk',label:'TALK'},
                {id:'use', label:'USE' }, {id:'take',label:'TAKE'} ];
const BAR_Y = 172, SLOT0 = 196, SLOTW = 20;
const mouse = { x:160, y:100, down:false };

function verbRect(i){ return { x:4+i*46, y:BAR_Y+4, w:44, h:12 }; }
function slotRect(i){ return { x:SLOT0+i*SLOTW, y:BAR_Y+3, w:19, h:19 }; }
function inRect(p, q){ return p.x>=q.x && p.x<q.x+q.w && p.y>=q.y && p.y<q.y+q.h; }

const audioBtn = i => ({ x:293+i*13, y:1, w:12, h:10 });
function drawAudioSwitches(){
  const spec = [[Audio_.musicOn, P.surf], [Audio_.sfxOn, P.gold]];
  for(let i=0;i<2;i++){
    const q = audioBtn(i), on = spec[i][0], col = on ? spec[i][1] : '#5a4470';
    if(inRect(mouse,q)) r(q.x, q.y, q.w, q.h, '#3d1f52');
    if(i===0){                                        // a note: music
      r(q.x+2, q.y+6, 3, 3, col); r(q.x+5, q.y+2, 1, 5, col); r(q.x+5, q.y+2, 3, 1, col);
    } else {                                          // a speaker: sound effects
      r(q.x+1, q.y+4, 2, 3, col); r(q.x+3, q.y+2, 1, 7, col); r(q.x+4, q.y+3, 1, 5, col);
      px(q.x+7, q.y+3, col); px(q.x+8, q.y+5, col); px(q.x+7, q.y+7, col);
    }
    if(!on) for(let k=0;k<8;k++) px(q.x+2+k, q.y+1+k, '#ff5f6d');   // struck through
  }
}
function drawStatusBar(){
  g.globalAlpha = .72; r(0,0,W,11,P.ink); g.globalAlpha = 1;
  r(0,11,W,1,'rgba(255,46,136,.45)');
  text('ACT 1, LEVEL 1 — SMALL CHANGE', 5, 2, P.dim, FONT.sm);
  const m = money();
  text(m, 288-textW(m,FONT.sm), 2, P.gold, FONT.sm);
  drawAudioSwitches();
}
function drawVerbBar(hoverName){
  r(0, BAR_Y, W, 200-BAR_Y, P.ink);
  r(0, BAR_Y, W, 1, P.hot);
  g.globalAlpha=.5; r(0, BAR_Y+1, W, 1, '#5a2a52'); g.globalAlpha=1;
  for(let i=0;i<VERBS.length;i++){
    const q = verbRect(i), on = GS.verb===VERBS[i].id, hov = inRect(mouse,q);
    r(q.x, q.y, q.w, q.h, on ? P.hot : (hov ? '#3d1f52' : '#241134'));
    r(q.x, q.y, q.w, 1, on ? '#ff7ab5' : '#3d2255');
    textC(VERBS[i].label, q.x+q.w/2, q.y+2, on ? P.ink : (hov?P.bone:P.dim), FONT.sm);
  }
  // inventory strip
  r(SLOT0-4, BAR_Y+2, W-SLOT0+4, 21, '#1a0f28');
  for(let i=0;i<6;i++){
    const q = slotRect(i), id = GS.inv[i];
    r(q.x, q.y, q.w, q.h, '#241134');
    r(q.x, q.y, q.w, 1, '#3d2255'); r(q.x, q.y, 1, q.h, '#3d2255');
    if(id){
      drawItemIcon(id, q.x+1, q.y+1);
      if(GS.sel===id){ r(q.x,q.y,q.w,1,P.surf); r(q.x,q.y+q.h-1,q.w,1,P.surf);
                       r(q.x,q.y,1,q.h,P.surf); r(q.x+q.w-1,q.y,1,q.h,P.surf); }
      else if(inRect(mouse,q)){ r(q.x,q.y,q.w,1,P.gold); r(q.x,q.y+q.h-1,q.w,1,P.gold); }
    }
  }
  // hint line
  let hint = '';
  if(GS.sel && GS.verb==='use') hint = 'Use ' + ITEMS[GS.sel].name + (hoverName? ' on ' + hoverName : ' on…');
  else if(hoverName) hint = VERBS.find(v=>v.id===GS.verb).label.charAt(0) +
        VERBS.find(v=>v.id===GS.verb).label.slice(1).toLowerCase() + ' ' + hoverName;
  else hint = GS.name ? '' : '';
  text(hint, 6, BAR_Y+17, hoverName?P.bone:P.dim, FONT.sm);
}

const DLG_MAX = 6;                        // lines per view before it flows on

function dlgLayout(m){
  const hasPort = !!m.look;
  const tx = hasPort ? PW + 14 : 12, tw = hasPort ? 294 - PW : 296;
  const nameH = m.speaker ? 10 : 0;
  const sub = m.sub || 0;
  const all = wrap(m.pages[m.i], FONT.dlg, tw);
  const onLast = m.i === m.pages.length-1;

  // choice rows wrap too, and each knows its own height
  let rows = null, chH = 0;
  if(m.choices && onLast){
    rows = m.choices.map(c => {
      const pre = c.tag ? c.tag + ' \u00b7 ' : '';
      const ls = wrap(pre + c.text, FONT.dlg, tw - 14);
      return { c, pre, lines:ls, h: ls.length*13 + 3 };
    });
    chH = rows.reduce((a,q)=>a+q.h, 0) + 6;
  }

  // shrink the body view until the box fits between the status bar and the verb bar
  let maxL = DLG_MAX, lines, more, h;
  for(;;){
    lines = all.slice(sub*maxL, sub*maxL + maxL);
    more  = (sub+1)*maxL < all.length;
    h = Math.max(hasPort ? PH + 12 : 46, 10 + nameH + lines.length*13 + (more ? 0 : chH) + 8);
    if(h <= 150 || maxL <= 2) break;
    maxL--;
  }
  const last = !more && onLast;
  const choices = (rows && !more) ? m.choices : null;
  const y = Math.max(14, 166 - h);
  return { hasPort, tx, tw, lines, more, last, nameH, choices,
           rows: (rows && !more) ? rows : null, chH, h, y,
           x:6, bw:308, chY: y + 6 + nameH + lines.length*13 + 4 };
}
function dlgHasMore(m){ const L = dlgLayout(m); return L.more; }

function drawDialogue(){
  const m = GS.msg; if(!m) return;
  const L = dlgLayout(m);

  g.globalAlpha = .93; r(L.x, L.y, L.bw, L.h, '#180d26'); g.globalAlpha = 1;
  r(L.x, L.y, L.bw, 1, P.hot); r(L.x, L.y+L.h-1, L.bw, 1, P.hot);
  r(L.x, L.y, 1, L.h, P.hot); r(L.x+L.bw-1, L.y, 1, L.h, P.hot);
  g.globalAlpha = .35; r(L.x+1, L.y+1, L.bw-2, 1, '#ff9ac8'); g.globalAlpha = 1;

  if(L.hasPort) drawPortrait(L.x+5, L.y+6, m.look, clock);
  let ty = L.y+6;
  if(m.speaker){ text(m.speaker.toUpperCase(), L.tx, ty, P.gold, FONT.sm); ty += L.nameH; }
  for(const ln of L.lines){ text(ln, L.tx, ty, P.bone, FONT.dlg); ty += 13; }

  if(L.rows){
    let cy = L.chY;
    for(const row of L.rows){
      const q = { x:L.tx-4, y:cy, w:L.tw+6, h:row.h };
      const hov = inRect(mouse,q) && row.c.enabled !== false;
      if(hov) r(q.x, q.y, q.w, q.h, 'rgba(255,46,136,.22)');
      const col = row.c.enabled===false ? '#6b4d8a' : (hov ? P.hot : P.surf);
      text(hov ? '\u25b8' : ' ', q.x+2, q.y+1, P.hot, FONT.dlg);
      for(let j=0;j<row.lines.length;j++)
        text(row.lines[j], q.x+11, q.y+1+j*13, col, FONT.dlg);
      if(row.pre) text(row.pre, q.x+11, q.y+1, P.gold, FONT.dlg);   // pick the gate out
      cy += row.h;
    }
  } else if(!L.last){
    if(Math.floor(clock/450)%2===0) text('\u25bc', L.x+L.bw-14, L.y+L.h-13, P.hot, FONT.dlg);
  } else {
    if(Math.floor(clock/600)%2===0) text('\u25a0', L.x+L.bw-13, L.y+L.h-12, P.dim, FONT.sm);
  }
}

/* ---- cursor ---- */
function drawCursor(){
  const x = mouse.x|0, y = mouse.y|0;
  const c = GS.verb==='talk' ? P.surf : GS.verb==='take' ? P.gold :
            GS.verb==='use' ? '#4de0a0' : P.bone;
  r(x-4, y, 3, 1, c); r(x+2, y, 3, 1, c);
  r(x, y-4, 1, 3, c); r(x, y+2, 1, 3, c);
  px(x, y, P.hot);
}

/* ---------- 4c. ROOM RENDER ---------------------------------------------- */
let clock = 0;
function hotspotsOf(room){ return ROOMS[room].hotspots.filter(h => !h.hidden || !h.hidden()); }
/* A person's clickable area is derived from the person, not authored per room.
   Hand-written rects were sized by eye for a 40px cast, so at Sierra 72 the head
   and hat of every character stuck out above their own hitbox — measured at 62%
   to 81% of sprite height in Level 2, against 105% to 115% in Level 1.
   This unions the authored rect with the bounds actually drawn, so it can only
   ever grow a box, never shrink one, and it tracks CHAR_H on its own from here. */
function hitRect(h){
  if((h.pri || 0) < 2) return h;                 // scenery keeps its authored rect
  const rm = ROOMS[GS.room];
  for(const n of rm.npcs){
    if(n.hidden && n.hidden()) continue;
    if(n.x < h.x - 4 || n.x > h.x + h.w + 4) continue;
    if(n.y < h.y - 4 || n.y > h.y + h.h + 12) continue;
    const m = charMetrics(n.look || {});
    const w = Math.max(m.shW, m.hiW, m.headW * 1.7) + 4;
    const x0 = Math.min(h.x, n.x - w / 2), y0 = Math.min(h.y, n.y - m.H - 2);
    const x1 = Math.max(h.x + h.w, n.x + w / 2), y1 = Math.max(h.y + h.h, n.y + 2);
    return { x:x0, y:y0, w:x1 - x0, h:y1 - y0, pri:h.pri };
  }
  return h;
}
function hotspotAt(p){
  let best = null, bestArea = Infinity, bestPri = -1;
  for(const h0 of hotspotsOf(GS.room)){
    const h = hitRect(h0);
    if(p.x>=h.x && p.x<h.x+h.w && p.y>=h.y && p.y<h.y+h.h){
      const pri = h.pri||0, a = h.w*h.h;       // a person beats the building behind them
      if(pri > bestPri || (pri === bestPri && a < bestArea)){ best = h0; bestPri = pri; bestArea = a; }
    }
  }
  return best;
}
function drawRoom(t){
  g.drawImage(bakedRoom(GS.room), 0, 0);
  ROOMART[GS.room].live(t);
  const rm = ROOMS[GS.room];

  // entities sorted back-to-front
  const ents = [];
  for(const n of rm.npcs) if(!n.hidden || !n.hidden())
    ents.push({ y:n.y, draw:()=>{ if(n.behind) n.behind(t);
      drawPerson(n.x, n.y, n.look, t, 0); if(n.extra) n.extra(t); } });
  ents.push({ y:GS.player.y, draw:()=>{
    const o = Object.assign({}, GS.look, { size:playerDepth() });
    drawPerson(GS.player.x, GS.player.y, o, t, GS.player.walking?GS.player.phase:0); } });
  ents.sort((a,b)=>a.y-b.y);
  for(const e of ents) e.draw();

  if(rm.overlay) rm.overlay(t);

  // hover outline
  const hs = GS.msg ? null : hotspotAt(mouse);
  if(hs && mouse.y < BAR_Y){
    g.globalAlpha = .55 + (REDUCED?0:Math.sin(t/220)*.2);
    const c = P.gold;
    r(hs.x, hs.y, hs.w, 1, c); r(hs.x, hs.y+hs.h-1, hs.w, 1, c);
    r(hs.x, hs.y, 1, hs.h, c); r(hs.x+hs.w-1, hs.y, 1, hs.h, c);
    g.globalAlpha = 1;
  }
  drawStatusBar();
  drawDialogue();
  drawVerbBar(hs ? hs.name : null);
}

/* ---------- 4d. ACTION DISPATCH ------------------------------------------ */
const SHRUG = {
  look:['Nothing there worth the eye strain.','You look. Vanity Shores looks back, unimpressed.',
        'It is exactly as tacky up close.'],
  talk:['It says nothing. You respect that.','You are not yet desperate enough to talk to that.',
        'Talking to that is a Level 6 problem.'],
  use:['That does not work that way. Almost nothing here does.','You try. It does not take.',
       'No. But points for the attempt.'],
  take:['It is not yours. Yet.','You cannot carry that, and it would not suit you.',
        'Too big, too bolted down, or too watched.']
};
function shrug(verb){ const a=SHRUG[verb]||SHRUG.look; return a[(Math.random()*a.length)|0]; }

function doAction(hs, verb){
  if(hs.exit){
    if(verb==='look' && hs.desc){ narrate(hs.desc, { then:hs.go }); return; }
    if(verb==='talk'){ narrate('You do not need to ask its permission.', { then:hs.go }); return; }
    hs.go(); return;
  }
  const fn = hs[verb];
  if(GS.sel && verb==='use'){
    const item = GS.sel;
    if(hs.useItem){ const done = hs.useItem(item); GS.sel = null; if(done !== false) return; }
    GS.sel = null;
    narrate('You wave ' + ITEMS[item].name + ' at ' + hs.name + '. Nothing in the universe responds.');
    Audio_.sfx('deny'); return;
  }
  if(typeof fn === 'function'){ fn(); return; }
  if(typeof fn === 'string'){ narrate(fn); return; }
  Audio_.sfx('deny'); narrate(shrug(verb));
}
function clickScene(p){
  if(GS.msg){                                   // dialogue owns the click
    const L = dlgLayout(GS.msg);
    if(L.rows){
      let cy = L.chY;
      for(let i=0;i<L.rows.length;i++){
        if(inRect(p, { x:L.tx-4, y:cy, w:L.tw+6, h:L.rows[i].h })){ chooseOption(i); return; }
        cy += L.rows[i].h;
      }
      return;
    }
    advanceMsg(); return;
  }
  const hs = hotspotAt(p);
  if(hs){
    const ap = hs.approach;
    if(ap) walkTo(ap[0], ap[1], () => doAction(hs, GS.verb));
    else doAction(hs, GS.verb);
    return;
  }
  const rm = ROOMS[GS.room];
  if(p.y >= rm.walk.y0-14 && p.y <= BAR_Y){
    if(rm.danger && rm.danger(p)) return;
    walkTo(p.x, p.y);
  } else if(p.y < rm.walk.y0-14){
    if(rm.danger && rm.danger(p)) return;
    narrate('You cannot get there from here. Not in these shoes.');
  }
}

