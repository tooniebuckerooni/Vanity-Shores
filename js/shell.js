/* Vanity Shores — shell.js
 *
   Front of house — title, avatar creation, the complete card — then input,
      the frame loop and boot(). Loads LAST: boot() runs at the end of it.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
/* ---------- 5e. FRONT-OF-HOUSE SCENES ------------------------------------ */
/* Title, character creation, the vector-mode arrival, and the cards. */

const TRAITS = {
  hair:   ['blowout','spikes','perm','ponytail','pomp','bun'],
  hairN:  ['FEATHERED','SPIKED','PERMED','SLICKED','POMPADOUR','TOPKNOT'],
  hairC:  [['#3b2416','#6b4426'],['#1e1420','#4a3a4e'],['#d8b45a','#f2dc9a'],
           ['#b4703a','#d8965a'],['#8e2a4e','#c4406a'],['#7a7488','#a8a2b4']],
  outfit: ['blazer','tank','hawaii','polo','sequin','bikini','lingerie','slip','corset','halter'],
  outfitN:['BLAZER','TANK TOP','HAWAIIAN','POLO','SEQUINS','BIKINI','LINGERIE','SLIP','CORSET','HALTER'],
  figure: ['straight','curved','hourglass','broad'],
  figureN:['STRAIGHT','CURVED','HOURGLASS','BROAD'],
  shirtC: [['#e94f6a','#b8324a'],['#2fa8a0','#1d7a74'],['#f0c23d','#c99a1a'],
           ['#7a5fd8','#5a3fa8'],['#f5e6d3','#c4bca8'],['#2a3f5e','#1b2a42']],
  skin:   ['fair','tan','deep','pale'],
  skinN:  ['FAIR','TAN','DEEP','PALE'],
  acc:    ['none','shades','chain','fanny','band','visor','hoops'],
  accN:   ['NONE','AVIATORS','GOLD ROPE','FANNYPACK','HEADBAND','VISOR','HOOPS']
};
const CC = { i:{ hair:0, hairC:0, figure:0, outfit:0, shirtC:0, skin:1, acc:1 },
             stats:{ money:10, fight:10, charm:10 }, hot:null };
const CC_ROWS = [
  { key:'hair',   label:'HAIR',    pool:'hair',   names:'hairN' },
  { key:'hairC',  label:'COLOUR',  pool:'hairC',  swatch:true },
  { key:'figure', label:'FIGURE',  pool:'figure', names:'figureN' },
  { key:'outfit', label:'OUTFIT',  pool:'outfit', names:'outfitN' },
  { key:'shirtC', label:'SHADE',   pool:'shirtC', swatch:true },
  { key:'skin',   label:'SKIN',    pool:'skin',   names:'skinN' },
  { key:'acc',    label:'EXTRA',   pool:'acc',    names:'accN' }
];
const STAT_ROWS = [
  { key:'money', label:'MONEY',    col:P.gold, blurb:'capital, odds' },
  { key:'fight', label:'FIGHTING', col:P.hot,  blurb:'talk failed' },
  { key:'charm', label:'CHARM',    col:P.surf, blurb:'be believed' }
];
function ccLook(){
  const i = CC.i;
  return { skin:TRAITS.skin[i.skin], hair:TRAITS.hair[i.hair],
           hairC:TRAITS.hairC[i.hairC][0], hairC2:TRAITS.hairC[i.hairC][1],
           figure:TRAITS.figure[i.figure],
           shirtStyle:TRAITS.outfit[i.outfit],
           skirt:['bikini','lingerie','slip','corset','halter'].indexOf(TRAITS.outfit[i.outfit])>=0
                 ? TRAITS.shirtC[i.shirtC][0] : null,
           shirt:TRAITS.shirtC[i.shirtC][0], shirtD:TRAITS.shirtC[i.shirtC][1],
           inner:'#f5e6d3', pants:'#2f3a6b', pantsD:'#1e2648', shoes:'#e9e4d8',
           acc:TRAITS.acc[i.acc], eyes:'#3a5a8c', still:false };
}
const ccTotal = () => CC.stats.money + CC.stats.fight + CC.stats.charm;

