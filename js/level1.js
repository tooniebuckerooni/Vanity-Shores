/* Vanity Shores — level1.js
 *
   LEVEL 1 CONTENT — the cast, the economy, the four rooms and every scripted
      scene of Small Change. This is the file a new level copies the shape of.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
/* ---------- 5. CONTENT: the cast ----------------------------------------- */
const CAST = {
  chip:{ pose:'pocket', portrait:'chip', name:'Chip Winthrop', skin:'tan', role:'Demo antagonist, and the level\'s win condition. Flips to ally at Level 4.', where:'Bus stop, then the boardwalk',
         hair:'pomp', hairC:'#d8b45a', hairC2:'#f2dc9a',
         hat:'flat', hatC:'#1a1620',
         shirtStyle:'mesh', shirt:'#241f2e', shirtD:'#14101c', inner:'#ffffff',
         pants:'#efe6d4', pantsD:'#cfc4ae', shoes:'#8a5a3a', acc:'chain',
         figure:'broad', eyes:'#4a7ab0', size:2, still:false },
  gil:{ pose:'stiff', name:'Gil Furnace', skin:'burn', role:'Sunburnt tourist. Your first customer.', where:'Bench, boardwalk', hair:'cap', hairC:'#e8e4d8', hairC2:'#c4c0b4',
         shirtStyle:'hawaii', shirt:'#2fa8a0', shirtD:'#1d7a74',
         pants:'#d8cfa8', pantsD:'#b0a882', shoes:'#f0ece0', build:1, eyes:'#5a7a4a' },
  brenda:{ pose:'hold', name:'Brenda Tang', skin:'tan', role:'Timeshare shark. Gatekeeper for the aloe and the sign.', where:'Timeshare booth, boardwalk', hair:'bun', hairC:'#231a26', hairC2:'#4a3a4e', figure:'curved',
         shirtStyle:'blazer', shirt:'#2a3f5e', shirtD:'#1b2a42', inner:'#f5e6d3',
         skirt:'#2a3f5e', shoes:'#241134', lips:'#d8365e', acc:'none',
         eyes:'#3a2a2a', build:-1 },
  zsazsa:{ portrait:'larue', name:'Madame LaRue', skin:'deep', role:'Boardwalk psychic. Sells the tell that beats the table.', where:'Fortune tent, pier', hair:'perm',
         hairC:'#1c1030', hairC2:'#3a2352', figure:'hourglass', build:-1,
         shirtStyle:'halter', shirt:'#c4304a', shirtD:'#8e1e33', inner:'#f5e6d3',
         skirt:'#c4304a', shoes:'#241134', lips:'#c02a4e', acc:'hoops',
         eyes:'#2a1a1a', size:-1 },
  dickie:{ pose:'hold', name:'Dickie Vermouth', skin:'pale', role:'Has-been lounge act. Repeatable income.', where:'Bandshell, pier', hair:'pomp', hairC:'#7a7488', hairC2:'#a8a2b4',
         shirtStyle:'sequin', shirt:'#8e2a4e', shirtD:'#5e1a32', inner:'#f5e6d3',
         pants:'#2a2438', pantsD:'#1a1626', shoes:'#e8e4d8', stubble:true,
         mustache:true, eyes:'#4a4a5a', size:-2 },
  monte:{ pose:'crossed', name:'Monte', skin:'tan', role:'Shell game. The level\u2019s boss fight.', where:'Folding table, under the pier', hair:'ponytail', hairC:'#2a1c14', hairC2:'#4a3424',
         shirtStyle:'tank', shirt:'#e8e4d8', shirtD:'#c4c0b4',
         pants:'#3a3448', pantsD:'#241f30', shoes:'#241134', acc:'chain',
         stubble:true, build:1, eyes:'#3a2a1a' },
  /* The crowd the FREE GIFT sign builds. Eight bodies, all different, none of
     them anybody — they exist so the bandshell has an audience and so that
     audience can visibly thin out. */
  c0:{ name:'a tourist', skin:'fair', hair:'perm',     hairC:'#b4703a', hairC2:'#d8965a', figure:'curved',
       shirtStyle:'tank',   shirt:'#f0a8c0', pants:'#e8e0d0', size:-1 },
  c1:{ name:'a tourist', skin:'deep', hair:'cap',      hairC:'#c41d68', hairC2:'#8e1148',
       shirtStyle:'hawaii', shirt:'#f0c23d', pants:'#3a4a6a', build:1 },
  c2:{ name:'a tourist', skin:'tan',  hair:'blowout',  hairC:'#2a1c14', hairC2:'#4a3424', figure:'hourglass',
       shirtStyle:'halter', shirt:'#4de0a0', skirt:'#2a3448', shoes:'#241134', size:-1, build:-1 },
  c3:{ name:'a tourist', skin:'burn', hair:'bald',     hairC:'#8a8290', hairC2:'#6a6270',
       shirtStyle:'hawaii', shirt:'#21c8d6', pants:'#d8cfa8', build:1, size:1 },
  c4:{ name:'a tourist', skin:'pale', hair:'ponytail', hairC:'#e8c45a', hairC2:'#f4e29a', figure:'curved',
       shirtStyle:'tank',   shirt:'#e94f6a', skirt:'#f0e6d2', size:-2 },
  c5:{ name:'a tourist', skin:'deep', hair:'spikes',   hairC:'#1c1030', hairC2:'#3a2352',
       shirtStyle:'mesh',   shirt:'#2a2438', shirtD:'#1a1626', inner:'#f5e6d3', pants:'#241134', acc:'shades' },
  c6:{ name:'a tourist', skin:'tan',  hair:'bun',      hairC:'#5a3a24', hairC2:'#8a5a34', figure:'curved',
       shirtStyle:'blazer', shirt:'#8e2a4e', shirtD:'#5e1a32', inner:'#f5e6d3', skirt:'#2a1a30', build:-1 },
  c7:{ name:'a tourist', skin:'fair', hair:'pomp',     hairC:'#7a7488', hairC2:'#a8a2b4',
       shirtStyle:'sequin', shirt:'#3a5a8c', shirtD:'#24406a', inner:'#e8e4d8', pants:'#2a2438', size:1 },

  rube1:{ name:'a tourist', skin:'fair', role:'Set dressing. Proves the boardwalk has other people on it.', where:'Boardwalk', hair:'perm', hairC:'#b4703a', hairC2:'#d8965a', figure:'curved',
          shirtStyle:'tank', shirt:'#f0a8c0', pants:'#e8e0d0', size:-1, still:true },
  rube2:{ name:'a tourist', skin:'deep', role:'Set dressing. Proves the boardwalk has other people on it.', where:'Boardwalk', hair:'cap', hairC:'#c41d68', hairC2:'#8e1148',
          shirtStyle:'hawaii', shirt:'#f0c23d', pants:'#3a4a6a', build:1, still:true }
};
const sayAs = (who, pages, opts) => say(pages, Object.assign({ speaker:CAST[who].name, look:CAST[who] }, opts||{}));

/* ---------------------------------------------------------------------------
   CUTAWAY.
   The grammar this genre actually runs on: the payoff happens off-screen and
   the camera looks at something else. It is funnier than showing it, it keeps
   the game shippable anywhere, and it costs four pixels of animation instead of
   a sprite sheet. A cutaway is a framed vignette plus captions; click through.
   --------------------------------------------------------------------------- */
function cutaway(paint, pages, then){
  GS.cut = { paint, pages, i:0, then, t0:clock };
  GS.msg = null; GS.scene = 'cutaway';
  Audio_.scene('win');
}
/* A face, filling the screen, with the room drawn out from behind it. Used when
   somebody gets close enough that the scene is their expression. */
/* stage[] is optional, one entry per page: how hard the camera pushes in, how
   much the frame shakes, how fast the speed lines turn, and anything held up
   in shot. Absent, a closeup plays exactly as it always did. */
function closeup(look, pages, then, stage){
  GS.cut = { look, pages, i:0, then, stage, t0:clock, pageAt:clock };
  GS.msg = null; GS.scene = 'cutaway';
}
function drawCloseup(t){
  const c  = GS.cut;
  const st = (c.stage && c.stage[c.i]) || {};
  const since = t - (c.pageAt || c.t0);
  /* the push settles over the first half-second of a page rather than snapping */
  const ease = Math.min(1, since/500);
  const push = 1 + ((st.push || 1) - 1) * ease;
  const shk  = (REDUCED || !st.shake) ? 0 : st.shake * Math.max(0, 1 - since/900);
  const jx = shk ? (Math.random()*2-1)*shk : 0;
  const jy = shk ? (Math.random()*2-1)*shk : 0;

  r(0, 0, W, 200, '#08040e');
  const cx = 160, cy = 62;
  g.strokeStyle = 'rgba(255,46,136,' + (0.40 * (st.rays === undefined ? 1 : st.rays)) + ')';
  g.lineWidth = 1;
  const spin = REDUCED ? 0 : t/3400 * (st.rays === undefined ? 1 : st.rays);
  for(let i = 0; i < 30; i++){
    const a = i/30*Math.PI*2 + spin;
    const r0 = (48 + (i % 3)*8) * push;
    g.beginPath();
    g.moveTo(cx + Math.cos(a)*r0, cy + Math.sin(a)*r0);
    g.lineTo(cx + Math.cos(a)*280, cy + Math.sin(a)*280);
    g.stroke();
  }
  g.globalAlpha = .40; r(0, 0, W, 200, '#180624'); g.globalAlpha = 1;

  /* he blinks, which is most of what stops a portrait reading as a photograph */
  const blink = !REDUCED && Math.floor(t/2400) % 5 === 0 && Math.floor(t/120) % 2 === 0;
  const b  = portraitBuffer(c.look, blink);
  const w2 = Math.round(PW*2*push), h2 = Math.round(PH*2*push);
  const bx = Math.round(cx - w2/2 + jx), by = Math.round(8 - (h2 - PH*2)/2 + jy);
  r(bx-2, by-2, w2+4, h2+4, '#241134');
  g.drawImage(b, 0, 0, PW, PH, bx, by, w2, h2);
  r(bx-2, by-2, w2+4, 1, P.hot); r(bx-2, by+h2+1, w2+4, 1, P.hot);
  r(bx-2, by-2, 1, h2+4, P.hot); r(bx+w2+1, by-2, 1, h2+4, P.hot);
  if(st.prop) st.prop(bx, by, w2, h2, t, since);

  const cap = cutCaption(c.pages[c.i], 84);
  let ty = 184 - cap.ls.length*cap.lh;
  for(const ln of cap.ls){ textC(ln, 160, ty, P.bone, cap.font); ty += cap.lh; }
  if(Math.floor(t/500)%2 === 0)
    textC(c.i < c.pages.length-1 ? 'MORE' : 'CLICK TO GO BACK',
          160, 190, '#6b4d8a', FONT.sm);
}

