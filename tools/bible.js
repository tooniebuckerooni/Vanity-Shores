/* The bible generator moved to Canon, which is the same idea made general: the
 * documentation is read out of the artifact that ships, and the invariants are
 * checked against that same read.
 *
 *   node tools/canon.js              generate
 *   node tools/canon.js --check      invariants only, exit 1 on error
 *   node tools/canon-test.js         Canon's own suite
 *
 * This shim stays so anything pointing at the old path keeps working. */
console.error('tools/bible.js is now tools/canon.js — running it for you.\n');
require('./canon.js');