/* ---- the Outrun grid: the deliberate mode switch (§7) ---- */
function vectorGrid(t, horizon, speed){
  const gr = g.createLinearGradient(0,horizon,0,SCENE_H+26);
  gr.addColorStop(0,'#2a0f4a'); gr.addColorStop(1,'#0a0416');
  g.fillStyle = gr; g.fillRect(0,horizon,W,200-horizon);
  g.strokeStyle = 'rgba(255,46,136,.75)'; g.lineWidth = 1;
  const off = REDUCED ? 0 : (t/1000*speed) % 1;
  for(let i=0;i<16;i++){                                  // receding rungs
    const k = (i + off)/16, yy = horizon + Math.pow(k,2.4)*(200-horizon);
    if(yy > 200) continue;
    g.globalAlpha = .22 + k*.65;
    g.beginPath(); g.moveTo(0,yy|0); g.lineTo(W,yy|0); g.stroke();
  }
  g.globalAlpha = .55;
  for(let i=-9;i<=9;i++){                                 // rails to the vanishing point
    g.beginPath(); g.moveTo(160 + i*3.2, horizon); g.lineTo(160 + i*46, 200); g.stroke();
  }
  g.globalAlpha = 1;
}
function vectorSun(cx, cy, rad, t){
  const gr = g.createLinearGradient(0,cy-rad,0,cy+rad);
  gr.addColorStop(0,'#fff0b0'); gr.addColorStop(.4,P.gold);
  gr.addColorStop(.72,'#ff5f6d'); gr.addColorStop(1,'#c41d68');
  g.fillStyle = gr; g.beginPath(); g.arc(cx,cy,rad,0,Math.PI*2); g.fill();
  for(let i=0;i<8;i++){
    const yy = cy - rad*0.15 + i*i*0.55 + i*2.2;
    if(yy > cy+rad) break;
    r(cx-rad, yy, rad*2, 1+(i>>1), '#2a0f4a');
  }
}
function vectorPalm(x, baseY, h, col){
  g.fillStyle = col;
  g.beginPath(); g.moveTo(x-1.5, baseY); g.lineTo(x+1.5, baseY);
  g.lineTo(x+3, baseY-h); g.lineTo(x, baseY-h); g.closePath(); g.fill();
  for(let f=0;f<6;f++){
    const a = -Math.PI*0.9 + f*(Math.PI*1.8/5), L = h*0.42;
    g.beginPath(); g.moveTo(x+1, baseY-h);
    g.quadraticCurveTo(x+1+Math.cos(a)*L*0.7, baseY-h+Math.sin(a)*L*0.7 - 3,
                       x+1+Math.cos(a)*L,     baseY-h+Math.sin(a)*L + L*0.35);
    g.quadraticCurveTo(x+1+Math.cos(a)*L*0.6, baseY-h+Math.sin(a)*L*0.6 + 1, x+1, baseY-h);
    g.fill();
  }
}

/* ---- TITLE ---- */
function drawTitle(t){
  const gr = g.createLinearGradient(0,0,0,120);
  gr.addColorStop(0,'#160b2a'); gr.addColorStop(.55,'#5b2170'); gr.addColorStop(1,'#c43a72');
  g.fillStyle = gr; g.fillRect(0,0,W,120);
  const q = rnd32(8);
  for(let i=0;i<40;i++){ g.globalAlpha=.1+q()*.4; px((q()*W)|0,(q()*54)|0,P.bone); } g.globalAlpha=1;
  vectorSun(160, 124, 34, t);
  for(const [x,h] of [[16,44],[42,30],[286,46],[262,28],[300,34]])
    vectorPalm(x, 122, h, '#1c0b30');
  r(0,120,W,2,'#ff8ac0');
  vectorGrid(t, 122, 1.1);
  g.globalAlpha=.30; r(0,0,W,200,'#2a0f4a'); g.globalAlpha=1;

  // the placeholder nameplate — the title is deliberately not written yet (§11)
  const px0 = 44, py0 = 30, pw = 232, ph = 44;
  const pg = g.createLinearGradient(0,py0,0,py0+ph);
  pg.addColorStop(0,'#e8e4f2'); pg.addColorStop(.45,'#8f89a8');
  pg.addColorStop(.5,'#4a4460'); pg.addColorStop(1,'#c8c2dc');
  g.fillStyle = pg; g.fillRect(px0,py0,pw,ph);
  r(px0,py0,pw,1,'#fff'); r(px0,py0+ph-1,pw,1,'#2a2438');
  r(px0,py0,1,ph,'#fff'); r(px0+pw-1,py0,1,ph,'#2a2438');
  textC('TITLE', 160, py0+5, '#241134', '20px Monoton, fantasy');
  textC('PENDING', 160, py0+24, '#241134', '20px Monoton, fantasy');
  r(46, 78, 228, 13, '#1c0c30');
  r(46, 78, 228, 1, 'rgba(255,46,136,.45)');
  textC('A  V A N I T Y   S H O R E S   S T O R Y', 160, 80, P.gold, FONT.sm);

  const blink = REDUCED || Math.floor(t/620)%2===0;
  const hasSave = !!localStorage.getItem(SAVE_KEY);
  if(blink){
    g.globalAlpha=.28; r(122,136,76,19,P.hot); g.globalAlpha=1;
    textC('START', 160, 140, '#ff8ac0', FONT.bg);
  }
  if(hasSave) textC('CONTINUE', 160, 160, P.surf, FONT.sm);
  textC('ENTER CODE', 160, 170, P.gold, FONT.sm);
  textC('ACT 1  ·  LEVEL 1  ·  FREE DEMO', 160, 182, '#a08cb4', FONT.sm);
  textC('CLICK TO BEGIN', 160, 192, '#6b4d8a', FONT.sm);
}