/* Fit a caption into the 74px between the frame and the prompt. Never returns
   a line height shorter than the type it is setting. */
function cutCaption(str, room){
  const space = room || 78;
  for(let px = 16; px >= 11; px--){
    const font = scaleFont(FONT.dlg, px/16);
    const ls   = wrap(str, font, 292);
    const lh   = Math.max(px - 2, Math.round(px * 0.95));   // VT323 descends
    if(ls.length * lh <= space) return { ls, lh, font };
  }
  const font = scaleFont(FONT.dlg, 11/16);
  return { ls: wrap(str, font, 292), lh: 11, font };
}
function drawCutaway(t){
  if(GS.cut.look) return drawCloseup(t);
  r(0, 0, W, 200, '#08040e');
  const bx = 80, by = 18, bw = 160, bh = 82;
  g.save();
  g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
  GS.cut.paint(bx, by, bw, bh, t);
  g.restore();
  r(bx-1, by-1, bw+2, 1, P.hot);   r(bx-1, by+bh, bw+2, 1, P.hot);
  r(bx-1, by-1, 1, bh+2, P.hot);   r(bx+bw, by-1, 1, bh+2, P.hot);
  g.globalAlpha = .5;
  r(bx-3, by-3, bw+6, 1, '#5a2a72'); r(bx-3, by+bh+2, bw+6, 1, '#5a2a72');
  g.globalAlpha = 1;

  /* The old rule dropped the line height to 11px past four lines, which is
     shorter than the glyphs — five-line captions overlapped each other. Shrink
     the type until the block fits the gap under the frame instead, the same way
     the dialogue box does it. */
  const cap = cutCaption(GS.cut.pages[GS.cut.i]);
  let ty = 178 - cap.ls.length*cap.lh;
  for(const ln of cap.ls){ textC(ln, 160, ty, P.bone, cap.font); ty += cap.lh; }
  if(Math.floor(t/500)%2 === 0)
    textC(GS.cut.i < GS.cut.pages.length-1 ? 'MORE' : 'CLICK TO GO BACK',
          160, 186, '#6b4d8a', FONT.sm);
}
function advanceCutaway(){
  const c = GS.cut;
  if(c.i < c.pages.length-1){ c.i++; c.pageAt = clock; Audio_.sfx('click'); return; }
  GS.cut = null; GS.scene = 'play'; Audio_.scene('play');
  if(c.then) c.then();
}

/* ---------- 5b. transitions & deaths ------------------------------------- */
let fade = 0, fadeDir = 0, fadeThen = null;
function transition(fn){ fadeDir = 1; fadeThen = fn; }
function gotoRoom(id, x, y){
  transition(() => {
    GS.room = id; GS.player.x = x; GS.player.y = y;
    GS.player.tx = x; GS.player.ty = y; GS.player.walking = false;
    GS.msg = null; GS.sel = null;
    Audio_.ambience(id==='underpier' ? 'deep' : id==='pier' ? 'surf' : 'boardwalk');
    saveGame();
    const rm = ROOMS[id]; if(rm.onEnter) rm.onEnter();
  });
}
const DEATHS = {
  road:{ head:'FLATTENED', body:'You step into the road to admire the sunset. A pink convertible '+
        'the size of a small country removes you from the timeline. The driver does not slow down.',
        sting:'Right of way belongs to whoever owns more of the road.' },
  surf:{ head:'DROWNED', body:'You wade out to rinse the boardwalk off your ankles. The riptide has '+
        'other plans, and the riptide has seniority.',
        sting:'Nobody on that beach looked up. Their tans were at a critical stage.' },
  oil:{ head:'DECEASED, TROPICALLY', body:'It said TROPICAL. It said COCONUT. It said, in letters '+
        'you chose not to read, DO NOT DRINK.',
        sting:'You die golden, glistening, and evenly bronzed on the inside.' },
  rail:{ head:'DASHED UPON THE PILINGS', body:'You climb the pier railing because it looked like '+
        'something a man with a future does. The railing is ninety years old.',
        sting:'The pilings below are barnacled, immovable, and well attended by crabs.' }
};
/* Dying used to be free, which made the death cards a gallery rather than a
   consequence. It now costs a quarter of the purse — enough to feel, never
   enough to strand you, because Dickie's floor means any purse can be rebuilt.
   That recoverability is not a hope, it is asserted by canon --check. */
function die(kind){
  GS.deaths++; tick('deaths');
  GS.deathToll = Math.floor(GS.cash * 0.25 / 25) * 25;
  if(GS.cash > 0 && GS.deathToll < 25) GS.deathToll = Math.min(25, GS.cash);
  if(GS.deathToll > 0){ GS.cash -= GS.deathToll; tick('dropped', GS.deathToll); }
  GS.msg = null; GS.scene = 'death'; GS.deathKind = kind;
  Audio_.sfx('death'); Audio_.scene('tense'); saveGame();
}
/* What it cost you, said in the register of somebody who is not sympathetic. */
function deathToll(){
  const n = GS.deaths;
  if(!GS.deathToll)
    return n > 3 ? 'You had nothing on you. Again.' : 'You had nothing on you, which is the only mercy here.';
  const c = '$' + (GS.deathToll/100).toFixed(2);
  return n === 1 ? 'Somebody went through your pockets before the ambulance. ' + c + ' gone.'
       : n === 2 ? 'Same somebody. Same pockets. ' + c + ' gone.'
       : n <= 4  ? 'They know your pockets by name now. ' + c + ' gone.'
       :           'There is a man on this boardwalk whose entire income is you. ' + c + ' gone.';
}
function reviveFromDeath(){
  GS.scene = 'play'; Audio_.scene('play');
  const rm = ROOMS[GS.room];
  GS.player.x = rm.spawn[0]; GS.player.y = rm.spawn[1];
  GS.player.tx = GS.player.x; GS.player.ty = GS.player.y; GS.player.walking = false;
}

/* ---------- 5c. ROOMS ---------------------------------------------------- */
/* Where the crowd stands, front row first — so thinning it takes the back of
   the room away rather than punching holes in the middle of it. */
const CROWD_SPOTS = [[88,150],[112,158],[136,150],[100,164],
                     [160,156],[126,142],[178,148],[150,166]];
const crowdSize = () => Math.max(2, 8 - (GS.flags.encores || 0) * 2);

