/* Vanity Shores — cast.js
 *
   The procedural cast. Every proportion is a fraction of CHAR_H, so
      setCharHeight(72) is the whole of the Sierra-scale jump for characters.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
/* ---------- 1. ART: procedural cast -------------------------------------- */
/* One renderer, many people. Every NPC is this function with different knobs. */

const SKIN = {
  fair:{ s:'#f0c9a0', d:'#c9976c', l:'#ffe0bd' },
  tan :{ s:'#d99a63', d:'#a86f45', l:'#f2bb85' },
  deep:{ s:'#8a5433', d:'#5e3520', l:'#a97048' },
  burn:{ s:'#f0533f', d:'#b8352a', l:'#ff7a63' },
  pale:{ s:'#f7ddc4', d:'#d0ab8c', l:'#fff2e2' }
};

/* Hair, built from the same curves as the head it sits on. The main mass has to
   stay clear of the eyes (they sit at hdT + hh*0.46); anything that frames the
   face goes outside the skull width instead of down over it. */
function hairShape(cx, hdT, hw, hh, style, c1, c2, sway){
  const crown = hdT + hh*0.10;
  switch(style){
    case 'blowout':                                   // feathered, 1987, immovable
      blob(cx, crown, hw*0.72, hh*0.36, c1);
      blob(cx - hw*0.56, hdT + hh*0.46, hw*0.28, hh*0.42, c1);
      blob(cx + hw*0.56, hdT + hh*0.46, hw*0.28, hh*0.42, c1);
      blob(cx - hw*0.30, hdT - hh*0.10, hw*0.26, hh*0.14, c2);
      blob(cx + hw*0.26, hdT - hh*0.06, hw*0.20, hh*0.12, c2);
      break;
    case 'perm':                                      // volume as a lifestyle
      blob(cx, crown - hh*0.04, hw*0.88, hh*0.42, c1);
      blob(cx - hw*0.70, hdT + hh*0.42, hw*0.36, hh*0.48, c1);
      blob(cx + hw*0.70, hdT + hh*0.42, hw*0.36, hh*0.48, c1);
      blob(cx - hw*0.62, hdT + hh*0.86, hw*0.26, hh*0.28, c1);
      blob(cx + hw*0.62, hdT + hh*0.86, hw*0.26, hh*0.28, c1);
      blob(cx - hw*0.36, hdT - hh*0.14, hw*0.28, hh*0.16, c2);
      blob(cx + hw*0.32, hdT - hh*0.08, hw*0.22, hh*0.13, c2);
      break;
    case 'spikes':
      for(let i = 0; i < 5; i++){
        const sx = cx - hw*0.46 + hw*0.23*i;
        g.fillStyle = c1;
        g.beginPath();
        g.moveTo(sx - hw*0.15, hdT + hh*0.24);
        g.lineTo(sx, hdT - hh*(0.20 + (i % 2)*0.20));
        g.lineTo(sx + hw*0.15, hdT + hh*0.24);
        g.closePath(); g.fill();
      }
      blob(cx, crown + hh*0.04, hw*0.60, hh*0.28, c1);
      blob(cx - hw*0.20, crown - hh*0.02, hw*0.20, hh*0.10, c2);
      break;
    case 'ponytail':
      blob(cx, crown, hw*0.58, hh*0.30, c1);
      blob(cx - hw*0.30, hdT + hh*0.02, hw*0.26, hh*0.12, c2);
      blob(cx + hw*0.60, hdT + hh*0.52, hw*0.20, hh*0.42, c1);
      blob(cx + hw*0.64, hdT + hh*(0.92 + sway*0.04), hw*0.17, hh*0.30, c1);
      break;
    case 'pomp':                                      // greased, load-bearing
      blob(cx, crown - hh*0.02, hw*0.60, hh*0.32, c1);
      blob(cx, hdT - hh*0.16, hw*0.46, hh*0.24, c1);
      blob(cx - hw*0.16, hdT - hh*0.20, hw*0.20, hh*0.12, c2);
      break;
    case 'bun':
      blob(cx, crown, hw*0.56, hh*0.30, c1);
      blob(cx + hw*0.54, hdT - hh*0.06, hw*0.26, hh*0.26, c1);
      blob(cx + hw*0.50, hdT - hh*0.12, hw*0.12, hh*0.10, c2);
      break;
    case 'turban':
      blob(cx, crown - hh*0.06, hw*0.76, hh*0.40, c1);
      blob(cx, hdT + hh*0.20, hw*0.78, hh*0.11, c2);
      blob(cx + hw*0.62, hdT - hh*0.18, hw*0.16, hh*0.16, P.gold);
      break;
    case 'cap':
      blob(cx, crown - hh*0.02, hw*0.68, hh*0.34, c1);
      blob(cx - hw*0.62, hdT + hh*0.24, hw*0.52, hh*0.09, c2);
      break;
    case 'bald':
      blob(cx, hdT + hh*0.16, hw*0.46, hh*0.16, c2);
      break;
    default:
      blob(cx, crown, hw*0.66, hh*0.34, c1);
  }
}

/* Tint a hex colour toward white (amt>0) or black (amt<0). */
function shade(hex, amt){
  const c = hex2rgb(hex), f = amt < 0 ? 0 : 255, k = Math.abs(amt);
  return '#' + c.map(v => Math.round(v + (f-v)*k).toString(16).padStart(2,'0')).join('');
}

/* ---------------------------------------------------------------------------
   THE CAST, BUILT FROM CURVES.

   Every proportion below is a fraction of CHAR_H, so raising the character
   height is a constant change rather than a rewrite — Level 2 ships at 72 by
   calling setCharHeight(72). Bodies are drawn 1:1 into a buffer with real
   curves (shoulder to waist to hip as one path, tapered limbs), the alpha is
   hardened to kill the anti-aliasing, and a dark keyline is stamped around the
   silhouette. Same technique the portraits use, and it is what stops a figure
   reading as a stack of rectangles.

   The composited result is cached per look and per animation frame, so the
   per-frame cost is a blit rather than a re-render.
   --------------------------------------------------------------------------- */
let CHAR_H = 40;
const _spriteCache = new Map();
let PB_W, PB_H, PBX, PBY, _pbuf, _pctx, _pout, _octx;

function sizeCharBuffers(){
  PB_W = Math.ceil(CHAR_H * 1.30); if(PB_W % 2) PB_W++;
  PB_H = Math.ceil(CHAR_H * 1.85);
  PBX  = PB_W >> 1;
  PBY  = PB_H - Math.ceil(CHAR_H * 0.10);
  _pbuf = offscreen(PB_W, PB_H); _pctx = _pbuf.getContext('2d');
  _pout = offscreen(PB_W, PB_H); _octx = _pout.getContext('2d');
  _spriteCache.clear();
}
sizeCharBuffers();
function setCharHeight(h){ CHAR_H = h; sizeCharBuffers(); }

function charMetrics(o){
  const H   = Math.max(16, CHAR_H + (o.size|0));
  const bd  = o.build || 0;
  const fig = o.figure || 'straight';
  /* a taller character can afford more realistic proportions; a small one cannot */
  const headH = H * (H < 50 ? 0.235 : H < 66 ? 0.20 : 0.165);
  const neck  = Math.max(1, H * 0.028);
  const torH  = H * 0.30;
  const shW   = H * ((fig === 'broad' || bd > 0) ? 0.250 : bd < 0 ? 0.190 : 0.215);
  return { H, bd, fig, headH, headW: headH * 0.88, neck, torH,
    legH: H - headH - neck - torH, shW,
    waW: shW * (fig === 'hourglass' ? 0.50 : fig === 'curved' ? 0.70 : bd > 0 ? 0.94 : 0.86),
    hiW: shW * (fig === 'hourglass' ? 1.20 : fig === 'curved' ? 1.06 : 0.92),
    limb: Math.max(1.2, H * 0.038) };
}