/* ---- PASSCODE ENTRY ---- */
function drawCodeEntry(t){
  const gr = g.createLinearGradient(0,0,0,200);
  gr.addColorStop(0,'#140a22'); gr.addColorStop(1,'#2a1140');
  g.fillStyle = gr; g.fillRect(0,0,W,200);
  vectorGrid(t, 150, .4);
  textC('ENTER YOUR CODE', 160, 22, P.gold, FONT.bg);
  r(70,44,180,1,'rgba(255,46,136,.4)');
  textC('Eight characters. Written on the card at the end of a level.',
        160, 54, '#a08cb4', FONT.sm);
  r(96,74,128,20,'#0d0518'); r(96,74,128,1,P.surf);
  textC(GS.codeBuf || '· · · ·   · · · ·', 160, 79,
        GS.codeBuf ? P.bone : '#4a3a60', FONT.bg);
  if(GS.codeBad && clock - GS.codeBad < 2200)
    textC('THAT IS NOT A CODE.', 160, 102, P.bad, FONT.sm);
  else
    textC('A code carries what you did, not what you had.', 160, 102, '#6b5a86', FONT.sm);
  const ok = {x:96,y:126,w:60,h:16}, bk = {x:164,y:126,w:60,h:16};
  const oh = inRect(mouse,ok), bh = inRect(mouse,bk);
  r(ok.x,ok.y,ok.w,ok.h, oh?P.surf:'#123a44'); textC('GO', ok.x+ok.w/2, ok.y+4, oh?'#08202a':P.surf, FONT.sm);
  r(bk.x,bk.y,bk.w,bk.h, bh?P.hot:'#3a1030');  textC('BACK', bk.x+bk.w/2, bk.y+4, bh?P.bone:'#c07aa0', FONT.sm);
  textC('Type it, then press Enter.', 160, 156, '#5a4470', FONT.sm);
}
function submitCode(){
  const c = parseCode(GS.codeBuf);
  if(!c){ GS.codeBad = clock; Audio_.sfx('deny'); return; }
  Audio_.sfx('fanfare');
  GS.pendingLevel = applyCode(c);
  showNameBox(false); GS.codeBuf = '';
  GS.scene = 'create'; showNameBox(true);          // you still pick who you are
}

/* ---- CHARACTER CREATION ---- */
function drawCreate(t){
  const gr = g.createLinearGradient(0,0,0,200);
  gr.addColorStop(0,'#1a0d2c'); gr.addColorStop(1,'#2e1148');
  g.fillStyle = gr; g.fillRect(0,0,W,200);
  vectorGrid(t, 162, .5);
  g.globalAlpha=.5; r(0,162,W,38,'#1a0d2c'); g.globalAlpha=1;

  textC('WHO WASHES UP IN VANITY SHORES', 160, 4, P.gold, FONT.bg);
  r(48,25,224,1,'rgba(255,46,136,.5)');

  text('NAME', 8, 30, P.dim, FONT.sm);
  r(8, 40, 108, 13, '#120a1e'); r(8,40,108,1,'#5a2a72');
  if(!GS.name) text('click here', 12, 42, '#5a4470', FONT.dlg);

  // trait rows
  for(let i=0;i<CC_ROWS.length;i++){
    const row = CC_ROWS[i], y = 58 + i*15;
    text(row.label, 8, y+2, P.dim, FONT.sm);
    const lq={x:46,y:y,w:11,h:12}, rq={x:101,y:y,w:11,h:12};
    for(const [q,ch] of [[lq,'\u25c0'],[rq,'\u25b6']]){
      const hv = inRect(mouse,q);
      r(q.x,q.y,q.w,q.h, hv?'#5a2a72':'#2a1140');
      textC(ch, q.x+q.w/2, q.y+1, hv?P.bone:P.dim, FONT.sm);
    }
    if(row.swatch){
      const cols = TRAITS[row.pool][CC.i[row.key]];
      r(62, y+1, 36, 10, cols[0]); r(62, y+1, 36, 1, cols[1]); r(62, y+1, 1, 10, cols[1]);
    } else {
      textC(TRAITS[row.names][CC.i[row.key]], 80, y+2, P.bone, FONT.sm);
    }
  }

  // preview — the sprite, doubled
  const pv = offscreen(46, 62);
  withTarget(pv.getContext('2d'), () => drawPerson(23, 58, ccLook(), t, 0));
  r(126, 36, 52, 124, '#120a1e');
  r(126,36,52,1,'#5a2a72'); r(126,159,52,1,'#5a2a72');
  r(126,36,1,124,'#5a2a72'); r(177,36,1,124,'#5a2a72');
  const shine = g.createLinearGradient(0,36,0,160);
  shine.addColorStop(0,'rgba(255,46,136,.16)'); shine.addColorStop(1,'rgba(33,224,214,.08)');
  g.fillStyle = shine; g.fillRect(127,37,50,122);
  g.drawImage(pv, 0,0,46,62, 106,36, 92,124);

  // stat allocation
  const left = 100 - ccTotal();
  text('POINTS LEFT ' + left, 190, 30, left===0?P.surf:P.gold, FONT.sm);
  for(let i=0;i<3;i++){
    const st = STAT_ROWS[i], y = 46 + i*36, v = CC.stats[st.key];
    text(st.label, 190, y, st.col, FONT.sm);
    const vs = String(v);
    text(vs, 306-textW(vs,FONT.sm), y, P.bone, FONT.sm);
    r(190, y+10, 116, 7, '#120a1e');
    r(190, y+10, Math.round(116*v/90), 7, st.col);
    r(190, y+10, 116, 1, '#3d2255');
    const mq={x:190,y:y+19,w:13,h:11}, pq={x:206,y:y+19,w:13,h:11};
    for(const [q,ch,ok] of [[mq,'\u2212',v>5],[pq,'+',left>0]]){
      const hv = inRect(mouse,q) && ok;
      r(q.x,q.y,q.w,q.h, hv?'#5a2a72':(ok?'#2a1140':'#1a0f28'));
      textC(ch, q.x+q.w/2, q.y+1, ok?(hv?P.bone:P.dim):'#3d2255', FONT.sm);
    }
    text(st.blurb, 224, y+21, '#7a5f96', FONT.sm);
  }

  const ready = left===0 && GS.name.trim().length>0;
  const bq = {x:104,y:164,w:112,h:17};
  const hv = inRect(mouse,bq) && ready;
  r(bq.x,bq.y,bq.w,bq.h, ready?(hv?P.hot:'#8e1148'):'#241134');
  r(bq.x,bq.y,bq.w,1, ready?'#ff9ac8':'#3d2255');
  textC(ready?'STEP OFF THE BUS':'NAME AND 100 POINTS', 160, bq.y+5,
        ready?P.bone:'#6b4d8a', FONT.sm);
  textC('THIS SPLIT IS LOCKED FOR THE WHOLE PLAYTHROUGH', 160, 185, '#6b4d8a', FONT.sm);
}