const ROOMS = {

/* ============================ ARRIVAL ==================================== */
arrival:{
  walk:{ x0:16, x1:304, y0:134, y1:168 }, spawn:[40,150],
  npcs:[ { id:'chip', x:210, y:136, look:CAST.chip,
           hidden:()=>GS.flags.chipGone } ],
  danger(p){ if(p.y>=92 && p.y<126){ walkTo(p.x, 136, ()=>die('road')); return true; } },
  onEnter(){ if(!GS.flags.arrived){ GS.flags.arrived = true;
      narrate(['The bus pulls away with the sound of a large animal giving up. '+
               'You are standing at the top of the strip in Vanity Shores with '+ money() +
               ' and a plan you have not written down yet.',
               'The air smells like coconut oil, hot asphalt, and other people\'s money. '+
               'Somewhere below, a casino is taking a percentage of everything.',
               'First you get the money. You are fairly sure of the order.'],
              { then:()=>saveGame() }); } },
  hotspots:[
    { id:'chip', pri:2, name:'Chip Winthrop', x:194, y:100, w:34, h:44, approach:[190,146],
      hidden:()=>GS.flags.chipGone,
      look:()=>narrate(['Boat shoes with no socks, a polo with the collar standing at attention, '+
        'and the deep, even tan of a man who has never once been told no. He is leaning on the car '+
        'the way other people lean on inherited wealth.',
        'The genuinely infuriating part — the part you would like on the record as infuriating — is '+
        'that it works. It is working right now, a little, and he has not even turned around yet.']),
      talk:()=>chipIntro(),
      take:()=>narrate('You would need a much larger bag and a much better lawyer.'),
      use:()=>narrate('He is not a tool. He is a warning.') },

    { id:'car', name:'the pink convertible', x:194, y:108, w:66, h:20, approach:[210,140],
      look:()=>narrate('A convertible in a pink that does not occur in nature, with a vanity plate '+
        'reading CHIP. The upholstery is white. Nobody who has ever worried about money owns white '+
        'upholstery.'),
      take:()=>{ Audio_.sfx('deny'); narrate('You reach for the door handle. Somewhere a car alarm '+
        'clears its throat and you reconsider your entire life.'); },
      use:()=>narrate('The car does not need you. That is rather the point of the car.') },

    { id:'sign', name:'the welcome sign', x:104, y:28, w:130, h:24,
      look:()=>narrate('"WELCOME TO VANITY SHORES." Underneath, in smaller neon: "YOU LOOK '+
        'FANTASTIC." The sign says this to everyone. The sign has never once been wrong about '+
        'anyone who mattered.') },

    { id:'shelter', name:'the bus shelter', x:12, y:90, w:56, h:44, approach:[52,142],
      look:()=>narrate('A bench, a roof, and an advertisement for a tanning salon called SEAR. '+
        'Someone has scratched "I CAME HERE BROKE TOO" into the glass. It is not comforting. '+
        'It is a statistic.'),
      take:()=>narrate('The bench is bolted down. In this town everything not bolted down '+
        'has already been taken.') },

    { id:'quarter', pri:3, name:'a quarter', x:176, y:150, w:14, h:12, approach:[178,156],
      hidden:()=>!GS.flags.quarterOnGround || has('quarter'),
      look:()=>narrate('Twenty-five cents, lying in the grit where he flicked it. It is the '+
        'single most humiliating coin in the state of Florida. It is also money.'),
      take:()=>{ give('quarter'); GS.flags.quarterOnGround = false;
        narrate('You pick it up. You do not brush it off. Brushing it off would mean it mattered, '+
          'and you would like the record to show it did not matter.'); },
      use:()=>narrate('Pick it up first. Even in this town you have to hold a thing to spend it.') },

    { id:'road', name:'the road', x:0, y:92, w:320, h:20,
      look:()=>narrate('Four lanes of convertibles moving at the speed of unearned confidence. '+
        'Crossing on foot is what the newspaper would call "an incident."'),
      talk:()=>narrate('You do not talk to traffic. Not on day one.'),
      take:()=>narrate('You cannot take a road. You can only get taken by one.'),
      use:()=>{ walkTo(mouse.x, 136, ()=>die('road')); } },

    { id:'east', name:'the boardwalk', x:296, y:120, w:24, h:52, approach:[292,152],
      exit:true, desc:'Down the steps, the boardwalk runs south along the water: bodies, noise, '+
        'fried sugar, and the casino tower standing over all of it like a tax collector.',
      go:()=>gotoRoom('boardwalk', 20, 150) }
  ],
  overlay(t){
    if(!GS.flags.chipGone) return;
    if(Math.floor(t/700)%2===0) return;
  }
},

/* ============================ BOARDWALK ================================== */
boardwalk:{
  walk:{ x0:14, x1:306, y0:126, y1:168 }, spawn:[40,150],
  npcs:[ { id:'chip', x:158, y:130, look:CAST.chip,
           hidden:()=>!GS.flags.chipOnStrip || GS.flags.levelDone },
         { id:'gil', x:62, y:152, look:CAST.gil },
         { id:'brenda', x:272, y:158, look:CAST.brenda,
           extra:()=>{ r(278,142,7,9,P.bone); r(279,143,5,7,'#8a9ab0');
                       r(279,144,4,1,'#5a6a80'); r(279,146,3,1,'#5a6a80'); } } ],
  onEnter(){
    if(GS.flags.stake && GS.flags.chipOnStrip && !GS.flags.chipNoticed){
      GS.flags.chipNoticed = true;
      narrate(['Chip Winthrop is leaning on the railing where he can see the whole strip, and he '+
        'is looking directly at your hands.',
        'He has been there the entire time. You have just become worth turning his head for.'],
        { then:saveGame });
      return; }
    if(!GS.flags.sawStrip){ GS.flags.sawStrip = true;
      narrate(['The boardwalk. Two hundred yards of oiled shoulders, frozen drinks in souvenir cups, '+
               'and a casino tower at the far end throwing a shadow across all of it.',
               'Everybody here is selling something. The ones who look like they are not selling '+
               'anything are selling the hardest.']); } },
  hotspots:[
    { id:'chip', pri:2, name:'Chip Winthrop', x:144, y:92, w:30, h:44, approach:[166,148],
      hidden:()=>!GS.flags.chipOnStrip || GS.flags.levelDone,
      look:()=>narrate(['Black flat-brim cap dead level, a mesh shirt that is not so much clothing '+
        'as a filing decision, and the deep even tan of a man who has never once been told no.',
        'He is not doing anything. He drove down here specifically to not do anything at you, and '+
        'he is extremely good at it.']),
      talk:()=>chipStrip(),
      take:()=>narrate('You would need a much larger bag and a much better lawyer.'),
      useItem:(it)=>{ if(it==='churro'){ sayAs('chip','I do not eat anything I can see the sugar '+
        'on.'); return true; } return false; } },

    { id:'gil', pri:2, name:'the sunburnt man', x:50, y:112, w:28, h:46, approach:[74,152],
      look:()=>narrate('A man the colour of a stop sign, radiating heat like a parked car. His '+
        'Hawaiian shirt is unbuttoned to a depth that is a cry for help. He is holding himself very '+
        'still, the way you hold yourself when moving is a decision you have to make each time.'),
      talk:()=>gilTalk(),
      take:()=>narrate('He is too hot to touch. Literally. You can feel it from here.'),
      useItem:(it)=>{
        if(it==='aloe'){ gilPayoff(); return true; }
        if(it==='spf'){ sayAs('gil', 'SPF two? SPF TWO? Buddy, that\'s not lotion, that\'s BASTING. '+
          'Get away from me.'); Audio_.sfx('deny'); return true; }
        if(it==='churro'){ sayAs('gil', 'I can\'t eat. Chewing moves my FACE.'); return true; }
        return false; } },

    { id:'bench', name:'the bench', x:42, y:130, w:44, h:24, approach:[66,158],
      look:()=>narrate('A public bench, slatted, warm, and currently supporting one of the worst '+
        'afternoons in Florida history.') },

    { id:'brenda', pri:2, name:'the woman with the clipboard', x:258, y:118, w:28, h:46, approach:[248,160],
      look:()=>narrate(['Navy blazer in ninety-degree heat, a lanyard, and a smile with the '+
        'structural integrity of a bank vault. She has already decided how this conversation goes. '+
        'She has decided that about everyone on this boardwalk.',
        'She has not taken the jacket off once all day. That is not stubbornness. That is a woman '+
        'who knows precisely what the jacket is doing and has priced the heat into it.']),
      talk:()=>brendaTalk(),
      useItem:(it)=>{
        if(it==='sign'){
          if(GS.flags.brendaWary){
            drop('sign'); GS.flags.signReturned = true;
            sayAs('brenda',['She takes the sign out of your hands without a word and puts it back '+
              'on its stake.','"Do not come to this table again."']); return true; }
          if(heatOf('brenda') < BRENDA_SECRET_HEAT){
            drop('sign'); GS.flags.signReturned = true;
            sayAs('brenda',['"...Huh. It came back."',
              'She sets it on its stake, squares it off, and looks at you for a second longer than '+
              'the transaction needs.','"Most things down here do not."']); return true; }
          brendaSecret(); return true;
        }
        if(it==='coupon'){ addHeat('brenda', 4);
        sayAs('brenda',['That coupon is redeemable at any participating Shoreline property. There '+
          'are no participating Shoreline properties. That is not a lie, it is a *structure*.',
          'She is enjoying explaining this to you. She is aware that she is enjoying it.']);
        return true; } return false; } },

    { id:'booth', name:'the timeshare booth', x:240, y:100, w:62, h:56, approach:[228,158],
      look:()=>narrate('"SHORELINE RESIDENCES — OWN THE SUNSET." The brochures show a building that '+
        'does not exist, photographed from an angle that would be impossible if it did.') },

    { id:'freesign', pri:3, name:'the FREE GIFT sign', x:230, y:116, w:30, h:38, approach:[224,156],
      hidden:()=>GS.flags.signTaken,
      look:()=>narrate('Hot pink, laminated, two feet tall. It says FREE GIFT. It does not say what '+
        'the gift is. That is the entire trick and it has never once failed.'),
      take:()=>takeSign() },

    { id:'cart', name:'the churro cart', x:172, y:106, w:40, h:36, approach:[166,142],
      look:()=>narrate('A churro cart with a hand-lettered card taped to the glass: "BACK IN 5 MIN." '+
        'The tape has gone yellow. The card has gone soft. Nobody has been back in some time.'),
      take:()=>{ if(has('churro')){ narrate('One stolen churro is a snack. Two is a personality.'); return; }
        give('churro'); narrate(['You take a churro from an unattended cart. It is still warm, which '+
          'raises questions you decide not to pursue.',
          'This is your first crime in Vanity Shores. It will not make the top forty.']); },
      talk:()=>narrate('"Back in five minutes," you tell the cart. The cart does not believe you either.') },

    { id:'rail', name:'the railing', x:0, y:96, w:320, h:14, approach:[160,132],
      look:()=>narrate('Past the railing: a strip of sand, then the water, then the curve of the '+
        'earth. The sunset is doing something obscene with the colour orange.'),
      take:()=>narrate('The railing stays. You have already been thrown out of one place this year.') },

    { id:'tower', name:'the casino tower', x:224, y:16, w:32, h:62,
      look:()=>narrate('The Winthrop. Forty floors of poured concrete and better lighting, standing '+
        'over the boardwalk with its hands in everyone\'s pockets. From here you can see the '+
        'penthouse. From the penthouse, you are a smudge.') },

    { id:'stairs', name:'the steps down to the beach', x:107, y:130, w:46, h:34, approach:[132,144],
      exit:true, desc:'Wooden steps down under the pier, into the shade. Whatever happens down '+
        'there happens where the boardwalk cannot see it.',
      go:()=>gotoRoom('underpier', 60, 150) },

    { id:'west', name:'the top of the strip', x:0, y:118, w:16, h:54, approach:[22,152],
      exit:true, desc:'Back up the strip toward the bus stop, the road, and the man leaning on '+
        'the pink car.',
      go:()=>gotoRoom('arrival', 288, 152) },

    { id:'east', name:'the pier', x:306, y:112, w:14, h:60, approach:[298,152],
      exit:true, desc:'The boardwalk narrows and runs out over the water: a bandshell, a fortune '+
        'teller\'s tent, and a great deal of nothing beyond.',
      go:()=>gotoRoom('pier', 16, 152) }
  ]
},

/* ============================== PIER ===================================== */
pier:{
  walk:{ x0:14, x1:306, y0:132, y1:168 }, spawn:[40,150],
  npcs:[ { id:'dickie', x:52, y:130, look:CAST.dickie,
           extra:(t)=>{ r(61,106,1,7,'#5a5a68'); r(59,102,4,4,'#2a2a34');   // the microphone
             px(60,103,'#6a6a78');
             if(GS.flags.crowdDrawn && !REDUCED && Math.floor(t/240)%2===0)
               text('♪', 66, 100+((t/300)|0)%3, P.gold, FONT.dlg); } },
         { id:'zsazsa', x:266, y:154, look:CAST.zsazsa },
         /* Eight of them for the first set, two fewer for every encore, floored
            at the two who have nowhere else to be. The purse already halves each
            time; this is that same decay standing in front of the bandshell,
            where the player can watch it happen instead of being told. */
         ...CROWD_SPOTS.map((sp, i) => ({
            id:'c'+i, x:sp[0], y:sp[1], look:CAST['c'+i],
            hidden:()=>!GS.flags.crowdDrawn || i >= crowdSize(),
            extra:(t)=>{ if(REDUCED || i % 3) return;          // a few of them enjoying it
              if(Math.floor(t/300 + i) % 4 === 0)
                text('\u266a', sp[0]+6, sp[1]-46+((t/260+i)|0)%3, 'rgba(255,194,61,.7)', FONT.dlg); } })) ],
  onEnter(){ if(!GS.flags.sawPier){ GS.flags.sawPier = true;
      narrate('The pier. Out here the music from the strip arrives late and slightly wrong, like '+
              'news from a country you used to live in.'); } },
  hotspots:[
    { id:'dickie', pri:2, name:'the lounge singer', x:40, y:96, w:26, h:42, approach:[74,146],
      look:()=>narrate('A burgundy sequin dinner jacket in the year of our Lord whenever this is, '+
        'worn by a man singing to eleven empty feet of pier. He has the posture of somebody who was '+
        'on television once and has been paying for it ever since.'),
      talk:()=>dickieTalk(),
      useItem:(it)=>{ if(it==='sign'){ plantSign(); return true; }
        if(it==='churro'){ sayAs('dickie','Not while I\'m ON, kid. Sugar on the vowels.'); return true; }
        return false; } },

    { id:'stage', name:'the bandshell', x:6, y:70, w:98, h:62, approach:[100,148],
      look:()=>narrate('A municipal bandshell, purple, shell-shaped, and acoustically perfect for '+
        'carrying the sound of one man\'s decline out over open water.'),
      useItem:(it)=>{ if(it==='sign'){ plantSign(); return true; } return false; } },

    { id:'zsazsa', pri:2, name:'the fortune teller', x:254, y:120, w:26, h:44, approach:[248,158],
      look:()=>narrate('Rings on every finger, a turban with a costume-jewellery brooch, and eyes '+
        'that go over you like a customs officer. She is reading you right now. She has not asked '+
        'permission and she is not going to.'),
      talk:()=>zsaTalk(),
      useItem:(it)=>{ if(it==='quarter'){ zsaReading(); return true; }
        if(it==='fortune'){ sayAs('zsazsa','I know what it says, sugar. I wrote it.'); return true; }
        return false; } },

    { id:'tent', name:'the fortune tent', x:222, y:74, w:92, h:62, approach:[236,158],
      look:()=>narrate('"PALMS READ — $.25." Hand-painted, and the twenty-five has been painted over '+
        'something larger. Business is not what it was.') },

    { id:'plantedsign', pri:3, name:'the FREE GIFT sign', x:96, y:112, w:20, h:26,
      approach:[104,146],
      hidden:()=>!GS.flags.crowdDrawn || has('sign') || GS.flags.signReturned,
      look:()=>narrate('Still on its stake at the mouth of the bandshell, doing the only job it '+
        'has ever had. Dickie has stopped needing it. It is, technically, still stolen.'),
      take:()=>{ give('sign');
        narrate(['You lift the sign off its stake for the second time today.',
          'Nobody in the thinning crowd looks up. A sign that has already worked is invisible.']); },
      use:()=>narrate('It is already working. The question is what else it could be worth.') },

    { id:'crate', name:'the crate', x:118, y:118, w:44, h:12, approach:[140,144],
      look:()=>narrate('An empty crate stencilled SHORELINE RESIDENCES. Whatever was in it is now '+
        'somebody\'s equity.'),
      take:()=>narrate('It is empty, splintered, and heavier than it looks. Like most things '+
        'stencilled with a developer\'s name.') },

    { id:'railp', name:'the pier railing', x:0, y:112, w:320, h:10, approach:[160,140],
      look:()=>narrate('Ninety years of salt air have been working on this railing the whole time. '+
        'It is still standing. That is not the same as safe.'),
      take:()=>{ walkTo(mouse.x, 138, ()=>die('rail')); },
      use:()=>{ walkTo(mouse.x, 138, ()=>die('rail')); } },

    { id:'westp', name:'the boardwalk', x:0, y:118, w:14, h:54, approach:[22,152],
      exit:true, desc:'Back down the pier toward the noise, the sugar, and the money.',
      go:()=>gotoRoom('boardwalk', 298, 152) }
  ]
},

/* ========================== UNDER THE PIER =============================== */
underpier:{
  walk:{ x0:16, x1:298, y0:118, y1:168 }, spawn:[60,150],
  npcs:[ { id:'monte', x:206, y:144, look:CAST.monte },
         { id:'u1', x:150, y:160, look:CAST.rube1 },
         { id:'u2', x:262, y:164, look:CAST.rube2 } ],
  danger(p){ if(p.y>=86 && p.y<108){ walkTo(p.x, 120, ()=>die('surf')); return true; } },
  onEnter(){ if(!GS.flags.sawUnder){ GS.flags.sawUnder = true;
      narrate(['Under the pier the light comes down in stripes and everything smells like wet rope. '+
               'The temperature drops eight degrees and the rules drop with it.',
               'A folding table. Three shells. Two men watching who are not customers.']); } },
  hotspots:[
    { id:'monte', pri:2, name:'the man with the shells', x:192, y:110, w:28, h:44, approach:[196,158],
      look:()=>narrate('Tank top, gold rope chain, forearms like mooring line. He is not big the way '+
        'a bouncer is big. He is big the way a problem is big. His hands never stop moving and they '+
        'never move fast.'),
      talk:()=>monteTalk(),
      useItem:(it)=>{ if(it==='fortune'){ sayAs('monte','You want me to read your palm? Wrong tent, '+
        'wrong end of the pier.'); return true; }
        if(it==='churro'){ sayAs('monte','I\'m working.'); return true; } return false; } },

    { id:'table', name:'the folding table', x:174, y:144, w:60, h:16, approach:[190,162],
      look:()=>narrate('Green felt gone bald in three places. Three walnut shells and a pea that has '+
        'never, in the entire history of this table, been under any of them.'),
      take:()=>{ Audio_.sfx('deny');
        narrate('Two men who are not customers shift their weight at exactly the same moment. '+
          'You put your hand back in your pocket.'); } },

    { id:'rubes', pri:1, name:'the two onlookers', x:140, y:136, w:34, h:36, approach:[152,166],
      look:()=>narrate('They lose, they groan, they bet again. They have been doing this since before '+
        'you arrived and their money never actually leaves the table. Work it out.'),
      talk:()=>narrate('"Great game," says one, without moving his eyes. "Real fair game."') },

    { id:'water', name:'the water', x:0, y:86, w:320, h:14,
      look:()=>narrate('The tide is coming in over the sandbar, brown and busy. There is a rip out '+
        'past the third piling that has taken four tourists this season. The city has not put up a '+
        'sign. A sign would look negative.'),
      use:()=>{ walkTo(mouse.x, 120, ()=>die('surf')); },
      take:()=>narrate('You cannot take the ocean. Several men in this town have tried.') },

    { id:'drift', name:'the driftwood', x:36, y:152, w:30, h:12, approach:[52,164],
      look:()=>narrate('A grey plank worn smooth, and a single red sandal. Somewhere in Vanity Shores '+
        'a man is walking around at exactly fifty percent.') },

    { id:'upstairs', name:'the way back up', x:280, y:96, w:38, h:56, approach:[276,150],
      exit:true, desc:'Wooden steps back up into the noise and the light.',
      go:()=>gotoRoom('boardwalk', 130, 152) }
  ]
}
};

