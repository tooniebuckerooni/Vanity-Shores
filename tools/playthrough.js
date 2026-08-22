#!/usr/bin/env node
/* Plays the game with a real mouse, the way a person does.
 *
 * This exists because Level 2 shipped with its win line unreachable and every
 * check passed. The smoke tests set GS.room directly, so nothing ever asked the
 * question a player asks first: can I GET there by clicking? A test that assigns
 * state cannot fail the way a player fails.
 *
 * Rules, both learned the hard way:
 *   - click through the canvas at logical coordinates, never call scene functions
 *   - wait on game state, never on the clock
 *
 *   node tools/playthrough.js [--headed]
 */
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch(e){ console.error('needs playwright: npm install --no-save playwright'); process.exit(1); }
const fs = require('fs');

const GAME = 'file://' + path.resolve(__dirname, '..', 'index.html');
function findChrome(){
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if(!fs.existsSync(root)) return null;
  const d = fs.readdirSync(root).filter(x=>/^chromium-\d+$/.test(x))
              .sort((a,b)=>parseInt(b.slice(9))-parseInt(a.slice(9)))[0];
  const exe = d && path.join(root, d, 'chrome-linux', 'chrome');
  return exe && fs.existsSync(exe) ? exe : null;
}

let pass = 0, fail = 0;
const ok = (c, what) => { if(c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + what); }
                          else { fail++; console.log('  \x1b[31m✗ ' + what + '\x1b[0m'); } };

(async () => {
  const exe = findChrome();
  const b = await chromium.launch(Object.assign(
    { headless: !process.argv.includes('--headed') }, exe ? { executablePath: exe } : {}));
  const p = await b.newPage({ viewport:{ width:960, height:600 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(GAME);
  await p.waitForFunction('typeof GS==="object" && GS.scene');

  /* click at LOGICAL game coordinates, through the real canvas */
  const clickAt = async (lx, ly) => {
    const box = await p.evaluate(() => { const r = cvs.getBoundingClientRect();
      return { l:r.left, t:r.top, w:r.width, h:r.height }; });
    await p.mouse.click(box.l + box.w*(lx/320), box.t + box.h*(ly/200));
  };
  const state  = () => p.evaluate(() => ({ scene:GS.scene, room:GS.room,
                        msg:!!GS.msg, walking:GS.player.walking }));
  const until  = async (fn, ms=8000) => {                 // poll state, never sleep
    const t0 = Date.now();
    while(Date.now() - t0 < ms){ if(fn(await state())) return true; await p.waitForTimeout(80); }
    return false;
  };
  /* dismiss whatever dialogue is up, however many pages it runs */
  const clearText = async () => {
    for(let i=0;i<24;i++){ const s = await state();
      if(!s.msg && s.scene!=='cutaway') return true;
      await clickAt(160, 150); await p.waitForTimeout(90); }
    return false;
  };

  console.log('\nreaching Level 2 the way a player does');
  await p.evaluate(() => {          // seed a finished Level 1 via the passcode path
    GS.flags = { levelDone:true, chipEnding:'charm', monteWon:true };
    GS.heat = { chip:40 }; GS.stats = { money:34, fight:33, charm:33 };
    GS.name = 'PLAYER'; GS.cash = 25000;
  });
  await p.evaluate(() => { if(typeof enterLevel2==='function') enterLevel2(); });
  ok(await until(s => s.scene==='levelcard2' || s.scene==='play'), 'Level 2 starts');
  await clickAt(160,150);
  ok(await until(s => s.scene==='play'), 'the level card hands over to play');
  const room0 = (await state()).room;
  ok(room0 === 'bwalk2', 'the player lands on the night strip (' + room0 + ')');

  console.log('\nthe alley — the only route to the win line');
  const alley = await p.evaluate(() => {
    const h = ROOMS.bwalk2.hotspots.find(x => /alley/i.test(x.name||x.id));
    return h && { cx: h.x + h.w/2, cy: h.y + h.h/2, w:h.w, h:h.h };
  });
  ok(!!alley, 'the boardwalk has an alley hotspot');
  /* Clear the room's own arrival narration first. A click while text is up goes
     to the text, not the world — which is exactly how a player loses their first
     click on the alley and concludes it is broken. */
  await clearText();
  await p.mouse.move(0,0);
  await clickAt(alley.cx, alley.cy);
  ok(await until(s => s.walking || s.msg, 4000), 'clicking it does something');
  /* Do NOT click again while the walk resolves: an exit fires on arrival, and a
     stray click lands as a fresh walk order that cancels it. Wait on state. */
  const arrived = await until(s => s.room === 'wall', 12000);
  if(process.env.TRACE) console.log('    final:', JSON.stringify(await state()));
  ok(arrived, 'clicking the alley actually reaches the wall');

  if(arrived){
    console.log('\nthe wall');
    const back = await p.evaluate(() => {
      const h = ROOMS.wall.hotspots.find(x => x.exit);
      return h && { cx:h.x + h.w/2, cy:h.y + h.h/2 }; });
    ok(!!back, 'the wall has a way back out');
    if(back){
      await clearText();                       // the wall narrates on arrival too
      await clickAt(back.cx, back.cy);
      ok(await until(s => s.room !== 'wall', 12000), 'and it works — the player is not trapped');
    }
  }

  ok(errs.length === 0, 'no page errors during play' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log('\n' + (fail ? '\x1b[31m' + fail + ' failed\x1b[0m, ' : '\x1b[32mall green\x1b[0m — ') + pass + ' checks\n');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('\x1b[31m' + e.message + '\x1b[0m'); process.exit(1); });
