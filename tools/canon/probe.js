/* Canon — the probe.
 *
 * The point of the whole tool: read the thing that SHIPS, not a document kept
 * alongside it. So the artifact is loaded in a real browser and its own live
 * objects are read out of the running page. A document written in parallel can
 * drift; this cannot, because there is nothing to drift from.
 *
 * If the artifact throws on load, that is a failure of the artifact and the
 * probe refuses to report on it. A bible generated from a broken game would be
 * fiction.
 */
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) {
  console.error('Canon drives the real artifact in a browser, so it needs Playwright:');
  console.error('  npm install --no-save playwright');
  console.error('(the artifact itself has no dependencies — this is tooling-only)');
  process.exit(1);
}

/* A pinned playwright and a pre-installed browser drift apart constantly, and
   the failure ("Executable doesn't exist at chromium-1234") reads like a bug in
   the tool. Take whatever Chromium is actually on the machine. */
const fs = require('fs'), path = require('path');
function findChrome(explicit){
  if(explicit && fs.existsSync(explicit)) return explicit;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if(!fs.existsSync(root)) return null;
  const dirs = fs.readdirSync(root).filter(d => /^chromium-\d+$/.test(d))
                 .sort((a,b) => parseInt(b.slice(9)) - parseInt(a.slice(9)));
  for(const d of dirs){
    const exe = path.join(root, d, 'chrome-linux', 'chrome');
    if(fs.existsSync(exe)) return exe;
  }
  /* A CI runner usually has a browser already; no reason to download another. */
  for(const exe of ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
                    '/usr/bin/chromium-browser', '/usr/bin/chromium'])
    if(fs.existsSync(exe)) return exe;
  return null;               // let Playwright fall back to its own download
}

async function probe(artifactPath, extract, opts = {}){
  const exe = findChrome(opts.chrome);
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + artifactPath);
  /* Settle on a condition the artifact itself reports, never on a clock — every
     false result this project has had came from a fixed delay. */
  if(opts.ready){
    await page.waitForFunction(opts.ready, null, { timeout: opts.timeout || 15000 });
  } else {
    await page.waitForFunction('document.readyState === "complete"',
                               null, { timeout: opts.timeout || 15000 });
  }
  let data = null, thrown = null;
  try { data = await page.evaluate(extract); }
  catch (e) { thrown = e.message; }
  await browser.close();

  if(errors.length) throw new Error('Artifact threw while loading:\n  ' + errors.join('\n  '));
  if(thrown)        throw new Error('Extractor failed inside the page:\n  ' + thrown);
  return data;
}

module.exports = { probe };