/* ---------- 5d. SCRIPTED SCENES ------------------------------------------ */
/* Every beat offers a build-specific route and a route anyone can take. The
   build never locks you out of Level 1 — it changes what the win looks like. */
const GATE = 38;                       // default stat needed to open a build route

/* ---------------------------------------------------------------------------
   THE ECONOMY, IN ONE TABLE.
   Every figure Level 1 can move is declared here, in cents, so the balance can
   be read, simulated and regenerated without anybody reading dialogue. Routes
   are 'base' (open to any build) and the three build routes. Change a number
   here and the game, the docs and the balance simulation all move together.
   --------------------------------------------------------------------------- */
const ECONOMY = {
  startPerMoneyPoint: 10,              // opening purse = Money stat x this
  stakeLine: 10000,                    // enough money to make Chip look at you
  monteStake: 5000,                    // cost to sit at the shell game
  encoreDecay: 0.5,                    // each encore plays to a thinner crowd
  encoreFloor: 500,                    // ...but never for nothing
  earn: {
    brendaGift:   { base:0,     charm:500,   money:500,   fight:0     },
    gilAloe:      { base:2000,  charm:3000,  money:2500,  fight:2000  },
    dickieSplit:  { base:2500,  charm:4500,  money:4000,  fight:3000  },
    dickieEncore: { base:1500,  charm:2000,  money:1500,  fight:1500  },
    monteWin:     { base:10000, charm:17500, money:15000, fight:12000 }
  }
};
/* Every stat check in the level, by name, so they can be listed and tuned
   individually. RULE: no gate may be the only route past a required beat. */
const GATES = {
  chipIntro:    { stat:'any',   need:GATE, opens:'a build-specific opening line with Chip' },
  brendaPitch:  { stat:'any',   need:GATE, opens:'the good bag in one pass instead of two' },
  gilPrice:     { stat:'any',   need:GATE, opens:'a better price for the aloe' },
  dickieSplit:  { stat:'any',   need:GATE, opens:'a bigger cut of the tip jar' },
  dickieEncore: { stat:'charm', need:GATE, opens:'a bigger first encore before the decay bites' },
  monteTable:   { stat:'any',   need:GATE, opens:'a bigger take at the shell game' },
  chipShowdown: { stat:'any',   need:GATE, opens:'a build-specific way to make Chip take the money' }
};
const gateNeed = k => (GATES[k] ? GATES[k].need : GATE);
const gated = (k, stat) => S()[stat] >= gateNeed(k);
const earn  = (k, route) => ECONOMY.earn[k][route] !== undefined
                          ? ECONOMY.earn[k][route] : ECONOMY.earn[k].base;

/* ---------------------------------------------------------------------------
   INTRIGUE.
   Attraction is tracked, never resolved — nothing in Act 1 is winnable (§5.4
   gates low-tier conquests to Act 2 and the rest to Act 3). What the player
   builds here is a number the later acts read, and a reason to talk to somebody
   twice when the puzzle does not require it.
   --------------------------------------------------------------------------- */
const HEAT_TIERS = [[80,'a problem for later'],[60,'circling'],[35,'interested'],
                    [15,'noticed you'],[1,'clocked you']];
const heatOf   = who => GS.heat[who] || 0;
function heatTier(v){ for(const [n,label] of HEAT_TIERS) if(v >= n) return label; return null; }
function addHeat(who, amt){
  GS.heat[who] = clamp(heatOf(who) + amt, 0, 100);
  saveGame();
}
/* Repeat flirtation is capped so it cannot be farmed for a number. */
function flirtBeat(who, beats, perBeat){
  const key = who + 'Flirt';
  const i = GS.flags[key] || 0;
  if(i < beats.length){
    GS.flags[key] = i + 1;
    addHeat(who, perBeat); tick('flirted');
    return beats[i];
  }
  return null;
}
const you = () => GS.name || 'you';

