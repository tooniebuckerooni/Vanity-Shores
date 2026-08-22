/* Vanity Shores — scenery.js
 *
   Backdrops, props, and the baked room layers they compose into.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
/* ---------- 2. BACKDROPS ------------------------------------------------- */
function paintSky(y0, y1){
  const grd = g.createLinearGradient(0,y0,0,y1);
  grd.addColorStop(0,   P.sky4); grd.addColorStop(0.35, P.sky3);
  grd.addColorStop(0.68,P.sky2); grd.addColorStop(1,    P.sky1);
  g.fillStyle = grd; g.fillRect(0,y0,W,y1-y0);
  const q = rnd32(4);                                   // a few high stars up top
  for(let i=0;i<26;i++){ const sx=(q()*W)|0, sy=(q()*28)|0;
    g.globalAlpha = .10+q()*.35; px(sx,sy,P.bone); }
  g.globalAlpha = 1;
}
function synthSun(cx, cy, rad){                          // banded Outrun sun
  const grd = g.createLinearGradient(0,cy-rad,0,cy+rad);
  grd.addColorStop(0,'#ffe9a8'); grd.addColorStop(.45,P.gold);
  grd.addColorStop(.78,'#ff6a4d'); grd.addColorStop(1,P.hot);
  g.fillStyle = grd;
  g.beginPath(); g.arc(cx,cy,rad,0,Math.PI*2); g.fill();
  for(let i=0;i<9;i++){                                  // cut the classic gaps
    const yy = cy - rad + 10 + i*i*0.9 + i*3;
    if(yy > cy+rad) break;
    g.fillStyle = 'rgba(0,0,0,0)';
    g.clearRect(0,0,0,0);
    r(cx-rad, yy, rad*2, 1 + (i>>1), P.sky2);
  }
}
function skyline(baseY){                                 // Vanity Shores strip, far off
  const towers = [[8,26,'#3a1f5e'],[26,18,'#331b53'],[44,34,'#3a1f5e'],
                  [206,22,'#331b53'],[228,44,'#452668'],[252,16,'#331b53'],
                  [270,30,'#3a1f5e'],[296,20,'#331b53']];
  for(const [x,h,c] of towers){
    const w = 14 + (h%3)*4;
    r(x, baseY-h, w, h, c);
    const q = rnd32(x);
    for(let yy=baseY-h+3; yy<baseY-2; yy+=3)
      for(let xx=x+2; xx<x+w-2; xx+=3) if(q()>.45) px(xx,yy,P.gold);
  }
  // the casino: taller, crowned, unmistakable
  r(228, baseY-60, 24, 60, '#4a2a70');
  r(228, baseY-60, 24, 2, '#5d3689');
  r(236, baseY-70, 8, 10, '#4a2a70');
  r(238, baseY-76, 4, 6, '#5d3689');
  const q2 = rnd32(99);
  for(let yy=baseY-56; yy<baseY-4; yy+=4)
    for(let xx=230; xx<250; xx+=3) if(q2()>.35) px(xx,yy,q2()>.5?P.gold:P.amber);
}
function paintOcean(y0, y1){
  const grd = g.createLinearGradient(0,y0,0,y1);
  grd.addColorStop(0,P.sea1); grd.addColorStop(.5,P.sea2); grd.addColorStop(1,P.sea3);
  g.fillStyle = grd; g.fillRect(0,y0,W,y1-y0);
  for(let i=0;i<6;i++){                                   // static swell bands
    const yy = y0 + 2 + i*Math.max(2,((y1-y0)/7)|0);
    g.globalAlpha = .18; r(0,yy,W,1,P.foam); g.globalAlpha = 1;
  }
}
function oceanGlints(y0, y1, t, sunX){                    // live, drawn every frame
  const q = rnd32(((t/150)|0) % 64);
  g.globalAlpha = .7;
  for(let i=0;i<34;i++){
    const gx = (q()*W)|0, gy = (y0 + q()*(y1-y0))|0;
    const near = 1 - Math.min(1, Math.abs(gx-sunX)/150);
    if(q() < .25 + near*.5) r(gx, gy, 1+((q()*2)|0), 1, near>.5?'#ffe9a8':P.foam);
  }
  g.globalAlpha = 1;
}
function palmTree(x, baseY, h, seed, trunkC, frondC){
  const q = rnd32(seed);
  trunkC = trunkC||P.palm; frondC = frondC||P.palm;
  let tx = x;
  for(let i=0;i<h;i++){                                   // leaning trunk
    tx = x + Math.round(Math.sin(i/h*1.4)*4);
    r(tx, baseY-i, 3, 1, i%3===0 ? P.palmL : trunkC);
  }
  const ty = baseY-h;
  for(let f=0; f<7; f++){                                 // fronds
    const a = -Math.PI*0.92 + f*(Math.PI*1.84/6);
    const len = 11 + ((q()*7)|0);
    for(let i=0;i<len;i++){
      const px1 = tx+1 + Math.cos(a)*i;
      const py1 = ty + Math.sin(a)*i + (i*i)/(len*1.7);
      r(px1, py1, 2, 1, frondC);
      if(i>3 && i%2===0){ px(px1, py1-1, frondC); px(px1+1, py1+1, frondC); }
    }
  }
  r(tx-1, ty-1, 5, 3, frondC);
  for(let c=0;c<3;c++) px(tx + (c-1), ty+2, P.gold);       // coconuts
}
function plankFloor(y0, y1, warm){
  for(let y=y0; y<y1; y++){
    const dpt = (y-y0)/(y1-y0);
    const base = dpt<.33 ? P.wood2 : dpt<.7 ? P.wood : P.wood4;
    r(0,y,W,1,base);
    if((y-y0) % Math.max(3, 7-((dpt*4)|0)) === 0) r(0,y,W,1,P.wood3);
  }
  const q = rnd32(21);                                     // plank seams + grain
  for(let i=0;i<70;i++){
    const gx=(q()*W)|0, gy=(y0+q()*(y1-y0))|0, gw=2+((q()*7)|0);
    g.globalAlpha=.22; r(gx,gy,gw,1, q()>.5?P.wood3:P.wood4); g.globalAlpha=1;
  }
}
function railing(x0, x1, y){
  r(x0, y, x1-x0, 2, P.wood4);
  r(x0, y+2, x1-x0, 1, P.wood3);
  for(let x=x0+4; x<x1; x+=13){ r(x, y+2, 2, 9, P.wood2); r(x, y+2, 1, 9, P.wood4); }
  r(x0, y+9, x1-x0, 1, P.wood2);
}
function neonTube(x, y, w, h, col, on){
  const c = on ? col : 'rgba(120,90,140,.5)';
  r(x,y,w,h,c);
  if(on){ g.globalAlpha=.30; r(x-1,y-1,w+2,h+2,col); g.globalAlpha=1; }
}