function torsoPath(cx, torT, m){
  g.beginPath();
  g.moveTo(cx - m.shW/2, torT);
  g.quadraticCurveTo(cx - m.shW/2, torT + m.torH*0.34, cx - m.waW/2, torT + m.torH*0.60);
  g.quadraticCurveTo(cx - m.hiW/2, torT + m.torH*0.86, cx - m.hiW/2, torT + m.torH);
  g.lineTo(cx + m.hiW/2, torT + m.torH);
  g.quadraticCurveTo(cx + m.hiW/2, torT + m.torH*0.86, cx + m.waW/2, torT + m.torH*0.60);
  g.quadraticCurveTo(cx + m.shW/2, torT + m.torH*0.34, cx + m.shW/2, torT);
  g.closePath();
}
/* One tapered limb. Returns where the hand ends up. */
function limbShape(x0, y0, x1, y1, w, col){
  g.fillStyle = col;
  const mx = (x0 + x1)/2 + (x1 - x0)*0.28, my = (y0 + y1)/2;
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo(mx + w*0.5, my, x1 + w*0.5, y1);
  g.lineTo(x1 - w*0.5, y1);
  g.quadraticCurveTo(mx - w*0.5, my, x0 - w, y0);
  g.closePath(); g.fill();
  return { x:x1, y:y1 };
}
function blob(x, y, rx, ry, col){
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI*2); g.fill();
}