/* Three beats he does not have to give you. Each one costs him something. */
const CHIP_BEATS = [  /* @owner chip */
  ['He has moved four feet along the car so that he is facing you now, which he would describe, '+
   'if anybody asked him, as a coincidence.',
   '"Do you know the worst thing about a town like this? Everybody wants the same six things."',
   '"You want them too. You just want them out loud. It is —" he goes looking for a word he can '+
   'afford "— unbecoming."',
   'He says the word to your mouth rather than your eyes. Then he notices that he has done it.',
   '"You know what is in that fountain?" He does not point at it. "Eleven hundred dollars on a '+
   'good week. My family loses more than that in the fountain."',
   '"There is a man whose entire job is the fountain." He lets it sit. "I have never learned his '+
   'name. I want you to think about why that is the part you find upsetting."'],
  ['"You are still here."',
   'He says it like an accusation. It arrives like a compliment. Both of you hear which one it '+
   'was, and neither of you does anything about that.',
   '"People wash up here every June and they are gone by the Fourth. I have a system. I do not '+
   'learn the names until August."',
   'A pause. "What was it again?"'],
  ['"There is a room at the top of that tower," he says, looking at the tower and not at you, '+
   '"with one window that faces the whole boardwalk. You can see every single person down here '+
   'from up there. Nobody can see in."',
   'The pause runs exactly one beat longer than a pause is supposed to.',
   '"It is a very boring room," Chip says. "You would hate it."']
];
function chipIntro(){  /* @owner chip */
  if(GS.flags.metChip){
    const beat = flirtBeat('chip', CHIP_BEATS, 6);
    if(beat){ sayAs('chip', beat); return; }
    const lines = { money:'Still counting it? There\'s less of it than there was a minute ago.',
                    fight:'You\'ve got the shoulders for this town and the shoes for a different one.',
                    charm:'You\'re still handsome. In a rental sort of way.' }[leanName()];
    sayAs('chip', [lines, 'Go on. The boardwalk\'s that way. Everything down there is priced '+
      'for people like you, which is how we know what you\'re worth.']); return;
  }
  const opts = [];
  if(S().charm >= GATE) opts.push({ text:'"You\'ve been staring since the bus."',
    tag:'CHARM', fn:()=>chipBeat('charm') });
  if(S().fight >= GATE) opts.push({ text:'"Move the car."', tag:'FIGHTING', fn:()=>chipBeat('fight') });
  if(S().money >= GATE) opts.push({ text:'"What rate did they get you? Eleven? Ouch."',
    tag:'MONEY', fn:()=>chipBeat('money') });
  opts.push({ text:'"Hi. I, uh — I just got in."', fn:()=>chipBeat('none') });

  sayAs('chip', ['Oh, good. Another one.',
    'Let me guess. Bus ticket, one bag, and a philosophy. You people always have a philosophy. '+
    'It\'s the only thing you can afford to bring.',
    'Chip Winthrop. My family built the tower you\'ve been staring at since you got off. '+
    'You\'ll be staring at it for a while.'], { choices:opts });
}
function chipBeat(kind){  /* @owner chip */
  GS.flags.metChip = true;
  if(kind==='charm') addHeat('chip', 18);
  if(kind==='money') addHeat('chip', 8);     // being read is its own kind of intimate
  const beat = {
    charm:['Chip takes off the sunglasses. That is not nothing. That is a man buying time.',
      '"...Cute," he says, in the voice of somebody making a note. "That works down here, you know. '+
      'For about a season. Then everybody has seen it."',
      'He looks at you for a good deal longer than the insult required, catches himself doing it, '+
      'and puts the sunglasses back on like a man closing a door he did not mean to open.'],
    fight:['He does not move the car. But he checks — fast, and hoping you missed it — where his '+
      'hands are.','"Muscle," he says, pleased with himself for landing on a category. "There\'s '+
      'work for muscle in this town. It\'s all somebody else\'s work, but there\'s work."'],
    money:['The smile stays exactly where it is. Something behind it does not.',
      '"Nine and a quarter," he says, too quickly. "It\'s nine and a quarter." Then, recovering: '+
      '"You know what rates are. That\'s adorable. That\'s like a dog knowing what a Tuesday is."'],
    none:['You hear yourself say it. It lands on the pavement between you and stays there.',
      '"You just got in," Chip repeats, savouring it like a good oyster. "You just got in. God, '+
      'that\'s wonderful. Say it again for my friends sometime."']
  }[kind];
  say(beat, { speaker:CAST.chip.name, look:CAST.chip, then:()=>{
    GS.flags.quarterOnGround = true; Audio_.sfx('coin');
    narrate(['He flicks a coin at your feet. It lands, spins, and settles heads up, which somehow '+
      'makes it worse.',
      '"Buy yourself a personality," Chip says. "Ask for the small."',
      'Then he gets in the car, and instead of leaving he drives four hundred yards down the strip '+
      'and parks where he can see the whole boardwalk.',
      'He is not finished. He has cleared his afternoon.'],
      { then:()=>{ GS.flags.chipOnStrip = true; GS.flags.chipGone = true; saveGame(); } }); } });
}

/* ---- Gil Furnace: the sunburnt tourist --------------------------------- */
function gilTalk(){  /* @owner gil */
  if(GS.flags.gilPaid){ sayAs('gil', ['I can move my ARMS. Do you understand what you\'ve done '+
    'for me?','I\'m going to go stand in the ocean now. Slowly. Like a gentleman.']); return; }
  if(has('aloe')){ sayAs('gil', ['Is that — is that ALOE? Is that aloe in your hand right now?',
    'Twenty dollars. Twenty American dollars, right now, into your hand.'],
    { choices:[ { text:'Hand him the aloe.', fn:gilPayoff },
                { text:'"Let me think about it." (Keep it.)',
                  fn:()=>sayAs('gil','THINK ABOUT IT? I\'m COOKING out here!') } ] }); return; }
  sayAs('gil', ['Don\'t. Don\'t say it. I know how I look.',
    'Four hours. Four hours on a rented lounger because the girl said "you\'re already so tan" and '+
    'I believed her, because she was PAID to say that and I have a MASTER\'S DEGREE.',
    'Anything cold. Aloe, ice, a wet towel, a kind word delivered at low temperature. Twenty dollars '+
    'to the first person who brings me something cold. I am not joking. I have never been less funny '+
    'in my life.']);
}
function gilPayoff(){  /* @owner gil @critical */
  drop('aloe'); GS.flags.gilPaid = true;
  const opts = [{ text:'"Twenty. Pleasure doing business."', fn:()=>gilPay('base',
    ['He pays. He does not haggle. A man in that condition has no leverage and both of you know it.']) }];
  if(gated('gilPrice','charm')) opts.unshift({ text:'"Twenty? Gil. Look at me. This is medical."', tag:'CHARM',
    fn:()=>gilPay('charm', ['You hold the tube just out of reach and say his name like you have known '+
      'him for years. He hears a friend. He is paying a stranger thirty dollars.']) });
  if(gated('gilPrice','money')) opts.unshift({ text:'"Twenty-five, and the shade of that awning."',
    tag:'MONEY', fn:()=>gilPay('money', ['You bundle it: product, plus a service he was already getting '+
      'for free. He accepts the bundle. Everyone accepts the bundle. That is why there is always '+
      'a bundle.']) });
  if(gated('gilPrice','fight')) opts.unshift({ text:'"Twenty." (Hold out your hand. Wait.)',
    tag:'FIGHTING', fn:()=>gilPay('fight', ['You say the number once and then say nothing at all, which '+
      'is a thing you are apparently good at. He finds the twenty very quickly. He finds another five '+
      'and puts it away again while watching your face.']) });
  say('The tube changes hands. Gil makes a noise that should not be made in public.', { choices:opts });
}
function gilPay(route, lines){  /* @owner gil */
  pay(earn('gilAloe', route));
  say(lines.concat(['You are ' + money() + ' into Vanity Shores. It is not power. It is the thing '+
    'you buy power with.']), { speaker:CAST.gil.name, look:CAST.gil });
}

/* ---- Brenda Tang: the timeshare shark ---------------------------------- */
/* Offered only once her business with you is finished — she does not flirt on the clock. */
const BRENDA_BEATS = [  /* @owner brenda */
  ['"Still here." She checks the clipboard. The clipboard does not need checking.',
   '"I work until seven. Then the jacket comes off and I stop being pleasant to people for money, '+
   'and those two events are related."'],
  ['"You want to know what I actually sell?" She does not wait to find out.',
   '"One week of being somebody else. Fifty-one weeks a year they are whoever they actually are, '+
   'and for one week they get to be the person they described to me at this table."',
   'She taps the pen against the clipboard twice.',
   '"You are trying to run the whole year like that. It is the most ambitious thing anybody has '+
   'said to me on this boardwalk, and I have been out here since March."'],
  ['She writes something on the back of a brochure and does not hand it over.',
   '"When you have real money," she says, "come and find me. Not for a unit."',
   'Then she puts the brochure in her blazer pocket, which is either the entire point of the '+
   'gesture or it is not, and goes back to work.']
];
const brendaDone = () => GS.flags.gotPremium || GS.flags.brendaWary ||
                         (GS.flags.pitchCount||0) >= 2;
function brendaTalk(){  /* @owner brenda @critical */
  if(brendaDone()){
    const beat = flirtBeat('brenda', BRENDA_BEATS, 6);
    if(beat){ sayAs('brenda', beat); return; }
    sayAs('brenda','You already got the gift, sweetheart. The gift is a one-time offer. '+
      'Everything is a one-time offer. That\'s what makes it an offer.'); return; }
  const opts = [];
  if(S().charm >= GATE) opts.push({ text:'"Do you close this hard on everyone?"',
    tag:'CHARM', fn:()=>brendaOut('charm') });
  if(S().money >= GATE) opts.push({ text:'"What\'s your points-to-maintenance ratio?"',
    tag:'MONEY', fn:()=>brendaOut('money') });
  if(S().fight >= GATE) opts.push({ text:'(Say nothing. Keep standing there.)',
    tag:'FIGHTING', fn:()=>brendaOut('fight') });
  opts.push({ text:'"Sure. Hit me with the pitch."', fn:()=>brendaOut('sit') });
  opts.push({ text:'"No thanks."', fn:()=>sayAs('brenda','Nobody says no. They say "not today," and '+
    'then they say "let me talk to my wife," and THEN they say yes. You\'re just early.') });

  sayAs('brenda', GS.flags.pitchDone ?
    ['You\'re back. They always come back. What is it this time?'] :
    ['Ninety seconds. That\'s all I want. Ninety seconds and a FREE GIFT, no obligation, no purchase, '+
     'you keep the gift either way.',
     'Shoreline Residences. Fractional ownership. You\'re not buying a condo, you\'re buying *access '+
     'to a lifestyle* — and the beautiful thing, the really beautiful thing, is you only pay for the '+
     'weeks you use.',
     'Also the weeks you don\'t use. But those are cheaper.'], { choices:opts });
}
function brendaOut(kind){  /* @owner brenda */
  GS.flags.pitchDone = true;
  if(kind==='charm'){
    GS.flags.gotPremium = true; give('aloe'); give('coupon');
    pay(earn('brendaGift','charm')); addHeat('brenda', 20);
    sayAs('brenda', ['...Huh.',
      'She looks at you properly for the first time — the quick top-to-bottom appraisal of somebody '+
      'who prices things for a living. Then a second pass, which pricing did not require.',
      '"You are going to do well here," she says, "and I am going to hate reading about it."',
      'She reaches under the table for the good bag: aloe, a drink coupon, and a five-dollar gift '+
      'card she was supposed to log. When you take it she does not let go of it immediately, which '+
      'is either a negotiating habit or it is not.']); return;
  }
  if(kind==='money'){
    GS.flags.gotPremium = true; give('aloe'); give('coupon');
    pay(earn('brendaGift','money')); addHeat('brenda', 12);
    sayAs('brenda', ['Her whole face changes. Not warmer — *lighter*. The relief of not having to '+
      'do the voice.','"Oh, thank God, you\'re in the business. Twelve to one, and they moved '+
      'maintenance off the disclosure page in March, which should be illegal and is instead '+
      'a *strategy*."',
      'Colleagues get the good bag. She hands it over without breaking eye contact: aloe, a drink '+
      'coupon, and a gift card she is definitely not logging.']); return;
  }
  if(kind==='fight'){
    give('aloe'); GS.flags.brendaWary = true; tick('leaned');   // earned now, not on dismissal
    sayAs('brenda', ['You do not say anything. You just stay exactly where you are, at exactly the '+
      'distance where a person has to decide what you are.',
      'Twenty seconds of that and her pitch dies in the middle of a sentence about *equity*.',
      '"Take the aloe," she says flatly, "and go stand somewhere else. You\'re costing me the '+
      'four-thirty crowd."',
      'She does not look away while she says it, and she does not look away after. Whatever she '+
      'has decided you are, she has decided it all the way through.'], { then:saveGame }); return;
  }
  // anyone can simply sit through it — twice, if that is what it takes
  GS.flags.pitchCount = (GS.flags.pitchCount||0) + 1;
  if(GS.flags.pitchCount === 1){
    give('tote'); give('spf'); give('coupon');
    sayAs('brenda', ['Ninety seconds becomes eleven minutes. You learn about *deeded weeks*. You '+
      'learn about the *sunset premium*. You learn that the building in the photograph is '+
      '"substantially similar" to a building that will exist.',
      'You nod at all of it, and at the end she hands you the free gift with the air of a woman '+
      'settling a debt: a canvas tote, a bottle of Coco Blast SPF 2, and a drink coupon.',
      '"Come back if you want to hear about financing," she says, already looking past you.']);
  } else {
    give('aloe'); addHeat('brenda', 8);
    sayAs('brenda', ['You sit through it again. On purpose. Voluntarily.',
      'Somewhere around minute six she stops selling and just looks at you, and something in her '+
      'goes quiet, and you understand that she has met her own kind.',
      '"Okay," she says. "Okay. Whatever you\'re actually doing out here — take this and do it '+
      'somewhere I can\'t be blamed." Under the table: the aloe. The real gift. The one they keep '+
      'for the people who won\'t leave.']);
  }
}
function takeSign(){  /* @owner brenda */
  if(!GS.flags.pitchDone){
    Audio_.sfx('deny');
    sayAs('brenda','Hand. Off. The sign, sweetheart. The sign is *the whole business*.'); return; }
  GS.flags.signTaken = true; give('sign'); tick('pocketed');
  narrate(['She has turned to work a family of four with the dead-eyed patience of a heron.',
    'You lift the FREE GIFT sign off its stake and walk away with it under your arm. Nobody stops '+
    'you. Nobody ever stops a person carrying something confidently.',
    'You are now in possession of two feet of laminated hot pink that promises something for '+
    'nothing. In this town that is not a sign. That is a crowd, folded up.'], { then:saveGame });
}

