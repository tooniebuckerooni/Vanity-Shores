/* Vanity Shores — level2.js
 *
   LEVEL 2 CONTENT — "Other People's Money."
      Chip stops mocking and starts competing. You take his crowd in public.
      Ships at Sierra 72 for its OWN rooms; Level 1 stays at 40 forever.
 *
   The four L1 backdrops are recomposed here as separate rooms (arrival2,
   bwalk2, pier2, under2) so the Level 1 baked cache is never touched — mixing
   scales inside one baked backdrop is the class of bug we do not want. The
   fifth room, the wall, is new: neon, spot-lit, and where Chip runs the
   Winthrop Open Hustle in front of anybody who will look.
 *
   Load order: this file follows level1.js and precedes shell.js. It shares
   one global scope with everything else; nothing here is a module.
 */
"use strict";

/* ---------- L2 CAST ADDITIONS -------------------------------------------- */
Object.assign(CAST, {
  marnie:{ pose:'hold', name:'Marnie Sable', skin:'fair', role:'Fired cocktail waitress. First recruit.',
           where:'Boardwalk bench, then the wall',
           hair:'blowout', hairC:'#5a1030', hairC2:'#8e2050', figure:'hourglass',
           shirtStyle:'halter', shirt:'#e8547a', shirtD:'#a82e5a', inner:'#f5e6d3',
           skirt:'#241134', shoes:'#241134', lips:'#c8143e', acc:'hoops',
           eyes:'#3a2a2a', build:-1, size:1 },

  hoyt:{ pose:'stiff', name:'Hoyt Winthrop', skin:'burn', role:'Chip’s cousin. Rich, drunk, and next.',
         where:'Under the light at the wall',
         hair:'pomp', hairC:'#c4a05a', hairC2:'#e0c084',
         shirtStyle:'polo', shirt:'#f2ead0', shirtD:'#c4b892', inner:'#e94f6a',
         pants:'#d8cfa8', pantsD:'#a89874', shoes:'#8a5a3a', acc:'shades',
         eyes:'#5a7a4a', build:1, size:2 },

  vince:{ pose:'crossed', name:'Vince', skin:'deep', role:'The man on the door at the wall. Not for hire.',
          where:'Kingfisher service door, the wall',
          hair:'bald', hairC:'#2a1a1a', hairC2:'#4a2c2c',
          shirtStyle:'blazer', shirt:'#0a0f18', shirtD:'#050810', inner:'#0a0f18',
          pants:'#0a0f18', pantsD:'#050810', shoes:'#0a0f18', acc:'shades',
          eyes:'#2a1a1a', build:1, size:2, still:true }
});

/* ---------- L2 ECONOMY ROWS ---------------------------------------------- *
   Adds rows to the same table. Cents. Level 1's simulate() ignores anything
   it does not name, so this cannot destabilise the L1 balance checks. */
Object.assign(ECONOMY.earn, {
  marnieRunner:{ base:2000, charm:3500, money:3000, fight:2500 },
  hoytBurn:    { base:6000, charm:9500, money:8500, fight:7500 },
  wallSkim:    { base:12000, charm:18000, money:16000, fight:14000 },
  hoytComp:    { base:1500,  charm:2500,  money:2500,  fight:2000  }
});
const L2 = {
  ante:      10000,    // 100 to sit down at the wall
  cousinHeat:35,       // enough of Hoyt's regard to run him out of pocket
  pot:       30000     // what actually lands on the felt over the night
};

/* ---------- L2 GATES ----------------------------------------------------- */
Object.assign(GATES, {
  marnieHire:    { stat:'any', need:GATE, opens:'a better cut with Marnie' },
  hoytBurn:      { stat:'any', need:GATE, opens:'a fatter burn on Hoyt' },
  wallShowdown:  { stat:'any', need:GATE, opens:'a build-specific way to fold Chip in public' }
});

/* ---------- L2 ITEMS ----------------------------------------------------- */
Object.assign(ITEMS, {
  flyer:    { name:'a hand-lettered flyer', desc:'"WINTHROP OPEN HUSTLE — 100 to sit, and everything after is your fault. Wall of the strip, after dark." Hand-lettered because a printer keeps receipts.' },
  matchbook:{ name:'a Kingfisher matchbook',  desc:'Black card, gold KINGFISHER lettered in a hand that has not changed since 1972. Three matches missing. A phone number on the strike-pad in eyeliner, half worn off.' },
  mcard:    { name:'Marnie’s coaster',   desc:'"M. Sable. Available." Written in eyeliner on the back of a Shoreline drink coupon. The front carries a lipstick print you take as a signature.' },
  ring:     { name:'a signet ring',           desc:'Chip’s signet. Gold, heavy, and the crest so old it has become just "a crest." It slides on and off your finger with a familiarity neither of you is going to bring up again.' }
});

/* Custom icons for the L2 items. Reassigns drawItemIcon so its switch is
   handled here first and the L1 icons fall through untouched. Same technique
   the level uses elsewhere: extend a registry from your own file. */
const _drawItemIconL1 = drawItemIcon;
drawItemIcon = function(id, x, y){                        // eslint-disable-line
  switch(id){
    case 'flyer':
      r(x+3, y+3, 12, 14, '#efe4c8'); r(x+3, y+3, 12, 1, '#c4b892');
      r(x+5, y+6, 8, 1, '#3d1f52'); r(x+5, y+9, 6, 1, '#3d1f52');
      r(x+5, y+12, 7, 1, '#3d1f52'); px(x+13, y+15, P.hot); return;
    case 'matchbook':
      r(x+3, y+4, 12, 12, '#120a1e'); r(x+3, y+4, 12, 1, '#3d2255');
      textC('KF', x+9, y+7, P.gold, FONT.sm);
      r(x+4, y+13, 10, 1, '#8a3040'); return;
    case 'mcard':
      r(x+2, y+5, 14, 9, '#e8dcc0'); r(x+2, y+5, 14, 1, '#c8b898');
      r(x+11, y+7, 4, 3, '#c8143e');
      r(x+4, y+10, 6, 1, '#3a1d2e'); return;
    case 'ring':
      blob(x+9, y+10, 5, 5, '#c98a1a'); blob(x+9, y+10, 3.5, 3.5, P.gold);
      r(x+8, y+8, 3, 3, '#2a1140'); px(x+9, y+8, '#8ec4f0'); return;
  }
  return _drawItemIconL1(id, x, y);
};

/* ---------- L2 SCENERY --------------------------------------------------- *
   All new prop functions live here so scenery.js stays shut. Composed for a
   72px cast: walk bands sit low, horizons ride high, props are half again as
   large as their Level 1 cousins. */

const NIGHT = {                                    // the L2 sky palette
  sky1:'#3d1a5e', sky2:'#5b2170', sky3:'#8a2f6e', sky4:'#160b2a',
  cloudR:'#c4304a', cloudP:'#3d1a5e', cloudG:'#8a2a4e',
  neon1:'#ff2e88', neon2:'#21e0d6', neon3:'#ffc23d', neon4:'#4de0a0'
};

function paintNightSky(y0, y1){
  const grd = g.createLinearGradient(0,y0,0,y1);
  grd.addColorStop(0,   NIGHT.sky4); grd.addColorStop(0.45, NIGHT.sky1);
  grd.addColorStop(0.72,NIGHT.sky2); grd.addColorStop(1,    NIGHT.sky3);
  g.fillStyle = grd; g.fillRect(0,y0,W,y1-y0);
  const q = rnd32(19);
  for(let i=0;i<58;i++){ const sx=(q()*W)|0, sy=(q()*(y1-y0)*0.7)|0;
    g.globalAlpha = .18+q()*.65; px(sx, y0+sy, P.bone); }
  g.globalAlpha = 1;
  /* one crescent, up high, so the eye has somewhere to rest */
  g.globalAlpha=.85; blob(258, y0+12, 8, 8, '#ffe9a8');
  g.globalAlpha=1; blob(254, y0+11, 7.5, 7.5, NIGHT.sky4);
  g.globalAlpha=.7; px(266, y0+11, P.gold); px(268, y0+14, P.gold);
  g.globalAlpha=1;
}
function paintNightSea(y0, y1){
  const grd = g.createLinearGradient(0,y0,0,y1);
  grd.addColorStop(0,'#1a0e2e'); grd.addColorStop(.5,'#2a1a4e'); grd.addColorStop(1,'#3a2570');
  g.fillStyle = grd; g.fillRect(0,y0,W,y1-y0);
  for(let i=0;i<4;i++){
    const yy = y0 + 2 + i*Math.max(2,((y1-y0)/5)|0);
    g.globalAlpha = .22; r(0,yy,W,1,'#8a5fa8'); g.globalAlpha = 1;
  }
}
function nightGlints(y0, y1, t){
  const q = rnd32(((t/200)|0) % 64);
  g.globalAlpha = .55;
  for(let i=0;i<24;i++){
    const gx = (q()*W)|0, gy = (y0 + q()*(y1-y0))|0;
    if(q() < .35) r(gx, gy, 1+((q()*2)|0), 1, q()>.5?NIGHT.neon2:'#e8547a');
  }
  g.globalAlpha = 1;
}

/* the strip's tower at night — same silhouette, now lit from inside */
function nightSkyline(baseY){
  const towers = [[8,32,'#241134'],[26,22,'#1a0d24'],[44,44,'#241134'],
                  [204,26,'#1a0d24'],[254,20,'#1a0d24'],
                  [270,36,'#241134'],[300,24,'#1a0d24']];
  for(const [x,h,c] of towers){
    const w = 14 + (h%3)*4;
    r(x, baseY-h, w, h, c);
    const q = rnd32(x*7);
    for(let yy=baseY-h+3; yy<baseY-2; yy+=3)
      for(let xx=x+2; xx<x+w-2; xx+=3) if(q()>.35) px(xx,yy, q()>.6?P.gold:'#ff8ac0');
  }
  /* the Winthrop, dressed for the evening */
  r(226, baseY-74, 26, 74, '#2a1140');
  r(226, baseY-74, 26, 2, '#5d3689');
  r(234, baseY-84, 10, 10, '#2a1140');
  r(236, baseY-92, 6, 8, '#5d3689');
  const q2 = rnd32(101);
  for(let yy=baseY-70; yy<baseY-4; yy+=4)
    for(let xx=228; xx<250; xx+=3) if(q2()>.22) px(xx,yy, q2()>.5?P.gold:NIGHT.neon2);
  r(230, baseY-84, 18, 1, P.hot);                       // crown running light
  r(230, baseY-82, 18, 1, NIGHT.neon2);
  r(228, baseY-24, 22, 4, P.hot);                       // WINTHROP marquee
  textC('WINTHROP', 239, baseY-24, P.bone, FONT.sm);
}

/* An 80-px canopy for the churro cart at 72 — proportions the L1 cart cannot
   deliver, so this is a rebuild rather than a rescale. */
function bigCart(x, y){                              // y = ground line
  r(x, y-30, 46, 22, '#c04533');
  r(x, y-30, 46, 2, '#e8664e');
  r(x+2, y-27, 42, 15, '#2a1030');
  for(let i=0;i<6;i++) r(x+4+i*7, y-25, 5, 10, i%2?P.gold:'#ff8a3d');
  r(x-3, y-42, 52, 10, '#f0e2c8');                   // striped awning
  for(let i=0;i<52;i+=6) r(x-3+i, y-42, 3, 10, '#c04533');
  r(x, y-8, 46, 4, '#5c3a24');
  r(x+3, y-4, 8, 6, '#1a1420'); r(x+35, y-4, 8, 6, '#1a1420');
  textC('CHURRO', x+23, y-24, P.bone, FONT.sm);
  r(x+8, y-53, 12, 12, P.gold);                      // hanging string lights
  for(let i=0;i<8;i++){ const lx = x-8 + i*8;
    px(lx, y-46, i%2?P.hot:NIGHT.neon2); }
}

function bigBooth(x, y){                             // Brenda's booth after dark, closed
  r(x, y-56, 66, 56, '#3a2450');
  r(x, y-56, 66, 3, '#5b2170');
  r(x-3, y-64, 72, 8, '#241134');
  textC('SHORELINE', x+33, y-63, '#5f93ad', FONT.sm);
  for(let yy=y-52; yy<y-8; yy+=4)
    for(let xx=x+4; xx<x+62; xx+=4) if((xx+yy)%3===0) px(xx, yy, '#4a2a6a');
  r(x+2, y-22, 62, 5, '#3d2255');                    // shuttered table
  r(x+2, y-14, 2, 14, '#1a0f2e'); r(x+58, y-14, 2, 14, '#1a0f2e');
  r(x+6, y-52, 54, 22, '#241134');                   // brochures under a shutter
  r(x+6, y-30, 54, 1, '#5b2170');
  /* A hand-taped flyer, if Brenda took the day off */
  textC('BACK TUESDAY', x+33, y-45, '#8a68ad', FONT.sm);
}

