/* Vanity Shores — text.js
 *
   Real webfonts rendered to an offscreen buffer and thresholded to 1-bit,
      so type carries SC-times the detail while the art stays chunky.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
/* ---------- 1b. TEXT: real fonts, thresholded to 1-bit pixel text --------- */
const FONT = { sm:'8px Silkscreen, monospace', bg:'16px Silkscreen, monospace',
               dlg:'16px VT323, monospace', big:'24px Silkscreen, monospace' };
const _measure = offscreen(4,4).getContext('2d');
const _tcache  = new Map();
function scaleFont(font, k){
  return k === 1 ? font
    : font.replace(/^(\d+(?:\.\d+)?)px/, (m,v) => (Math.round(parseFloat(v)*k)) + 'px');
}

function hex2rgb(h){ h=h.replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255]; }

function textW(str, font){
  _measure.font = scaleFont(font||FONT.sm, TXSC);
  return _measure.measureText(str).width / TXSC;          // logical width
}

function textCanvas(str, font, color){
  const k = TXSC, key = k+'|'+font+'|'+color+'|'+str;
  const hit = _tcache.get(key); if(hit) return hit;
  font = scaleFont(font, k);
  _measure.font = font;
  const w = Math.max(1, Math.ceil(_measure.measureText(str).width) + 2*k),
        h = parseInt(font,10) + 7*k;
  const oc = offscreen(w,h), x = oc.getContext('2d');
  x.font = font; x.textBaseline = 'top'; x.fillStyle = '#fff'; x.fillText(str, k, 3*k);
  const id = x.getImageData(0,0,w,h), d = id.data, c = hex2rgb(color);
  for(let i=0;i<d.length;i+=4){
    if(d[i+3] > 108){ d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=255; } else d[i+3]=0;
  }
  x.putImageData(id,0,0);
  if(_tcache.size > 1200) _tcache.clear();
  _tcache.set(key, oc); return oc;
}
function text(str, x, y, color, font){
  const c = textCanvas(str, font||FONT.sm, color||P.bone);
  const k = TXSC;
  g.drawImage(c, x|0, y|0, c.width/k, c.height/k);
  return c.width/k;
}
function textC(str, cx, y, color, font){
  const f = font||FONT.sm; return text(str, Math.round(cx - textW(str,f)/2), y, color, f);
}
function wrap(str, font, maxw){
  const words = String(str).split(' '), lines = []; let cur = '';
  for(const w of words){
    const test = cur ? cur+' '+w : w;
    if(textW(test,font) <= maxw) cur = test;
    else { if(cur) lines.push(cur); cur = w; }
  }
  if(cur) lines.push(cur); return lines;
}