/* ---- ARRIVAL INTERLUDE: full vector/synthwave mode ---- */
let driveT = 0;
function drawDrive(t){
  const k = driveT/1000;
  const gr = g.createLinearGradient(0,0,0,118);
  gr.addColorStop(0,'#120826'); gr.addColorStop(.5,'#6b2470'); gr.addColorStop(1,'#e8557f');
  g.fillStyle = gr; g.fillRect(0,0,W,118);
  vectorSun(160, 112, 40 + Math.sin(k/2)*2, t);
  r(0,116,W,2,'#ffb0d0');
  vectorGrid(t, 118, 2.6);
  const pass = (k*1.15) % 1;
  for(let i=0;i<5;i++){
    const kk = ((i/5) + pass) % 1, sc = Math.pow(kk, 2.2);
    const x = 160 + (kk<.5?-1:1) * (16 + sc*300), y = 118 + sc*74, h = 8 + sc*80;
    if(y < 200) vectorPalm(x, y, h, 'rgba(20,8,40,'+(0.45+sc*0.5)+')');
  }
  // the bus, receding
  const bs = 1 - Math.min(1, k/11);
  const bw = 34 + bs*22, bh = 20 + bs*12, bx = 160 - bw/2, by = 150 - bs*14;
  r(bx, by, bw, bh, '#241134');
  r(bx, by, bw, 2, '#5a2a72');
  r(bx+3, by+3, bw-6, bh*0.42, 'rgba(120,220,230,.45)');
  r(bx+2, by+bh, bw-4, 2, '#120826');
  r(bx-2, by+bh-4, 3, 3, '#ff5f6d'); r(bx+bw-1, by+bh-4, 3, 3, '#ff5f6d');
  g.globalAlpha=.5; r(bx-4, by+bh+2, bw+8, 1, '#ff2e88'); g.globalAlpha=1;

  const lines = [
    ['THREE HUNDRED MILES OF NOTHING,', 'AND THEN ALL OF THIS AT ONCE.'],
    ['VANITY SHORES — POP. 41,000.', 'VISITORS: EVERYBODY ELSE.'],
    ['YOU HAVE ' + money() + ', ONE BAG,', 'AND AN ORDER OF OPERATIONS.'],
    ['FIRST YOU GET THE MONEY.', 'YOU ARE FAIRLY SURE OF THE ORDER.']
  ];
  const idx = Math.min(lines.length-1, Math.floor(k/2.7));
  const fadeIn = Math.min(1, (k - idx*2.7)/0.5), out = Math.min(1, Math.max(0,(idx*2.7+2.4 - k)/0.4));
  g.globalAlpha = Math.min(fadeIn, out);
  textC(lines[idx][0], 160, 22, P.bone, FONT.sm);
  textC(lines[idx][1], 160, 34, P.gold, FONT.sm);
  g.globalAlpha = 1;
  if(Math.floor(t/700)%2===0) textC('CLICK TO SKIP', 160, 190, '#7a5f96', FONT.sm);
  if(k > 11.2) startLevelCard();
}

/* ---- LEVEL CARD ---- */
let cardT = 0;
function startLevelCard(){ GS.scene = 'levelcard'; cardT = 0; Audio_.scene('play');
  Audio_.ambience('boardwalk'); }
function drawCard(t){
  r(0,0,W,200,'#0d0518');
  const k = Math.min(1, cardT/700);
  g.globalAlpha = k;
  textC('ACT 1,  LEVEL 1', 160, 74, P.dim, FONT.sm);
  r(96, 88, 128, 1, 'rgba(255,46,136,.6)');
  textC('SMALL CHANGE', 160, 96, P.gold, FONT.big);
  g.globalAlpha = Math.max(0, Math.min(1,(cardT-900)/600));
  textC('he flicked a quarter at you. give it back.', 160, 126, '#7a5f96', FONT.sm);
  g.globalAlpha = 1;
  if(cardT > 1800 && Math.floor(t/600)%2===0)
    textC('CLICK TO CONTINUE', 160, 172, '#5a4470', FONT.sm);
  if(cardT > 4200) enterPlay();
}
function enterPlay(){
  GS.scene = 'play';
  showNameBox(false);                                 // never leave it holding focus
  const rm = ROOMS[GS.room];
  GS.player.x = rm.spawn[0]; GS.player.y = rm.spawn[1];
  GS.player.tx = GS.player.x; GS.player.ty = GS.player.y;
  Audio_.scene('play');
  Audio_.ambience(GS.room==='underpier'?'deep':GS.room==='pier'?'surf':'boardwalk');
  if(rm.onEnter) rm.onEnter();
  saveGame();
}