function bigTent(x, y){                              // LaRue at 72, holding court
  for(let i=0;i<50;i++){
    const w = 6 + i*2.1;
    r(x+52-w/2, y-64+i, w, 1, i%6<3 ? '#5b2170' : '#8e3aa8');
  }
  r(x+10, y-18, 84, 18, '#3d1a5e');
  r(x+10, y-18, 84, 1, '#8a4fc0');
  r(x+24, y-16, 56, 14, '#241134');                  // beaded doorway
  for(let i=0;i<56;i+=3) for(let j=0;j<14;j+=3) px(x+24+i, y-16+j, P.gold);
  r(x+50, y-74, 4, 10, P.gold); r(x+48, y-78, 8, 5, P.gold);
  r(x-42, y-52, 58, 30, '#241134');                  // sign
  r(x-42, y-52, 58, 1, P.hot);
  r(x-42, y-24, 58, 1, '#4a1d3a');
  textC('PALMS',  x-13, y-50, P.hot,  FONT.sm);
  textC('READ',   x-13, y-42, NIGHT.neon2, FONT.sm);
  textC('$1',     x-13, y-32, P.gold, FONT.sm);
  textC('AFTER',  x-13, y-25, P.dim, FONT.sm);
}

function bigBandshell(x, y){                         // half again as tall, marquee lit
  r(x, y-74, 112, 50, '#8e5fa8');
  r(x+4, y-80, 104, 6, '#a37cc0');
  for(let i=0;i<6;i++) r(x+10+i*18, y-74, 2, 50, '#6b4586');
  r(x+8, y-70, 96, 46, '#4e3466');
  const grd = g.createLinearGradient(x+8,y-70,x+8,y-24);
  grd.addColorStop(0,'#5e3f7e'); grd.addColorStop(1,'#31204a');
  g.fillStyle = grd; g.fillRect(x+8,y-70,96,46);
  for(let i=1;i<6;i++){ const rr=i*10; g.strokeStyle='rgba(200,160,230,.24)'; g.lineWidth=1;
    g.beginPath(); g.arc(x+56, y-24, rr, Math.PI, 0); g.stroke(); }
  r(x, y-24, 112, 6, '#6b4586');
  r(x, y-24, 112, 1, '#a37cc0');
  r(x+14, y-90, 84, 10, '#241134');
  r(x+14, y-90, 84, 1, P.gold);
  textC('DICKIE VERMOUTH TONITE', x+56, y-89, P.gold, FONT.sm);
}

function foldingTable(x, y){                         // Chip's felt at the wall
  r(x, y-24, 84, 6, '#3a5e3a');
  r(x, y-24, 84, 1, '#5a8a5a');
  r(x+4, y-18, 4, 18, '#241a14'); r(x+76, y-18, 4, 18, '#241a14');
  r(x+6, y-30, 14, 5, '#c8b08a');                    // three shells, larger
  r(x+26, y-30, 14, 5, '#c8b08a');
  r(x+46, y-30, 14, 5, '#c8b08a');
  for(const sx of [x+6,x+26,x+46]){ r(sx+2,y-31,10,1,'#e0cba8'); r(sx,y-25,14,1,'#8a7458'); }
  /* the CHIP name-plate on the table */
  r(x+64, y-30, 18, 6, '#2a1140');
  r(x+64, y-30, 18, 1, P.hot);
  textC('CHIP', x+73, y-30, P.gold, FONT.sm);
}

/* the wall — the neon alley that opens on the Kingfisher door */
function paintWallBackdrop(){
  paintNightSky(0, 62);
  nightSkyline(62);
  /* two low buildings framing the alley */
  r(0, 40, 92, SCENE_H-40, '#1a0d28');
  r(0, 40, 92, 4, '#3d2255');
  for(let yy=48; yy<SCENE_H-6; yy+=8)
    for(let xx=6; xx<80; xx+=8){
      if((xx+yy)%16===0) r(xx, yy, 6, 5, '#3a1d5e');
      else if((xx+yy)%8===0) r(xx, yy, 4, 3, '#2a1140');
    }
  r(228, 46, W-228, SCENE_H-46, '#1a0d28');
  r(228, 46, W-228, 4, '#3d2255');
  for(let yy=54; yy<SCENE_H-6; yy+=8)
    for(let xx=232; xx<W-6; xx+=8){
      if((xx+yy)%14===0) r(xx, yy, 6, 5, '#3a1d5e');
    }
  /* the alley floor: wet asphalt, doing the whole shot's work */
  const grd = g.createLinearGradient(0, 116, 0, SCENE_H);
  grd.addColorStop(0, '#2a1a3e'); grd.addColorStop(.55, '#3d2255');
  grd.addColorStop(1, '#5b2170');
  g.fillStyle = grd; g.fillRect(0, 116, W, SCENE_H-116);
  /* three big spot pools on the asphalt */
  for(const [cx, cy, rr, col] of [[160, 148, 60, 'rgba(255,194,61,.30)'],
                                   [88, 158, 34, 'rgba(255,46,136,.22)'],
                                   [236, 156, 40, 'rgba(33,224,214,.22)']]){
    const rg = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
    rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI*2); g.fill();
  }
  /* the service door, up two steps, under the Kingfisher sign */
  r(94, 66, 132, 52, '#120a1e');                     // recess behind the door
  r(94, 66, 132, 2, '#3d2255');
  r(120, 82, 80, 34, '#1a0d24');                     // the door itself
  r(120, 82, 80, 2, '#3d2255');
  r(120, 82, 2, 34, '#3d2255'); r(198, 82, 2, 34, '#3d2255');
  r(120, 116, 80, 2, '#050810');
  r(140, 96, 40, 4, '#050810');                      // slot for a viewing hatch
  blob(190, 100, 2, 2, P.gold);                      // door knob, brass
  /* two steps up */
  r(112, 116, 96, 6, '#3d2255');
  r(112, 116, 96, 1, '#5b2170');
  r(102, 122, 116, 5, '#241134');
  r(102, 122, 116, 1, '#3d2255');
  /* the KINGFISHER sign, bruise-pink neon */
  r(102, 44, 116, 22, '#0a0410');
  r(102, 44, 116, 1, '#3d2255');
  /* the tin awning above it */
  g.fillStyle = '#241134';
  g.beginPath(); g.moveTo(96, 44); g.lineTo(224, 44);
  g.lineTo(212, 38); g.lineTo(108, 38); g.closePath(); g.fill();
  /* one glass pendant lamp hanging over the table */
  r(158, 40, 4, 12, '#3d2255');
  blob(160, 60, 12, 8, 'rgba(255,194,61,.28)');
  /* the felt table planted here so it's part of the scene */
  foldingTable(118, 158);
  /* an iron stanchion and a velvet rope, either side */
  r(52, 132, 3, 24, P.gold); blob(53, 130, 3, 3, P.gold);
  r(266, 132, 3, 24, P.gold); blob(268, 130, 3, 3, P.gold);
  for(let x=56; x<266; x+=6) r(x, 138, 4, 1, '#8e1148');
}