function drawPersonRaw(x, y, o, t, walkPhase, blink){
  const m  = charMetrics(o);
  const sk = SKIN[o.skin || 'tan'];
  const bob = (o.still || REDUCED) ? 0 : (Math.floor(t/420) % 2 ? 0 : -1);
  const wk  = walkPhase || 0;
  const cx  = x;
  const legT = y - m.legH;
  const torT = legT - m.torH + bob;
  const hdT  = torT - m.neck - m.headH;

  const sc = o.shirt || '#e94f6a', scD = o.shirtD || '#b8324a';
  const pants = o.pants || '#2f3a6b';
  const step = wk ? Math.sin(wk) * m.H * 0.055 : 0;
  const ank  = Math.max(1.2, m.H * 0.036);

  /* ---- legs: tapered, with a real gap between them ---- */
  for(const side of [-1, 1]){
    const sw = side < 0 ? step : -step;
    g.fillStyle = side < 0 ? pants : shade(pants, -0.18);
    g.beginPath();
    g.moveTo(cx + side*m.hiW*0.06, legT - 1);
    g.lineTo(cx + side*m.hiW*0.50, legT - 1);
    g.quadraticCurveTo(cx + side*m.hiW*0.42, legT + m.legH*0.5, cx + sw + side*ank*1.7, y);
    g.lineTo(cx + sw + side*ank*0.2, y);
    g.quadraticCurveTo(cx + side*m.hiW*0.10, legT + m.legH*0.5, cx + side*m.hiW*0.06, legT - 1);
    g.closePath(); g.fill();
  }
  if(o.skirt){
    g.fillStyle = o.skirt;
    g.beginPath();
    g.moveTo(cx - m.waW*0.54, legT - m.torH*0.34);
    g.quadraticCurveTo(cx - m.hiW*0.58, legT - m.torH*0.04, cx - m.hiW*0.66, legT + m.legH*0.34);
    g.lineTo(cx + m.hiW*0.66, legT + m.legH*0.34);
    g.quadraticCurveTo(cx + m.hiW*0.58, legT - m.torH*0.04, cx + m.waW*0.54, legT - m.torH*0.34);
    g.closePath(); g.fill();
    r(cx - m.waW*0.54, legT - m.torH*0.34, m.waW*0.5, 1, shade(o.skirt, .14));
  }
  const sh = o.shoes || '#e9e4d8';
  r(cx + step - ank*2.1, y - ank*0.8, ank*2, ank*1.1, sh);
  r(cx - step + ank*0.1, y - ank*0.8, ank*2, ank*1.1, shade(sh, -0.14));

  /* ---- torso: one silhouette, the outfit painted inside it ---- */
  const bare = ['tank','bikini','lingerie','slip','halter','mesh'].indexOf(o.shirtStyle) >= 0;
  g.save();
  torsoPath(cx, torT, m);
  g.clip();
  r(cx - m.shW, torT - 1, m.shW*2, m.torH + 2, bare ? sk.s : sc);
  const tL = cx - m.shW/2, tW = m.shW;
  const S1 = Math.max(1, m.H*0.025), S2 = Math.max(1, m.H*0.05);
  if(!bare){
    r(tL, torT, tW, S1, o.shirtL || scD);
    r(tL, torT, Math.max(1, m.H*0.022), m.torH*0.6, shade(sc, .16));
    r(cx + m.shW/2 - Math.max(1,m.H*0.022), torT, Math.max(1,m.H*0.022), m.torH*0.9, shade(sc, -.20));
    r(cx - m.shW*0.16, torT + m.H*0.02, m.shW*0.32, Math.max(1,m.H*0.022), shade(sc, -.16));
    r(tL, torT + m.torH - S1, tW, S1, shade(sc, -.30));
  } else {
    r(cx + m.shW*0.28, torT, m.shW*0.24, m.torH, sk.d);
  }

  /* chest, as form rather than decoration */
  if(m.fig === 'curved' || m.fig === 'hourglass'){
    const br = m.shW * (m.fig === 'hourglass' ? 0.30 : 0.24);
    const bc1 = bare ? shade(sk.s, .22) : shade(sc, .22);
    const bc2 = bare ? shade(sk.d, -.12) : shade(sc, -.28);
    blob(cx - br*0.84, torT + m.torH*0.26, br, br*0.86, bc1);
    blob(cx + br*0.84, torT + m.torH*0.26, br, br*0.86, bc1);
    blob(cx - br*0.84, torT + m.torH*0.36, br*0.92, br*0.34, bc2);
    blob(cx + br*0.84, torT + m.torH*0.36, br*0.92, br*0.34, bc2);
  }

  if(m.fig === 'curved' || m.fig === 'hourglass'){
    const wy = torT + m.torH*0.46, wh = m.torH*0.42;
    const pinch = m.fig === 'hourglass' ? 0.46 : 0.30;
    g.fillStyle = bare ? shade(sk.s, -.30) : shade(sc, -.30);
    for(const side of [-1, 1]){
      g.beginPath();
      g.moveTo(cx + side*m.shW, wy);
      g.lineTo(cx + side*m.shW*0.5, wy);
      g.quadraticCurveTo(cx + side*m.shW*(0.5 - pinch), wy + wh*0.46,
                         cx + side*m.shW*0.52, wy + wh);
      g.lineTo(cx + side*m.shW, wy + wh);
      g.closePath(); g.fill();
    }
  }

  switch(o.shirtStyle){
    case 'hawaii': { const q = rnd32(7);
      for(let i=0;i<12;i++){ const fx = tL + q()*tW, fy = torT + q()*m.torH;
        px(fx, fy, P.gold); px(fx+1, fy, P.surf); } break; }
    case 'blazer':
      r(cx - m.shW*0.14, torT, m.shW*0.28, m.torH, o.inner || P.bone);
      g.fillStyle = scD;
      g.beginPath(); g.moveTo(tL, torT); g.lineTo(cx, torT + m.torH*0.42);
      g.lineTo(tL + tW*0.22, torT + m.torH); g.lineTo(tL, torT + m.torH); g.closePath(); g.fill();
      g.fillStyle = shade(scD, -.18);
      g.beginPath(); g.moveTo(tL + tW, torT); g.lineTo(cx, torT + m.torH*0.42);
      g.lineTo(tL + tW*0.78, torT + m.torH); g.lineTo(tL + tW, torT + m.torH); g.closePath(); g.fill();
      break;
    case 'sequin': { const q = rnd32(19 + ((t/260)|0) % 5);
      for(let i=0;i<16;i++) px(tL + q()*tW, torT + q()*m.torH, P.gold);
      r(cx - m.shW*0.12, torT, m.shW*0.24, m.torH, o.inner || P.bone); break; }
    case 'polo':
      r(cx - m.shW*0.22, torT, m.shW*0.44, S2, o.inner || P.white);
      r(cx - m.shW*0.34, torT - S1, m.shW*0.24, S2, o.inner || P.white);
      r(cx + m.shW*0.10, torT - S1, m.shW*0.24, S2, shade(o.inner || P.white, -.12));
      break;
    case 'mesh':
      for(let yy = torT; yy < torT + m.torH; yy += 2)
        for(let xx = tL - 2; xx < tL + tW + 2; xx += 2)
          px(xx + (((yy - torT)/2) % 2 ? 1 : 0), yy, sc);
      r(cx - m.shW*0.10, torT, m.shW*0.20, m.torH, sc);
      break;
    case 'bikini':
      r(tL - 2, torT + m.torH*0.20, tW + 4, S2, sc);
      r(tL - 2, torT + m.torH*0.20, tW + 4, S1, shade(sc, .20));
      r(tL - 2, torT + m.torH*0.80, tW + 4, S2, sc);
      break;
    case 'lingerie':
      r(tL - 2, torT + m.torH*0.16, tW + 4, m.torH*0.26, sc);
      r(tL - 2, torT + m.torH*0.16, tW + 4, S1, o.inner || '#f0dce6');
      r(tL - 2, torT + m.torH*0.40, tW + 4, S1, o.inner || '#f0dce6');
      r(tL - 2, torT + m.torH*0.78, tW + 4, m.torH*0.16, sc);
      r(tL - 2, torT + m.torH*0.92, tW + 4, S1, o.inner || '#f0dce6');
      break;
    case 'slip':
      r(tL - 2, torT + m.torH*0.14, tW + 4, m.torH, sc);
      r(tL - 2, torT + m.torH*0.14, tW + 4, S1, shade(sc, .22));
      r(cx - m.shW*0.32, torT - S1, S1, m.torH*0.22, sc);
      r(cx + m.shW*0.24, torT - S1, S1, m.torH*0.22, sc);
      break;
    case 'corset':
      r(tL - 2, torT + m.torH*0.16, tW + 4, m.torH, sc);
      r(tL - 2, torT + m.torH*0.16, tW + 4, S1, shade(sc, .24));
      for(let yy = torT + m.torH*0.28; yy < torT + m.torH*0.92; yy += 2){
        px(cx - 1, yy, o.inner || P.bone); px(cx + 1, yy + 1, o.inner || P.bone);
      }
      break;
    case 'halter':
      r(tL - 2, torT + m.torH*0.16, tW + 4, m.torH*0.40, sc);
      r(tL - 2, torT + m.torH*0.16, tW + 4, S1, shade(sc, .18));
      r(cx - S1, torT - S2*0.6, S1*2, m.torH*0.24, sc);
      break;
  }
  g.restore();

  /* ---- arms ---- */
  const sleeve  = bare ? shade(sk.s, -.16) : sc;
  const sleeveD = bare ? sk.d : shade(sc, -.22);
  const swing = wk ? Math.sin(wk + Math.PI) * m.H * 0.035 : 0;
  const armTop = torT + m.torH*0.06;
  const pose = wk ? '' : (o.pose || '');
  if(pose === 'crossed'){
    r(cx - m.shW*0.62, torT + m.torH*0.30, m.shW*1.24, m.H*0.075, sleeve);
    r(cx - m.shW*0.62, torT + m.torH*0.30, m.shW*1.24, Math.max(1, m.H*0.022), shade(sleeve, .16));
    blob(cx - m.shW*0.52, torT + m.torH*0.45, m.limb*0.6, m.limb*0.55, sk.s);
    blob(cx + m.shW*0.52, torT + m.torH*0.45, m.limb*0.6, m.limb*0.55, sk.d);
  } else {
    for(const side of [-1, 1]){
      const out  = pose === 'stiff' ? 0.34 : (pose === 'hold' && side > 0) ? 0.10 : 0;
      const drop = (pose === 'pocket' && side > 0) ? 0.86
                 : (pose === 'hold' && side > 0)   ? 0.78 : 1.02;
      const sw = side < 0 ? swing : -swing;
      /* nearly vertical: the shoulder stays the widest point, and whatever the
         waist does underneath is left visible between arm and body */
      const h = limbShape(cx + side*(m.shW*0.54), armTop,
                          cx + side*(m.shW*0.58 + out*m.shW),
                          torT + m.torH*drop + sw, m.limb,
                          side < 0 ? sleeve : sleeveD);
      blob(h.x, h.y + m.limb*0.3, m.limb*0.55, m.limb*0.62, side < 0 ? sk.s : sk.d);
      if(pose === 'hold' && side > 0)
        r(h.x - m.limb, h.y + m.limb*0.2, m.limb*2, Math.max(1, m.H*0.022), sleeveD);
    }
  }

  /* ---- neck and head ---- */
  const hw = m.headW, hh = m.headH, hx = cx - hw/2;
  r(cx - hw*0.20, hdT + hh*0.86, hw*0.40, m.neck + hh*0.16, sk.d);
  blob(cx, hdT + hh*0.50, hw*0.50, hh*0.50, sk.s);
  blob(cx, hdT + hh*0.62, hw*0.44, hh*0.42, sk.s);
  blob(cx - hw*0.16, hdT + hh*0.38, hw*0.24, hh*0.26, sk.l);
  blob(cx + hw*0.28, hdT + hh*0.54, hw*0.16, hh*0.30, sk.d);
  if(o.skin === 'burn'){
    px(hx + hw*0.2, hdT + hh*0.3, P.bone);
    px(hx + hw*0.7, hdT + hh*0.5, P.bone);
    px(hx + hw*0.45, hdT + hh*0.72, P.bone);
  }
  const ey = Math.max(1, Math.round(hw*0.14));
  if(blink){
    r(Math.round(cx - hw*0.30), Math.round(hdT + hh*0.52), ey*1.6, 1, sk.d);
    r(Math.round(cx + hw*0.06), Math.round(hdT + hh*0.52), ey*1.6, 1, sk.d);
  } else {
    r(Math.round(cx - hw*0.28), Math.round(hdT + hh*0.46), ey, ey, P.ink);
    r(Math.round(cx + hw*0.12), Math.round(hdT + hh*0.46), ey, ey, P.ink);
    r(Math.round(cx - hw*0.32), Math.round(hdT + hh*0.36), ey*1.8, Math.max(1, ey*0.6),
      shade(o.hairC || '#3b2416', -.1));
    r(Math.round(cx + hw*0.08), Math.round(hdT + hh*0.36), ey*1.8, Math.max(1, ey*0.6),
      shade(o.hairC || '#3b2416', -.1));
  }
  r(Math.round(cx + hw*0.02), Math.round(hdT + hh*0.58), 1, Math.max(1, hh*0.14), shade(sk.s, -.14));
  r(Math.round(cx - hw*0.16), Math.round(hdT + hh*0.74), hw*0.32, Math.max(1, hh*0.10), o.lips || sk.d);
  if(o.stubble) r(hx + 1, hdT + hh*0.62, hw - 2, hh*0.30, 'rgba(40,25,60,.32)');
  if(o.mustache) r(cx - hw*0.20, hdT + hh*0.68, hw*0.40, Math.max(1, hh*0.10),
                   shade(o.hairC || '#3b2416', -.1));

  hairShape(cx, hdT, hw, hh, o.hair || 'blowout',
            o.hairC || '#3b2416', o.hairC2 || '#6b4426', (Math.floor(t/300) % 2));

  switch(o.acc){
    case 'shades': r(hx, hdT + hh*0.38, hw*0.42, hh*0.26, P.ink);
                   r(hx + hw*0.58, hdT + hh*0.38, hw*0.42, hh*0.26, P.ink);
                   r(hx + hw*0.42, hdT + hh*0.46, hw*0.16, 1, P.ink);
                   px(hx + hw*0.12, hdT + hh*0.42, '#5f93ad'); break;
    case 'chain':  blob(cx, torT + m.torH*0.16, m.shW*0.20, Math.max(1, m.H*0.02), P.gold); break;
    case 'fanny':  r(cx - m.hiW*0.5, legT - m.H*0.06, m.hiW, Math.max(1.5, m.H*0.05), '#4de0a0');
                   r(cx - 1, legT - m.H*0.045, 2, 1, P.ink); break;
    case 'band':   r(hx - 1, hdT + hh*0.10, hw + 2, Math.max(1.5, hh*0.18), P.hot); break;
    case 'hoops':  blob(hx - hw*0.06, hdT + hh*0.56, hw*0.10, hh*0.16, P.gold);
                   blob(hx + hw*1.06, hdT + hh*0.56, hw*0.10, hh*0.16, P.gold); break;
    case 'visor':  r(hx - hw*0.2, hdT + hh*0.24, hw*1.4, Math.max(1.5, hh*0.16), P.hot); break;
  }
  if(o.hat === 'fedora'){
    r(hx - hw*0.34, hdT - hh*0.06, hw*1.68, Math.max(1.5, hh*0.16), o.hatC || '#e8dcc4');
    r(hx - hw*0.10, hdT - hh*0.42, hw*1.20, hh*0.40, o.hatC || '#e8dcc4');
    r(hx - hw*0.10, hdT - hh*0.16, hw*1.20, Math.max(1, hh*0.10), '#6b4426');
  }
  if(o.hat === 'flat'){
    const hc = o.hatC || '#1a1620';
    blob(cx, hdT - hh*0.10, hw*0.68, hh*0.34, hc);
    r(hx - hw*0.08, hdT - hh*0.32, hw*1.16, hh*0.36, hc);
    r(hx - hw*0.08, hdT - hh*0.32, hw*1.16, Math.max(1, hh*0.10), shade(hc, .28));
    r(hx - hw*0.30, hdT - hh*0.02, hw*1.60, Math.max(1.5, hh*0.14), hc);
    r(hx - hw*0.30, hdT - hh*0.02, hw*1.60, Math.max(1, hh*0.07), shade(hc, .16));
    px(Math.round(hx + hw*0.1), Math.round(hdT - hh*0.22), P.gold);
  }
  /* Marks. What last night left on you. Nobody in Vanity Shores will mention
     any of this — the joke is between the game and the person holding the
     mouse — but it is on the sprite until something takes it off. */
  if(o.marks){
    /* At CHAR_H 40 a cheek is one logical pixel wide, so a soft blend simply
       disappears — the same thing that killed the hourglass waist. These are
       painted as solid, grid-aligned pixels at full alpha instead, sized as
       fractions of the head so they hold up when Level 2 goes to 72. */
    const R = Math.round;
    if(o.marks.indexOf('flushed') >= 0){
      const cw = Math.max(2, R(hw*0.22)), ch = Math.max(1, R(hh*0.12));
      const cy = R(hdT + hh*0.60);
      r(R(cx - hw*0.44), cy, cw, ch, '#e0455f');
      r(R(cx + hw*0.44) - cw, cy, cw, ch, '#e0455f');
    }
    if(o.marks.indexOf('lipstick') >= 0)
      r(R(cx + m.shW*0.14), R(torT + m.torH*0.05),
        Math.max(2, R(m.shW*0.16)), Math.max(1, R(m.H*0.030)), '#c8143e');
    if(o.marks.indexOf('stain') >= 0){
      const sw = Math.max(2, R(m.shW*0.20)), sh = Math.max(2, R(m.torH*0.16));
      const sx = R(cx - m.shW*0.20), sy = R(torT + m.torH*0.44);
      r(sx, sy, sw, sh, '#e8dcb0');
      r(sx, sy, sw, Math.max(1, R(sh*0.4)), '#f4ecd0');
    }
    if(o.marks.indexOf('dishevel') >= 0){
      const dw = Math.max(1, R(hw*0.12));
      r(R(cx + hw*0.46), R(hdT - hh*0.26), dw, Math.max(2, R(hh*0.34)),
        o.hairC2 || '#6b4426');
      r(R(cx - hw*0.54), R(hdT - hh*0.14), dw, Math.max(2, R(hh*0.22)),
        o.hairC2 || '#6b4426');
    }
  }
  return { headTop: hdT, headX: hx, headW: hw, torsoTop: torT };
}

