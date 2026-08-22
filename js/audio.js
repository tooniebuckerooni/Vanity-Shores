/* Vanity Shores — audio.js
 *
   The adaptive score and the sound effects, generated live. No audio files.
 *
   Load order is the order this file used to be read top to bottom, and it
   matters: these are classic scripts sharing one global scope, so a file that
   runs at load time cannot reference a const declared in a later one.
   A NEW LEVEL GOES IN AS ITS OWN FILE, AFTER level1.js AND BEFORE shell.js.
 */
"use strict";
/* ---------- 3. AUDIO: adaptive synthwave, generated live ------------------ */
/* Stems crossfade against the player's stat lean (§8): the arp carries Money,
   a distorted saw carries Fighting, pad + lead carry Charm. Nothing is a file. */
const Audio_ = (() => {
  let ctx=null, master=null, buses={}, noiseBuf=null, started=false;
  let musicOn=true, sfxOn=true, musicGain=null, sfxGain=null;
  let timer=null, step=0, nextTime=0, scene='title', amb=null, ambGain=null;
  let lean = { money:.33, fight:.33, charm:.33 };
  const BPM = 106, SPB = 60/BPM/4;                   // sixteenth notes

  /* Eight bars rather than four, and a texture that changes every time round,
     so the loop stops announcing itself after a minute. */
  const CH = {
    Am:{ root:45, tones:[57,60,64] }, F:{ root:41, tones:[53,57,60] },
    C: { root:48, tones:[52,55,60] }, G:{ root:43, tones:[50,55,59] },
    Dm:{ root:38, tones:[53,57,62] }, E:{ root:40, tones:[52,56,59] }
  };
  const LOOP = ['Am','F','C','G','Am','F','Dm','E'];
  const ARPS = [[0,1,2,1],[0,2,1,2],[2,1,0,1],[0,1,2,3],[2,0,1,0],[0,3,2,1]];
  /* statement, melody, breathe, push */
  const SECT = [ { arp:1,   lead:0,  grit:1,   perc:1,    pad:1    },
                 { arp:1,   lead:1,  grit:.7,  perc:1,    pad:.85  },
                 { arp:.3,  lead:.5, grit:.15, perc:.3,   pad:1.35 },
                 { arp:1.2, lead:1,  grit:1.2, perc:1.15, pad:.7   } ];
  /* an eight-bar phrase: [bar, sixteenth, midi, beats] */
  const MELODY = [ [0,0,64,.55],[0,8,60,.40],
                   [1,0,65,.80],
                   [2,0,64,.35],[2,6,62,.35],[2,12,60,.50],
                   [3,0,59,1.00],
                   [4,0,64,.50],[4,8,67,.50],
                   [5,0,69,.80],
                   [6,0,67,.35],[6,6,65,.35],[6,12,64,.50],
                   [7,0,57,1.10] ];
  const mtof = m => 440 * Math.pow(2, (m-69)/12);
  let section = 0, lastSection = -1;

  function init(){
    if(ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 6;
    master.connect(comp); comp.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = musicOn ? 1 : 0;
    sfxGain   = ctx.createGain(); sfxGain.gain.value   = sfxOn   ? 1 : 0;
    musicGain.connect(master); sfxGain.connect(master);
    for(const n of ['bass','pad','arp','lead','grit','perc']){
      const gn = ctx.createGain(); gn.gain.value = 0; gn.connect(musicGain); buses[n] = gn;
    }
    buses.sfx = ctx.createGain(); buses.sfx.gain.value = 0.9; buses.sfx.connect(sfxGain);
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime+1.2);
  }

  function voice(type, freq, when, dur, bus, vol, opts){
    if(!ctx) return;
    opts = opts||{};
    const o = ctx.createOscillator(), gn = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, when);
    if(opts.detune) o.detune.value = opts.detune;
    if(opts.slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20,opts.slideTo), when+dur);
    let node = o;
    if(opts.filter){
      const f = ctx.createBiquadFilter();
      f.type = opts.filter; f.frequency.setValueAtTime(opts.cut||1200, when);
      f.Q.value = opts.q||1;
      if(opts.cutTo) f.frequency.exponentialRampToValueAtTime(Math.max(60,opts.cutTo), when+dur);
      o.connect(f); node = f;
    }
    const a = opts.atk!==undefined ? opts.atk : 0.008;
    gn.gain.setValueAtTime(0.0001, when);
    gn.gain.exponentialRampToValueAtTime(Math.max(.0002,vol), when+a);
    gn.gain.exponentialRampToValueAtTime(0.0001, when+dur);
    node.connect(gn); gn.connect(buses[bus]||buses.sfx);
    o.start(when); o.stop(when+dur+0.03);
  }
  function noise(when, dur, vol, cut, cutTo, bus){
    if(!ctx) return;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type='lowpass';
    f.frequency.setValueAtTime(cut, when);
    if(cutTo) f.frequency.exponentialRampToValueAtTime(Math.max(60,cutTo), when+dur);
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(vol, when);
    gn.gain.exponentialRampToValueAtTime(0.0001, when+dur);
    s.connect(f); f.connect(gn); gn.connect(buses[bus]||buses.sfx);
    s.start(when); s.stop(when+dur+0.02);
  }

  /* stem levels follow the build AND the current section — the adaptive part */
  function mix(){
    if(!ctx) return;
    const T = ctx.currentTime, R = 1.4, sx = SECT[section];
    const on = (name, v) => buses[name].gain.setTargetAtTime(Math.max(0,v), T, R/3);
    const s = { title:{b:.20,p:.34,a:.00,l:.06,g:.00,pc:.00},
                create:{b:.24,p:.30,a:.10,l:.10,g:.02,pc:.05},
                play:{b:.30,p:.22,a:.16,l:.13,g:.08,pc:.14},
                tense:{b:.34,p:.14,a:.10,l:.06,g:.22,pc:.18},
                win:{b:.30,p:.30,a:.26,l:.22,g:.06,pc:.16} }[scene] || {};
    const fixed = scene === 'title' || scene === 'create';
    on('bass', s.b);
    on('pad',  s.p * (0.7 + lean.charm*1.1) * (fixed?1:sx.pad));
    on('arp',  s.a * (0.4 + lean.money*2.0) * (fixed?1:sx.arp));
    on('lead', s.l * (0.4 + lean.charm*1.8) * (fixed?1:sx.lead));
    on('grit', s.g * (0.3 + lean.fight*2.2) * (fixed?1:sx.grit));
    on('perc', s.pc * (0.7 + lean.fight*0.9) * (fixed?1:sx.perc));
  }

  function tick(){
    if(!ctx) return;
    while(nextTime < ctx.currentTime + 0.18){
      const bar = (step>>4) % 8, six = step % 16, T = nextTime;
      const round = (step/128)|0;
      section = round % SECT.length;
      if(section !== lastSection){ lastSection = section; mix(); }
      const ch = CH[LOOP[bar]], sx = SECT[section];
      const cut = 780 + Math.sin(round*0.7 + bar*0.4)*260;     // slow filter drift

      if(six % 4 === 0){                                        // bass
        const oct = (section===3 && six===12) ? 12 : 0;
        voice('sawtooth', mtof(ch.root+oct), T, .30, 'bass', .5,
              { filter:'lowpass', cut:cut, cutTo:220, q:4 });
      }
      if(six === 0){                                            // pad
        for(const nn of ch.tones){
          voice('sawtooth', mtof(nn),    T, 1.8, 'pad', .16,
                { atk:.35, filter:'lowpass', cut:1500, q:.7 });
          voice('sawtooth', mtof(nn+12), T, 1.8, 'pad', .07,
                { atk:.4, detune:9, filter:'lowpass', cut:2200 });
        }
      }
      if(six % 2 === 0 && sx.arp > .2){                         // money arp
        const pat = ARPS[(round*3 + bar) % ARPS.length];
        const idx = pat[(step>>1) % 4];
        voice('square', mtof((idx < 3 ? ch.tones[idx] : ch.tones[0]+12) + 12), T, .13,
              'arp', .16, { filter:'lowpass', cut:3400, q:2 });
      }
      if((six === 4 || six === 12) && sx.grit > .2)             // fighting stabs
        voice('sawtooth', mtof(ch.root+12), T, .18, 'grit', .30,
              { filter:'lowpass', cut:2600, cutTo:500, q:7 });

      const fill = (bar === 7 && six >= 12 && section !== 2);
      if(six === 0 || (six === 10 && section !== 2) || (six === 6 && section === 3))
        voice('sine', 110, T, .17, 'perc', .55, { slideTo:44 });
      if(six === 8 || (six === 12 && section === 3)) noise(T, .13, .14, 4000, 900, 'perc');
      if(fill) noise(T, .07, .12 + (six-12)*.02, 5200, 1400, 'perc');
      if(six % 2 === 1 && !fill)
        noise(T, .035, (six===2||six===6||six===10||six===14) ? .075 : .045, 9000, 6000, 'perc');

      if(sx.lead > 0){                                          // the charm phrase
        for(const m of MELODY) if(m[0] === bar && m[1] === six){
          voice('triangle', mtof(m[2]+12), T, m[3]*0.5, 'lead', .24, { atk:.04 });
          voice('sawtooth', mtof(m[2]+12), T, m[3]*0.5, 'lead', .07,
                { atk:.06, detune:7, filter:'lowpass', cut:2400 });
        }
      }
      nextTime += SPB; step++;
    }
  }

  function ambience(kind){
    if(!ctx) return;
    if(amb){ try{ amb.stop(); }catch(e){} amb=null; }
    if(!kind) return;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter();
    const gn = ctx.createGain(); ambGain = gn;
    if(kind==='surf'){ f.type='lowpass'; f.frequency.value=520; gn.gain.value=.055; }
    else if(kind==='deep'){ f.type='lowpass'; f.frequency.value=280; gn.gain.value=.075; }
    else { f.type='bandpass'; f.frequency.value=900; gn.gain.value=.03; }
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.11; lg.gain.value = kind==='deep'?.03:.022;
    lfo.connect(lg); lg.connect(gn.gain); lfo.start();
    s.connect(f); f.connect(gn); gn.connect(musicGain);
    s.start(); amb = s;
  }

  const API = {
    start(){
      init(); if(!ctx || started) return;
      if(ctx.state === 'suspended') ctx.resume();
      started = true; nextTime = ctx.currentTime + 0.06;
      timer = setInterval(tick, 25); mix();
    },
    scene(s){ if(scene===s) return; scene = s; mix(); },
    lean(m,f,c){ const tot=Math.max(1,m+f+c); lean={money:m/tot,fight:f/tot,charm:c/tot}; mix(); },
    ambience,
    get musicOn(){ return musicOn; },
    get sfxOn(){ return sfxOn; },
    toggleMusic(){
      musicOn = !musicOn;
      if(musicGain) musicGain.gain.setTargetAtTime(musicOn?1:0, ctx.currentTime, .12);
      return musicOn;
    },
    toggleSfx(){
      sfxOn = !sfxOn;
      if(sfxGain) sfxGain.gain.setTargetAtTime(sfxOn?1:0, ctx.currentTime, .05);
      return sfxOn;
    },
    /* ---- SFX ---- */
    sfx(name){
      if(!ctx || !sfxOn) return;
      const T = ctx.currentTime + 0.01;
      switch(name){
        case 'click': voice('square', 1400, T, .035, 'sfx', .10); break;
        case 'walk':  noise(T, .05, .05, 1600, 500, 'sfx'); break;
        case 'coin':  voice('square', 988, T, .07, 'sfx', .20);
                      voice('square', 1319, T+.07, .16, 'sfx', .20); break;
        case 'cash':  [523,659,784,1047].forEach((f,i)=>
                        voice('square', f, T+i*.055, .16, 'sfx', .19));
                      noise(T, .06, .10, 5000, 1200, 'sfx'); break;
        case 'punch': noise(T, .17, .40, 1800, 90, 'sfx');
                      voice('sine', 180, T, .16, 'sfx', .34, { slideTo:48 }); break;
        case 'charm': [659,831,988,1319].forEach((f,i)=>
                        voice('triangle', f, T+i*.05, .42, 'sfx', .17, { atk:.02 })); break;
        case 'fail':  voice('sawtooth', 392, T, .42, 'sfx', .22,
                        { slideTo:120, filter:'lowpass', cut:1600, cutTo:300 }); break;
        case 'death': [233,220,208].forEach((f,i)=>
                        voice('sawtooth', f, T+i*.02, 1.5, 'sfx', .20,
                          { slideTo:f/3.6, filter:'lowpass', cut:1400, cutTo:180 }));
                      noise(T+.1, 1.0, .16, 900, 120, 'sfx'); break;
        case 'slots': for(let i=0;i<9;i++) voice('square', 900+i*40, T+i*.045, .03, 'sfx', .13); break;
        case 'shell': noise(T, .09, .13, 2600, 700, 'sfx'); break;
        case 'fanfare':[523,659,784,1047,1319].forEach((f,i)=>{
                        voice('square', f, T+i*.10, .5, 'sfx', .18);
                        voice('sawtooth', f/2, T+i*.10, .5, 'sfx', .09,
                          { filter:'lowpass', cut:2000 }); }); break;
        case 'deny':  voice('square', 220, T, .13, 'sfx', .16, { slideTo:150 }); break;
        case 'pickup':voice('triangle', 784, T, .09, 'sfx', .18);
                      voice('triangle', 1175, T+.06, .12, 'sfx', .16); break;
      }
    }
  };
  return API;
})();