/* -------- ROOMART for the five L2 rooms ---------------------------------- */
Object.assign(ROOMART, {

  arrival2:{
    horizon: 82,
    bake(){
      paintNightSky(0, 88);
      nightSkyline(88);
      r(0, 88, W, 8, '#3d1a5e');                     // haze band
      r(0, 96, W, 40, '#1a1224');                    // the road, blacker now
      r(0, 96, W, 2, '#3d2255');
      for(let x=8; x<W; x+=24) r(x, 116, 12, 2, P.gold);
      r(0, 136, W, 3, '#5b2170');                    // kerb
      r(0, 139, W, SCENE_H-139, '#241134');          // wet sidewalk
      const q = rnd32(31);
      for(let i=0;i<160;i++){ const sx=(q()*W)|0, sy=(139+q()*(SCENE_H-139))|0;
        g.globalAlpha=.14; px(sx,sy, q()>.5?'#3d2255':'#5b2170'); g.globalAlpha=1; }
      for(let x=0;x<W;x+=48) r(x,139,1,SCENE_H-139,'#3d2255');
      palmTree(80, 142, 54, 5, '#0f0620', '#241a3a');
      palmTree(298, 144, 60, 9, '#0f0620', '#241a3a');
      /* the bus shelter, sized for 72 */
      r(10, 92, 74, 52, '#3d2255');                  // roof + posts, upscaled
      r(12, 96, 70, 34, 'rgba(120,220,230,.20)');
      r(10, 92, 2, 52, '#241134'); r(82, 92, 2, 52, '#241134');
      r(10, 92, 74, 3, '#5b2170');
      r(16, 128, 62, 5, P.wood);                     // bench
      r(20, 133, 4, 12, P.wood3); r(70, 133, 4, 12, P.wood3);
      r(18, 100, 40, 24, P.hot);                     // ad panel: TAN NOW
      r(19, 101, 38, 22, '#2a1140');
      textC('SEAR', 38, 105, P.gold, FONT.sm);
      textC('SUN 24H', 38, 113, NIGHT.neon2, FONT.sm);
      /* the welcome arch, taller */
      r(102, 26, 4, 52, '#5c3a7a'); r(214, 26, 4, 52, '#5c3a7a');
      r(98, 24, 122, 34, '#241134');
      r(98, 24, 122, 1, '#7a4fa0'); r(98, 57, 122, 1, '#5c3a7a');
      textC('WELCOME TO', 160, 28, P.gold, FONT.sm);
      textC('VANITY SHORES', 160, 40, P.hot, FONT.bg);
      for(let i=0;i<122;i+=6) px(98+i, 22, P.gold);
      /* the bus-stop post */
      r(148, 128, 26, 12, '#241134');
      r(158, 140, 3, 20, '#4e3466');
      textC('STOP', 161, 130, P.bone, FONT.sm);
      g.globalAlpha=.28; r(0,SCENE_H-14,W,14,'#8a5fa8'); g.globalAlpha=1;
    },
    live(t){
      const on = REDUCED || Math.floor(t/1100)%9 !== 0;
      neonTube(98, 58, 122, 1, P.hot, on);
      if(!REDUCED && Math.floor(t/300)%2===0) px(180+((t/90)|0)%6, 56, P.gold);
      /* the "SEAR" sign flickers on its own timer, so the shelter reads awake */
      const on2 = REDUCED || Math.floor(t/900)%7 !== 0;
      if(on2){ g.globalAlpha=.35; r(17, 99, 42, 26, P.hot); g.globalAlpha=1; }
    }
  },

  bwalk2:{
    horizon: 62,
    bake(){
      paintNightSky(0, 62);
      nightSkyline(62);
      paintNightSea(62, 90);
      r(0, 90, W, 8, '#3d2255');                     // beach at night
      r(0, 90, W, 1, '#5b2170');
      const q = rnd32(15);
      for(let i=0;i<70;i++) { g.globalAlpha=.35;
        px((q()*W)|0, (90+q()*8)|0, q()>.5?'#5b2170':'#3d2255'); g.globalAlpha=1; }
      /* the boardwalk deck, plusher at 72 */
      const grd = g.createLinearGradient(0, 100, 0, SCENE_H);
      grd.addColorStop(0, '#3d2450'); grd.addColorStop(.5, '#5c3a7a');
      grd.addColorStop(1, '#7a5a9c'); g.fillStyle = grd; g.fillRect(0, 100, W, SCENE_H-100);
      for(let x=0;x<W;x+=30) r(x,100,1,SCENE_H-100,'#241134');
      /* the railings and the two palms */
      railing(0, 100, 96); railing(140, W, 96);
      palmTree(18, 116, 58, 3, '#0f0620', '#241a3a');
      palmTree(290, 114, 52, 8, '#0f0620', '#241a3a');
      bigCart(174, 138);
      /* the timeshare booth (packed up) */
      bigBooth(232, 152);
      /* the bench at the far left */
      r(38, 138, 56, 5, P.wood4);
      r(38, 143, 56, 3, P.wood2);
      r(38, 122, 56, 5, P.wood4);
      r(40, 138, 4, 16, P.wood3); r(88, 138, 4, 16, P.wood3);
      /* stairwell down */
      r(106, 152, 44, 26, '#241134');
      for(let i=0;i<7;i++){
        r(106+i*2, 152+i*4, 44-i*4, 3, i%2?P.wood2:P.wood);
        r(106+i*2, 152+i*4+3, 44-i*4, 1, P.wood3);
      }
      r(104, 140, 3, 14, P.wood2); r(147, 140, 3, 14, P.wood2);
      r(108, 128, 40, 10, '#241134');
      r(108, 128, 40, 1, NIGHT.neon2);
      textC('BEACH', 128, 129, NIGHT.neon2, FONT.sm);
      r(0, SCENE_H-4, W, 4, 'rgba(60,30,20,.35)');
    },
    live(t){
      nightGlints(62, 90, t);
      /* three streams of neon along the strip */
      const on = REDUCED || Math.floor(t/700)%11 !== 0;
      neonTube(232, 96, 68, 2, P.hot, on);            // booth valance
      neonTube(174, 108, 46, 1, NIGHT.neon2, REDUCED || Math.floor(t/560)%8!==0);
      /* string lights along the railings */
      for(let x=6; x<W; x+=14){
        const on2 = REDUCED || Math.floor(t/220 + x)%9 !== 0;
        if(on2) px(x, 94, x%3?P.hot:NIGHT.neon2);
      }
      /* a lit flyer taped to the churro cart if Marnie has been talked to */
      if(GS.flags.marnieMet && !GS.flags.marnieHired){
        r(196, 128, 16, 12, '#efe4c8');
        r(196, 128, 16, 1, '#c4b892');
        textC('OPEN', 204, 129, '#8a2050', FONT.sm);
        textC('HUSTLE', 204, 134, '#8a2050', FONT.sm);
      }
      /* a moth around the churro cart light */
      if(!REDUCED){
        const mx = 190 + Math.sin(t/240)*10, my = 90 + Math.cos(t/300)*5;
        px(mx, my, '#f5e6d3'); px(mx+1, my, '#c8b898');
      }
    }
  },

  pier2:{
    horizon: 60,
    bake(){
      paintNightSky(0, 60);
      nightSkyline(60);
      paintNightSea(60, 122);
      const grd = g.createLinearGradient(0, 122, 0, SCENE_H);
      grd.addColorStop(0, '#3d2450'); grd.addColorStop(.5, '#5c3a7a');
      grd.addColorStop(1, '#7a5a9c'); g.fillStyle = grd; g.fillRect(0, 122, W, SCENE_H-122);
      for(let x=0;x<W;x+=22) r(x,122,1,SCENE_H-122,'#241134');
      for(let i=0;i<8;i++) r(20+i*38, 123, 14, 1, '#3a6a84');
      railing(0, W, 118);
      bigBandshell(4, 138);
      bigTent(212, 138);
      r(112, 128, 56, 8, P.wood2);                   // a crate: larger, standable
      r(112, 128, 56, 1, P.wood4);
      r(0, SCENE_H-4, W, 4, 'rgba(60,30,20,.35)');
    },
    live(t){
      nightGlints(60, 118, t);
      const on = REDUCED || Math.floor(t/520)%7 !== 0;
      neonTube(20, 55, 78, 1, P.gold, on);
      neonTube(212, 68, 6, 6, P.hot, REDUCED || Math.floor(t/800)%5!==0);
      /* a spotlight on the bandshell */
      const gs = g.createRadialGradient(60, 100, 4, 60, 100, 46);
      gs.addColorStop(0, 'rgba(255,194,61,.35)');
      gs.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gs; g.beginPath(); g.arc(60, 100, 46, 0, Math.PI*2); g.fill();
    }
  },

  under2:{
    horizon: 96,
    bake(){
      r(0, 0, W, SCENE_H, '#1a0d24');
      r(0, 0, W, 40, '#0f0620');
      for(let x=0;x<W;x+=14) r(x, 0, 3, 40, '#050310');
      for(let x=0;x<W;x+=14) r(x+3, 0, 1, 40, '#241a3a');
      const grd = g.createLinearGradient(0,40,0,96);
      grd.addColorStop(0,'#1a1228'); grd.addColorStop(1,'#3c2f4a');
      g.fillStyle = grd; g.fillRect(0,40,W,56);
      r(0, 92, W, 22, '#1e2f46');                    // surf, midnight
      r(0, 92, W, 1, '#3a5a72');
      for(let i=0;i<6;i++) r(0, 94+i*4, W, 1, i%2?'#2a4a62':'#12283a');
      const grd2 = g.createLinearGradient(0,114,0,SCENE_H);
      grd2.addColorStop(0,'#241811'); grd2.addColorStop(1,'#3a2a1e');
      g.fillStyle = grd2; g.fillRect(0,114,W,SCENE_H-114);
      const q = rnd32(87);
      for(let i=0;i<220;i++){ g.globalAlpha=.24;
        px((q()*W)|0,(114+q()*(SCENE_H-114))|0, q()>.5?'#241d14':'#6a5842'); g.globalAlpha=1; }
      for(const [x,b] of [[22,138],[92,156],[164,168],[228,158],[292,142]]) piling(x,40,b);
      /* moon-through-the-slats: gold slashes on the sand */
      for(let i=0;i<9;i++){
        g.globalAlpha = .08; g.fillStyle = NIGHT.neon2;
        g.beginPath();
        g.moveTo(i*38+4, 40); g.lineTo(i*38+14, 40);
        g.lineTo(i*38+38, SCENE_H); g.lineTo(i*38+20, SCENE_H); g.closePath(); g.fill();
        g.globalAlpha = 1;
      }
      /* a cold campfire ring where Monte's table used to be */
      blob(196, 158, 26, 8, '#2a1a14');
      blob(196, 156, 22, 6, '#3d2820');
      for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, dx=Math.cos(a)*20, dy=Math.sin(a)*7;
        r(196+dx, 156+dy, 3, 3, '#0f0620'); }
      /* the way back up */
      r(288, 106, 34, 4, P.wood2);
      for(let i=0;i<6;i++) r(288+i*2, 110+i*6, 34-i*3, 4, i%2?P.wood:P.wood2);
      r(272, 96, 44, 10, '#241134'); r(272, 96, 44, 1, NIGHT.neon2);
      textC('BOARDWALK', 294, 97, NIGHT.neon2, FONT.sm);
      /* driftwood, a lost sandal — the tide came in and left the boardwalk's
         cast-offs behind */
      r(40, 168, 24, 4, '#4a3e30'); r(46, 165, 12, 3, '#5a4c3c');
      r(122, 174, 8, 3, '#8a2c3e');
      const vg = g.createRadialGradient(160, 128, 46, 160, 128, 210);
      vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(4,2,10,.78)');
      g.fillStyle = vg; g.fillRect(0,40,W,SCENE_H-40);
    },
    live(t){
      const q = rnd32(((t/180)|0)%40);
      for(let i=0;i<20;i++){ const sx=(q()*W)|0;
        if(q()>.55) r(sx, 104+((q()*6)|0), 2+((q()*3)|0), 1, '#6ca8b8'); }
      g.globalAlpha = REDUCED ? .035 : .035 + Math.sin(t/900)*.02;
      r(0, 40, W, SCENE_H-40, NIGHT.neon2); g.globalAlpha = 1;
    }
  },

  wall:{
    horizon: 62,
    bake(){ paintWallBackdrop(); },
    live(t){
      /* the KINGFISHER sign — pink neon that buzzes and rests */
      const on = REDUCED || Math.floor(t/650)%9 !== 0;
      neonTube(108, 48, 8, 12, P.hot, on);            // K
      neonTube(120, 48, 8, 12, P.hot, on);            // I
      neonTube(132, 48, 8, 12, P.hot, on);            // N
      neonTube(144, 48, 8, 12, P.hot, on);            // G
      neonTube(156, 48, 8, 12, NIGHT.neon2, on);      // F
      neonTube(168, 48, 8, 12, NIGHT.neon2, on);      // I
      neonTube(180, 48, 8, 12, NIGHT.neon2, on);      // S
      neonTube(192, 48, 8, 12, NIGHT.neon2, on);      // H
      neonTube(204, 48, 8, 12, P.gold, on);           // E
      neonTube(216, 48, 8, 12, P.gold, on);           // R
      textC('KINGFISHER', 160, 52, on ? P.bone : '#5a2a72', FONT.bg);
      /* the pendant swinging half a degree */
      const sw = REDUCED ? 0 : Math.sin(t/1400)*.6;
      g.save();
      g.translate(160, 40); g.rotate(sw*0.02); g.translate(-160, -40);
      blob(160, 60, 12, 8, 'rgba(255,194,61,.34)');
      blob(160, 60, 5, 4, '#ffe9a8');
      g.restore();
      /* a very slow ember drifting up from the alley */
      if(!REDUCED){
        const y = 176 - ((t/40)%140);
        px(88, y, P.gold); px(268, y+40>176?y+40-140:y+40, '#ff8a3d');
      }
      /* the door has one gold blade of light under it if closed */
      const doorOn = GS.flags.wallDoorOpen ? 1 : .35;
      g.globalAlpha = doorOn; r(120, 116, 80, 1, P.gold); g.globalAlpha = 1;
      /* if the crew has been recruited, the string lights along the rope come on */
      if(GS.flags.marnieHired || GS.flags.crewChosen){
        for(let x=56; x<266; x+=6){
          const on2 = REDUCED || Math.floor(t/240 + x)%7 !== 0;
          if(on2) px(x, 133, x%3?P.hot:NIGHT.neon2);
        }
      }
    }
  }
});

/* -------- ROOMS for L2 --------------------------------------------------- */
function L2Enter(){                                  // shared onEnter housekeeping
  if(CHAR_H !== 72){ setCharHeight(72); }
  saveGame();
}