/* Look plus animation frame gives a finished, outlined sprite. Cached. */
function lookKey(o){
  return [o.skin,o.hair,o.hairC,o.hairC2,o.shirtStyle,o.shirt,o.shirtD,o.shirtL,o.inner,
          o.pants,o.skirt,o.shoes,o.acc,o.hat,o.hatC,o.figure,o.build,o.size,o.pose,
          o.lips,o.stubble,o.mustache,o.still,o.marks].join('|');
}
function spriteBuffer(o, t, walkPhase, bobF, blink){
  const bucket = walkPhase ? (Math.floor((walkPhase % (Math.PI*2)) / (Math.PI*2) * 8) + 1) : 0;
  const shim = (o.shirtStyle === 'sequin') ? ((t/260)|0) % 5 : 0;
  const key = lookKey(o) + '#' + CHAR_H + ',' + bucket + ',' + bobF + ',' + (blink?1:0) + ',' + shim;
  const hit = _spriteCache.get(key);
  if(hit) return hit;

  _pctx.clearRect(0, 0, PB_W, PB_H);
  withTarget(_pctx, () => drawPersonRaw(PBX, PBY, o,
    bobF ? 0 : 999999, walkPhase ? (bucket - 1)/8 * Math.PI*2 : 0, blink));

  /* harden the edges — curves without this read as smudges once scaled up */
  const id = _pctx.getImageData(0, 0, PB_W, PB_H), d = id.data;
  for(let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;
  _pctx.putImageData(id, 0, 0);

  _octx.clearRect(0, 0, PB_W, PB_H);
  _octx.globalCompositeOperation = 'source-over';
  _octx.drawImage(_pbuf, 0, 0);
  _octx.globalCompositeOperation = 'source-in';
  _octx.fillStyle = '#130a1e';
  _octx.fillRect(0, 0, PB_W, PB_H);
  _octx.globalCompositeOperation = 'source-over';

  const fin = offscreen(PB_W, PB_H), fc = fin.getContext('2d');
  fc.imageSmoothingEnabled = false;
  for(const d2 of [[-1,0],[1,0],[0,-1],[0,1]]) fc.drawImage(_pout, d2[0], d2[1]);
  fc.drawImage(_pbuf, 0, 0);

  if(_spriteCache.size > 260) _spriteCache.clear();
  _spriteCache.set(key, fin);
  return fin;
}

/* Draw a person. (x,y) = centre of feet. o = look options. t = ms clock. */
function drawPerson(x, y, o, t, walkPhase){
  const m = charMetrics(o);
  g.globalAlpha = .26;
  r((x|0) - m.hiW/2 - 1, y, m.hiW + 2, Math.max(1.5, m.H*0.05), P.ink);
  g.globalAlpha = 1;

  const bobF  = (o.still || REDUCED) ? 1 : (Math.floor(t/420) % 2);
  const blink = !REDUCED && !o.still &&
                Math.floor(t/2600) % 7 === 0 && Math.floor(t/130) % 2 === 0;
  g.drawImage(spriteBuffer(o, t, walkPhase, bobF, blink), (x|0) - PBX, (y|0) - PBY);
  return { torsoTop: y - m.legH - m.torH };
}

/* ---------------------------------------------------------------------------
   PORTRAITS.
   The world sprites are ~40px tall and there is no room in them for a face.
   Portraits are where a character actually gets to look like somebody, so they
   are drawn bigger and, for the cast who earn it, by hand.

   The technique: draw into a 44x52 buffer at 1:1 using real curves — ellipses
   and arcs, which rects cannot fake — then harden every edge to full alpha and
   snap every colour to a fixed palette. Smooth tools, limited-palette pixel-art
   output. The result is cached per expression, so the per-frame cost is a blit.
   --------------------------------------------------------------------------- */
const PW = 44, PH = 52;

function quantize(ctx, palette){
  const id = ctx.getImageData(0, 0, PW, PH), d = id.data;
  for(let i = 0; i < d.length; i += 4){
    if(d[i+3] < 110){ d[i+3] = 0; continue; }
    d[i+3] = 255;
    let best = palette[0], bd = 1e9;
    for(const c of palette){
      const dr = d[i]-c[0], dg = d[i+1]-c[1], db = d[i+2]-c[2];
      const dist = dr*dr + dg*dg + db*db;
      if(dist < bd){ bd = dist; best = c; }
    }
    d[i] = best[0]; d[i+1] = best[1]; d[i+2] = best[2];
  }
  ctx.putImageData(id, 0, 0);
}
const rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
function ell(c, x, y, rx, ry, col){
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI*2); c.fill();
}
function ring(c, x, y, r, w, col){
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(x, y, r, 0, Math.PI*2); c.stroke();
}

