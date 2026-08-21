#!/usr/bin/env node
/* Canon's own suite. There is no test framework in this project; this drives the
 * real generator against two real artifacts and asserts what it found.
 *
 * The fixture is broken ON PURPOSE. Asserting that Canon still reports a clean
 * bill of health for the real game proves nothing on its own — a checker that
 * has quietly stopped checking also reports clean. So the suite requires both:
 * the flawed game must fail with exactly the planted defects, and the shipping
 * game must pass.
 *
 *   node tools/canon-test.js
 */
const path  = require('path');
const canon = require('./canon/index.js');

let pass = 0, fail = 0;
const ok = (cond, what) => {
  if(cond){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + what); }
  else    { fail++; console.log('  \x1b[31m✗ ' + what + '\x1b[0m'); }
};
const has = (list, level, re) => list.some(f => f.level === level && re.test(f.title));

(async () => {
  console.log('\nfixture — a game Canon has never seen, with three planted defects');
  const toy = await canon.run(require('./fixtures/toy.canon.js'), { checkOnly: true });

  ok(Object.keys(toy.owners).length === 2, 'reads ownership from a game with different globals');
  ok(toy.flags.length === 2,               'finds state under a different accessor than GS.flags');
  ok(Object.keys(toy.space.per).join() === 'nerve,cash',
     'sweeps a two-stat model under its own stat names, not a three-stat one');
  ok(toy.space.total === 41,               'enumerates every legal 60-point split of two stats');
  ok(has(toy.findings, 'error', /read but never written/),
     'catches the planted orphan read');
  ok(has(toy.findings, 'error', /no ungated route/),
     'catches the planted sealed required beat');
  ok(has(toy.findings, 'warn',  /belongs to nobody/),
     'catches the planted untagged scene');
  ok(has(toy.findings, 'note',  /written but never read/),
     'reports an uncollected flag as a promise, not a bug');
  ok(toy.findings.filter(f => f.level === 'error').length === 2,
     'reports exactly the two planted errors and no phantom third');

  console.log('\nshipping game — the same generator, the real artifact');
  const vs = await canon.run(require('./vanity-shores.canon.js'), { checkOnly: true });

  ok(vs.unclaimed.length === 0,   'every scene in the game is claimed by somebody');
  ok(vs.findings.filter(f => f.level === 'error').length === 0, 'no invariant is failing');
  ok(vs.gates.some(g => g.critical), 'required beats are marked and audited');
  ok(vs.gates.filter(g => g.critical).every(g => g.open > 0),
     'every required beat keeps a route a spread build can take');
  ok(Object.values(vs.space.builds).every(b => b.passes),
     'every named build can finish the level');
  ok(Object.values(vs.space.builds).every(b => b.mustPlay),
     'no build reaches the stake line without sitting down at Monte');
  ok(Object.values(vs.load).every(l => l.score <= 80),
     'no character has crossed the hand-authoring ceiling');

  console.log('\n' + (fail ? '\x1b[31m' + fail + ' failed\x1b[0m, ' : '\x1b[32mall green\x1b[0m — ')
              + pass + ' checks\n');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('\x1b[31m' + e.message + '\x1b[0m'); process.exit(1); });