Object.assign(ROOMS, {

/* ============================ ARRIVAL 2 ================================== */
arrival2:{
  walk:{ x0:18, x1:302, y0:146, y1:172 }, spawn:[52,158],
  npcs:[],
  onEnter(){ L2Enter();
    if(!GS.flags.l2Arrived){ GS.flags.l2Arrived = true;
      narrate(['The strip after dark. The bus stop is empty, the road is a river of taillights, '+
               'and somebody has taped a flyer to the shelter that was not there before.',
               'Chip’s convertible is not at the kerb any more. He has taken it to the far end '+
               'and parked it under a light. There is a light down there tonight that was not there '+
               'yesterday.'],
              { then:saveGame }); } },
  hotspots:[
    { id:'shelterFlyer', pri:3, name:'the flyer', x:26, y:96, w:56, h:36, approach:[54,148],
      hidden:()=>has('flyer') || GS.flags.flyerRead,
      look:()=>{ GS.flags.flyerRead = true;
        narrate(['Somebody has taped a hand-lettered flyer inside the shelter, over the SEAR ad.',
          '"WINTHROP OPEN HUSTLE — 100 to sit, and everything after is your fault. Wall of '+
          'the strip, after dark. Hosted by CHIP WINTHROP."',
          'The handwriting is exactly the handwriting of a man who is now running a business the '+
          'shape of the business you ran through him yesterday.']); },
      take:()=>{ give('flyer'); GS.flags.flyerRead = true; tick('pocketed');
        narrate(['You pull the flyer off the glass. The tape has been on there about an hour and '+
          'the paper is still warm.','You are now in possession of the schedule of your own night.']); } },

    { id:'shelter2', name:'the bus shelter', x:10, y:92, w:74, h:52, approach:[52,148],
      look:()=>narrate('The bench you did not sit on yesterday. The scratched glass under "I CAME '+
        'HERE BROKE TOO" now has a second line added: "AND SOMEBODY HERE IS ABOUT TO."') },

    { id:'welcome', name:'the welcome sign', x:98, y:22, w:122, h:36,
      look:()=>narrate('"WELCOME TO VANITY SHORES." Underneath it: "YOU LOOK FANTASTIC." At night '+
        'you can see the second sentence is on a separate transformer, and somebody replaces the '+
        'bulbs. Somebody in this town wants you to know you look fantastic all night, and it costs '+
        'them money.') },

    { id:'road2', name:'the road', x:0, y:96, w:320, h:32,
      look:()=>narrate('Four lanes of taillights and cologne. A driver in a lifted truck slows down '+
        'to look at you. A driver in a lower one does not. Both are shopping.'),
      use:()=>{ walkTo(mouse.x, 148, ()=>die('road')); } },

    { id:'east2', name:'the boardwalk', x:296, y:130, w:24, h:44, approach:[292,158],
      exit:true, desc:'The strip runs south into the noise: cologne, cinnamon sugar, and a light '+
        'somebody has hung at the far end that nobody hung last night.',
      go:()=>gotoRoom('bwalk2', 20, 158) }
  ]
},

/* ============================ BOARDWALK 2 ================================ */
bwalk2:{
  walk:{ x0:14, x1:306, y0:140, y1:172 }, spawn:[40,158],
  npcs:[ { id:'marnie', x:70, y:158, look:CAST.marnie,
           hidden:()=>GS.flags.marnieAtWall },
         { id:'dickieN', x:196, y:156, look:CAST.dickie,
           hidden:()=>!GS.flags.dickiePaid || GS.flags.dickieAtWall },
         { id:'gilN', x:250, y:160, look:CAST.gil,
           hidden:()=>!GS.flags.gilPaid,
           extra:()=>{ /* Gil is wearing a Shoreline polo now — one stripe fix */
             r(246, 118, 8, 4, '#2fa8a0'); r(246, 118, 8, 1, '#6fe0d0'); } },
         { id:'zsazN', x:270, y:162, look:CAST.zsazsa,
           hidden:()=>GS.flags.zsaAtWall } ],
  onEnter(){ L2Enter();
    if(!GS.flags.sawStrip2){ GS.flags.sawStrip2 = true;
      narrate(['The boardwalk after dark. The sun is under the water and the strip has come on '+
               'without it — pink here, gold there, whatever colour a cheap bulb makes when '+
               'nobody has agreed on a colour.',
               'Down at the wall a light is burning that was not burning yesterday. Everybody on '+
               'this deck knows exactly what it is for and nobody is walking toward it yet. That '+
               'is a job.']); } },
  hotspots:[
    { id:'marnie', pri:2, name:'the woman on the bench', x:56, y:118, w:32, h:50, approach:[80,166],
      hidden:()=>GS.flags.marnieAtWall,
      look:()=>narrate(['A woman leaning on the bench in a halter she has not bought, smoking a '+
        'cigarette she has. Dark red hair, hoops down to her collarbones, the deep even tan of a '+
        'person who works evenings and sleeps through the sun on principle.',
        'She is looking at the light down the strip, not at you. She is aware you are here.']),
      talk:()=>marnieTalk(),
      useItem:(it)=>{
        if(it==='flyer'){ addHeat('marnie', 3);
          sayAs('marnie', ['"I know what it says, honey. I helped write half of it while he was '+
            'still figuring out how to hold a pen."']); return true; }
        if(it==='matchbook'){ marnieSecret(); return true; }
        if(it==='churro'){ sayAs('marnie', 'Sugar and cinnamon and my whole face. No. Give it here.',
          { then:()=>{ drop('churro'); tick('flirted'); addHeat('marnie', 2); } }); return true; }
        return false; } },

    { id:'dickieN', pri:2, name:'Dickie Vermouth', x:184, y:114, w:24, h:52, approach:[210,164],
      hidden:()=>!GS.flags.dickiePaid || GS.flags.dickieAtWall,
      look:()=>narrate('Off the stage tonight, on the boardwalk, sequin jacket over one arm, '+
        'nursing a paper cup of something that smells medicinal. He looks smaller out of the shell.'),
      talk:()=>dickieL2(),
      useItem:(it)=>{ if(it==='flyer'){ sayAs('dickie','I know, kid. Every crown gets one before '+
        'they take it off.'); return true; } return false; } },

    { id:'gilN', pri:2, name:'the man in the polo', x:240, y:114, w:22, h:54, approach:[240,166],
      hidden:()=>!GS.flags.gilPaid,
      look:()=>narrate(['Same man. Same shade of red. He is wearing a Shoreline Residences polo now, '+
        'peeling out of the collar of it, the tag still stapled to the hem.',
        'He is walking a little more slowly than a person walks who has somewhere to be. He is '+
        'holding a laminated welcome packet like a man holding a subpoena.']),
      talk:()=>gilL2(),
      useItem:(it)=>{ if(it==='matchbook'){ sayAs('gil','No. No, I don’t drink any more. '+
        'Ownership.','I own a thing now and I have not drunk since Tuesday and both are the same '+
        'sentence.'); return true; } return false; } },

    { id:'zsazN', pri:2, name:'the fortune teller', x:258, y:118, w:26, h:50, approach:[262,166],
      hidden:()=>GS.flags.zsaAtWall,
      look:()=>narrate('Off the pier tonight. Even the rings and the turban and the readings '+
        'travel now, apparently, because the light is at the other end of the strip and business '+
        'is where the light is.'),
      talk:()=>zsaL2() },

    { id:'benchN', name:'the bench', x:44, y:132, w:52, h:24, approach:[70,166],
      look:()=>narrate('The bench you did not sit on this afternoon. It has an ashtray screwed to '+
        'the arm now. Nobody screws an ashtray to a bench in the afternoon.') },

    { id:'boothN', name:'the timeshare booth', x:232, y:96, w:66, h:64, approach:[232,166],
      look:()=>{
        if(GS.flags.brendaWary) narrate('Shuttered. The canopy is rolled and there is a laminated '+
          '"BACK TUESDAY" sign taped to the plywood. Brenda has taken herself out of tonight.');
        else if(GS.flags.gotPremium) narrate(['Shuttered for the night. There is a Shoreline '+
          'brochure on the deck by the shutter, face up, and somebody has written on the back of it '+
          'in blue eyeliner: "wall @ nine. bring the good bag."',
          'You cannot tell whether she left it there for the wind, or for you, or both.']);
        else narrate('Shuttered. The canopy is rolled and the good bag has gone home with her.');
      } },

    { id:'cartN', name:'the churro cart', x:172, y:110, w:46, h:42, approach:[172,152],
      look:()=>narrate('Still no cart-owner. The card in the glass now says "BACK IN 5 MIN," on a '+
        'card that has gone yellow, taped with tape that has gone brown. There is a proper crowd of '+
        'nobody at the cart tonight.'),
      take:()=>{ if(has('churro')){ narrate('One churro is a snack. Two is a personality. Three '+
        'is a legal category.'); return; }
        give('churro'); narrate(['You take a second churro from the same unattended cart. It is '+
          'colder now.','This is your second crime of the day and neither of them will make the '+
          'top forty.']); } },

    { id:'railN', name:'the railing', x:0, y:94, w:320, h:8, approach:[160,138],
      look:()=>narrate('Past the railing: dark water and a horizon somebody keeps rewriting in '+
        'neon. Nothing on the beach except a red plastic cup someone was proud of an hour ago.') },

    { id:'towerN', name:'the casino tower', x:222, y:16, w:34, h:72,
      look:()=>narrate('The Winthrop, lit from inside now. From the boardwalk you can pick out one '+
        'window at the very top that is dark. Nobody in Vanity Shores ever seems to be in that room '+
        'and everybody knows whose it is.') },

    { id:'stairsN', name:'the steps down under the pier', x:106, y:142, w:44, h:34, approach:[128,152],
      exit:true, desc:'Down under the boards where the light does not reach. Whatever is happening '+
        'under the pier tonight is happening slower than it was this afternoon.',
      go:()=>gotoRoom('under2', 60, 158) },

    { id:'westN', name:'the top of the strip', x:0, y:132, w:14, h:44, approach:[22,158],
      exit:true, desc:'Back up the strip toward the shelter and the road. The bus is not coming '+
        'back. It never was.',
      go:()=>gotoRoom('arrival2', 288, 158) },

    { id:'eastN', name:'the pier', x:306, y:124, w:14, h:52, approach:[298,158],
      exit:true, desc:'The pier, on the water, into the dark. The bandshell has a light on tonight '+
        'and nobody standing in front of it.',
      go:()=>gotoRoom('pier2', 16, 158) },

    { id:'wallExit', name:'the wall', x:310, y:170, w:10, h:8, approach:[302,166],
      hidden:()=>true },       // never; visible via 'eastN' path

    { id:'wallJump', name:'the far end of the strip', x:200, y:170, w:0, h:0,
      hidden:()=>true }
  ]
},

/* ============================== PIER 2 =================================== */
pier2:{
  walk:{ x0:14, x1:306, y0:144, y1:172 }, spawn:[40,158],
  npcs:[ { id:'dickieP', x:64, y:158, look:CAST.dickie,
           hidden:()=>GS.flags.dickieAtWall,
           extra:(t)=>{ r(74,120,1,10,'#5a5a68'); r(72,116,4,4,'#2a2a34');
             px(73,117,'#6a6a78');
             if(!REDUCED && Math.floor(t/300)%2===0)
               text('♪', 78, 112+((t/280)|0)%3, P.gold, FONT.dlg); } },
         { id:'zsazP', x:270, y:162, look:CAST.zsazsa,
           hidden:()=>GS.flags.zsaAtWall } ],
  onEnter(){ L2Enter();
    if(!GS.flags.sawPier2){ GS.flags.sawPier2 = true;
      narrate('The pier. The tide is up and the boards are wet. The bandshell has a spotlight on it '+
              'and nobody in front of it, and Dickie Vermouth is singing to a railing and one gull.'); } },
  hotspots:[
    { id:'dickieP', pri:2, name:'the lounge singer', x:52, y:110, w:28, h:60, approach:[80,164],
      hidden:()=>GS.flags.dickieAtWall,
      look:()=>narrate(['Same jacket, same posture, same three chords — different night. Under '+
        'the spot, at 72 inches of height instead of 40, he is enormous and doing his job to nobody '+
        'exactly as hard as he did to eight this afternoon.',
        'The gull knows every word.']),
      talk:()=>dickieL2Talk(),
      useItem:(it)=>{ if(it==='matchbook'){ dickieMatchbook(); return true; }
        return false; } },

    { id:'stageP', name:'the bandshell', x:6, y:60, w:112, h:78, approach:[100,164],
      look:()=>narrate('The bandshell. Purple, shell-shaped, painted in 1963. In this light it '+
        'looks like an ear that has heard a great deal it did not want to.') },

    { id:'zsazP', pri:2, name:'the fortune teller', x:258, y:118, w:26, h:52, approach:[262,166],
      hidden:()=>GS.flags.zsaAtWall,
      look:()=>narrate('At night the rings catch the neon and the eyes carry a shade the daylight '+
        'kept polite. She is looking at your hands even when your hands are in your pockets.'),
      talk:()=>zsaL2(),
      useItem:(it)=>{ if(it==='fortune'){ sayAs('zsazsa','I wrote it. It still works.'); return true; }
        return false; } },

    { id:'tentP', name:'the fortune tent', x:212, y:74, w:96, h:64, approach:[236,166],
      look:()=>narrate('"PALMS READ — $1 AFTER DARK." The old sign has been painted over and '+
        'the "$.25" is under it, still legible. Inflation has come for the fortunes.') },

    { id:'railP', name:'the pier railing', x:0, y:114, w:320, h:10, approach:[160,146],
      look:()=>narrate('Ninety-one years of salt now. The railing shifts when you lean on it, in '+
        'a slow deliberate way that is not you moving.'),
      take:()=>{ walkTo(mouse.x, 148, ()=>die('rail')); },
      use:()=>{ walkTo(mouse.x, 148, ()=>die('rail')); } },

    { id:'westP', name:'the boardwalk', x:0, y:130, w:14, h:46, approach:[22,158],
      exit:true, desc:'Back toward the noise and the light. The music from the strip does not '+
        'arrive late any more — it is coming out of the same speakers now.',
      go:()=>gotoRoom('bwalk2', 298, 158) }
  ]
},

/* ========================== UNDER THE PIER 2 ============================ */
under2:{
  walk:{ x0:18, x1:298, y0:126, y1:172 }, spawn:[60,158],
  npcs:[ { id:'monteU', x:190, y:150, look:CAST.monte,
           hidden:()=>GS.flags.monteWon || GS.flags.monteEnemy || GS.flags.monteAtWall },
         { id:'u1n', x:88, y:170, look:CAST.rube1 },
         { id:'u2n', x:260, y:172, look:CAST.rube2 } ],
  danger(p){ if(p.y>=92 && p.y<118){ walkTo(p.x, 128, ()=>die('surf')); return true; } },
  onEnter(){ L2Enter();
    if(!GS.flags.sawUnder2){ GS.flags.sawUnder2 = true;
      narrate(['Under the pier at night. The tide has come up and the sand smells like something '+
               'that used to be alive.',
               GS.flags.monteWon ? 'Monte’s felt is a wet square on the sand and the shells '+
                 'have gone home in a pocket.'
                                 : 'A folding table under one of the pilings. Two men who are not '+
                 'customers, an ember-red cigarette between them. A green cloth on the felt.']); } },
  hotspots:[
    { id:'monteU', pri:2, name:'the man with the shells', x:176, y:110, w:32, h:56, approach:[192,166],
      hidden:()=>GS.flags.monteWon || GS.flags.monteEnemy || GS.flags.monteAtWall,
      look:()=>narrate('Same tank, same arms, same table. The shells are wetter tonight and he is '+
        'moving them slower.'),
      talk:()=>monteL2(),
      useItem:(it)=>{ if(it==='flyer'){ sayAs('monte','I saw the flyer. Kid, that is not a hustle, '+
        'that is a *floor show*. It is not the same job.'); return true; }
        return false; } },

    { id:'rubesU', pri:1, name:'the onlookers', x:76, y:140, w:36, h:36, approach:[92,172],
      look:()=>narrate('They lose. They groan. They bet again. In this light they look older than '+
        'they did this afternoon.'),
      talk:()=>narrate('"Great game," says one, at the same rate he said it this afternoon. Neither '+
        'of them looks at your feet.') },

    { id:'coldFire', name:'the burned patch on the sand', x:170, y:150, w:56, h:16, approach:[196,170],
      hidden:()=>!(GS.flags.monteWon || GS.flags.monteEnemy),
      look:()=>narrate('A dark ring on the sand where the table stood. Somebody has burned '+
        'something small in the middle of it — receipts, maybe, or a photograph, or the way '+
        'a man tells a story about his afternoon.') },

    { id:'waterU', name:'the water', x:0, y:92, w:320, h:22,
      look:()=>narrate('The tide is high tonight. The riptide past the third piling has taken one '+
        'more this season. The city has still not put up a sign. A sign at this stage would be an '+
        'admission of pattern.'),
      use:()=>{ walkTo(mouse.x, 128, ()=>die('surf')); },
      take:()=>narrate('The ocean is bigger than your ambitions and it is holding.') },

    { id:'upstairsU', name:'the way back up', x:280, y:96, w:44, h:60, approach:[276,158],
      exit:true, desc:'The wooden steps back up. Whatever is happening down here is more of the '+
        'same. Whatever is happening at the wall is not.',
      go:()=>gotoRoom('bwalk2', 130, 158) }
  ]
},

/* ============================== THE WALL ================================= */
wall:{
  walk:{ x0:22, x1:296, y0:144, y1:172 }, spawn:[46,160],
  npcs:[
    { id:'chipW', x:200, y:158, look:CAST.chip,
      hidden:()=>GS.flags.wallDone,
      extra:(t)=>{ /* a coin turning in his hand, if he is still holding one */
        if(GS.flags.chipEnding !== 'plain' && !REDUCED && Math.floor(t/700)%2===0)
          px(212, 132+((t/420)|0)%2, P.gold); } },
    { id:'hoytW', x:106, y:162, look:CAST.hoyt,
      hidden:()=>GS.flags.hoytHome },
    { id:'vinceW', x:262, y:158, look:CAST.vince },
    { id:'marnieW', x:170, y:166, look:CAST.marnie,
      hidden:()=>!GS.flags.marnieAtWall || GS.flags.wallDone },
    { id:'dickieW', x:76, y:158, look:CAST.dickie,
      hidden:()=>!GS.flags.dickieAtWall || GS.flags.wallDone },
    { id:'zsazW', x:288, y:166, look:CAST.zsazsa,
      hidden:()=>!GS.flags.zsaAtWall } ],
  onEnter(){ L2Enter();
    if(!GS.flags.sawWall){ GS.flags.sawWall = true;
      narrate(['The wall. A neon sign above a service door that says KINGFISHER in a hand nobody '+
               'has used since 1972. Under the sign, a light. Under the light, a felt table. Behind '+
               'the felt: Chip Winthrop.',
               'A man on the door, who is looking at your shoes. A very rich boy on the wrong side '+
               'of the felt, whose face is his father’s in about ten years and knows it.',
               'This is not the boardwalk any more. This is a room somebody has put outside.']); } },
  hotspots:[
    { id:'chipW', pri:2, name:'Chip Winthrop', x:186, y:110, w:32, h:60, approach:[196,168],
      hidden:()=>GS.flags.wallDone,
      look:()=>narrate(['At the far end of the felt, both hands flat on it, cap dead level, '+
        'smiling at nobody in particular. He has spent all afternoon making sure this is exactly '+
        'the shape it is.',
        'He is different at 72 inches. He is smaller.']),
      talk:()=>chipL2Talk(),
      useItem:(it)=>{ if(it==='flyer'){ sayAs('chip','Yes. I know what it says. I wrote it. '+
        'Nobody quotes me back to me on my own boardwalk.'); return true; }
        if(it==='churro'){ sayAs('chip','Not while I am *dealing*.'); return true; }
        if(it==='matchbook'){ sayAs('chip','...Where did you get that?','No. Do not tell me. Put '+
          'it away and do not tell anybody at this table you have it, do you understand?'); return true; }
        return false; } },

    { id:'hoytW', pri:2, name:'Chip’s cousin', x:92, y:112, w:32, h:60, approach:[110,170],
      hidden:()=>GS.flags.hoytHome,
      look:()=>narrate(['Golf-course tan, tortoiseshell aviators, a polo the colour of vanilla ice '+
        'cream that costs seventy dollars. He is drunk with the specific joyless competence of a '+
        'man who is drunk every night at exactly the same time.',
        'He is losing, cheerfully, to his cousin.']),
      talk:()=>hoytTalk(),
      useItem:(it)=>{
        if(it==='matchbook'){ sayAs('hoyt','I have three of those in the car. Real ones.','I would '+
          'give you one but that would be *tacky*.'); return true; }
        if(it==='coupon'){ hoytBurn(); return true; }
        if(it==='churro'){ sayAs('hoyt','Not while I am *drinking*. Sugar. Fights the whiskey.'); return true; }
        return false; } },

    { id:'vinceW', pri:2, name:'the man on the door', x:250, y:106, w:26, h:60, approach:[262,168],
      look:()=>narrate('Two-fifty, black shirt, black jacket, no lanyard. Not for hire. Not '+
        'interested in you either way, which is exactly what makes him worth being interested in.'),
      talk:()=>vinceTalk(),
      useItem:(it)=>{ if(it==='matchbook'){ vinceMatchbook(); return true; }
        if(it==='coupon'){ sayAs('vince','That coupon is redeemable for a place I have thrown you '+
          'out of already.'); return true; }
        return false; } },

    { id:'marnieW', pri:2, name:'Marnie Sable', x:154, y:118, w:32, h:54, approach:[170,170],
      hidden:()=>!GS.flags.marnieAtWall || GS.flags.wallDone,
      look:()=>narrate('Marnie has taken up a position at the end of the rope, holding a drink '+
        'she is not drinking, letting the light do its work. The crowd on the boardwalk has just '+
        'discovered they need to know what she is drinking.'),
      talk:()=>marnieAtWallTalk() },

    { id:'dickieW', pri:2, name:'Dickie Vermouth', x:62, y:110, w:28, h:60, approach:[86,168],
      hidden:()=>!GS.flags.dickieAtWall || GS.flags.wallDone,
      look:()=>narrate('Dickie has set up an amp at the near end of the wall. There is a small '+
        'crowd around him that was going to Chip and is now not.'),
      talk:()=>dickieAtWallTalk() },

    { id:'zsazW', pri:2, name:'the fortune teller', x:274, y:130, w:26, h:44, approach:[278,170],
      hidden:()=>!GS.flags.zsaAtWall,
      look:()=>narrate('She has set up on a folding chair at the mouth of the alley, doing '+
        'readings for five dollars a hand. There is a queue. It is not moving.'),
      talk:()=>zsaAtWall() },

    { id:'tableW', name:'the felt table', x:118, y:150, w:84, h:20, approach:[160,168],
      look:()=>narrate('Green felt, three shells, a pea nobody is under, and CHIP in gold leaf '+
        'across the near edge. It is the boardwalk’s worst idea, plated.'),
      take:()=>{ Audio_.sfx('deny');
        narrate('The man on the door takes two steps in your direction. You reconsider.'); } },

    { id:'door', name:'the Kingfisher door', x:120, y:82, w:80, h:34, approach:[160,150],
      look:()=>{
        if(GS.flags.wallDoorOpen) narrate('Open now, exactly a hand’s width. The light behind '+
          'it is warm the way a room is warm when somebody has lived in it a long time.');
        else if(has('matchbook')) narrate(['The service door under the Kingfisher sign. The paint '+
          'is exactly the shade the matchbook is.',
          'It is locked from inside and Vince is between you and the lock.']);
        else narrate('A locked service door under a neon sign that has not been changed since 1972. '+
          'Nothing about it will open for you tonight.');
      },
      take:()=>{ Audio_.sfx('deny'); narrate('The door is not yours. Yet.'); } },

    { id:'signW', name:'the KINGFISHER sign', x:96, y:36, w:128, h:32,
      look:()=>narrate('KINGFISHER. Pink, cyan, gold, in that order, and the gold is the last two '+
        'letters. Whoever laid it out picked the two letters that spell OR.') },

    { id:'ropeW', name:'the velvet rope', x:52, y:130, w:216, h:14,
      look:()=>narrate('Two stanchions, one line of velvet, one Chip Winthrop on the far side. In '+
        'this town the important thing about a rope is which side of it your name is on.') },

    { id:'westW', name:'back to the strip', x:0, y:136, w:14, h:40, approach:[24,164],
      exit:true, desc:'Back up the boardwalk toward the noise. Whatever you did not bring with you '+
        'to the wall is up there.',
      go:()=>gotoRoom('bwalk2', 298, 158) }
  ]
}
});