/* ---- Madame LaRue -------------------------------------------------------
   Storm of black curls, gold at every opportunity, and a look that is already
   pricing you. Red with a white neckline, coins at the brow and the throat. */
const LARUE_PAL = ['#170e28','#2c1e4e','#3d2c66','#5a4184','#7a5aa8',
                   '#5e3520','#8a5433','#a97048','#c68a5c','#e0ab7e',
                   '#f2e4d4','#241a14','#7a1f3a','#c02a4e','#e8547a',
                   '#ffc23d','#c98a1a','#8e1e33','#c4304a','#f5e6d3'].map(rgb);

function paintLaRue(c, blink){
  c.clearRect(0, 0, PW, PH);
  const CX = 22;
  const SKN = '#8a5433', LIT = '#a97048', SHD = '#5e3520', HI = '#c68a5c';

  /* hair: a storm of it, but framing the face rather than swallowing it */
  ell(c, CX, 20, 21, 20, '#2c1e4e');
  ell(c, 6, 30, 8, 13, '#2c1e4e');   ell(c, 38, 30, 8, 13, '#2c1e4e');
  ell(c, 8, 42, 6, 7,  '#2c1e4e');   ell(c, 36, 42, 6, 7,  '#2c1e4e');
  for(const [x,y] of [[13,13],[31,13],[6,20],[38,20],[22,6],[6,34],[38,34],[16,41],[28,41]])
    ell(c, x, y, 3.6, 3.6, '#170e28');                   // shadow between the curls
  for(const [x,y,r] of [[4,16,4],[8,8,4.5],[15,4,4.5],[29,4,4.5],[36,8,4.5],[40,16,4],
                        [3,27,3.5],[41,27,3.5],[5,37,3.5],[39,37,3.5],[10,45,3.5],[34,45,3.5]])
    ell(c, x, y, r, r, '#3d2c66');                       // ringlets catch the edge
  for(const [x,y,r] of [[7,11,2.2],[16,3,2.4],[28,3,2.2],[37,11,2.2],[3,22,1.8],[41,22,1.8],
                        [6,38,1.8],[38,38,1.8]])
    ell(c, x, y, r, r, '#5a4184');
  ell(c, 12, 6, 1.6, 1.1, '#7a5aa8');  ell(c, 32, 6, 1.4, 1.1, '#7a5aa8');

  /* face — big enough to have features */
  ell(c, CX, 23, 10, 12, SKN);
  ell(c, CX, 26, 9, 9, SKN);
  ell(c, CX-3.5, 19, 5, 5.5, LIT);
  ell(c, CX-4.5, 17, 2.8, 2.4, HI);
  ell(c, CX+6.5, 23, 3, 6.5, SHD);
  ell(c, CX, 33.5, 4, 1.6, SHD);
  ell(c, 12.5, 24, 1.6, 2.2, SHD);  ell(c, 31.5, 24, 1.6, 2.2, SHD);   // ears
  c.fillStyle = '#ffc23d'; c.fillRect(12, 24, 1, 1); c.fillRect(31, 24, 1, 1);

  /* neck and shoulders */
  c.fillStyle = SHD; c.fillRect(18, 34, 8, 7);
  c.fillStyle = SKN;  c.fillRect(18, 35, 5, 6);
  ell(c, CX, 40, 6, 3, SKN);
  ell(c, CX, 34.5, 4.5, 1.2, '#4a2818');          // the line under the jaw
  ell(c, 11, 47, 10, 7, SKN);  ell(c, 33, 47, 10, 7, SKN);
  ell(c, 12, 45, 6, 3, LIT);

  /* the front of the hair: a crown and two curls at the temples, no more */
  ell(c, CX, 8, 12, 6, '#2c1e4e');
  ell(c, 9.5, 19, 4, 9, '#2c1e4e');     ell(c, 34.5, 19, 4, 9, '#2c1e4e');
  ell(c, 10.5, 28, 3, 4.5, '#2c1e4e');  ell(c, 33.5, 28, 3, 4.5, '#2c1e4e');
  ell(c, CX-5, 5.5, 4, 2.2, '#3d2c66'); ell(c, CX+4, 5, 3.4, 2, '#3d2c66');
  ell(c, CX-6, 4.5, 2, 1.2, '#5a4184');
  ell(c, 10, 14, 2, 2.6, '#170e28');    ell(c, 34, 14, 2, 2.6, '#170e28');

  /* brows, eyes, nose, mouth */
  c.fillStyle = '#140a1e';
  c.fillRect(15, 17, 6, 1); c.fillRect(14, 18, 2, 1);
  c.fillRect(23, 17, 6, 1); c.fillRect(28, 18, 2, 1);
  if(blink){
    c.fillStyle = SHD; c.fillRect(15, 21, 6, 1); c.fillRect(23, 21, 6, 1);
    c.fillStyle = '#140a1e'; c.fillRect(14, 20, 8, 1); c.fillRect(22, 20, 8, 1);
  } else {
    ell(c, 17.8, 21.5, 3, 2.2, '#f2e4d4');  ell(c, 26.2, 21.5, 3, 2.2, '#f2e4d4');
    ell(c, 18.2, 21.7, 1.8, 1.8, '#241a14'); ell(c, 26.6, 21.7, 1.8, 1.8, '#241a14');
    c.fillStyle = '#f5e6d3'; c.fillRect(17, 20, 1, 1); c.fillRect(25, 20, 1, 1);
    c.fillStyle = '#140a1e';
    c.fillRect(14, 19, 8, 1); c.fillRect(23, 19, 8, 1);   // kohl
    c.fillRect(13, 20, 1, 1); c.fillRect(31, 20, 1, 1);   // and the flick
  }
  ell(c, CX+0.5, 25.5, 1.5, 2.2, SHD);
  c.fillStyle = HI; c.fillRect(20, 24, 1, 2);
  ell(c, CX, 30, 3.2, 1.6, '#c02a4e');
  ell(c, CX-0.5, 29.3, 2.2, 0.8, '#e8547a');
  c.fillStyle = '#7a1f3a'; c.fillRect(19, 30.5, 6, 1);

  /* gold, everywhere it can be got away with */
  c.fillStyle = '#ffc23d';
  for(let x = 14; x <= 30; x += 2) c.fillRect(x, 12, 1, 1);      // a chain, not a bar
  for(const x of [15, 22, 29]) ell(c, x, 12.5, 1.3, 1.3, '#ffc23d');
  ell(c, CX, 14.5, 1.1, 1.1, '#ffc23d');
  ring(c, 9, 27, 3.6, 1.5, '#ffc23d');  ring(c, 35, 27, 3.6, 1.5, '#ffc23d');
  ring(c, 9, 27, 3.6, 0.5, '#c98a1a');  ring(c, 35, 27, 3.6, 0.5, '#c98a1a');
  c.strokeStyle = '#ffc23d'; c.lineWidth = 1;
  c.beginPath(); c.arc(CX, 34, 7, 0.2*Math.PI, 0.8*Math.PI); c.stroke();
  for(const [x,y] of [[17,39],[22,40.5],[27,39]]){
    ell(c, x, y, 1.5, 1.5, '#ffc23d'); ell(c, x+0.4, y+0.4, 0.6, 0.6, '#c98a1a');
  }

  /* red, with the white neckline */
  c.fillStyle = '#c4304a';
  c.beginPath(); c.moveTo(0, PH); c.lineTo(2, 45); c.lineTo(13, 42.5);
  c.lineTo(CX, 47); c.lineTo(31, 42.5); c.lineTo(42, 45); c.lineTo(PW, PH); c.closePath(); c.fill();
  c.fillStyle = '#8e1e33';
  c.beginPath(); c.moveTo(31, 42.5); c.lineTo(42, 45); c.lineTo(PW, PH);
  c.lineTo(35, PH); c.closePath(); c.fill();
  c.strokeStyle = '#f5e6d3'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(12, 42); c.lineTo(CX, 46.5); c.lineTo(32, 42); c.stroke();
  c.fillStyle = '#f5e6d3'; c.fillRect(0, 44, 4, 2); c.fillRect(40, 44, 4, 2);
}

