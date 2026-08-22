/* Canon — source scanning.
 *
 * Nothing here knows what a game is. It knows how to pull a named block out of
 * JavaScript source without being fooled by braces inside string literals, and
 * how to read the @owner tags that say which character a scene belongs to.
 */

/* Brace-match from an opening delimiter, skipping anything inside a string OR a
   comment. Naive matching breaks on the first "}" in a line of dialogue — and
   skipping only strings still breaks on an apostrophe inside a comment, which
   opens a string that never closes and swallows the rest of the file. That one
   is not hypothetical: it silently ate a prop painter in the real game and
   reported it as 567 words of unclaimed dialogue. */
function blockFrom(src, openIdx, open, close){
  let depth = 0, q = null, esc = false, line = false, block = false;
  for(let i = openIdx; i < src.length; i++){
    const c = src[i], n = src[i + 1];
    if(line){ if(c === '\n') line = false; continue; }
    if(block){ if(c === '*' && n === '/'){ block = false; i++; } continue; }
    if(esc){ esc = false; continue; }
    if(q){ if(c === '\\') esc = true; else if(c === q) q = null; continue; }
    if(c === '/' && n === '/'){ line  = true; i++; continue; }
    if(c === '/' && n === '*'){ block = true; i++; continue; }
    if(c === '"' || c === "'" || c === '`'){ q = c; continue; }
    if(c === open) depth++;
    else if(c === close){ depth--; if(depth === 0) return src.slice(openIdx, i + 1); }
  }
  return '';
}
const fnBody = (src, name) => {
  const m = src.match(new RegExp('function\\s+' + name + '\\s*\\('));
  return m ? blockFrom(src, src.indexOf('{', m.index), '{', '}') : '';
};
const constBody = (src, name) => {
  const m = src.match(new RegExp('const\\s+' + name + '\\s*='));
  if(!m) return '';
  const i = src.indexOf('[', m.index), j = src.indexOf('{', m.index);
  if(i < 0 && j < 0) return src.slice(m.index, src.indexOf('\n', m.index));
  return (i >= 0 && (j < 0 || i < j)) ? blockFrom(src, i, '[', ']') : blockFrom(src, j, '{', '}');
};

/* Every string literal in a block, so prose can be counted without counting
   identifiers, colours or CSS. */
function stringsIn(body){
  const out = [];
  let q = null, esc = false, buf = '';
  for(let i = 0; i < body.length; i++){
    const c = body[i];
    if(esc){ buf += c; esc = false; continue; }
    if(q){
      if(c === '\\'){ esc = true; continue; }
      if(c === q){ out.push(buf); buf = ''; q = null; continue; }
      buf += c; continue;
    }
    if(c === '"' || c === "'" || c === '`'){ q = c; buf = ''; }
  }
  return out;
}
/* Prose, not code. A string is dialogue if it reads like a sentence. */
function proseWords(strings){
  let w = 0;
  for(const s of strings){
    if(s.length < 12) continue;
    if(/^[#.\w-]+$/.test(s)) continue;
    if(/[;{}]|=>|\bfunction\b/.test(s)) continue;
    if(!/[a-z]{3}\s+[a-z]{2}/i.test(s)) continue;
    w += s.trim().split(/\s+/).length;
  }
  return w;
}

/* ---- ownership -----------------------------------------------------------
   The map of scene -> character used to live in this tool as a hand-kept
   table, which is exactly the drift the tool exists to prevent: add a scene,
   forget the table, and the numbers quietly go wrong. Ownership is declared at
   the declaration instead, and anything claiming to be a scene without a tag
   is REPORTED rather than skipped. A loud gap beats a silent miscount. */
const TAG = /\/\*\s*@owner\s+(\w+)((?:\s+@\w+)*)\s*\*\//;

function ownership(src, opts){
  const isScene = opts.sceneMarker;          // what makes a function a scene
  const owners = {};
  const unclaimed = [];
  const scenes = {};                         // name -> { owner, critical, body }
  const claim = (who) => (owners[who] = owners[who] || { fns: [], consts: [] });

  const lines = src.split('\n');
  for(let i = 0; i < lines.length; i++){
    const ln = lines[i];
    const fn = ln.match(/^function\s+(\w+)\s*\(/);
    const cn = ln.match(/^const\s+([A-Z][A-Z0-9_]*)\s*=/);
    if(!fn && !cn) continue;
    const name = (fn || cn)[1];
    const body = fn ? fnBody(src, name) : constBody(src, name);
    const tag = ln.match(TAG);
    if(tag){
      const who = tag[1], flags = tag[2] || '';
      claim(who)[fn ? 'fns' : 'consts'].push(name);
      if(fn) scenes[name] = { owner: who, critical: /@critical\b/.test(flags), body };
    } else if(fn && isScene && isScene.test(body)){
      unclaimed.push({ name, line: i + 1, words: proseWords(stringsIn(body)) });
    }
  }
  return { owners, unclaimed, scenes };
}

module.exports = { blockFrom, fnBody, constBody, stringsIn, proseWords, ownership };