/* ---------- FLAG WIRING FROM LEVEL 1 ------------------------------------- *
   The whole handoff between levels is done by reading GS.flags. Nothing
   automatic; each field below is deliberately consulted. */
function chipEndingLine(){                              /* @owner system */
  switch(GS.flags.chipEnding){
    case 'plain': return 'the one where you held your hand out and he broke first';
    case 'charm': return 'the one where he said it was a nice hundred dollars, out loud';
    case 'force': return 'the one where you closed his fingers around it';
    case 'math':  return 'the one at nine and a quarter, compounded since Tuesday';
    case 'heat':  return 'the one where you told him he had been watching, so watch';
    default:      return 'the one where you crossed the road and disappeared for an hour';
  }
}

/* ---------- SCENES: THE STRIP AT NIGHT ----------------------------------- */

/* ---- Marnie Sable, first recruit --------------------------------------- */
const MARNIE_BEATS = [  /* @owner marnie */
  ['"Fourteen years on that floor," she says, exhaling. "Fourteen years of pouring a Bloody Mary '+
   'for a Winthrop and being told the tomato is the wrong shade."',
   '"They fired me on a Wednesday because I was too old, which was a word they used and which they '+
   'have printed on a *form*. I photocopied the form. I still have the form."'],
  ['"You know what they teach you to do on a floor like that? Read a face. That is the whole job. '+
   'Everything else is *pouring*."',
   'She turns her head and reads your face. She stops smiling first, which is the tell.'],
  ['"When this is finished," she says, "I want a room. I do not care whose room. I have been sleeping '+
   'in my brother’s pool house for six months and my brother has been *very kind* about it."',
   '"You look like a person who is going to be able to get a room."']
];
function marnieTalk(){  /* @owner marnie @critical */
  if(GS.flags.marnieHired){
    const beat = flirtBeat('marnie', MARNIE_BEATS, 6);
    if(beat){ sayAs('marnie', beat); return; }
    sayAs('marnie','I said yes, honey. Do the job. Do not come back and re-ask.'); return;
  }
  GS.flags.marnieMet = true;
  const opts = [];
  if(S().charm >= GATE) opts.push({ text:'"You were the one at the Winthrop who never lied."',
    tag:'CHARM', fn:()=>marnieHire('charm') });
  if(S().money >= GATE) opts.push({ text:'"Fifty up front, forty of the pot, and a name on the door."',
    tag:'MONEY', fn:()=>marnieHire('money') });
  if(S().fight >= GATE) opts.push({ text:'"You want him buried. I can hold a shovel."',
    tag:'FIGHTING', fn:()=>marnieHire('fight') });
  opts.push({ text:'"Split it down the middle. Straight."', fn:()=>marnieHire('base') });
  opts.push({ text:'"Later. Watch me first."', fn:()=>sayAs('marnie',
    ['"Mm. Watch what, exactly? The thing at the end of the strip? Honey, I have already watched '+
     'the *rehearsal*."','"Come back when you have decided."']) });
  sayAs('marnie', ['You are the one they are all talking about. The one who put a hundred dollars '+
    'in a Winthrop’s hand at four in the afternoon and closed the fingers around it. Congratulations. '+
    'That was ' + chipEndingLine() + ', and it has been down the strip like a fire since.',
    '"He is furious," Marnie says. "He is *good* furious. He has been organising all day. He is '+
    'about to run a real one tonight and he does not know what he does not know, which is the shape '+
    'of the room."',
    '"Chip Winthrop has never worked a floor. I have. Do we have a *deal*?"'],
    { choices:opts });
}
function marnieHire(kind){  /* @owner marnie */
  GS.flags.marnieHired = true; GS.flags.crewChosen = true;
  GS.flags.l2Crew = 'marnie'; GS.flags.marnieAtWall = true;
  if(kind==='charm') addHeat('marnie', 22);
  if(kind==='money') addHeat('marnie', 10);
  if(kind==='fight') tick('leaned');
  pay(earn('marnieRunner', kind==='base' ? 'base' : kind));
  tick('pocketed');
  const beat = {
    charm:['"...Mm."','She stubs the cigarette on the arm of the bench and stands up. She is a full '+
      'head taller than she looked sitting down.',
      '"You are going to be very hard for me later," she says. "I want the record to note I said it."'],
    money:['"Forty of the pot," she repeats. "Say it out loud again so I remember. Forty of the pot '+
      'is more than fifty of anything, honey, because you have not thought about tips yet."',
      '"Consider tips."'],
    fight:['She does not smile. She does not need to.',
      '"I have been holding one since Wednesday," she says. "I have been *looking* for a hole to '+
      'put it in."'],
    base:['"Straight down the middle. Sure."','She puts out the cigarette carefully, saving half.',
      '"You are going to try to renegotiate at the wall and I am going to remember which of us said '+
      'straight down the middle first. I am *good* at remembering."']
  }[kind];
  say(beat.concat(['"See you at the wall, honey. Nine sharp. Bring the light on your face."']),
    { speaker:CAST.marnie.name, look:CAST.marnie, then:()=>{
      Audio_.sfx('coin'); saveGame();
      narrate('Marnie has moved to the wall. She will be there when you arrive.'); } });
}
function marnieAtWallTalk(){  /* @owner marnie */
  sayAs('marnie', ['"The queue on my side is longer than the queue on his side. Would you like to '+
    'work out why?"',
    '"Any minute now he is going to *notice*."']);
}