const _portCache = new Map();
function larueBuffer(blink){
  const key = 'larue' + (blink ? 1 : 0);
  let b = _portCache.get(key);
  if(b) return b;
  b = offscreen(PW, PH);
  const c = b.getContext('2d');
  paintLaRue(c, blink);
  quantize(c, LARUE_PAL);
  _portCache.set(key, b);
  return b;
}
/* ---- Chip Winthrop ------------------------------------------------------
   Drawn harder than the others on purpose: angular jaw, big anime eyes with a
   catchlight, shades pushed up on the brim so nothing is between you and him,
   black flat cap, and a mesh shirt doing almost no work at all. */
const CHIP_PAL = ['#0e0a14','#1a1620','#2e2836','#4a4454','#6e6880',
                  '#a86f45','#d99a63','#f2bb85','#ffd6a8','#7a4a28','#4a2a10',
                  '#a8873a','#d8b45a','#f2dc9a','#fff4c4',
                  '#f2e4d4','#1e3a5c','#4a7ab0','#8ec4f0',
                  '#8e3a4a','#c85a6a','#ffc23d','#f5e6d3'].map(rgb);

function paintChip(c, blink){
  c.clearRect(0, 0, PW, PH);
  const CX = 22;
  const SKN = '#d99a63', LIT = '#f2bb85', SHD = '#a86f45', HI = '#ffd6a8', DEEP = '#7a4a28';

  /* face first — angular, and given room to be a face */
  c.fillStyle = SKN;
  c.beginPath();
  c.moveTo(12, 17); c.lineTo(32, 17); c.lineTo(31.5, 28);
  c.lineTo(25, 36); c.lineTo(19, 36); c.lineTo(12.5, 28); c.closePath(); c.fill();
  ell(c, CX, 24, 9.5, 8.5, SKN);
  ell(c, CX-4, 22, 5, 6, LIT);
  ell(c, CX-5, 20, 2.6, 2.2, HI);
  c.fillStyle = SHD;
  c.beginPath(); c.moveTo(31, 19); c.lineTo(32, 28); c.lineTo(25, 36);
  c.lineTo(CX+4, 25); c.closePath(); c.fill();
  ell(c, CX, 34, 4.2, 2.2, SHD);
  c.fillStyle = DEEP; c.fillRect(15, 30.5, 5, 1); c.fillRect(25, 30.5, 5, 1);

  /* neck, and a chest the shirt is not covering */
  c.fillStyle = SHD; c.fillRect(17, 35, 10, 8);
  c.fillStyle = SKN; c.fillRect(17, 36, 7, 7);
  ell(c, CX, 43, 7.5, 3.5, SKN);
  ell(c, 10, 48, 12, 8, SKN);  ell(c, 34, 48, 12, 8, SKN);
  ell(c, 11, 46, 8, 3.5, LIT);

  /* the mesh: dark, fine, and doing almost nothing */
  c.fillStyle = '#1a1620';
  for(let y = 42; y < PH; y++)
    for(let x = 0; x < PW; x++)
      if(((x + y) % 3 === 0) && !(x > 17 && x < 27 && y < 49)) c.fillRect(x, y, 1, 1);
  c.fillStyle = '#2e2836';
  c.fillRect(0, 42, PW, 1);
  c.beginPath(); c.moveTo(14, 42); c.lineTo(18, 52); c.lineTo(15, 52); c.lineTo(11, 42);
  c.closePath(); c.fill();
  c.beginPath(); c.moveTo(30, 42); c.lineTo(26, 52); c.lineTo(29, 52); c.lineTo(33, 42);
  c.closePath(); c.fill();
  ell(c, CX, 45, 3.2, 1.4, '#ffc23d');
  ell(c, CX, 45.4, 1.2, 0.6, '#a8873a');

  /* brows and the eyes, which are the whole point of the shot */
  c.fillStyle = '#4a2a10';
  c.fillRect(13, 20, 8, 2); c.fillRect(23, 20, 8, 2);
  c.fillStyle = '#7a4a28'; c.fillRect(13, 20, 8, 1); c.fillRect(23, 20, 8, 1);
  if(blink){
    c.fillStyle = SHD; c.fillRect(14, 25, 7, 1); c.fillRect(24, 25, 7, 1);
    c.fillStyle = '#0e0a14'; c.fillRect(13, 24, 8, 1); c.fillRect(23, 24, 8, 1);
  } else {
    ell(c, 17.4, 25, 3.6, 2.8, '#f2e4d4');  ell(c, 26.6, 25, 3.6, 2.8, '#f2e4d4');
    ell(c, 17.8, 25.2, 2.2, 2.5, '#1e3a5c'); ell(c, 27, 25.2, 2.2, 2.5, '#1e3a5c');
    ell(c, 17.8, 25.6, 1.3, 1.6, '#4a7ab0'); ell(c, 27, 25.6, 1.3, 1.6, '#4a7ab0');
    c.fillStyle = '#8ec4f0'; c.fillRect(16, 24, 2, 1); c.fillRect(25, 24, 2, 1);
    c.fillStyle = '#f5e6d3'; c.fillRect(19, 26, 1, 1); c.fillRect(28, 26, 1, 1);
    c.fillStyle = '#0e0a14';
    c.fillRect(13, 23, 9, 1); c.fillRect(23, 23, 9, 1);
    c.fillRect(12, 24, 1, 1); c.fillRect(32, 24, 1, 1);
  }
  c.fillStyle = SHD; c.fillRect(CX, 27, 2, 3);
  c.fillStyle = HI;  c.fillRect(CX-1, 28, 1, 2);

  /* the smirk — one side only, always the same side */
  c.fillStyle = '#8e3a4a';
  c.fillRect(18, 32.5, 8, 1); c.fillRect(25, 31.5, 2, 1);
  c.fillStyle = '#c85a6a'; c.fillRect(19, 31.5, 5, 1);

  /* blond fringe, then the cap dead level on top of it */
  c.fillStyle = '#d8b45a';
  c.fillRect(11, 16, 22, 2);
  c.fillStyle = '#f2dc9a'; c.fillRect(13, 16, 5, 1); c.fillRect(24, 16, 4, 1);
  c.fillStyle = '#a8873a'; c.fillRect(11, 17, 22, 1);
  ell(c, 10, 20, 2.4, 3.5, '#d8b45a');  ell(c, 34, 20, 2.4, 3.5, '#d8b45a');

  ell(c, CX, 9, 12.5, 6, '#1a1620');
  c.fillStyle = '#1a1620'; c.fillRect(9, 9, 26, 5);
  c.fillStyle = '#2e2836'; c.fillRect(4, 13, 36, 3);      // the flat brim
  c.fillStyle = '#4a4454'; c.fillRect(4, 13, 36, 1);
  c.fillStyle = '#0e0a14'; c.fillRect(4, 15, 36, 1);
  ell(c, CX-4, 5.5, 6, 2.2, '#2e2836');
  c.fillStyle = '#6e6880'; c.fillRect(11, 6, 7, 1);
  c.fillStyle = '#ffc23d'; c.fillRect(19, 10, 6, 2);      // a monogram, obviously
  c.fillStyle = '#0e0a14'; c.fillRect(21, 10, 2, 2);
}
function chipBuffer(blink){
  const key = 'chip' + (blink ? 1 : 0);
  let b = _portCache.get(key);
  if(b) return b;
  b = offscreen(PW, PH);
  const c = b.getContext('2d');
  paintChip(c, blink);
  quantize(c, CHIP_PAL);
  _portCache.set(key, b);
  return b;
}
const BESPOKE = { larue: larueBuffer, chip: chipBuffer };

