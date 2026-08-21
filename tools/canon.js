#!/usr/bin/env node
/* Canon — read the shipping artifact, write the bible, hold the line.
 *
 *   node tools/canon.js                          generate the bible
 *   node tools/canon.js --check                  invariants only, exit 1 on error
 *   node tools/canon.js --config path/to.canon.js
 *   node tools/canon.js --quiet
 *
 * The documentation is generated FROM the thing that ships, so it cannot drift.
 * The invariants are checked against the same read, so they cannot be forgotten.
 */
const path = require('path');
const canon = require('./canon/index.js');   // explicit: ./canon resolves to this file

const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const val  = (n, d) => { const i = argv.indexOf('--' + n); return i < 0 ? d : argv[i + 1]; };

const CONFIG = path.resolve(val('config', path.join(__dirname, 'vanity-shores.canon.js')));
const check  = flag('check');
const quiet  = flag('quiet');

const RED = s => '\x1b[31m' + s + '\x1b[0m';
const YEL = s => '\x1b[33m' + s + '\x1b[0m';
const DIM = s => '\x1b[2m'  + s + '\x1b[0m';
const GRN = s => '\x1b[32m' + s + '\x1b[0m';

(async () => {
  const cfg = require(CONFIG);
  let ctx;
  try {
    ctx = await canon.run(cfg, { checkOnly: check });
  } catch (e) {
    console.error(RED('canon: ') + e.message);
    process.exit(1);
  }

  const errs  = ctx.findings.filter(f => f.level === 'error');
  const warns = ctx.findings.filter(f => f.level === 'warn');
  const notes = ctx.findings.filter(f => f.level === 'note');

  if(!quiet){
    if(!check){
      console.log('wrote ' + path.relative(process.cwd(), cfg.out));
      console.log(DIM('  ' + Object.keys(ctx.owners).length + ' owners, '
        + ctx.flags.length + ' state flags, '
        + ctx.gates.length + ' branching scenes, '
        + ctx.unclaimed.length + ' unclaimed'));
      for(const who in ctx.load){
        const l = ctx.load[who];
        console.log(DIM('  ' + who.padEnd(8)
          + String(l.words).padStart(5) + ' words  '
          + String(l.branches).padStart(2) + ' branches  axes['
          + l.axes.join(',') + ']  ' + l.band));
      }
    }
    for(const f of errs)  console.log(RED('  error  ') + f.title + '\n         ' + DIM(f.detail));
    for(const f of warns) console.log(YEL('  warn   ') + f.title + '\n         ' + DIM(f.detail));
    for(const f of notes) console.log(DIM('  note   ' + f.title));
    if(!errs.length && !warns.length)
      console.log(GRN('  invariants hold') + DIM(notes.length ? '  (' + notes.length + ' note' + (notes.length===1?'':'s') + ')' : ''));
  }

  /* Only an error fails the build. A warning is something to look at; an error
     is a state the game cannot be in and still be correct. */
  process.exit(errs.length ? 1 : 0);
})();
