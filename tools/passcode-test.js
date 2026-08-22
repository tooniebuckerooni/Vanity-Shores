global.HEAT_TIERS=[[80,'a'],[60,'b'],[35,'c'],[15,'d'],[1,'e']];
global.ECONOMY={stakeLine:10000,startPerMoneyPoint:10};
global.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
global.GS={flags:{},heat:{},secrets:{},look:{marks:''},stats:{money:34,fight:33,charm:33},inv:[],tally:{}};
global.S=()=>GS.stats; global.heatOf=w=>GS.heat[w]||0;
global.secretsFound=()=>Object.keys(GS.secrets).length;
global.marked=id=>(GS.look.marks||'').indexOf(id)>=0;
eval(require('fs').readFileSync('js/passcode.js','utf8').replace(/^"use strict";/m,'').replace(/^const (CODE_[A-Z_]+)/gm,'global.$1'));
let pass=0,fail=0;
const t=(n,f)=>{try{f();pass++;console.log('  ok  '+n);}catch(e){fail++;console.log('  FAIL '+n+' — '+e.message);}};

t('round-trips a finished Level 1',()=>{
  GS.flags={levelDone:true,chipEnding:'charm',brendaWary:true,monteWon:true};
  GS.heat={chip:62,brenda:20}; GS.secrets={brenda:true}; GS.look.marks='flushed,lipstick';
  GS.stats={money:45,fight:10,charm:45};
  const code=makeCode(), c=parseCode(code);
  if(!c) throw new Error('did not parse: '+code);
  if(c.level!==2) throw new Error('level '+c.level);
  if(CODE_ENDINGS[c.chipEnding]!=='charm') throw new Error('ending');
  if(!c.brendaWary||!c.monteWon) throw new Error('flags lost');
  console.log('        L1 charm route → '+code);
});
t('round-trips a finished Level 2',()=>{
  GS.flags={levelDone:true,level2Done:true,chipEnding:'force',l2Ending:'heat',monteEnemy:true};
  GS.heat={chip:85,brenda:0}; GS.secrets={}; GS.look.marks='';
  GS.stats={money:20,fight:60,charm:20};
  const code=makeCode(), c=parseCode(code);
  if(!c||c.level!==3) throw new Error('level');
  if(CODE_ENDINGS[c.l2Ending]!=='heat') throw new Error('l2 ending');
  console.log('        L2 force/heat route → '+code);
});
t('every mutated character is refused',()=>{
  const base=makeCode().replace('-','');
  let caught=0,tried=0;
  for(let i=0;i<8;i++) for(const ch of CODE_ALPHABET){
    if(ch===base[i]) continue;
    tried++; if(!parseCode(base.slice(0,i)+ch+base.slice(i+1))) caught++;
  }
  const rate=caught/tried;
  if(rate<0.9) throw new Error('only '+(rate*100).toFixed(0)+'% of typos caught');
  console.log('        '+(rate*100).toFixed(1)+'% of single-character typos refused ('+tried+' tried)');
});
t('forgives I L O U',()=>{
  const c=makeCode();
  if(!parseCode(c.toLowerCase())) throw new Error('lowercase');
  if(!parseCode(c.replace(/-/g,' '))) throw new Error('spaces');
});
t('applies cleanly',()=>{
  const lv=applyCode(parseCode(makeCode()));
  if(lv!==3) throw new Error('level '+lv);
  const s=GS.stats;
  if(s.money+s.fight+s.charm!==100) throw new Error('stats sum '+(s.money+s.fight+s.charm));
  if(GS.cash<=0) throw new Error('arrived broke');
});
console.log(fail?'\n  '+fail+' FAILED':'\n  codec: all '+pass+' green');
process.exit(fail?1:0);