/* ---- LEVEL COMPLETE ---- */
function routeNotes(){
  const n = [];
  if(GS.flags.gotPremium)  n.push('Talked the shark out of the good bag.');
  else if(GS.flags.brendaWary) n.push('Stood there until the shark gave in.');
  else n.push('Sat through the pitch. Possibly twice.');
  if(GS.flags.dickiePaid)  n.push('Drew Dickie a crowd and split the jar.');
  if(GS.flags.readingDone) n.push('Paid LaRue two bits for the tell.');
  if(GS.flags.monteEnemy)  n.push('Took Monte by the wrist. He will remember it.');
  else if(GS.flags.monteWon) n.push('Beat the shells without watching the shells.');
  for(const who of ['chip','brenda']){
    const tier = heatTier(heatOf(who));
    if(tier) n.push(CAST[who].name + ' ' + tier + '.');
  }
  const fin = { plain:'Made Chip put his hand out first, and said nothing at all.',
                charm:'Made Chip say it was a nice hundred dollars, out loud, in public.',
                force:'Closed Chip\'s fingers around it one at a time.',
                math:'Paid Chip back at his own interest rate.',
                heat:'Made Chip take it slowly, while everybody watched.' }[GS.flags.chipEnding];
  if(fin) n.unshift(fin);
  if(secretsFound())
    n.push('Found ' + secretsFound() + ' of ' + SECRET_COUNT + ' things nobody mentioned.');
  return n;
}
/* The tickers, one line. They keep counting through Levels 2-11; the closing
   card of the whole game is this same table, totalled. */
function tallyStrip(){
  const parts = [];
  for(const k in TALLY){
    const v = tallied(k); if(!v) continue;
    parts.push(TALLY[k].short + ' ' + (TALLY[k].cash ? '$' + (v/100).toFixed(2) : v));
  }
  return parts.join('   \u00b7   ');
}
function drawComplete(t){
  const el = t - GS.completeAt;
  r(0,0,W,200,'#0d0518');
  vectorGrid(t, 150, .6);
  g.globalAlpha=.6; r(0,150,W,50,'#0d0518'); g.globalAlpha=1;
  g.globalAlpha = Math.min(1, el/500);
  textC('LEVEL COMPLETE', 160, 10, P.surf, FONT.bg);
  r(60,26,200,1,'rgba(255,46,136,.5)');
  textC('ACT 1, LEVEL 1 — SMALL CHANGE', 160, 32, P.dim, FONT.sm);

  const nm = (GS.name||'THE NEWCOMER').toUpperCase();
  textC(nm + '  ·  ' + money(), 160, 48, P.gold, FONT.bg);
  const s = S();
  textC('MONEY ' + s.money + '   FIGHTING ' + s.fight + '   CHARM ' + s.charm, 160, 66, '#a08cb4', FONT.sm);

  const notes = routeNotes();
  let ny = 82;
  for(let i=0;i<notes.length && ny < 134;i++){
    g.globalAlpha = Math.min(1, Math.max(0,(el - 600 - i*260)/400));
    const ls = wrap(notes[i], FONT.sm, 244);
    text('\u00b7', 40, ny+1, P.hot, FONT.sm);
    for(let j=0;j<ls.length;j++) text(ls[j], 50, ny+j*10, P.bone, FONT.sm);
    ny += ls.length*10 + 3;
  }
  const strip = tallyStrip();
  if(strip){
    g.globalAlpha = Math.min(1, Math.max(0,(el-1500)/500));
    textC(strip, 160, 138, P.gold, FONT.sm);
    g.globalAlpha = 1;
  }
  /* The card is out of vertical room, so the code earns its space by replacing
     the flavour line under NEXT — the button already says what happens next. */
  g.globalAlpha = Math.min(1, Math.max(0,(el-1800)/600));
  r(30, 148, 260, 1, 'rgba(255,46,136,.35)');
  textC('CODE   ' + makeCode(), 160, 152, P.gold, FONT.bg);
  textC(codeGloss() + '  —  write it down, or send it to somebody',
        160, 169, '#6b5a86', FONT.sm);
  g.globalAlpha = 1;

  const canL2 = typeof enterLevel2 === 'function' && !GS.flags.level2Done;
  const bq = { x: canL2 ? 30 : 106, y:180, w:108, h:15 }, hv = inRect(mouse,bq);
  r(bq.x,bq.y,bq.w,bq.h, hv?P.hot:'#2a1140'); r(bq.x,bq.y,bq.w,1, hv?'#ff9ac8':'#5a2a72');
  textC('PLAY AGAIN', bq.x + bq.w/2, bq.y+4, hv?P.bone:P.dim, FONT.sm);
  if(canL2){
    const cbq = {x:184,y:180,w:108,h:15}, chv = inRect(mouse,cbq);
    r(cbq.x,cbq.y,cbq.w,cbq.h, chv?P.hot:'#3d1f52');
    r(cbq.x,cbq.y,cbq.w,1, chv?'#ff9ac8':'#7a4fa0');
    textC('CONTINUE ▶', cbq.x + cbq.w/2, cbq.y+4, chv?P.bone:P.gold, FONT.sm);
  }
}