/* ---------- 2b. PROPS ---------------------------------------------------- */
const SCENE_H = 174;                       // scene area; verb bar owns 174..200

function busShelter(x, y){                  // y = ground line
  r(x, y-40, 52, 3, '#6a4a86');             // roof
  r(x+2, y-38, 48, 26, 'rgba(120,220,230,.30)');
  r(x, y-40, 2, 40, '#4e3466'); r(x+50, y-40, 2, 40, '#4e3466');
  r(x+4, y-36, 20, 22, 'rgba(200,240,255,.16)');
  r(x+6, y-12, 40, 3, P.wood);              // bench
  r(x+8, y-9, 3, 9, P.wood3); r(x+40, y-9, 3, 9, P.wood3);
  r(x+6, y-34, 24, 16, P.hot);              // ad panel
  r(x+7, y-33, 22, 14, '#2a1140');
  textC('TAN', x+18, y-31, P.gold, FONT.sm);
  textC('NOW', x+18, y-24, P.surf, FONT.sm);
}
function welcomeArch(x, y, w){
  r(x, y, 4, 46, '#5c3a7a'); r(x+w-4, y, 4, 46, '#5c3a7a');
  r(x-4, y-2, w+8, 32, '#3d2255');
  r(x-4, y-2, w+8, 1, '#7a4fa0'); r(x-4, y+29, w+8, 1, '#241134');
  textC('WELCOME TO', x+w/2, y+1, P.gold, FONT.sm);
  textC('VANITY SHORES', x+w/2, y+11, P.hot, FONT.bg);
  for(let i=0;i<w;i+=6) px(x+i, y-3, P.gold);
}
function convertible(x, y, t){              // Chip's pink land yacht
  const b='#ff5fa2', b2='#c93d7a', chrome='#e8e4f0';
  r(x+4, y-9, 54, 8, b);
  r(x+14, y-15, 30, 7, b);                  // cabin
  r(x+16, y-14, 26, 5, '#2a1a3a');          // interior
  r(x+4, y-9, 54, 1, '#ff8cc0');
  r(x+2, y-4, 58, 3, b2);
  r(x, y-6, 4, 4, chrome); r(x+58, y-6, 4, 4, chrome);
  const spin = REDUCED ? 0 : (Math.floor(t/90)%4);
  for(const wx of [x+11, x+45]){
    r(wx, y-4, 9, 6, '#1a1420'); r(wx+2, y-2, 5, 3, chrome);
    px(wx+4+(spin>1?1:-1), y-1+(spin%2?1:0), '#8a8398');
  }
  r(x+36, y-8, 24, 8, P.gold);              // vanity plate
  r(x+36, y-8, 24, 1, '#fff0b0');
  textC('CHIP', x+48, y-7, '#2a1140', FONT.sm);
}
function bench(x, y){
  r(x, y-12, 42, 3, P.wood4); r(x, y-9, 42, 2, P.wood2);
  r(x, y-20, 42, 3, P.wood4); r(x, y-17, 42, 2, P.wood2);
  r(x+2, y-12, 3, 12, P.wood3); r(x+37, y-12, 3, 12, P.wood3);
  r(x+2, y-22, 2, 12, P.wood3); r(x+38, y-22, 2, 12, P.wood3);
}
function churroCart(x, y){
  r(x, y-22, 34, 16, '#d8563f'); r(x, y-22, 34, 2, '#f07a5f');
  r(x+2, y-19, 30, 10, '#3a1d2e');
  for(let i=0;i<5;i++) r(x+4+i*6, y-17, 4, 7, i%2?P.gold:P.amber);
  r(x-2, y-30, 38, 8, '#f0e2c8');           // striped awning
  for(let i=0;i<38;i+=6) r(x-2+i, y-30, 3, 8, '#d8563f');
  r(x, y-6, 34, 3, '#8a4030');
  r(x+3, y-3, 7, 5, '#1a1420'); r(x+24, y-3, 7, 5, '#1a1420');
  text('CHURRO', x+4, y-15, P.bone, FONT.sm);
}
function timeshareBooth(x, y){
  r(x, y-46, 58, 46, '#f2ead8');            // pop-up canopy
  r(x, y-46, 58, 3, '#e0d4bc');
  r(x-3, y-52, 64, 7, P.surf);
  r(x-3, y-52, 64, 1, '#6ff0e6');
  textC('SHORELINE', x+29, y-51, '#0a3c44', FONT.sm);
  r(x+2, y-42, 54, 22, '#dcd0b6');
  r(x+4, y-40, 50, 18, '#2a3f5e');          // brochure wall
  const q = rnd32(55);
  for(let i=0;i<12;i++){ const bx=x+6+(i%6)*8, by=y-38+((i/6)|0)*9;
    r(bx, by, 6, 7, q()>.5?P.gold:P.foam); px(bx+1,by+1,'#2a3f5e'); }
  r(x+2, y-18, 54, 4, '#c8b894');           // table
  r(x+2, y-14, 2, 14, '#a89874'); r(x+52, y-14, 2, 14, '#a89874');
  r(x+8, y-22, 12, 4, P.bone);              // clipboard stack
  r(x+30, y-21, 9, 3, '#d8563f');
}
function bandshell(x, y){
  r(x, y-58, 96, 40, '#8a5fa8');            // half-dome
  r(x+4, y-62, 88, 6, '#a37cc0');
  for(let i=0;i<5;i++) r(x+8+i*18, y-58, 2, 40, '#6b4586');
  r(x+8, y-54, 80, 34, '#4e3466');          // shell interior
  const grd = g.createLinearGradient(x+8,y-54,x+8,y-20);
  grd.addColorStop(0,'#5e3f7e'); grd.addColorStop(1,'#31204a');
  g.fillStyle = grd; g.fillRect(x+8,y-54,80,34);
  for(let i=1;i<5;i++){ const rr=i*9; g.strokeStyle='rgba(200,160,230,.22)'; g.lineWidth=1;
    g.beginPath(); g.arc(x+48, y-20, rr, Math.PI, 0); g.stroke(); }
  r(x, y-20, 96, 6, '#6b4586');             // stage lip
  r(x, y-20, 96, 1, '#a37cc0');
  r(x, y-14, 96, 3, '#3d2255');
  r(x+14, y-70, 68, 9, '#241134');          // marquee
  r(x+14, y-70, 68, 1, P.gold);
  textC('BANDSHELL', x+48, y-69, P.gold, FONT.sm);
}
function psychicTent(x, y){
  for(let i=0;i<44;i++){                    // conical tent
    const w = 4 + i*1.9;
    r(x+42-w/2, y-58+i, w, 1, i%7<3 ? '#5b2a8a' : '#7a3aad');
  }
  r(x+8, y-16, 68, 16, '#3d1a5e');
  r(x+8, y-16, 68, 1, '#8a4fc0');
  r(x+20, y-14, 44, 12, '#241134');         // beaded doorway
  for(let i=0;i<44;i+=3) for(let j=0;j<12;j+=3) px(x+20+i, y-14+j, P.gold);
  r(x+40, y-66, 4, 8, P.gold);              // finial
  r(x+38, y-70, 8, 5, P.gold);
  r(x-36, y-46, 52, 26, '#241134');         // hand-painted sign
  r(x-36, y-46, 52, 1, P.hot);
  r(x-36, y-21, 52, 1, '#4a1d3a');
  r(x-12, y-20, 3, 8, P.wood3);
  textC('PALMS', x-10, y-44, P.hot,  FONT.sm);
  textC('READ',  x-10, y-36, P.surf, FONT.sm);
  textC('$.25',  x-10, y-28, P.gold, FONT.sm);
}
function monteTable(x, y){
  r(x, y-18, 56, 4, '#3a5e3a');             // felt card table
  r(x, y-18, 56, 1, '#5a8a5a');
  r(x+3, y-14, 3, 14, '#2a2a30'); r(x+50, y-14, 3, 14, '#2a2a30');
  r(x+8, y-21, 10, 4, '#c8b08a');           // three shells
  r(x+23, y-21, 10, 4, '#c8b08a');
  r(x+38, y-21, 10, 4, '#c8b08a');
  for(const sx of [x+8,x+23,x+38]){ r(sx+1,y-22,8,1,'#e0cba8'); r(sx,y-18,10,1,'#8a7458'); }
}
function stairwell(x, y){                   // cut into the deck, descending
  r(x, y, 44, 24, '#241134');
  for(let i=0;i<6;i++){
    r(x+i*2, y+i*4, 44-i*4, 3, i%2?P.wood2:P.wood);
    r(x+i*2, y+i*4+3, 44-i*4, 1, P.wood3);
  }
  r(x-2, y-10, 3, 12, P.wood2); r(x+43, y-10, 3, 12, P.wood2);
  r(x-2, y-12, 48, 3, P.wood4);
  r(x+2, y-22, 40, 9, '#241134');
  r(x+2, y-22, 40, 1, P.surf);
  textC('BEACH', x+22, y-21, P.surf, FONT.sm);
}
function piling(x, yTop, yBot){
  r(x, yTop, 7, yBot-yTop, '#3a2a2a');
  r(x, yTop, 2, yBot-yTop, '#544040');
  r(x+5, yTop, 2, yBot-yTop, '#241a1a');
  const q = rnd32(x*7);
  for(let i=0;i<10;i++){ const yy=yTop+((q()*(yBot-yTop))|0);
    g.globalAlpha=.5; r(x, yy, 7, 1, q()>.5?'#2a3a3a':'#4a3a30'); g.globalAlpha=1; }
  r(x-1, yBot-16, 9, 3, '#1e2a2a');         // barnacle collar
}