/* Bring Marnie the matchbook: she has history with the room behind that door. */
function marnieSecret(){  /* @owner marnie */
  drop('matchbook'); foundSecret && foundSecret('marnie');
  GS.flags.marnieSecret = true; addHeat('marnie', 26);
  tick('laid'); mark('lipstick'); mark('dishevel');
  sayAs('marnie', ['"You brought me one of these."',
    'She takes it out of your hand without looking at it. She has known it was in your pocket since '+
    'you walked up.',
    '"There is a room behind that door that I have not been in since 1998. Pops threw me out for '+
    'stealing from a *purse*. I did not steal from the purse."',
    '"I have been *waiting*."',
    '"There is a service alley behind the wall and there is a fifteen-minute window when Vince is '+
    'on the front. Come with me. Bring the matches back."'],
    { then:()=>cutaway(paintAlleyDark, [
      'Marnie takes the matchbook and the strip disappears around a corner.',
      'A service door that has not been opened since ninety-eight opens quietly. Somebody who was '+
      'not in that room for twenty-eight years is in that room for eleven minutes.',
      'Somebody strikes exactly one match. It goes out on its own before it reaches the wick.',
      'When you come back the crowd at the wall has doubled and nobody has fetched Vince.'],
      ()=>sayAs('marnie', ['"Do not tell anybody we were behind the wall tonight," she says, '+
        'walking away from you toward the light.',
        '"Especially do not tell Chip. Especially do not tell *me* tomorrow."'])) });
}

/* ---- Hoyt, the mark ---------------------------------------------------- */
function hoytTalk(){  /* @owner hoyt */
  if(GS.flags.hoytBurned){
    sayAs('hoyt', ['I am *fine*.','I am going to walk very carefully to the car and I am going '+
      'to sit in it and I am going to *think* about some things.']); return; }
  const opts = [];
  if(S().charm >= GATE) opts.push({ text:'"You could beat him, you know. Twice around the shells."',
    tag:'CHARM', fn:()=>hoytBurnRun('charm') });
  if(S().money >= GATE) opts.push({ text:'"Double or nothing on the middle shell. My money on your read."',
    tag:'MONEY', fn:()=>hoytBurnRun('money') });
  if(S().fight >= GATE) opts.push({ text:'"He’s laughing at you between the shuffles."',
    tag:'FIGHTING', fn:()=>hoytBurnRun('fight') });
  opts.push({ text:'"How much have you dropped tonight, Hoyt?"',
    fn:()=>hoytBurnRun('base') });
  opts.push({ text:'Leave him to it.', fn:()=>sayAs('hoyt',
    'You are not... *staff*. Right? I keep forgetting the *faces*.') });
  sayAs('hoyt', ['"You are the boardwalk one. Chippy has been *talking* about you. He talks about '+
    'you in the shower now, which you would not think I would know, but he has a *very loud shower*."',
    '"I am *losing*. On *purpose*. It is a *family* thing. I do it every quarter."',
    '"Would you like a drink? I have four."'], { choices:opts });
}
function hoytBurnRun(kind){  /* @owner hoyt */
  GS.flags.hoytBurned = true; GS.flags.l2Burned = 'hoyt';
  const take = earn('hoytBurn', kind==='base' ? 'base' : kind);
  pay(take); tick('pocketed');
  if(kind==='fight') tick('leaned');
  if(kind==='charm') addHeat('hoyt', 8);
  const beat = {
    charm:['"You are *right*," Hoyt says. "That is exactly what he has been doing. That is *exactly* '+
      'what he did last Christmas."',
      'He gets one shell right in a row and comes off the felt with more than he came to it with '+
      '— and then, unprompted, gives you half. The half is ' + '$' + (take/100).toFixed(2) + '.',
      '"You told me a *true* thing," he says. "Nobody at this end tells me true things any more."'],
    money:['"Take my money on this one." He puts it down. "If you are wrong I have not lost anything '+
      'I was not going to lose."',
      'You watch Chip’s left hand and call the shell out loud. Hoyt wins. Hoyt is so surprised '+
      'to win that he splits the take with you at the felt, in front of everybody, out of *manners*.',
      '"Half," Hoyt says, "because you *sat down next to me*, and that is the *entire* code."'],
    fight:['"...He *is*," Hoyt says slowly. "He is doing that thing where he laughs before the '+
      'shells even move. He did that at *my father’s funeral*."',
      'He knocks over his own drink. He puts fifty on the middle. He wins. He looks at his cousin '+
      'and stops smiling.',
      'Then he takes half of what he won and pushes it into your hand under the felt where the '+
      'camera on the awning cannot see.'],
    base:['You ask him. He answers. He answers in full, in a voice that does not know it is being '+
      'heard.',
      '"I have dropped four thousand seven hundred dollars tonight and it is *nine*. I am *good* '+
      'for it. I am *fine*. I have *bonds*."',
      'He puts fifty on a shell you are pointing at. He wins. He tips you the way he tips a valet '+
      'and does not know you are not one.']
  }[kind];
  say(beat.concat(['You are carrying ' + money() + '. Chip has seen who you were talking to. '+
    'Chip has *seen*.']),
    { speaker:CAST.hoyt.name, look:CAST.hoyt,
      then:()=>{ GS.flags.hoytHome = true; Audio_.sfx('cash'); saveGame();
        narrate('Hoyt walks himself very carefully toward a car he cannot see and drives home in a '+
          'taxi he does not remember calling. He was, on the whole, the most honest man at the table.'); } });
}

/* ---- Chip, at the wall, running his own room --------------------------- */
function chipL2Talk(){  /* @owner chip */
  if(GS.flags.wallReady){ chipShowdownL2(); return; }
  const money = GS.cash;
  const patter = ['"Look who came. The boardwalk’s new *concern*."',
    '"One hundred to sit. It is my table so it is my ante. That is also the *whole business*."'];
  if(GS.flags.chipEnding === 'force')
    patter.push('He has not once put his hands under the felt since you walked up. He is aware of '+
                'this and he is aware that you have noticed, and neither of you is going to remark '+
                'on it.');
  if(GS.flags.chipEnding === 'charm')
    patter.push('"You had a *good* afternoon, boardwalk. I have been rewriting mine. You are going '+
                'to like tonight."');
  if(GS.flags.chipEnding === 'heat')
    patter.push('He looks at you the way he looked at you across the strip at four in the afternoon, '+
                'and this time neither of you is pretending to be somewhere else.');
  if(heatOf('chip') >= 35)
    patter.push('He does not smile at anybody at this table the way he smiles at you. He is not '+
                'aware of this. Marnie is.');

  const opts = [];
  if(money >= L2.ante){
    opts.push({ text:'"One hundred. On the felt. Let’s work."', fn:()=>chipSitDown() });
  } else {
    opts.push({ text:'"I am short."', fn:()=>sayAs('chip',
      'Then come back with a hundred, boardwalk. This is a *table*, not a *conversation*.') });
  }
  opts.push({ text:'"I am watching."', fn:()=>sayAs('chip',
    ['"So watch. Watch a man do it *right*, for once."',
     '"I am *paying* for this venue. My cousin is *paying* to be losing. The two men behind the '+
     'rope are paying me *ninety* an hour to *stand there*. There has never been a more honest room '+
     'on this strip and I built it *this afternoon*."']) });
  opts.push({ text:'Walk away.', fn:()=>narrate('You walk away from the felt. He does not call after '+
    'you. He does not need to.') });

  sayAs('chip', patter, { choices:opts });
}
function chipSitDown(){  /* @owner chip @critical */
  pay(-L2.ante, false); GS.flags.wallSat = true;
  Audio_.sfx('coin'); GS.flags.wallReady = true;
  narrate(['You put a hundred on the felt. Chip puts a hundred on top of yours without looking '+
    'up. Then he puts another hundred on top of that.',
    '"House matches everything," Chip says. "House is *me*. Nobody has ever run this before, so I '+
    'get to make up the rules. Which I am *good* at."',
    'The two onlookers behind the rope have stopped talking. The crowd behind them has stopped '+
    'thickening — which means it is done thickening, which means it will start thinning next.'],
    { then:()=>chipShowdownL2() });
}

/* the L2 curtain — five ways, exactly like L1 but built on the pieces this
   level has been putting on the board. This is where a person is the win. */
function chipShowdownL2(){  /* @owner chip @critical */
  const crew = GS.flags.l2Crew || 'solo';
  const opts = [];
  if(gated('wallShowdown','charm')) opts.push({ text:'"Look at the queue. On the other side of you."',
    tag:'CHARM', fn:()=>chipFolds('charm') });
  if(gated('wallShowdown','fight')) opts.push({ text:'"Take your hand off the shell."',
    tag:'FIGHTING', fn:()=>chipFolds('force') });
  if(gated('wallShowdown','money')) opts.push({ text:'"Double the ante. All of it, in one call."',
    tag:'MONEY', fn:()=>chipFolds('money') });
  if(heatOf('chip') >= 35) opts.push({ text:'"Cousin. Come *here*, and *look* at me."',
    tag:'HEAT', fn:()=>chipFolds('heat') });
  opts.push({ text:'Watch his left hand. Nothing else.', fn:()=>chipFolds('plain') });
  opts.push({ text:'Not tonight.', fn:()=>sayAs('chip',
    'Then take your hundred back and *leave*, boardwalk. This is a *table*. It does not wait.') });

  const patter = ['"Three shells, one pea, one hundred on the felt from each of us. Same rules '+
    'as Monte, boardwalk. Nothing under my hand you have not already seen."',
    '"I dealt this all afternoon. I am *good* at it now."'];
  if(crew === 'marnie') patter.push('Marnie is on the other side of the rope, leaning on it. Half '+
    'the queue is on her side.');
  if(crew === 'dickie') patter.push('Dickie has taken up the near end of the rope with an amp and '+
    'started a set. The queue on Chip’s side has forgotten which line it is in.');
  if(crew === 'monte')  patter.push('Monte is behind the rope with his arms folded, and every '+
    'time Chip’s left hand moves Monte’s eyes go with it.');
  if(GS.flags.hoytBurned) patter.push('Hoyt is not at the table. Chip has *noticed*.');

  sayAs('chip', patter, { choices:opts });
}