/* ---- everyone else, from their look parameters, same technique ---------- */
function paintGeneric(c, o, blink){
  c.clearRect(0, 0, PW, PH);
  const sk = SKIN[o.skin||'tan'], CX = 22;
  const hc = o.hairC || '#3b2416', hc2 = o.hairC2 || '#6b4426';
  const hcD = shade(hc, -0.35), hcL = shade(hc2, 0.18);
  const style = o.hair || 'blowout';

  /* hair behind the head */
  switch(style){
    case 'perm':    ell(c, CX, 21, 20, 18, hc);
                    for(const [x,y,r] of [[6,18,5],[10,9,5],[34,9,5],[38,18,5],[5,29,4],[39,29,4]])
                      ell(c, x, y, r, r, hc2);
                    break;
    case 'blowout': ell(c, CX, 18, 18, 15, hc);
                    ell(c, 7, 25, 6, 10, hc); ell(c, 37, 25, 6, 10, hc);
                    ell(c, 11, 10, 5, 4, hc2); ell(c, 33, 10, 5, 4, hc2); break;
    case 'spikes':  ell(c, CX, 15, 14, 9, hc);
                    for(let i = 0; i < 7; i++){
                      const x = 9 + i*4.5, h = i % 2 ? 11 : 7;
                      c.fillStyle = hc; c.beginPath(); c.moveTo(x-2.6, 12);
                      c.lineTo(x, 12-h); c.lineTo(x+2.6, 12); c.closePath(); c.fill();
                    } break;
    case 'ponytail':ell(c, CX, 15, 13, 9, hc);
                    ell(c, 36, 26, 5, 9, hc); ell(c, 37, 35, 4, 5, hc); break;
    case 'bun':     ell(c, CX, 15, 13, 9, hc); ell(c, 35, 12, 6, 6, hc);
                    ell(c, 34, 11, 2.4, 2.4, hc2); break;
    case 'pomp':    ell(c, CX, 14, 13, 9, hc); ell(c, CX, 6.5, 9, 5.5, hc);
                    ell(c, CX-3, 5, 4, 2.4, hc2); break;
    case 'turban':  ell(c, CX, 13, 15, 10, hc); break;
    case 'cap':     ell(c, CX, 13, 14, 10, hc); break;
    case 'bald':    break;
    default:        ell(c, CX, 16, 14, 11, hc);
  }

  /* face */
  ell(c, CX, 24, 8.6, 10.4, sk.s);
  ell(c, CX, 28, 7.2, 8.2, sk.s);
  ell(c, CX-3, 20, 4.6, 5.2, sk.l);
  ell(c, CX+5.5, 25, 3.2, 6, sk.d);
  ell(c, CX, 33.5, 4.6, 2.6, sk.d);
  if(o.skin === 'burn'){
    const q = rnd32(11);
    c.fillStyle = P.bone;
    for(let i = 0; i < 14; i++) c.fillRect(15 + ((q()*15)|0), 18 + ((q()*14)|0), 1, 1);
  }

  /* neck, shoulders, clothes */
  c.fillStyle = sk.d; c.fillRect(18, 32, 8, 8);
  ell(c, CX, 40, 5, 3, sk.s);
  const sc = o.shirt || '#e94f6a';
  const bare = ['tank','bikini','lingerie','slip','halter'].indexOf(o.shirtStyle) >= 0;
  ell(c, 11, 47, 10, 7, bare ? sk.s : sc);
  ell(c, 33, 47, 10, 7, bare ? sk.s : shade(bare ? sk.s : sc, -0.16));
  c.fillStyle = sc;
  c.beginPath(); c.moveTo(0, PH); c.lineTo(4, 46); c.lineTo(14, 43.5);
  c.lineTo(CX, 47); c.lineTo(30, 43.5); c.lineTo(40, 46); c.lineTo(PW, PH);
  c.closePath(); c.fill();
  if(bare){                                       // straps instead of a shoulder line
    c.fillStyle = sc; c.fillRect(14, 43, 2, 9); c.fillRect(28, 43, 2, 9);
    c.fillStyle = sk.s;
    c.beginPath(); c.moveTo(0, PH); c.lineTo(4, 46); c.lineTo(13, 44);
    c.lineTo(13, PH); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(PW, PH); c.lineTo(40, 46); c.lineTo(31, 44);
    c.lineTo(31, PH); c.closePath(); c.fill();
  }
  if(o.shirtStyle === 'blazer'){
    c.fillStyle = o.inner || P.bone; c.fillRect(19, 44, 6, 8);
    c.fillStyle = shade(sc, -0.2);
    c.beginPath(); c.moveTo(14, 43.5); c.lineTo(CX, 47); c.lineTo(19, 52); c.lineTo(12, 46); c.closePath(); c.fill();
  }
  if(o.shirtStyle === 'sequin'){
    const q = rnd32(31); c.fillStyle = P.gold;
    for(let i = 0; i < 22; i++) c.fillRect(4 + ((q()*36)|0), 44 + ((q()*8)|0), 1, 1);
  }
  if(o.shirtStyle === 'polo'){
    c.fillStyle = o.inner || '#ffffff';
    c.beginPath(); c.moveTo(15, 43); c.lineTo(CX, 48); c.lineTo(29, 43);
    c.lineTo(29, 46); c.lineTo(CX, 50); c.lineTo(15, 46); c.closePath(); c.fill();
  }

  /* hair over the brow */
  if(style !== 'bald' && style !== 'turban' && style !== 'cap'){
    ell(c, CX, 10.5, 12.5, 6.5, hc);
    ell(c, CX-5, 8, 4, 2.4, hc2);
    if(style === 'blowout' || style === 'perm'){
      ell(c, 12, 20, 4.8, 8, hc); ell(c, 32, 20, 4.8, 8, hc);
    }
  }
  if(style === 'turban'){
    ell(c, CX, 10, 14, 7, hc); c.fillStyle = hc2; c.fillRect(8, 13, 28, 2);
    ell(c, 35, 6, 3, 3, P.gold);
  }
  if(style === 'cap'){
    ell(c, CX, 10, 13, 6.5, hc);
    c.fillStyle = hc2; c.fillRect(3, 14, 15, 3);
  }

  /* features */
  c.fillStyle = shade(hc, -0.15);
  c.fillRect(16, 19, 5, 1); c.fillRect(23, 19, 5, 1);
  if(blink){
    c.fillStyle = sk.d; c.fillRect(16, 23, 5, 1); c.fillRect(23, 23, 5, 1);
  } else {
    ell(c, 18.4, 23, 2.6, 1.9, '#f2e4d4'); ell(c, 25.6, 23, 2.6, 1.9, '#f2e4d4');
    ell(c, 18.6, 23.2, 1.5, 1.5, o.eyes || '#3a5a8c');
    ell(c, 25.8, 23.2, 1.5, 1.5, o.eyes || '#3a5a8c');
    c.fillStyle = P.bone; c.fillRect(18, 22, 1, 1); c.fillRect(25, 22, 1, 1);
  }
  ell(c, CX+0.5, 27, 1.4, 2, sk.d);
  if(o.lips){ ell(c, CX, 31, 3.2, 1.8, o.lips); ell(c, CX-0.6, 30.4, 2, 0.8, shade(o.lips, .25)); }
  else { c.fillStyle = sk.d; c.fillRect(19, 31, 6, 1); }
  if(o.stubble){ c.fillStyle = 'rgba(40,25,60,.30)'; c.fillRect(15, 30, 14, 5); }
  if(o.mustache){ c.fillStyle = shade(hc, -0.1); c.fillRect(18, 28.5, 8, 2); }

  switch(o.acc){
    case 'shades': c.fillStyle = '#140a1e';
                   c.fillRect(13, 20, 8, 6); c.fillRect(23, 20, 8, 6); c.fillRect(21, 22, 2, 2);
                   c.fillStyle = '#5f93ad'; c.fillRect(14, 21, 2, 1); c.fillRect(24, 21, 2, 1); break;
    case 'hoops':  ring(c, 12, 27, 4, 1.6, P.gold); ring(c, 32, 27, 4, 1.6, P.gold); break;
    case 'band':   c.fillStyle = P.hot; c.fillRect(8, 14, 28, 3); break;
    case 'visor':  c.fillStyle = P.hot; c.fillRect(5, 17, 34, 3); break;
    case 'chain':  ell(c, CX, 43, 2, 1.4, P.gold); break;
  }
  if(o.hat === 'fedora'){
    c.fillStyle = o.hatC || '#e8dcc4';
    c.fillRect(4, 15, 36, 3); ell(c, CX, 11, 11, 6, o.hatC || '#e8dcc4');
    c.fillStyle = '#6b4426'; c.fillRect(11, 13, 22, 2);
  }
}
function genericPalette(o){
  const sk = SKIN[o.skin||'tan'], hc = o.hairC||'#3b2416', hc2 = o.hairC2||'#6b4426';
  const sc = o.shirt||'#e94f6a';
  return [sk.s, sk.l, sk.d, shade(sk.s,.18), shade(sk.d,-.25),
          hc, hc2, shade(hc,-.35), shade(hc2,.18),
          sc, shade(sc,-.2), shade(sc,.15), o.inner||P.bone,
          o.eyes||'#3a5a8c', o.lips||sk.d, '#f2e4d4', '#140a1e',
          P.gold, P.hot, P.bone].map(rgb);
}