/* ---------------------------------------------------------------------------
   SECRETS.
   Nothing points at these. They are for the player who goes back to a place
   the puzzle is finished with, carrying something they were not asked to carry.
   --------------------------------------------------------------------------- */
const SECRETS = {
  brenda: { name:'Behind the unit',
            where:'the timeshare booth, boardwalk',
            needs:'Bring back the FREE GIFT sign after the bandshell show — Brenda has to '+
                  'like you already (heat 18+), and intimidating her earlier closes it for good.',
            payoff:'A cutaway, and the largest single heat swing in the level.' }
};
const SECRET_COUNT = Object.keys(SECRETS).length;
function foundSecret(id){ GS.secrets[id] = true; saveGame(); }
const secretsFound = () => Object.keys(GS.secrets).length;

/* The FREE GIFT sign is the object the whole level runs on: you steal it from
   Brenda, it buys you a crowd, and if you think to go back to the pier and
   collect it afterwards you can hand it back to the woman you took it from.
   She has to already like you. Intimidating her earlier closes this off. */
const BRENDA_SECRET_HEAT = 18;  /* @owner brenda */

function paintBoothBack(bx, by, bw, bh, t){
  const grd = g.createLinearGradient(0, by, 0, by+bh);
  grd.addColorStop(0, '#3d2255'); grd.addColorStop(1, '#7a4a6a');
  g.fillStyle = grd; g.fillRect(bx, by, bw, bh);
  r(bx, by+bh-26, bw, 26, P.wood2);                       // the boardwalk behind
  for(let x = bx; x < bx+bw; x += 9) r(x, by+bh-26, 1, 26, P.wood3);
  railing(bx, bx+bw, by+bh-34);

  const cx = bx + bw/2;
  r(cx-34, by+18, 68, 50, '#e8dcc4');                     // the back of the canopy
  r(cx-34, by+18, 68, 3, '#d0c4ac');
  r(cx-38, by+13, 76, 6, P.surf);
  textC('SHORELINE', cx, by+13, '#0a3c44', FONT.sm);
  r(cx-34, by+66, 68, 2, '#b8ac94');

  /* A structural event, entirely in the canvas wall — and it plays as a scene
     rather than one flat loop. The page the reader is on sets the tempo: the
     canopy is still while she is closing up, finds a rhythm, loses its mind,
     and is completely still again by the time the booth reopens. Everything
     stays on the far side of the canvas. That is the whole joke. */
  const page = (GS.cut && GS.cut.i) || 0;
  const TEMPO = [0, 300, 150, 0];                     // ms per cycle, by page
  const AMPL  = [0.6, 2.2, 5.0, 0];
  const per = TEMPO[Math.min(page, 3)], amp = AMPL[Math.min(page, 3)];
  const ph  = (REDUCED || !per) ? 0 : Math.sin(t/per);
  const wob = REDUCED ? 0 : ph * amp;
  const bul = REDUCED ? 4 : 4 + Math.abs(ph) * amp * 0.9;
  const lean = REDUCED ? 0 : ph * amp * 0.5;

  if(page === 3){                                     // afterwards: just a wall
    g.fillStyle = '#efe5d1';
    g.beginPath(); g.ellipse(cx, by+44, 12, 14, 0, 0, Math.PI*2); g.fill();
  } else {
    g.fillStyle = '#f2e8d4';
    g.beginPath();
    g.ellipse(cx + wob, by+42, 13 + bul, 15, 0, 0, Math.PI*2);
    g.fill();
    g.fillStyle = '#d8ccb4';
    g.beginPath(); g.ellipse(cx + wob + 5, by+46, 7, 9, 0, 0, Math.PI*2); g.fill();
    /* the whole canopy takes the load, not just the wall */
    g.globalAlpha = .30;
    r(cx-34 + lean, by+18, 68, 3, '#8a7a62');
    g.globalAlpha = 1;
    if(page === 2 && !REDUCED){                       // the frame gives up a little
      for(let i=0;i<3;i++){
        const dy = by + 22 + i*14 + Math.sin(t/150 + i)*1.5;
        g.globalAlpha = .22; r(cx-34, dy, 68, 1, '#b8a888'); g.globalAlpha = 1;
      }
    }
  }

  /* Propped up, then knocked, then facing the wrong way for the rest of the
     afternoon — which is the only thing the boardwalk ever gets to see. */
  const pg = (GS.cut && GS.cut.i) || 0;
  g.save();
  g.translate(cx+32, by+50);
  g.rotate(pg >= 3 ? 0.22 : pg === 2 ? (REDUCED ? 0.06 : Math.sin(t/150)*0.07) : 0);
  r(-14,-12,28,24, P.gold);
  r(-13,-11,26,22,'#c41d68');
  textC(pg >= 3 ? 'EERF' : 'FREE', 0, -8, P.bone, FONT.sm);
  textC(pg >= 3 ? 'TFIG' : 'GIFT', 0,  1, P.bone, FONT.sm);
  g.restore();

  /* One witness. It looks away on page one out of manners, gives that up by
     page two, and does not blink again for the rest of the scene. */
  const gx = bx + 18, gy = by + bh - 38;
  const turn = pg === 0 ? (Math.floor(t/900) % 2) : 1;
  r(gx, gy, 4, 3, P.bone); r(gx + (turn?3:-1), gy-1, 2, 2, P.bone);
  px(gx + (turn?4:-1), gy-1, P.gold);
  r(gx+1, gy+3, 1, 2, P.gold);
  if(pg >= 2 && !REDUCED && Math.floor(t/260) % 2)     // a small head tilt
    px(gx + 4, gy - 2, P.bone);
}

function brendaSecret(){  /* @owner brenda */
  drop('sign'); GS.flags.signReturned = true; foundSecret('brenda');
  addHeat('brenda', 25);
  /* Earned here, not in a then() — a then() fires on dismissal and a room
     transition can eat it. The marks stay on the sprite into Level 2, and
     nobody anywhere in the game will mention them. */
  tick('laid'); mark('flushed'); mark('lipstick');
  sayAs('brenda', ['You hand back the FREE GIFT sign.',
    'She looks at it. She looks at the bandshell, four hundred yards down the pier, where it has '+
    'obviously been. She looks at you.',
    '"You took my sign," she says, "you built a *crowd* with it, you took a cut off the top, and '+
    'then you brought it back."',
    'She puts it under the table without breaking eye contact.',
    '"It is four-forty," Brenda says. "I work until seven."',
    '"I am going to take a fifteen-minute break. Behind the unit. Structurally the back wall is '+
    'the weakest part of the whole product and I have never once cared until today."'],
    { then:()=>cutaway(paintBoothBack, [
      'Brenda closes the Shoreline pop-up at four-forty, which is not seven, and which she does '+
      'not explain to anybody.',
      'From the boardwalk, the canopy appears to be having some kind of structural event.',
      'A seagull watches the whole thing without blinking. Seagulls in this town have seen worse.',
      'Fifteen minutes later the booth reopens. The FREE GIFT sign is back on its stake facing '+
      'the wrong way, and nobody fixes it all afternoon.'],
      ()=>sayAs('brenda', ['"Shoreline Residences," she says, to the four-thirty crowd, in exactly '+
        'the voice she was using before. "Ninety seconds and a free gift."',
        'She does not look over. Her lipstick is a different shape and she has not noticed yet.',
        '"Come back when you have real money," she says, to you, without turning round.'])) });
}