/* Chip loses his room. He is holding what you did with it. */
function heldSignet(bx, by, w2, h2, t, since, settled){
  const shake = REDUCED ? 0 : (settled ? 0.3 : 0.9);
  const hx = Math.round(bx + w2*0.50 + Math.sin(t/110)*shake);
  const hy = Math.round(by + h2 - 16 + Math.cos(t/85)*shake);
  blob(hx+8, hy+7, 8, 8, P.gold);
  blob(hx+8, hy+7, 6, 6, '#c98a1a');
  r(hx+6, hy+3, 5, 6, '#2a1140');
  px(hx+8, hy+3, '#8ec4f0');
}
const CHIP_CURTAIN_L2 = [
  { push:1.00, rays:0.6, prop:(bx,by,w,h,t,s)=>heldSignet(bx,by,w,h,t,s,false) },
  { push:1.10, rays:1.0, shake:1.8, prop:(bx,by,w,h,t,s)=>heldSignet(bx,by,w,h,t,s,false) },
  { push:1.04, rays:0.5, prop:(bx,by,w,h,t,s)=>heldSignet(bx,by,w,h,t,s,true) },
  { push:1.16, rays:2.2, shake:2.6, prop:(bx,by,w,h,t,s)=>heldSignet(bx,by,w,h,t,s,true) },
  { push:1.12, rays:1.6, prop:(bx,by,w,h,t,s)=>heldSignet(bx,by,w,h,t,s,true) },
  { push:1.00, rays:0.3 }
];

function chipFolds(kind){  /* @owner chip */
  GS.flags.l2Ending = kind;
  addHeat('chip', kind === 'heat' ? 18 : 10);
  const take = earn('wallSkim', kind==='plain' ? 'base' : kind);
  pay(take);
  Audio_.sfx('fanfare'); Audio_.scene('win');
  const crew = GS.flags.l2Crew || 'solo';

  const beat = {
    plain:['You do not say anything. You do not touch the shells. You watch his left hand every '+
      'time it moves, and after the third shuffle you call the pea for the crowd behind the rope, '+
      'quietly, so a stranger can hear you say it.',
      'The stranger repeats it. Then everybody does.',
      'Chip cannot keep dealing to a table that is calling the shell before he moves it.'],
    charm:['"Look at the queue," you say. "On the other side of you." He looks. He does the wrong '+
      'thing, which is that he looks for eight seconds instead of two.',
      'By the time he turns back his crowd is smaller than her queue and he has personally checked '+
      'both of them.',
      '"...*Marnie*," Chip says. He does not sound surprised. He sounds *briefed*.'],
    force:['You take his left wrist. Not hard — just entirely, the way you take something that '+
      'was never going to be handed to you.',
      'You turn the palm up. The pea is in the web of his thumb, exactly where the card said it '+
      'would be, on a table that does not need the card.',
      'Under the light it gets extremely quiet. Vince takes a step off the door and stops when '+
      'Chip lifts one finger. That one finger is the entire fold.'],
    money:['"Double." You put another hundred on top of the two hundred that is already on the '+
      'felt. "All in. One call."',
      'He looks at your money. He looks at his money. He looks at his cousin’s empty seat. '+
      'He looks at the queue on the other side of the rope.',
      '"...No," Chip says, out loud, in front of his crowd. Nobody has heard a Winthrop say no to a '+
      'call on this boardwalk in years.'],
    heat:['"Cousin. Come *here*, and look at me." You are the only person on this strip he lets '+
      'call him cousin.',
      'He comes over. He does it without thinking about it. He does it, in fact, before he decides '+
      'whether he is going to.',
      'By the time he has arrived he has left the table — which is the fold, and every person '+
      'on this side of the rope knows it, and he knows they know.']
  }[kind];

  const crewLine = {
    marnie:'Marnie is not smiling. She is doing an accountant’s arithmetic on her lips.',
    dickie:'Dickie has stopped singing mid-note and neither of you has told him to.',
    monte: 'Monte moves to the felt without being asked and starts turning the shells over one at '+
           'a time, slowly, so everybody can see the pea is not, and has not been, anywhere.',
    solo:  'There is nobody in your corner. That was the point of doing it alone.'
  }[crew];

  say(beat.concat([crewLine,
    'Chip Winthrop looks at his felt, and at his queue, and at the light he paid the city for. '+
    'Then he takes off his signet ring and turns it over in his hand, and he puts it on the felt '+
    'in front of you.',
    '"Take it," he says. "For tonight. Not because I lost. Because you *saw*."']),
    { speaker:CAST.chip.name, look:CAST.chip, then:()=>{
      give('ring'); tick('pocketed');
      closeup(CAST.chip, [
        'Chip Winthrop is holding a ring he took off his own hand and put down for you.',
        '"There is a room behind that door," he says, "that I have never been in. Nobody in my '+
        'family has ever been in it. It is not for us."',
        '"There is a man at the bar who used to know my father. He looks at me the way you look '+
        'at a person you have already given up on."',
        '"I want to go in there tonight, boardwalk. With you."',
        '"Bring the ring back tomorrow. Or do not. I would like the option."',
        'Then he puts his hand out, palm up, exactly the way he held it out over the quarter, and '+
        'he waits.'],
        ()=>{
          GS.flags.wallDone = true;
          GS.flags.wallDoorOpen = true;
          GS.flags.level2Done = true;
          saveGame();
          GS.scene = 'complete2';
          GS.complete2At = clock;
        },
        CHIP_CURTAIN_L2);
    } });
}

/* ---- Vince, the door --------------------------------------------------- */
function vinceTalk(){  /* @owner vince */
  sayAs('vince', ['Not tonight.',
    'Not any night. This door is *staff*. You are not.',
    'The felt is the show. The show is *fine*. Enjoy the show.']);
}
function vinceMatchbook(){  /* @owner vince */
  drop('matchbook'); GS.flags.vinceMatched = true;
  sayAs('vince', ['You are not staff. But somebody who was staff gave you this, and the somebody '+
    'was Marnie. I know because I *helped her steal it in 1996*.',
    'Keep it in a pocket that is not this pocket. If it is on the felt when I look up next, this '+
    'is a different conversation.',
    'Now go and *stand* somewhere the man on the door is not looking at you.']);
}

/* ---- Reused-cast L2 conversations, all short --------------------------- */
function dickieL2(){  /* @owner dickie */
  if(GS.flags.dickieAtWall){ dickieAtWallTalk(); return; }
  const opts = [];
  if(GS.flags.dickiePaid && !GS.flags.crewChosen){
    opts.push({ text:'"Take the wall with me. Same split as the bandshell."',
      fn:()=>dickieRecruit() });
  }
  opts.push({ text:'"Later, Dickie."', fn:()=>sayAs('dickie',
    'Later. Sure. I will be *here*. Between you and me, that is *increasingly* not a choice.') });
  sayAs('dickie', ['"Kid. You are the man of the hour. Which is a nice hour to be the man of."',
    'He does not look at the light down the strip.',
    '"There is a room down there tonight. There is a man on that door I have not been let past '+
    'in thirty years and I have not asked in twenty."',
    '"If I sang the wall tonight it would not be for the tips. Which is the first time I have '+
    'said that sentence in *any* decade."'], { choices:opts });
}
function dickieRecruit(){  /* @owner dickie */
  GS.flags.crewChosen = true; GS.flags.l2Crew = 'dickie';
  GS.flags.dickieAtWall = true;
  Audio_.sfx('fanfare'); tick('encores');
  sayAs('dickie', ['"Straight down the middle. Say *when*."',
    'He picks up the amp — which he has, evidently, had ready since about four this afternoon '+
    '— and starts walking toward the light.',
    '"I would like the record to show," Dickie says over his shoulder, "that when the boardwalk '+
    'stopped being the boardwalk, I *did not have to be asked twice*."'],
    { then:saveGame });
}
function dickieL2Talk(){  /* @owner dickie */
  sayAs('dickie', ['"Kid. Half the strip is at the wall. The pier is *empty*. Do you know what an '+
    'empty pier sounds like at nine at night?"',
    '"It sounds like a *career*. It sounds like exactly the *career* I have."',
    '"Come and get me if it is *me* the room needs."']);
}
function dickieAtWallTalk(){  /* @owner dickie */
  sayAs('dickie', ['"I am *singing* to Chip Winthrop’s crowd, kid. I am *singing* to it."',
    '"Say the word and I stop. Do not say the word."']);
}
function dickieMatchbook(){  /* @owner dickie */
  sayAs('dickie', ['You have *one of those*. Kid. Put it away.',
    'Actually give it here for a second.','...No. Keep it. I do not want to be seen with it.',
    'That door and I have *history* and it is not the *good* kind.']);
}

function gilL2(){  /* @owner gil */
  if(GS.flags.gilCompd){ sayAs('gil', ['You *comped* me,' + (GS.name?', '+GS.name+',':'')+' out '+
    'of a laminated welcome packet I *paid for*.',
    'I am not going to *forget* this. I mean that in every sense of the sentence.']); return; }
  const opts = [];
  if(has('coupon')){
    opts.push({ text:'"Redeem this here." (Give him the drink coupon.)', fn:()=>gilComp() });
  }
  opts.push({ text:'"Enjoy the walk, Gil."', fn:()=>sayAs('gil',
    'Thank you. I am, actually. Ownership is very *quiet*.') });
  sayAs('gil', ['"I *own* now. I own a *fractional*. I sat through Brenda’s pitch a second '+
    'time out of *gratitude* for the aloe and she *sold me a unit*."',
    '"The unit is *substantially similar* to a unit that will exist. The paperwork was *warm* '+
    'when I signed it. I am not saying it was a *mistake*. I am saying I have committed."'], { choices:opts });
}
function gilComp(){  /* @owner gil */
  drop('coupon'); GS.flags.gilCompd = true;
  const take = earn('hoytComp', leanName());
  pay(take); addHeat('gil', 4); tick('pocketed');
  sayAs('gil', ['"...The coupon was for a *Sunset Cooler* at a *participating property*. I *AM* '+
    'the participating property. Brenda *told* me. I am *the beverage*."',
    'He hands you cash. He does not look at his fingers. He looks past you at the light down the '+
    'strip.',
    '"Do you know what happens tomorrow?" Gil asks. "I *tour a model unit*. In *my own building*."',
    'You are carrying ' + money() + '.'], { then:saveGame });
}

function zsaL2(){  /* @owner zsazsa */
  if(!GS.flags.zsaMovedFromPier){ GS.flags.zsaMovedFromPier = true;
    sayAs('zsazsa', ['"Sugar. I *told* you. Three of them are coming for you. That was the reading '+
      'and I *charged* for it."',
      '"One of them is at the felt tonight. One of them is on the door tonight. The third one is '+
      'behind that door and *I* am not going in there and *you* are not going in there and *she* '+
      'is going in there."',
      '"The reading was correct. Pay me *again*."']); return; }
  if(has('quarter')){
    sayAs('zsazsa', ['"A dollar after dark, sugar. Inflation was in the *first* reading."'],
      { choices:[ { text:'Give her the quarter anyway.',
                    fn:()=>{ drop('quarter'); addHeat('zsazsa', 3);
                      sayAs('zsazsa','"...Old times." She takes it. "Watch your left in a minute."'); } },
                  { text:'"Later, then."', fn:()=>sayAs('zsazsa','Mm. Later.') } ] }); return; }
  sayAs('zsazsa', ['"You already read the *card*, sugar. Reading it again is on you."',
    '"Watch the man on the door. He is the *good* one. He knows things about that room he has '+
    'never told a Winthrop."']);
}
function zsaAtWall(){  /* @owner zsazsa */
  sayAs('zsazsa', ['"Five dollars, sugar. This queue is *five deep*. I have *never* had a queue."',
    '"You are the queue. You are why this queue is *five deep*."']);
}

