/* Vanity Shores — passcodes
 *
   Eight characters that get you back to a level with your history intact, the
   way a Metroid password did. A save and a code are not the same thing and
   neither replaces the other:

     the SAVE  is the exact state — your name, your look, your purse to the
               cent, every churro in your pockets. Continuous, and local to one
               browser.
     the CODE  is the SPINE — the handful of decisions later levels actually
               read. It survives a cleared browser, it fits on a napkin, and it
               is the only one of the two you can hand to somebody else.

   The spine is small because Canon says it is: every flag Levels 2+ read out of
   Level 1 is in the table below. What a code deliberately cannot carry is
   flavour — your name and your exact purse — so entering one asks your name
   again and gives you a stake sized to the level you are entering. That is the
   same bargain the NES made and it is the right one.
 *
   Load order: after engine.js (it reads GS), before shell.js (which draws it).
 */
"use strict";

/* No I, L, O, U — the four that get misread off a screen or a napkin, and U so
   the alphabet cannot accidentally spell anything. 32 symbols, 5 bits each. */
const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_MARKS    = ['flushed','lipstick','stain','dishevel'];
const CODE_ENDINGS  = ['', 'plain', 'charm', 'force', 'math', 'heat'];

/* Written and read in exactly this order. Widths are bits. 35 bits of payload
   plus a 5-bit check digit is 40 bits, which is 8 symbols. */
const CODE_FIELDS = [
  { key:'level',      bits:4 },
  { key:'chipEnding', bits:3 },
  { key:'l2Ending',   bits:3 },
  { key:'heatChip',   bits:3 },
  { key:'heatBrenda', bits:3 },
  { key:'brendaWary', bits:1 },
  { key:'monteWon',   bits:1 },
  { key:'monteEnemy', bits:1 },
  { key:'secrets',    bits:2 },
  { key:'marks',      bits:4 },
  { key:'money',      bits:5 },
  { key:'fight',      bits:5 }
];

/* Heat is 0-100 but only its TIER is ever read, so a code carries the tier.
   Decoding lands you at the bottom of the tier you earned — never above it. */
const heatToTier = h => HEAT_TIERS.filter(t => h >= t[0]).length;
const tierToHeat = n => n <= 0 ? 0 : (HEAT_TIERS[HEAT_TIERS.length - n] || [0])[0];

function codeState(){
  const f = GS.flags, s = S();
  return {
    level:      f.level2Done ? 3 : f.levelDone ? 2 : 1,
    chipEnding: Math.max(0, CODE_ENDINGS.indexOf(f.chipEnding || '')),
    l2Ending:   Math.max(0, CODE_ENDINGS.indexOf(f.l2Ending || '')),
    heatChip:   heatToTier(heatOf('chip')),
    heatBrenda: heatToTier(heatOf('brenda')),
    brendaWary: f.brendaWary ? 1 : 0,
    monteWon:   f.monteWon   ? 1 : 0,
    monteEnemy: f.monteEnemy ? 1 : 0,
    secrets:    Math.min(3, secretsFound()),
    marks:      CODE_MARKS.reduce((a, m, i) => a | (marked(m) ? 1 << i : 0), 0),
    money:      Math.min(31, Math.round(s.money / 3)),
    fight:      Math.min(31, Math.round(s.fight / 3))
  };
}

/* A one-line English gloss of what a code remembers, printed under it. A code
   that says what it is gets passed around; eight characters on their own do not. */
function codeGloss(){
  const st = codeState(), bits = [];
  bits.push('Level ' + Math.min(3, st.level));
  const route = CODE_ENDINGS[st.l2Ending] || CODE_ENDINGS[st.chipEnding];
  if(route) bits.push(route + ' route');
  const tier = HEAT_TIERS[HEAT_TIERS.length - st.heatChip];
  if(tier) bits.push('Chip ' + tier[1]);
  if(st.secrets) bits.push(st.secrets + ' secret' + (st.secrets>1?'s':''));
  if(st.marks)   bits.push('marked');
  return bits.join(' \u00b7 ');
}