/* ---- DEATH ---- */
function drawDeath(t){
  drawRoom(t);
  g.globalAlpha = .82; r(0,0,W,200,'#12040c'); g.globalAlpha = 1;
  const d = DEATHS[GS.deathKind] || DEATHS.road;
  const x=20, bw=280;
  const lines = wrap(d.body, FONT.dlg, bw-24);
  const stg   = wrap(d.sting, FONT.dlg, bw-24);
  const toll  = wrap(deathToll(), FONT.dlg, bw-24);
  const lh = (lines.length + stg.length + toll.length) > 10 ? 11 : 13;
  const bh = 28 + lines.length*lh + 8 + stg.length*lh + 8 + toll.length*lh + 24;
  const y  = clamp(Math.round((200-bh)/2), 4, 40);
  r(x,y,bw,bh,'#1a0610');
  r(x,y,bw,2,'#e02a4a'); r(x,y+bh-2,bw,2,'#e02a4a');
  r(x,y,2,bh,'#e02a4a'); r(x+bw-2,y,2,bh,'#e02a4a');
  textC(d.head, 160, y+6, '#ff5f6d', FONT.bg);
  r(x+40, y+22, bw-80, 1, 'rgba(224,42,74,.5)');
  let ty = y+28;
  for(const ln of lines){ text(ln, x+12, ty, P.bone, FONT.dlg); ty += lh; }
  ty += 8;
  for(const ln of stg){ text(ln, x+12, ty, '#c49ab0', FONT.dlg); ty += lh; }
  ty += 8;
  for(const ln of toll){ text(ln, x+12, ty, GS.deathToll ? P.gold : '#7a6a90', FONT.dlg); ty += lh; }
  const bq = {x:110,y:y+bh-19,w:100,h:14}, hv = inRect(mouse,bq);
  r(bq.x,bq.y,bq.w,bq.h, hv?'#e02a4a':'#3a0c18');
  textC('TRY AGAIN', 160, bq.y+3, hv?P.bone:'#ff8a9a', FONT.sm);
}

/* ---------- 6. INPUT, LOOP, BOOT ----------------------------------------- */
const nameBox = document.getElementById('namebox');
function toCanvas(e){
  const b = cvs.getBoundingClientRect();
  return { x:(e.clientX-b.left)/b.width*W, y:(e.clientY-b.top)/b.height*200 };
}
cvs.addEventListener('pointermove', e => { const p = toCanvas(e); mouse.x=p.x; mouse.y=p.y; });
cvs.addEventListener('pointerdown', e => { e.preventDefault(); const p = toCanvas(e);
  mouse.x=p.x; mouse.y=p.y; handleClick(p); });