function monteL2(){  /* @owner monte */
  if(GS.flags.crewChosen){ sayAs('monte',
    ['Kid. Table is *mine*. You have got your *floor show* down the strip.',
     'Go and *host* it.']); return; }
  const opts = [];
  if(!GS.flags.crewChosen && !GS.flags.monteEnemy && GS.flags.monteWon){
    opts.push({ text:'"Bring the shells to the wall. Show them what an *actual* one looks like."',
      fn:()=>monteRecruit() });
  }
  opts.push({ text:'"Just checking in, Monte."', fn:()=>sayAs('monte',
    'You checked. Now *go*.') });
  const patter = GS.flags.monteEnemy
    ? ['Kid. You still have my *wrist* somewhere.',
       '"You want something from me tonight?" He does not turn round. "Not for money."']
    : ['"You saw the flyer. Kid, that is *not* a hustle, that is a *floor show*. It is not the '+
       'same *job*."',
       '"Winthrop opens a room like that, he’s not *taking* from his crowd, he’s '+
       '*performing* for them. Which is *worse* and also *funnier*."'];
  sayAs('monte', patter, { choices:opts });
}
function monteRecruit(){  /* @owner monte */
  GS.flags.crewChosen = true; GS.flags.l2Crew = 'monte';
  GS.flags.monteAtWall = true;
  sayAs('monte', ['"For a *cut*, kid. Twenty of whatever he loses. And I *tell you when to call*."',
    'He folds the felt into a square, puts three shells in his pocket like they are *car keys*, and '+
    'starts walking toward the light without waiting to see if you are following.',
    '"I have wanted a *reason* to stand in that light," Monte says, "for *fifteen years*."'],
    { then:saveGame });
}

/* ---- LEVEL 2 CUTAWAY PAINTER: the alley behind the wall ---------------- */
function paintAlleyDark(bx, by, bw, bh, t){
  /* the far wall of the alley, in the light of one bare bulb Vince cannot see */
  const grd = g.createLinearGradient(0, by, 0, by+bh);
  grd.addColorStop(0, '#0f0620'); grd.addColorStop(1, '#3d1a5e');
  g.fillStyle = grd; g.fillRect(bx, by, bw, bh);
  /* bricks */
  for(let yy = by; yy < by+bh; yy += 6){
    for(let xx = bx + ((yy/6)|0 %2 ? 3 : 0); xx < bx+bw; xx += 12){
      r(xx, yy, 10, 4, '#2a1140');
      r(xx, yy, 10, 1, '#3d2255');
    }
  }
  /* a bare bulb */
  const page = (GS.cut && GS.cut.i) || 0;
  const swing = REDUCED ? 0 : Math.sin(t/700 + page)*.6;
  const bx0 = bx + 30 + swing*4;
  r(bx0 + 6, by + 4, 1, 8, '#5a4470');
  blob(bx0 + 6, by + 14, 4, 4, page < 3 ? 'rgba(255,232,168,.90)' : 'rgba(80,60,40,.55)');
  /* pool of light on the ground */
  if(page < 3){
    const rg = g.createRadialGradient(bx0+6, by+bh-18, 2, bx0+6, by+bh-18, 42);
    rg.addColorStop(0, 'rgba(255,232,168,.28)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(bx0+6, by+bh-18, 42, 0, Math.PI*2); g.fill();
  }
  /* two silhouettes on the far wall, tempo per page */
  const TEMPO = [0, 260, 140, 0];
  const AMPL  = [0.5, 1.8, 3.6, 0];
  const per = TEMPO[Math.min(page, 3)], amp = AMPL[Math.min(page, 3)];
  const ph  = (REDUCED || !per) ? 0 : Math.sin(t/per);
  const wob = REDUCED ? 0 : ph * amp;
  const bul = REDUCED ? 3 : 3 + Math.abs(ph) * amp * 0.7;

  if(page === 3){
    /* afterwards: a matchbook on the ground and one bootprint */
    r(bx+bw/2-4, by+bh-10, 8, 4, '#120a1e'); textC('KF', bx+bw/2, by+bh-9, P.gold, FONT.sm);
    r(bx+bw/2+18, by+bh-8, 8, 3, '#2a1140');
  } else {
    /* two people, off-set, leaning in from opposite sides — shown only as
       silhouette against the far wall. the shape hooks up like an ampersand. */
    g.fillStyle = 'rgba(10,4,20,.85)';
    g.beginPath();
    g.ellipse(bx + bw/2 - 12 + wob*0.5, by + bh/2 - 6, 8 + bul*0.4, 12, 0, 0, Math.PI*2);
    g.fill();
    g.beginPath();
    g.ellipse(bx + bw/2 + 10 - wob*0.5, by + bh/2 - 4, 8 + bul*0.4, 12, 0, 0, Math.PI*2);
    g.fill();
    /* the leaning frame */
    g.globalAlpha = .35;
    r(bx + bw/2 - 22, by + bh/2 + 6 + wob*0.2, 44, 2, '#5a2a72');
    g.globalAlpha = 1;
  }

  /* one witness at the mouth of the alley: a cat, which turns away on page 2. */
  const pg = page;
  const cx = bx + bw - 14, cy = by + bh - 10;
  r(cx, cy, 6, 3, '#2a1140'); r(cx + (pg >= 1 ? 4 : 0), cy - 2, 3, 3, '#2a1140');
  if(pg < 2){ px(cx + 5, cy - 1, P.gold); px(cx + 6, cy - 1, P.gold); }
}

/* ---------- LEVEL 2 ENTRY: card, then the strip at night ---------------- */
let card2T = 0;
function enterLevel2(){                                 /* @owner system */
  GS.flags.chipGone = true;                             // he is at the wall now
  GS.flags.chipOnStrip = false;
  GS.flags.chipNoticed = false;
  GS.room = 'bwalk2';                                   // land on the strip
  setCharHeight(72);
  /* LaRue has moved to the wall for the night — she never misses a queue */
  GS.flags.zsaAtWall = true;
  Audio_.scene('play');
  Audio_.ambience('boardwalk');
  GS.scene = 'levelcard2';
  card2T = 0;
  saveGame();
}
function drawCard2(t){                                  /* @owner system */
  r(0,0,W,200,'#0d0518');
  const k = Math.min(1, card2T/700);
  g.globalAlpha = k;
  textC('ACT 1,  LEVEL 2', 160, 74, P.dim, FONT.sm);
  r(70, 88, 180, 1, 'rgba(255,46,136,.6)');
  textC("OTHER PEOPLE'S MONEY", 160, 96, P.gold, FONT.big);
  g.globalAlpha = Math.max(0, Math.min(1,(card2T-900)/600));
  textC('he is not mocking you any more. that is the problem.', 160, 126, '#7a5f96', FONT.sm);
  g.globalAlpha = 1;
  if(card2T > 1800 && Math.floor(t/600)%2===0)
    textC('CLICK TO CONTINUE', 160, 172, '#5a4470', FONT.sm);
  if(card2T > 4200) enterPlay2();
}
function enterPlay2(){                                  /* @owner system */
  GS.scene = 'play';
  const rm = ROOMS[GS.room];
  GS.player.x = rm.spawn[0]; GS.player.y = rm.spawn[1];
  GS.player.tx = GS.player.x; GS.player.ty = GS.player.y;
  Audio_.scene('play');
  Audio_.ambience(GS.room==='under2' ? 'deep' : GS.room==='pier2' ? 'surf' : 'boardwalk');
  if(rm.onEnter) rm.onEnter();
  saveGame();
}

/* Status bar label follows the level. Reassigns the engine's drawStatusBar
   without touching engine.js — same shape as the drawItemIcon extension. */
const _drawStatusBarL1 = drawStatusBar;
drawStatusBar = function(){                                    // eslint-disable-line
  g.globalAlpha = .72; r(0,0,W,11,P.ink); g.globalAlpha = 1;
  r(0,11,W,1,'rgba(255,46,136,.45)');
  const label = (GS.flags.levelDone && !GS.flags.level2Done)
              ? "ACT 1, LEVEL 2 - OTHER PEOPLE'S MONEY"
              : GS.flags.level2Done
              ? "ACT 1, LEVEL 2 - OTHER PEOPLE'S MONEY"
              : 'ACT 1, LEVEL 1 — SMALL CHANGE';
  text(label, 5, 2, P.dim, FONT.sm);
  const m = money();
  text(m, 288-textW(m,FONT.sm), 2, P.gold, FONT.sm);
  drawAudioSwitches();
};

/* ---------- LEVEL 2 CURTAIN CARD ---------------------------------------- */
function crewNote(){                                    /* @owner system */
  const c = GS.flags.l2Crew;
  return c === 'marnie' ? 'Ran the wall with Marnie Sable. She has a *room* now.'
       : c === 'dickie' ? 'Sang Chip’s crowd off him with Dickie Vermouth.'
       : c === 'monte'  ? 'Brought Monte to the wall. He will not be underneath the pier tomorrow.'
       :                  'Took the wall alone. Nobody is going to remember who else was there.';
}
function burnNote(){                                    /* @owner system */
  const b = GS.flags.l2Burned;
  return b === 'hoyt' ? 'Hoyt Winthrop tipped you like a valet. That is a name on a ledger later.'
       :                'Nobody was burned tonight who could be embarrassed about it in six levels.';
}
function endingNoteL2(){                                /* @owner system */
  return { plain:'Made Chip fold to a table that could see his hand.',
           charm:'Made Chip look at a queue that was longer than his.',
           force:'Took his wrist in front of Vince and let go before Vince decided.',
           money: 'Doubled the ante and heard Chip Winthrop say no in front of his crowd.',
           heat:  'Called him cousin. He came.' }[GS.flags.l2Ending] || 'Watched him fold.';
}
function drawComplete2(t){                              /* @owner system */
  const el = t - GS.complete2At;
  r(0,0,W,200,'#0d0518');
  vectorGrid(t, 150, .8);
  g.globalAlpha=.6; r(0,150,W,50,'#0d0518'); g.globalAlpha=1;
  g.globalAlpha = Math.min(1, el/500);
  textC('LEVEL COMPLETE', 160, 10, P.surf, FONT.bg);
  r(60,26,200,1,'rgba(255,46,136,.5)');
  textC("ACT 1, LEVEL 2 - OTHER PEOPLE'S MONEY", 160, 32, P.dim, FONT.sm);

  const nm = (GS.name||'THE BOARDWALK').toUpperCase();
  textC(nm + '  ·  ' + money(), 160, 48, P.gold, FONT.bg);
  const s = S();
  textC('MONEY ' + s.money + '   FIGHTING ' + s.fight + '   CHARM ' + s.charm, 160, 66, '#a08cb4', FONT.sm);

  const notes = [ endingNoteL2(), crewNote(), burnNote() ];
  if(GS.flags.marnieSecret) notes.push('Went behind the wall. Nobody there mentioned it.');
  if(GS.flags.gilCompd)     notes.push('Made a landlord pay you out of a coupon he printed himself.');
  const tier = heatTier(heatOf('chip'));
  if(tier) notes.push('Chip Winthrop ' + tier + '.');

  let ny = 82;
  for(let i=0;i<notes.length && ny < 134;i++){
    g.globalAlpha = Math.min(1, Math.max(0,(el - 600 - i*260)/400));
    const ls = wrap(notes[i], FONT.sm, 244);
    text('·', 40, ny+1, P.hot, FONT.sm);
    for(let j=0;j<ls.length;j++) text(ls[j], 50, ny+j*10, P.bone, FONT.sm);
    ny += ls.length*10 + 3;
  }
  const strip = tallyStrip();
  if(strip){
    g.globalAlpha = Math.min(1, Math.max(0,(el-1500)/500));
    textC(strip, 160, 140, P.gold, FONT.sm);
    g.globalAlpha = 1;
  }
  g.globalAlpha = Math.min(1, Math.max(0,(el-1800)/600));
  r(30, 150, 260, 1, 'rgba(255,46,136,.35)');
  textC('END OF THE FREE DEMO — THE WALL IS OPEN.', 160, 156, P.gold, FONT.sm);
  textC('Level 3 opens the door. Bring the ring.', 160, 168, '#7a5f96', FONT.sm);
  g.globalAlpha = 1;

  const bq = {x:106,y:180,w:108,h:15}, hv = inRect(mouse,bq);
  r(bq.x,bq.y,bq.w,bq.h, hv?P.hot:'#2a1140'); r(bq.x,bq.y,bq.w,1, hv?'#ff9ac8':'#5a2a72');
  textC('PLAY AGAIN', 160, bq.y+4, hv?P.bone:P.dim, FONT.sm);
}