/* ---------- 2c. ROOMS: baked backdrops + live layers ---------------------- */
const _baked = {};
function bakedRoom(id){
  if(_baked[id]) return _baked[id];
  const oc = offscreen(W, SCENE_H);
  withTarget(oc.getContext('2d'), () => ROOMART[id].bake());
  _baked[id] = oc; return oc;
}

const ROOMART = {
  /* ---- ARRIVAL: the bus drops you at the top of the strip ---- */
  arrival: {
    horizon: 78,
    bake(){
      paintSky(0, 84);
      synthSun(232, 74, 26);
      skyline(84);
      r(0, 84, W, 8, '#5a3a72');                       // haze band
      r(0, 92, W, 34, '#2e2438');                      // the road
      r(0, 92, W, 2, '#463a52');
      for(let x=6; x<W; x+=22) r(x, 108, 12, 2, P.gold); // centre line
      r(0, 124, W, 3, '#6a5a78');                      // kerb
      r(0, 127, W, SCENE_H-127, '#b8a894');            // sidewalk
      const q = rnd32(3);
      for(let i=0;i<180;i++){ const sx=(q()*W)|0, sy=(127+q()*(SCENE_H-127))|0;
        g.globalAlpha=.16; px(sx,sy, q()>.5?'#8a7a68':'#d8c8b0'); g.globalAlpha=1; }
      for(let x=0;x<W;x+=40) r(x,127,1,SCENE_H-127,'#a09080');
      palmTree(92, 130, 40, 5); palmTree(298, 132, 46, 9);
      welcomeArch(108, 30, 122);
      busShelter(12, 130);
      r(150, 118, 24, 9, '#241134');                   // bus-stop post sign
      r(158, 127, 3, 12, '#4e3466');
      textC('STOP', 162, 119, P.bone, FONT.sm);
      g.globalAlpha=.22; r(0,SCENE_H-14,W,14,'#8a7a68'); g.globalAlpha=1;
    },
    live(t){
      if(!GS.flags.chipGone) convertible(196, 124, t);
      if(GS.flags.quarterOnGround && !has('quarter')){        // it has to be visible
        r(180, 155, 5, 4, '#c8c8d4'); r(181, 154, 3, 6, '#c8c8d4');
        r(179, 156, 7, 2, '#c8c8d4'); r(181, 156, 3, 2, '#9a9aa8');
        g.globalAlpha = .35; r(178, 154, 9, 7, '#e8e8f0'); g.globalAlpha = 1;
        if(!REDUCED && Math.floor(t/620)%3 === 0) px(181 + (Math.floor(t/160)%3), 155, P.white);
      }
      const on = REDUCED || Math.floor(t/1100)%9 !== 0;  // buzzing neon
      neonTube(108, 62, 122, 1, P.hot, on);
      if(!REDUCED && Math.floor(t/300)%2===0) px(180+((t/90)|0)%6, 60, P.gold);
    }
  },

  /* ---- BOARDWALK: the strip proper ---- */
  boardwalk: {
    horizon: 76,
    bake(){
      paintSky(0, 76);
      synthSun(86, 68, 30);
      skyline(76);
      paintOcean(76, 98);
      r(0, 98, W, 10, P.sand);                          // beach
      r(0, 98, W, 1, P.foam);
      const q = rnd32(12);
      for(let i=0;i<90;i++) { g.globalAlpha=.3;
        px((q()*W)|0, (98+q()*10)|0, q()>.5?P.sand2:P.sand3); g.globalAlpha=1; }
      plankFloor(108, SCENE_H, true);
      for(let x=0;x<W;x+=26) r(x,108,1,SCENE_H-108,P.wood3); // plank seams
      railing(0, 108, 100); railing(140, W, 100);
      palmTree(16, 122, 44, 2, null, P.palm);
      palmTree(286, 120, 38, 8, null, P.palm);
      churroCart(176, 138);
      bench(44, 152);
      timeshareBooth(244, 152);
      stairwell(108, 150);
      r(0, SCENE_H-4, W, 4, 'rgba(60,30,20,.25)');
    },
    live(t){
      oceanGlints(76, 98, t, 86);
      const on = REDUCED || Math.floor(t/700)%11 !== 0;
      neonTube(244, 101, 58, 2, P.surf, on);            // booth valance glow
      if(!GS.flags.signTaken){                          // the FREE GIFT sign
        r(232, 118, 26, 20, P.gold);
        r(233, 119, 24, 18, '#c41d68');
        textC('FREE', 245, 120, P.bone, FONT.sm);
        textC('GIFT', 245, 128, P.bone, FONT.sm);
        r(238, 138, 3, 14, P.wood3);
      }
      if(!REDUCED){                                     // a gull, drifting
        const gx = (t/40) % (W+40) - 20, gy = 52 + Math.sin(t/700)*5;
        r(gx, gy, 3, 1, P.bone); r(gx-3, gy-1+((t/220)|0)%2, 3, 1, P.bone);
        r(gx+3, gy-1+((t/220)|0)%2, 3, 1, P.bone);
      }
    }
  },

  /* ---- PIER: bandshell and the fortune tent ---- */
  pier: {
    horizon: 74,
    bake(){
      paintSky(0, 74);
      synthSun(160, 66, 24);
      skyline(74);
      paintOcean(74, 120);
      plankFloor(120, SCENE_H, true);
      for(let x=0;x<W;x+=18) r(x,120,1,SCENE_H-120,P.wood3);
      for(let i=0;i<7;i++) r(20+i*44, 121, 12, 1, '#3a6a84'); // water through the slats
      railing(0, W, 116);
      bandshell(6, 132);
      psychicTent(226, 134);
      r(120, 122, 40, 6, P.wood2);                       // a crate, for standing on
      r(120, 122, 40, 1, P.wood4);
      r(0, SCENE_H-4, W, 4, 'rgba(60,30,20,.25)');
    },
    live(t){
      oceanGlints(74, 118, t, 160);
      const on = REDUCED || Math.floor(t/520)%7 !== 0;
      neonTube(20, 63, 68, 1, P.gold, on);
      neonTube(226, 70, 6, 6, P.hot, REDUCED || Math.floor(t/800)%5!==0);
      if(!REDUCED){
        for(let k=0;k<2;k++){
          const gx = ((t/32) + k*140) % (W+40) - 20, gy = 40 + Math.sin(t/600+k)*7;
          r(gx, gy, 3, 1, P.bone);
          r(gx-3, gy-1+((t/200+k*60)|0)%2, 3, 1, P.bone);
          r(gx+3, gy-1+((t/200+k*60)|0)%2, 3, 1, P.bone);
        }
      }
    }
  },

  /* ---- UNDER THE PIER: where the real money changes hands ---- */
  underpier: {
    horizon: 96,
    bake(){
      r(0, 0, W, SCENE_H, '#241a30');
      r(0, 0, W, 34, '#1a1220');                          // deck underside
      for(let x=0;x<W;x+=12) r(x, 0, 3, 34, '#120c18');   // joists
      for(let x=0;x<W;x+=12) r(x+3, 0, 1, 34, '#2a1e38');
      const grd = g.createLinearGradient(0,34,0,96);       // gloom under the deck
      grd.addColorStop(0,'#1e1628'); grd.addColorStop(1,'#3c2f4a');
      g.fillStyle = grd; g.fillRect(0,34,W,62);
      r(0, 88, W, 18, '#1e4356');                          // surf beyond
      r(0, 88, W, 1, '#3a7288');
      for(let i=0;i<5;i++) r(0, 90+i*4, W, 1, i%2?'#2a5a72':'#183a4c');
      r(0, 106, W, SCENE_H-106, '#3d3325');                // wet sand
      const grd2 = g.createLinearGradient(0,106,0,SCENE_H);
      grd2.addColorStop(0,'#33291e'); grd2.addColorStop(1,'#584838');
      g.fillStyle = grd2; g.fillRect(0,106,W,SCENE_H-106);
      const q = rnd32(77);
      for(let i=0;i<260;i++){ g.globalAlpha=.2;
        px((q()*W)|0,(106+q()*(SCENE_H-106))|0, q()>.5?'#241d14':'#6a5842'); g.globalAlpha=1; }
      for(const [x,b] of [[18,132],[84,148],[150,160],[216,150],[282,136]]) piling(x,34,b);
      for(let i=0;i<9;i++){                                // light through the slats
        g.globalAlpha = .055;
        g.fillStyle = P.gold;
        g.beginPath();
        g.moveTo(i*36+4, 34); g.lineTo(i*36+12, 34);
        g.lineTo(i*36+34, SCENE_H); g.lineTo(i*36+18, SCENE_H); g.closePath(); g.fill();
        g.globalAlpha = 1;
      }
      monteTable(178, 150);
      r(288, 106, 30, 4, P.wood2);                         // way back up
      for(let i=0;i<5;i++) r(288+i*2, 110+i*6, 30-i*3, 4, i%2?P.wood:P.wood2);
      r(276, 96, 40, 9, '#241134'); r(276, 96, 40, 1, P.surf);
      textC('BOARDWALK', 296, 97, P.surf, FONT.sm);
      // driftwood, a lost sandal, the usual
      r(40, 158, 22, 3, '#4a3e30'); r(44, 156, 9, 2, '#5a4c3c');
      r(120, 166, 7, 3, '#8a2c3e');
      const vg = g.createRadialGradient(160, 118, 40, 160, 118, 190);
      vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(8,4,14,.72)');
      g.fillStyle = vg; g.fillRect(0,34,W,SCENE_H-34);
    },
    live(t){
      const q = rnd32(((t/180)|0)%40);                     // breaking surf
      for(let i=0;i<26;i++){ const sx=(q()*W)|0;
        if(q()>.5) r(sx, 100+((q()*6)|0), 2+((q()*3)|0), 1, '#9cd4e0'); }
      g.globalAlpha = REDUCED ? .035 : .035 + Math.sin(t/900)*.02;
      r(0, 34, W, SCENE_H-34, P.gold); g.globalAlpha = 1;
    }
  }
};