/* ---- Madame LaRue: the boardwalk psychic ------------------------------- */
function zsaTalk(){  /* @owner zsazsa */
  if(has('fortune') || GS.flags.readingDone){
    sayAs('zsazsa','I told you what I saw. Twenty-five cents doesn\'t buy a second opinion.'); return; }
  if(has('quarter')){
    sayAs('zsazsa', ['Palms read. Two bits. Same price since the Carter administration, and before '+
      'you ask — no, I don\'t do futures on credit. Futures on credit is how I ended up on a pier.'],
      { choices:[ { text:'Put the quarter in her hand.', fn:zsaReading },
                  { text:'"Maybe later."', fn:()=>sayAs('zsazsa','Mm. Later.') } ] }); return; }
  sayAs('zsazsa', ['Twenty-five cents, sugar.','I know. I know. You don\'t have it. I can see that '+
    'from here and I didn\'t need the cards.','Find a quarter. This town is *littered* with men who '+
    'throw them.']);
}
function zsaReading(){  /* @owner zsazsa */
  drop('quarter'); GS.flags.readingDone = true; give('fortune'); Audio_.sfx('charm');
  const lean = leanName();
  const personal = {
    money:'"Money hand," she says. "You count in your sleep. That\'s not an insult, it\'s a *warning* '+
      '— the ones who count get invited upstairs, and upstairs is where the counting stops being '+
      'yours."',
    fight:'"Oh, that\'s a *loud* hand," she says. "You solve things with it. It works. It keeps '+
      'working right up until the night it works too well, and then it\'s the only tool you own."',
    charm:'"Mm. That hand." She holds it a second longer than the reading requires. "You\'re going to '+
      'be loved in this town, sugar, and about half of it is going to be a business decision. Yours '+
      'or theirs, I can\'t tell yet."'
  }[lean];
  sayAs('zsazsa', ['She takes the quarter without looking at it and turns your hand over like she is '+
    'checking fruit.', personal,
    '"Three of them are coming for you. A man who laughs before he does it. A woman you\'ll tell '+
    'things to. And one more I can\'t see, because they haven\'t decided to hate you yet."',
    (['chip','brenda'].some(w => heatOf(w) >= 15)
      ? '"And somebody up on that strip has been thinking about you when you are not in the room," '+
        'she adds. "That one is not a prophecy, sugar. That one is just me having eyes."'
      : '"Nobody is in love with you yet. Give it a week. This town falls hard and it falls for '+
        'the wrong reasons."'),
    'Then she lets go, writes something on a card, and presses it into your palm.',
    '"That one\'s free, and it\'s worth more than the reading. There\'s a table under the pier. Read '+
    'it before you sit down at it."'], { then:saveGame });
}

/* ---- Dickie Vermouth: the has-been ------------------------------------- */
function dickieTalk(){  /* @owner dickie */
  if(GS.flags.crowdDrawn){
    if(GS.cash >= ECONOMY.monteStake && !GS.flags.monteWon){
      sayAs('dickie', ['Kid. You are standing there with table money in your pocket asking me to '+
        'sing at you.',
        'No. Go and do the thing you actually came down here to do.',
        'I will still be here afterwards. That is the one part of this I am reliably good at.']);
      return; }
    const next = encoreTake();
    sayAs('dickie', ['Kid. KID. Did you see that? Fourteen people. I counted during the key change.',
      (GS.flags.encores
        ? 'Another one? Crowd is thinner every time, and half of it is the same crowd. Your share '+
          'would be about ' + '$' + (next/100).toFixed(2) + '.'
        : 'You want another set? Say the word. Crowd\'s thinner now but a room is a room.')],
      { choices:[ { text:'"Do another set." (Split it again.)', fn:dickieEncore },
                  { text:'"Later, Dickie."', fn:()=>sayAs('dickie','Later. Sure. I\'ll be here. '+
                    'That\'s the one thing I\'m still great at.') } ] }); return; }
  sayAs('dickie', ['Ladies and gentlemen — and I use the term in the plural out of *habit* —',
    'Dickie Vermouth. Four seasons at the Sapphire Room. Opened for a man whose name you know. '+
    'Closed for a man whose name you don\'t.',
    'Here\'s the arithmetic, kid. I got the pipes, I got the jacket, I got a bandshell the city '+
    'isn\'t using. What I don\'t got is *people*. You can\'t tip a man you never stopped for.',
    'Get me a crowd and I\'ll split what lands in the jar. Straight down the middle, and I\'ll cry '+
    'about it later in private like a professional.']);
}
function plantSign(){  /* @owner dickie */
  if(!has('sign')){ narrate('You would need something that makes people stop.'); return; }
  drop('sign'); GS.flags.crowdDrawn = true;
  const opts = [{ text:'Stand back and let it happen.', fn:()=>dickiePay('base',
    ['You lean on the railing and watch a crowd assemble itself out of nothing but the word FREE.',
     'Dickie sings. Dickie is, it turns out, genuinely good — which makes the whole thing sadder and '+
     'the tips larger.']) }];
  if(gated('dickieSplit','charm')) opts.unshift({ text:'Work the crowd yourself between numbers.', tag:'CHARM',
    fn:()=>dickiePay('charm', ['You move through them during the second number telling everyone the '+
      'same thing: that they got here early, that this never happens, that they should not tell '+
      'anybody.',
      'People will pay almost anything to have been somewhere first.']) });
  if(gated('dickieSplit','money')) opts.unshift({ text:'Call the tip jar a cover charge.',
    tag:'MONEY', fn:()=>dickiePay('money', ['You move the tip jar to the mouth of the bandshell and '+
      'stand behind it, and just like that it stops being a jar and starts being a door.',
      'Fewer people come in. All of them pay. You have invented the velvet rope from first '+
      'principles.']) });
  if(gated('dickieSplit','fight')) opts.unshift({ text:'Make sure nobody wanders off mid-song.', tag:'FIGHTING',
    fn:()=>dickiePay('fight', ['You position yourself at the open end of the bandshell with your arms '+
      'folded, and it is remarkable how many people discover they had nowhere else to be.',
      'The crowd stays. The crowd is also, you notice, standing very close together.']) });
  narrate(['You plant the FREE GIFT sign at the mouth of the bandshell.',
    'It takes ninety seconds. A family stops. Then a couple. Then eleven people who cannot see the '+
    'sign but can see a crowd, which is the same thing and always has been.',
    'Dickie Vermouth steps to the microphone with the expression of a man who has been kept in a '+
    'garage for nine years.'], { choices:opts });
}
function dickiePay(route, lines){  /* @owner dickie */
  pay(earn('dickieSplit', route)); GS.flags.dickiePaid = true; Audio_.sfx('fanfare');
  say(lines.concat(['He counts the jar out on the stage lip, halves it without being asked, and '+
    'presses your share into your hand with both of his.',
    '"Don\'t say thank you," he says. "Say *when*."',
    'You are carrying ' + money() + '.']), { speaker:CAST.dickie.name, look:CAST.dickie, then:saveGame });
}
/* Diminishing returns, and he will not play at all once you are holding table
   money. Between them the encore can never carry anyone to the win line — the
   level has to go through Monte — while the floor keeps it a real way back from
   a lost stake, so there is still no dead end. */
function encoreTake(){
  const first = earn('dickieEncore', gated('dickieEncore','charm') ? 'charm' : 'base');
  const raw = first * Math.pow(ECONOMY.encoreDecay, GS.flags.encores || 0);
  return Math.max(ECONOMY.encoreFloor, Math.round(raw/25)*25);
}
function dickieEncore(){  /* @owner dickie */
  const take = encoreTake();
  GS.flags.encores = (GS.flags.encores || 0) + 1; tick('encores');
  pay(take); Audio_.sfx('cash');
  sayAs('dickie', [(GS.flags.encores > 2
      ? 'He does it again. There are four people now, and two of them are waiting for somebody '+
        'else. He sings to them exactly as hard.'
      : 'He does it again. It is thinner the second time — the crowd is smaller, the jokes land '+
        'a half-beat late, and he knows it, and he does it anyway.'),
    'Your half comes to ' + '$' + (take/100).toFixed(2) + '. You are carrying ' + money() + '.',
    '"That\'s the business, kid," he says, not looking at you. "First set\'s the miracle. Every set '+
    'after is the *job*."'], { then:saveGame });
}

/* ---- Monte: the shell game, and the point of the whole level ------------ */
function monteTalk(){  /* @owner monte @critical */
  if(GS.flags.monteWon){
    sayAs('monte', ['Table\'s closed.','It\'s closed for you specifically. Everybody else, table\'s '+
      'wide open.']); return; }
  if(GS.cash < ECONOMY.monteStake){
    sayAs('monte', ['Fifty to sit.','That\'s not me being tough, that\'s the whole business. Under '+
      'fifty you\'re not a player, you\'re *weather*.',
      'Come back when you\'re holding.']); return; }
  /* The card is the win condition; the four routes are only how you cash it.
     That was true before and completely invisible — four options all opening
     "Play —" read as four guesses rather than one certainty spent four ways.
     Each names its method now, the card gets said out loud, and refusing to use
     it is labelled as a refusal instead of hiding among the winners. */
  const card = has('fortune');
  const opts = [];
  if(card){
    if(gated('monteTable','charm')) opts.push({ text:'Work the crowd instead of the shells.',
      tag:'CHARM', fn:()=>monteWin('charm') });
    if(gated('monteTable','money')) opts.push({ text:'Bet like the outcome is already settled.',
      tag:'MONEY', fn:()=>monteWin('money') });
    if(gated('monteTable','fight')) opts.push({ text:'Take hold of his left wrist.',
      tag:'FIGHTING', fn:()=>monteWin('fight') });
    opts.push({ text:'Watch his left hand. Nothing else.', fn:()=>monteWin('plain') });
  }
  opts.push({ text: card ? 'Ignore the card. Follow the shells like everybody else.'
                         : 'Put fifty down. Follow the shells.', fn:monteLose });
  opts.push({ text:'Walk away.', fn:()=>narrate('You walk away from the table, which is the single '+
    'most profitable decision anyone has made under this pier all year.') });

  const patter = ['Fifty to sit, pays three to one, one pea, three shells, and the pea is right '+
    'there where you can see it. I\'m not hiding anything. Look at my hands.',
    'Everybody looks at my hands. That\'s free too.'];
  if(card) patter.push('Madame LaRue\'s card is in your pocket. You have stopped needing to read '+
    'it. THE PEA IS NEVER UNDER A SHELL. WATCH THE LEFT HAND, NOT THE SHELLS.',
    'Knowing that is not the same as getting paid for it. That part is decided by how you sit down.');

  sayAs('monte', patter, { choices:opts });
}
function monteLose(){  /* @owner monte */
  pay(-ECONOMY.monteStake, false); Audio_.sfx('shell'); GS.hustleTries++;
  GS.flags.encores = 0;              // hours pass; the pier gets a fresh crowd
  say(['You put fifty on the felt and you watch the shells. You watch them *hard*. You do not blink.',
    'You are extremely confident about the middle one.',
    'It is not the middle one. It was never any of them, and somewhere in the last four seconds your '+
    'fifty dollars became his fifty dollars with your full cooperation.',
    GS.hustleTries===1 ? '"Tough," says Monte, already resetting. "Real tough. Go again?"' :
      '"You\'re a good customer," Monte says, and he means it the way a farmer means it about a field.'],
    { speaker:CAST.monte.name, look:CAST.monte, then:()=>{ Audio_.sfx('fail');
      narrate('You are down to ' + money() + '. Dickie Vermouth would do another set. Dickie '+
        'Vermouth would do another set at gunpoint, and there is no gun.', { then:saveGame }); } });
}
function monteWin(kind){  /* @owner monte */
  pay(-ECONOMY.monteStake, false); Audio_.sfx('shell');
  const beats = {
    charm:{ take:earn('monteWin','charm'), lines:[
      'You put fifty down. Then you turn your back on the table entirely and start talking to the '+
      'two onlookers, who are not onlookers, about how sorry you feel for the next mark.',
      'By the third shuffle they are betting against you to save face, and the small crowd that '+
      'gathers to watch is betting with you, because you are the one who has been *talking to them*.',
      'You never do watch the shells. You watch his left hand, exactly like the card said, and you '+
      'call it out loud with a showman\'s certainty about four seconds before it is true.',
      'The side bets alone come to more than the pot. Monte pays because a crowd is watching him '+
      'pay, and that is the one thing his business cannot survive refusing.'] },
    money:{ take:earn('monteWin','money'), lines:[
      'You put fifty down and you do not follow the shells at all. You follow the *money* — where he '+
      'lets it sit, what he covers first, which loss he can afford.',
      'His left hand palms the pea before the first shell moves. The card said so. You knew before '+
      'you sat down, which means the only real question was how much to make it worth.',
      'You lose the first two on purpose, small, and let him raise you. Then you take the third at '+
      'three to one and stand up while he is still working out when it started.'] },
    plain:{ take:earn('monteWin','base'), lines:[
      'You put fifty down and you do not watch the shells at all. You watch his left hand, the '+
      'way the card told you to, and you keep watching it while every other person at this table '+
      'watches the walnut shells dance.',
      'It is not clever. It is just the one piece of information nobody else at the table paid '+
      'twenty-five cents for.',
      'You take it on the third pass, quietly, and you do not make a face about it. Monte pays '+
      'without a word and looks at you for slightly too long.'] },
    fight:{ take:earn('monteWin','fight'), lines:[
      'You put fifty down, let him run one clean shuffle, and then you reach across the felt and '+
      'take hold of his left wrist.',
      'You do not squeeze. You just hold it up where the two onlookers and the four tourists behind '+
      'them can see the pea sitting in the web of his thumb, exactly where the card said it would be.',
      'Under the pier it gets very quiet. Monte looks at your hand on his wrist and does the '+
      'arithmetic that everybody in this town eventually does about you.',
      '"Take it," he says, "and don\'t come back down here." He counts it out one-handed. He is '+
      'good at that. He has clearly done it before.'] }
  }[kind];
  pay(beats.take);
  GS.flags.monteWon = true;
  if(kind==='fight'){ GS.flags.monteEnemy = true; tick('leaned'); }
  Audio_.sfx('fanfare'); Audio_.scene('win');
  say(beats.lines.concat([
    'You come out from under the pier holding ' + money() + '.',
    'It is not a fortune. It is a *stake*, which is the only kind of money that matters, because it '+
    'is the kind you can put back down on a table.']),
    { speaker:CAST.monte.name, look:CAST.monte,
      then:()=>{ Audio_.scene('play'); saveGame();
        narrate('Up the steps. Into the light. Somebody should really see you like this.',
          { then:saveGame }); } });
}