function portraitBuffer(o, blink){
  if(o.portrait && BESPOKE[o.portrait]) return BESPOKE[o.portrait](blink);
  const key = (o.name||'you') + '|' + [o.skin,o.hair,o.hairC,o.shirt,o.shirtStyle,
              o.acc,o.figure,o.lips].join(',') + '|' + (blink?1:0);
  let b = _portCache.get(key);
  if(b) return b;
  b = offscreen(PW, PH);
  const c = b.getContext('2d');
  paintGeneric(c, o, blink);
  quantize(c, genericPalette(o));
  if(_portCache.size > 80) _portCache.clear();
  _portCache.set(key, b);
  return b;
}

/* Dialogue portrait: backing plate, the face, and a frame. */
function drawPortrait(bx, by, o, t){
  r(bx, by, PW, PH, P.ink2);
  const grd = g.createLinearGradient(bx, by, bx, by+PH);
  grd.addColorStop(0, 'rgba(255,46,136,.30)'); grd.addColorStop(1, 'rgba(33,224,214,.10)');
  g.fillStyle = grd; g.fillRect(bx, by, PW, PH);
  const blink = !REDUCED && Math.floor(t/3100)%6 === 0 && Math.floor(t/150)%2 === 0;
  g.drawImage(portraitBuffer(o, blink), bx|0, by|0);
  r(bx, by, PW, 1, P.hot); r(bx, by+PH-1, PW, 1, P.hot);
  r(bx, by, 1, PH, P.hot); r(bx+PW-1, by, 1, PH, P.hot);
}

