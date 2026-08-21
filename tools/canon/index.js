/* Canon — the orchestrator.
 *
 *   const canon = require('./canon');
 *   canon.run(require('../my-game.canon.js'))
 *
 * A config describes one artifact: where it is, what to pull out of it while it
 * runs, how its player configuration space is shaped, and how to render the
 * result. Everything below is game-agnostic — including, deliberately, the
 * invariants, because "state nothing writes" and "a required beat every build
 * cannot pass" are bugs in any game that has states and beats.
 */
const fs   = require('fs');
const path = require('path');
const { probe }   = require('./probe');
const scan        = require('./scan');
const metrics     = require('./metrics');
const layout      = require('./layout');

const bodyOf = (src, name, kind) =>
  kind === 'fn' ? scan.fnBody(src, name) : scan.constBody(src, name);

/* The invariants Canon enforces for everybody. A game adds its own through
   config.invariants — they get the same treatment and the same exit code. */
function audit(ctx, cfg){
  const out = [];
  const push = (level, title, detail) => out.push({ level, title, detail });

  for(const u of ctx.unclaimed)
    push(cfg.strictOwnership ? 'error' : 'warn',
         `Scene "${u.name}" belongs to nobody.`,
         `Declared at line ${u.line} and carrying ${u.words} words of dialogue, but no @owner tag, `
         + `so every measurement below undercounts. Tag it at the declaration.`);

  for(const f of ctx.flags){
    if(f.state === 'orphan-read')
      push('error', `Flag "${f.name}" is read but never written.`,
           `${f.reads} branch${f.reads === 1 ? '' : 'es'} depend${f.reads === 1 ? 's' : ''} on state nothing sets, so that path is dead.`);
    if(f.state === 'awaiting-payoff')
      push('note', `Flag "${f.name}" is written but never read.`,
           `Recorded ${f.writes} time${f.writes === 1 ? '' : 's'} and collected by nobody yet — a promise a later level still owes.`);
  }

  for(const g of ctx.gates){
    if(g.critical && g.sealed)
      push('error', `"${g.name}" is a required beat with no ungated route.`,
           `All ${g.choices} choices sit behind a stat check, so a spread build cannot get past it.`);
    if(!g.critical && g.sealed)
      push('note', `"${g.name}" is fully gated.`,
           `Optional, so this is a reward rather than a wall — but every route is behind a check.`);
  }

  for(const who in ctx.load){
    const l = ctx.load[who];
    if(l.score > (cfg.loadCeiling || 80) && !(cfg.loadWaivers || []).includes(who))
      push('warn', `${who} is past the hand-authoring ceiling.`,
           `Load ${l.score} across ${l.axes.length} axes. Either split the character or give them a goal-driven backend.`);
  }

  for(const inv of cfg.invariants || []){
    const r = inv(ctx);
    if(r) (Array.isArray(r) ? r : [r]).forEach(x => push(x.level || 'error', x.title, x.detail));
  }
  return out;
}

async function run(cfg, opts = {}){
  const src = fs.readFileSync(cfg.artifact, 'utf8');

  const data = await probe(cfg.artifact, cfg.extract,
                           { chrome: cfg.chrome || process.env.CHROME_PATH,
                             ready: cfg.ready, timeout: cfg.timeout });

  const { owners, unclaimed, scenes } = scan.ownership(src, { sceneMarker: cfg.sceneMarker });
  const load  = metrics.authoringLoad({ src, owners, axes: cfg.axes, bodyOf,
                                        ceiling: cfg.loadCeiling ? cfg.loadCeiling + 30 : 110 });
  const flags = metrics.stateLedger(src, cfg.statePattern);
  const gates = metrics.gateAudit(scenes);
  const space = cfg.space ? metrics.sweep(Object.assign({}, cfg.space, { simulate: cfg.space.simulate(data) }))
                          : null;

  const ctx = { data, src, owners, unclaimed, scenes, load, flags, gates, space };
  ctx.findings = audit(ctx, cfg);

  if(!opts.checkOnly){
    const html = cfg.render(ctx, layout);
    fs.mkdirSync(path.dirname(cfg.out), { recursive: true });
    fs.writeFileSync(cfg.out, html);
  }
  return ctx;
}

module.exports = { run, scan, metrics, layout, audit };