/* ---------------------------------------------------------------------------
   THE CURTAIN.
   Level 1 is not won by reaching a number. The number only buys you the right
   to walk back up to the man who flicked a quarter at you and make him hold
   what you did with it. He can be paid five ways; every one of them ends with
   a hundred dollars in a hand that does not want it.
   --------------------------------------------------------------------------- */
function chipStrip(){  /* @owner chip */
  if(!GS.flags.stake){
    const c = GS.cash;
    sayAs('chip', c < 2000
      ? ['You have been down here the better part of an hour now.',
         '"And you are still worth" — he does the arithmetic without looking away — "almost '+
         'exactly what I flicked at you."']
      : c < 5000
      ? ['"Twenty dollars," Chip says, delighted. "*Twenty.* My father tips more than that to '+
         'have a door held open."',
         '"Keep going. Genuinely. You are the most interesting thing on this strip, which is a '+
         'devastating sentence for me to have had to build."']
      : ['He straightens up off the railing, which is the most physical effort he has made today.',
         '"Oh, you are close. That is the worst thing about you. Close is where people down here '+
         '*live*, and look at them, they are all still here."']);
    return;
  }
  chipShowdown();
}

function chipShowdown(){  /* @owner chip @critical */
  const opts = [];
  if(gated('chipShowdown','charm')) opts.push({
    text:'"You said it was a nice hundred dollars. Hold it and say that again."',
    tag:'CHARM', fn:()=>chipTakes('charm') });
  if(gated('chipShowdown','fight')) opts.push({
    text:'Take his wrist. Put it in his hand. Close the fingers one at a time.',
    tag:'FIGHTING', fn:()=>chipTakes('force') });
  if(gated('chipShowdown','money')) opts.push({
    text:'"Twenty-five cents. Nine and a quarter. Compounded since Tuesday."',
    tag:'MONEY', fn:()=>chipTakes('math') });
  if(heatOf('chip') >= 35) opts.push({
    text:'"You parked where you could watch me. So watch."',
    tag:'HEAT', fn:()=>chipTakes('heat') });
  opts.push({ text:'Hold your hand out, palm up, and wait.', fn:()=>chipTakes('plain') });
  opts.push({ text:'Not yet.', fn:()=>sayAs('chip','Mm. Come back when your hands stop shaking. '+
    'I will be here. I have cleared the afternoon.') });

  sayAs('chip', ['He has seen it. He saw it before you were off the steps.',
    'The whole performance — the railing, the boredom, the four hundred yards of parking — is '+
    'still running, and underneath it Chip Winthrop is doing sums about you.',
    '"So," he says. "You have had a day."'], { choices:opts });
}

/* The hundred, held at the bottom of frame. It will not stay still, because he
   cannot make his hand stop, and by the last page it is gone into a pocket that
   does not exist. */
function heldHundred(bx, by, w2, h2, t, since, settled){
  const shake = REDUCED ? 0 : (settled ? 0.4 : 1.1);
  const hx = Math.round(bx + w2*0.52 + Math.sin(t/90)*shake);
  const hy = Math.round(by + h2 - 14 + Math.cos(t/70)*shake);
  r(hx, hy, 26, 12, '#cfe0c0');
  r(hx, hy, 26, 1, '#e8f2e0');
  r(hx+1, hy+1, 24, 10, '#a8c497');
  r(hx+9, hy+3, 8, 6, '#cfe0c0');
  textC('100', hx+13, hy+3, '#2a4a2a', FONT.sm);
}

/* The curtain of the level, staged. Held, cracked, three looks in four seconds,
   the invitation, and the pocket that is not there. */
const CHIP_CURTAIN = [
  { push:1.00, rays:0.7, prop:(bx,by,w,h,t,s)=>heldHundred(bx,by,w,h,t,s,false) },
  { push:1.09, rays:1.0, shake:1.6, prop:(bx,by,w,h,t,s)=>heldHundred(bx,by,w,h,t,s,false) },
  { push:1.05, rays:0.5, prop:(bx,by,w,h,t,s)=>heldHundred(bx,by,w,h,t,s,true) },
  { push:1.16, rays:1.9, shake:2.2, prop:(bx,by,w,h,t,s)=>heldHundred(bx,by,w,h,t,s,true) },
  { push:1.12, rays:1.4, prop:(bx,by,w,h,t,s)=>heldHundred(bx,by,w,h,t,s,true) },
  { push:1.00, rays:0.35 }
];

function chipTakes(kind){  /* @owner chip */
  GS.flags.chipEnding = kind;
  addHeat('chip', kind === 'heat' ? 14 : 8);
  const beat = {
    plain:['You do not say anything at all. You hold your hand out, palm up, exactly the way he '+
      'held his out over the quarter, and you wait.',
      'It takes eleven seconds. He is counting them too.',
      'Then his hand comes out — because the alternative is standing on a public boardwalk visibly '+
      'refusing a hundred dollars in front of four strangers, and Chip Winthrop has never in his '+
      'life been able to look like that.'],
    charm:['"You said it was a nice hundred dollars," you tell him. "Hold it. Say that again."',
      'And because you asked him nicely, in a voice he likes, in front of people, he does.',
      '"...It is a nice hundred dollars," Chip says, and hears it happen, and cannot get it back.'],
    force:['You take his wrist. Not hard — just entirely, the way you take something that was '+
      'never going to be handed over.',
      'You turn the hand palm-up, put the money in it, and close the fingers one at a time.',
      'He lets you. That is the part neither of you is ever going to bring up again.'],
    math:['"Twenty-five cents," you say. "At nine and a quarter, which is your number and not mine. '+
      'Compounded since Tuesday."',
      'It is not a hundred dollars. It is not within a hundred miles of a hundred dollars, and you '+
      'both know it, and that is exactly why it works.',
      'He takes the money to make the arithmetic stop.'],
    heat:['"You drove four hundred yards down this strip," you say, "and parked where you could see '+
      'me. You have been there all afternoon. So watch."',
      'You put it into his hand slowly enough that he has to decide twice not to pull it back.',
      'He decides twice.']
  }[kind];

  say(beat, { speaker:CAST.chip.name, look:CAST.chip, then:()=>{
    Audio_.sfx('fanfare');
    closeup(CAST.chip, [
      'Chip Winthrop is holding one hundred dollars that he did not want, cannot hand back, and '+
      'is not going to put away.',
      '"...It is a hundred dollars," he says. The sentence does not do the work he needs it to do.',
      'He looks at the money. Then at you. Then, for less than a second, up at the tower.',
      '"There is a hustle on the strip Thursday. Everybody who is nobody will be there."',
      'He puts the car in gear without getting into it. "Come. I want to watch it happen to you '+
      'in front of people."',
      'Then he puts the hundred in his shirt pocket. The shirt does not have a pocket. He does it '+
      'anyway, and neither of you says a word about that either.'],
      ()=>{ GS.flags.levelDone = true; GS.flags.chipOnStrip = false; saveGame();
            GS.scene = 'complete'; GS.completeAt = clock; },
      CHIP_CURTAIN);
  }});
}

/* ---- looking at what you are carrying ---------------------------------- */
function lookItem(id){  /* @owner system */
  if(id === 'spf'){
    say(['Coco Blast SPF 2. "TROPICAL COCONUT." The bottle is warm and it sloshes and it smells, '+
         'frankly, incredible.','On the back, in letters too small to be a real warning: DO NOT DRINK.'],
      { choices:[
        { text:'Put it away.', fn:()=>narrate('Sensible. Disappointing, but sensible.') },
        { text:'Smell it again.', fn:()=>narrate('Coconut. Pineapple. A note of something chemical '+
          'and expensive. You could genuinely drink this.') },
        { text:'Drink it.', fn:()=>die('oil') } ] }); return;
  }
  narrate(ITEMS[id].desc);
}