function handleClick(p){
  Audio_.start();
  switch(GS.scene){
    case 'title': {
      const fresh = !localStorage.getItem(SAVE_KEY);
      if(p.y>=166 && p.y<=178){                       // ENTER CODE
        Audio_.sfx('click'); GS.codeBuf=''; GS.codeBad=0;
        GS.scene='code'; showNameBox(true); return; }
      if(!fresh && p.y>=154 && p.y<=166){ if(loadGame()){ Audio_.sfx('click');
        if(GS.flags.level2Done){ GS.scene='complete2'; GS.complete2At=clock; }
        else if(GS.flags.levelDone){ GS.scene='complete'; GS.completeAt=clock; }
        else enterPlay(); return; } }
      Audio_.sfx('click'); wipeSave(); GS.scene='create'; showNameBox(true); return; }
    case 'create': return createClick(p);
    case 'code': {
      if(inRect(p,{x:96,y:126,w:60,h:16})) return submitCode();
      if(inRect(p,{x:164,y:126,w:60,h:16})){
        Audio_.sfx('click'); showNameBox(false); GS.scene='title'; }
      return; }
    case 'drive':  Audio_.sfx('click'); startLevelCard(); return;
    case 'levelcard': if(cardT>700){ Audio_.sfx('click'); enterPlay(); } return;
    case 'death': Audio_.sfx('click'); reviveFromDeath(); return;
    case 'cutaway': advanceCutaway(); return;
    case 'complete': {
      const canL2 = typeof enterLevel2 === 'function' && !GS.flags.level2Done;
      const pbq = { x: canL2 ? 30 : 106, y:180, w:108, h:15 };
      if(inRect(p,pbq)){ Audio_.sfx('click'); wipeSave(); location.reload(); return; }
      if(canL2){
        const cbq = {x:184,y:180,w:108,h:15};
        if(inRect(p,cbq)){ Audio_.sfx('click'); enterLevel2(); return; }
      }
      return; }
    case 'levelcard2': if(card2T>700){ Audio_.sfx('click'); enterPlay2(); } return;
    case 'complete2': {
      const bq = {x:106,y:180,w:108,h:15};
      if(inRect(p,bq)){ Audio_.sfx('click'); wipeSave(); location.reload(); } return; }
    case 'play': return playClick(p);
  }
}
function playClick(p){
  if(p.y < 12){
    for(let i=0;i<2;i++) if(inRect(p, audioBtn(i))){
      Audio_.start(); i===0 ? Audio_.toggleMusic() : Audio_.toggleSfx();
      Audio_.sfx('click'); syncAudioButtons(); return; }
  }
  if(p.y >= BAR_Y){
    for(let i=0;i<VERBS.length;i++) if(inRect(p, verbRect(i))){
      GS.verb = VERBS[i].id; if(GS.verb!=='use') GS.sel=null; Audio_.sfx('click'); return; }
    for(let i=0;i<6;i++){ const id = GS.inv[i];
      if(id && inRect(p, slotRect(i))){
        Audio_.sfx('click');
        if(GS.verb==='look'){ lookItem(id); }
        else { GS.sel = (GS.sel===id ? null : id); GS.verb='use'; }
        return; } }
    return;
  }
  clickScene(p);
}
function createClick(p){
  for(let i=0;i<CC_ROWS.length;i++){
    const row = CC_ROWS[i], y = 58 + i*15, n = TRAITS[row.pool].length;
    if(inRect(p,{x:46,y:y,w:11,h:12})){ CC.i[row.key] = (CC.i[row.key]+n-1)%n; Audio_.sfx('click'); return; }
    if(inRect(p,{x:101,y:y,w:11,h:12})){ CC.i[row.key] = (CC.i[row.key]+1)%n; Audio_.sfx('click'); return; }
  }
  for(let i=0;i<3;i++){
    const st = STAT_ROWS[i], y = 46 + i*36, left = 100 - ccTotal();
    if(inRect(p,{x:190,y:y+19,w:13,h:11}) && CC.stats[st.key]>5){ CC.stats[st.key]--; Audio_.sfx('click'); return; }
    if(inRect(p,{x:206,y:y+19,w:13,h:11}) && left>0){ CC.stats[st.key]++; Audio_.sfx('coin'); return; }
    if(inRect(p,{x:190,y:y+10,w:116,h:7})){
      const want = clamp(Math.round((p.x-190)/116*90), 5, 90);
      const others = ccTotal() - CC.stats[st.key];
      CC.stats[st.key] = clamp(want, 5, 100-others); Audio_.sfx('click'); return; }
  }
  if(inRect(p,{x:8,y:40,w:108,h:13})){ nameBox.focus(); return; }
  if(100-ccTotal()===0 && GS.name.trim() && inRect(p,{x:104,y:164,w:112,h:17})){
    GS.look = ccLook(); GS.stats = { money:CC.stats.money, fight:CC.stats.fight, charm:CC.stats.charm };
    GS.cash = GS.stats.money * ECONOMY.startPerMoneyPoint;   // what you brought with you
    Audio_.lean(GS.stats.money, GS.stats.fight, GS.stats.charm);
    Audio_.sfx('fanfare'); showNameBox(false);
    if(GS.pendingLevel > 1){                       // arrived by code, not by bus
      const lv = GS.pendingLevel; GS.pendingLevel = 0; saveGame();
      if(lv >= 2 && typeof enterLevel2 === 'function'){ enterLevel2(); return; }
    }
    GS.scene = 'drive'; driveT = 0; Audio_.scene('play'); saveGame();
  }
}
function showNameBox(on){
  nameBox.style.display = on ? 'block' : 'none';
  if(on){ nameBox.value = GS.name; positionNameBox(); setTimeout(()=>nameBox.focus(), 60); }
}
function positionNameBox(){
  const b = cvs.getBoundingClientRect(), wrapB = document.getElementById('bezelwrap').getBoundingClientRect();
  const sx = b.width/W, sy = b.height/200;
  nameBox.style.left   = (b.left - wrapB.left + 8*sx) + 'px';
  nameBox.style.top    = (b.top  - wrapB.top  + 40*sy) + 'px';
  nameBox.style.width  = (108*sx) + 'px';
  nameBox.style.height = (13*sy) + 'px';
  nameBox.style.fontSize = Math.max(10, Math.round(11*sy)) + 'px';
}
nameBox.addEventListener('input', () => {
  if(GS.scene === 'code'){ GS.codeBuf = nameBox.value.toUpperCase().slice(0,9); return; }
  GS.name = nameBox.value.replace(/[<>]/g,'');
});
nameBox.addEventListener('keydown', e => {
  if(e.key !== 'Enter') return;
  e.preventDefault();
  if(GS.scene === 'code') return submitCode();
  nameBox.blur();
});

