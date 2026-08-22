/* Vanity Shores — core.js
 *
   Palette, canvas, the render target, and the small helpers everything
      else is built out of. Nothing here knows what game this is.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
"use strict";
/* ============================================================================
   VANITY SHORES — Act 1, Level 1
   A self-contained 16-bit-style adventure. No external assets: every sprite,
   backdrop and note is generated at runtime.
   ---------------------------------------------------------------------------
   SECTIONS:  0 core  1 art  2 backdrops  3 audio  4 engine  5 content  6 boot
   ========================================================================= */

/* ---------- 0. CORE ------------------------------------------------------ */
const W = 320, H = 200;
const cvs = document.getElementById('screen');
let   g   = cvs.getContext('2d', { alpha:false });
const MAIN = g;
/* The world is authored in a 320x200 logical space and always will be — that is
   the pixel art. SC is how many real pixels each logical pixel gets on the main
   canvas, which lets type carry SC times the detail while the art stays chunky.
   Offscreen bakes run at TXSC=1 so painted signs stay part of the pixel art. */
let SC = 3, TXSC = 3;
function withTarget(ctx, fn){ const o=g, ot=TXSC; g=ctx; TXSC=1; fn(); g=o; TXSC=ot; }
function offscreen(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h;
  const x=c.getContext('2d'); x.imageSmoothingEnabled=false; return c; }
g.imageSmoothingEnabled = false;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

function r(x,y,w,h,c){ g.fillStyle=c; g.fillRect(x|0,y|0,w|0,h|0); }
function px(x,y,c){ g.fillStyle=c; g.fillRect(x|0,y|0,1,1); }
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function lerp(a,b,t){ return a+(b-a)*t; }
function rnd32(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0;
  let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296; }; }

/* World palette — sun-bleached resort at golden hour */
const P = {
  ink:'#160b22', ink2:'#241134', shadow:'#3a1d4e',
  bone:'#f5e6d3', dim:'#a08cb4',
  hot:'#ff2e88', hot2:'#c41d68', surf:'#21e0d6', surf2:'#0e9c97',
  gold:'#ffc23d', gold2:'#c98a1a', amber:'#ff8a3d',
  sky1:'#ff9a4d', sky2:'#ff5f8f', sky3:'#7b3fa0', sky4:'#2e1a52',
  sea1:'#1b5c8a', sea2:'#2a7fa8', sea3:'#48b3c4', foam:'#cfeef2',
  sand:'#e8c98f', sand2:'#c9a468', sand3:'#9c7b48',
  wood:'#9c6b3f', wood2:'#7a5230', wood3:'#5c3d24', wood4:'#b98a55',
  palm:'#2c1a3e', palmL:'#4a2c66',
  white:'#ffffff', black:'#000000'
};