function makeCode(){
  const st = codeState();
  let bits = 0n, width = 0n;
  for(const f of CODE_FIELDS){
    bits = (bits << BigInt(f.bits)) | BigInt(st[f.key] & ((1 << f.bits) - 1));
    width += BigInt(f.bits);
  }
  /* A check digit so a mistyped code is REFUSED rather than silently dropping
     you into a state nobody played. */
  let sum = 0n, tmp = bits;
  while(tmp > 0n){ sum = (sum + (tmp & 31n)) % 31n; tmp >>= 5n; }
  bits = (bits << 5n) | sum;
  /* Append, do not prepend: iterating from the most significant digit and
     prepending writes the code backwards, and parseCode reads big-endian. */
  let out = '';
  for(let i = 7; i >= 0; i--)
    out += CODE_ALPHABET[Number((bits >> BigInt(i * 5)) & 31n)];
  return out.slice(0, 4) + '-' + out.slice(4);
}

/* Returns the decoded spine, or null if it is not a real code. */
function parseCode(str){
  const clean = String(str || '').toUpperCase()
    .replace(/[IL]/g, '1').replace(/O/g, '0').replace(/U/g, 'V')   // forgive the four
    .replace(/[^0-9A-Z]/g, '');
  if(clean.length !== 8) return null;
  let bits = 0n;
  for(const ch of clean){
    const v = CODE_ALPHABET.indexOf(ch);
    if(v < 0) return null;
    bits = (bits << 5n) | BigInt(v);
  }
  const given = bits & 31n;
  let body = bits >> 5n, sum = 0n, tmp = body;
  while(tmp > 0n){ sum = (sum + (tmp & 31n)) % 31n; tmp >>= 5n; }
  if(sum !== given) return null;

  const out = {};
  for(let i = CODE_FIELDS.length - 1; i >= 0; i--){
    const f = CODE_FIELDS[i];
    out[f.key] = Number(body & BigInt((1 << f.bits) - 1));
    body >>= BigInt(f.bits);
  }
  if(out.level < 1 || out.level > 3) return null;
  if(out.chipEnding >= CODE_ENDINGS.length || out.l2Ending >= CODE_ENDINGS.length) return null;
  return out;
}

/* Apply a decoded spine to a fresh run. The player supplies the name and the
   look themselves; everything below is what the code actually remembered. */
function applyCode(c){
  const money = clamp(c.money * 3, 5, 90);
  const fight = clamp(c.fight * 3, 5, 95 - money);
  GS.stats = { money, fight, charm: 100 - money - fight };

  GS.flags = {};
  if(CODE_ENDINGS[c.chipEnding]) GS.flags.chipEnding = CODE_ENDINGS[c.chipEnding];
  if(CODE_ENDINGS[c.l2Ending])   GS.flags.l2Ending   = CODE_ENDINGS[c.l2Ending];
  if(c.brendaWary) GS.flags.brendaWary = true;
  if(c.monteWon)   GS.flags.monteWon   = true;
  if(c.monteEnemy) GS.flags.monteEnemy = true;
  if(c.level >= 2) GS.flags.levelDone  = true;
  if(c.level >= 3) GS.flags.level2Done = true;

  GS.heat = { chip: tierToHeat(c.heatChip), brenda: tierToHeat(c.heatBrenda) };
  GS.secrets = {};
  if(c.secrets) GS.secrets.brenda = true;        // one secret ships; widen with the table
  GS.look.marks = CODE_MARKS.filter((m, i) => c.marks & (1 << i)).sort().join(',');

  /* A stake sized to where you are coming in, because a code cannot carry a
     purse and arriving broke at the wall is not a puzzle, it is a wall. */
  GS.cash   = c.level >= 3 ? 25000 : c.level >= 2 ? ECONOMY.stakeLine : money * ECONOMY.startPerMoneyPoint;
  GS.inv    = c.level >= 2 ? ['quarter'] : [];
  GS.deaths = 0; GS.tally = {};
  return c.level;
}