addEventListener('keydown', e => {
  if(document.activeElement === nameBox) return;      // typing a name
  const k = e.key.toLowerCase();
  if(k==='m'){ Audio_.start(); Audio_.toggleMusic(); syncAudioButtons(); return; }
  if(k==='n'){ Audio_.start(); Audio_.toggleSfx();   syncAudioButtons(); return; }
  if(GS.scene==='play'){
    if(k==='1'){ GS.verb='look'; GS.sel=null; }
    if(k==='2'){ GS.verb='talk'; GS.sel=null; }
    if(k==='3'){ GS.verb='use'; }
    if(k==='4'){ GS.verb='take'; GS.sel=null; }
    if(k===' '||k==='enter'){ if(GS.msg && !GS.msg.choices) advanceMsg(); e.preventDefault(); }
    if(k==='escape'){ GS.sel=null; }
  } else if(k===' ' && GS.scene!=='create'){ handleClick(mouse); e.preventDefault(); }
});

/* ---- presentation scaling ---- */
let scaleMode = 'auto';
function fitScreen(){
  const availW = innerWidth - 32, availH = innerHeight - 118;
  let n = Math.min(Math.floor(availW/W), Math.floor(availH/200));
  n = Math.max(1, Math.min(4, n));
  if(scaleMode !== 'auto') n = Math.min(scaleMode, Math.max(1, Math.floor(availW/W)));
  const want = Math.max(2, n);                    // never rasterise type below 2x
  if(want !== SC){ SC = want; TXSC = SC; _tcache.clear(); }
  if(cvs.width !== W*SC){ cvs.width = W*SC; cvs.height = 200*SC; }
  cvs.style.width  = (W*n) + 'px';
  cvs.style.height = (200*n) + 'px';
  cvs.style.imageRendering = (n === SC) ? 'pixelated' : 'auto';
  positionNameBox();
}
addEventListener('resize', fitScreen);

/* ---- status strip under the cabinet ---- */
const strip = document.getElementById('strip');
function updateStrip(){
  if(GS.scene==='title' || GS.scene==='create'){
    strip.innerHTML = '<span>A Sierra-style hustle on a boardwalk that deserves it</span>'; return; }
  const s = S();
  strip.innerHTML =
    '<span><b>' + (GS.name||'—').replace(/[<>&]/g,'') + '</b></span>' +
    '<span class="sep">|</span>' +
    '<span class="m">MONEY ' + s.money + '</span>' +
    '<span class="f">FIGHTING ' + s.fight + '</span>' +
    '<span class="c">CHARM ' + s.charm + '</span>' +
    '<span class="sep">|</span>' +
    '<span>PURSE <b class="m">' + money() + '</b></span>';
}

const btnMusic = document.getElementById('btnMusic');
const btnSfx   = document.getElementById('btnSfx');
function syncAudioButtons(){
  btnMusic.textContent = 'Music: ' + (Audio_.musicOn ? 'On' : 'Off');
  btnSfx.textContent   = 'Sound FX: ' + (Audio_.sfxOn ? 'On' : 'Off');
}
btnMusic.onclick = () => { Audio_.start(); Audio_.toggleMusic(); syncAudioButtons(); };
btnSfx.onclick   = () => { Audio_.start(); Audio_.toggleSfx();   syncAudioButtons(); };
document.getElementById('btnScale').onclick = () => {
  scaleMode = scaleMode==='auto' ? 1 : scaleMode>=4 ? 'auto' : scaleMode+1; fitScreen(); };
document.getElementById('btnWipe').onclick = () => {
  wipeSave(); location.reload(); };

/* ---- main loop ---- */
let last = performance.now();
function frame(now){
  const dt = Math.min(0.05, (now-last)/1000); last = now; clock = now;
  g.setTransform(SC, 0, 0, SC, 0, 0);             // a resize resets canvas state
  g.imageSmoothingEnabled = false;
  if(GS.scene==='play'){ updatePlayer(dt); }
  if(GS.scene==='levelcard') cardT += dt*1000;
  if(GS.scene==='levelcard2' && typeof card2T === 'number') card2T += dt*1000;
  if(GS.scene==='drive')     driveT += dt*1000;

  switch(GS.scene){
    case 'title':      drawTitle(now); break;
    case 'create':     drawCreate(now); break;
    case 'code':       drawCodeEntry(now); break;
    case 'drive':      drawDrive(now); break;
    case 'levelcard':  drawCard(now); break;
    case 'levelcard2': if(typeof drawCard2==='function') drawCard2(now); break;
    case 'complete':   drawComplete(now); break;
    case 'complete2':  if(typeof drawComplete2==='function') drawComplete2(now); break;
    case 'death':      drawDeath(now); break;
    case 'cutaway':    drawCutaway(now); break;
    default:           drawRoom(now);
  }
  if(fadeDir){                                    // room-to-room wipe
    fade += fadeDir * dt * 3.4;
    if(fade >= 1){ fade = 1; fadeDir = -1; const f = fadeThen; fadeThen = null; if(f) f(); }
    else if(fade <= 0){ fade = 0; fadeDir = 0; }
    g.globalAlpha = clamp(fade,0,1); r(0,0,W,200,'#0d0518'); g.globalAlpha = 1;
  }
  if(GS.scene!=='create') drawCursor();
  updateStrip();
  requestAnimationFrame(frame);
}

/* ---- boot ---- */
function boot(){
  fitScreen();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => _tcache.clear());
  Audio_.lean(GS.stats.money, GS.stats.fight, GS.stats.charm);
  requestAnimationFrame(frame);
}
boot();
