// Node parse-check for QUIZ6 (MOCK 3). Reads listening-quiz.html, extracts QUIZ6
// via balanced-brace eval (in a tiny sandbox), then validates structure.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'listening-quiz.html'), 'utf8');

// --- extract LPICS keys (just the keys, by regex on the object declaration)
function extractLpicsKeys(){
  const m = html.match(/const\s+LPICS\s*=\s*{([\s\S]*?)\n};/);
  if(!m) throw new Error('LPICS not found');
  const body = m[1];
  // Match "key:" at any indent; key can have letters/digits/_
  const re = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/gm;
  const keys = new Set();
  let mm; while((mm = re.exec(body)) !== null) keys.add(mm[1]);
  return keys;
}

// --- extract LPHOTO set
function extractLphoto(){
  const m = html.match(/const\s+LPHOTO\s*=\s*new\s+Set\(\[(.*?)\]\)/);
  if(!m) throw new Error('LPHOTO not found');
  const items = m[1].match(/"([^"]+)"/g).map(s => s.slice(1,-1));
  return new Set(items);
}

// --- extract QUIZ6 by balanced braces and eval in a sandbox
function extractQuiz6(){
  const marker = 'const QUIZ6 = ';
  const start = html.indexOf(marker);
  if(start < 0) throw new Error('QUIZ6 not found');
  const objStart = html.indexOf('{', start);
  let i = objStart, depth = 0, inStr = false, strCh = '';
  while(i < html.length){
    const c = html[i];
    if(inStr){
      if(c === '\\'){ i += 2; continue; }
      if(c === strCh) inStr = false;
    } else {
      if(c === '"' || c === "'"){ inStr = true; strCh = c; }
      else if(c === '{') depth++;
      else if(c === '}'){
        depth--;
        if(depth === 0){
          const src = html.substring(objStart, i+1);
          const ctx = { result: null };
          vm.createContext(ctx);
          vm.runInContext('result = ' + src, ctx);
          return ctx.result;
        }
      }
    }
    i++;
  }
  throw new Error('QUIZ6 unbalanced');
}

const lpicsKeys = extractLpicsKeys();
const lphoto = extractLphoto();
const allPic = new Set([...lpicsKeys, ...lphoto]);
const quiz6 = extractQuiz6();

console.log('LPICS keys:', lpicsKeys.size);
console.log('LPHOTO keys:', lphoto.size);
console.log('Union (pic sources):', allPic.size);
console.log('');

let totalChars = 0;
let totalQuestions = 0;
let totalAudios = 0;
let errors = [];

for(const lev of ['A2','B1','B2','C1']){
  const block = quiz6[lev];
  if(!block){ errors.push(`MISSING level ${lev}`); continue; }
  console.log(`==== ${lev} (${block.label}) ====`);
  let levChars = 0;
  let levQs = 0;
  for(const aud of block.audios){
    totalAudios++;
    const scriptsAll = (aud.scripts || []).join(' ');
    levChars += scriptsAll.length;
    const qs = aud.questions || [];
    levQs += qs.length;
    let perQAudio = 0;
    for(let qi=0; qi<qs.length; qi++){
      const q = qs[qi];
      if(q.type === 'pic'){
        if(!Array.isArray(q.imgs) || q.imgs.length !== 3) errors.push(`${lev}/${aud.id} Q${qi+1} pic must have 3 imgs`);
        for(const k of (q.imgs||[])){
          if(!allPic.has(k)) errors.push(`${lev}/${aud.id} Q${qi+1} pic key MISSING in LPICS/LPHOTO: ${k}`);
        }
        if(!(Number.isInteger(q.c) && q.c >= 0 && q.c < 3)) errors.push(`${lev}/${aud.id} Q${qi+1} answer idx out of range: ${q.c}`);
      } else if(q.type === 'mc'){
        if(!Array.isArray(q.o) || q.o.length < 2) errors.push(`${lev}/${aud.id} Q${qi+1} mc must have options`);
        if(!(Number.isInteger(q.c) && q.c >= 0 && q.c < q.o.length)) errors.push(`${lev}/${aud.id} Q${qi+1} mc answer idx out of range: ${q.c}/${q.o?.length}`);
      } else if(q.type === 'gap'){
        if(!Array.isArray(q.accept) || q.accept.length === 0) errors.push(`${lev}/${aud.id} Q${qi+1} gap missing accept`);
      } else if(q.type === 'match'){
        const bank = aud.bank || q.bank;
        if(!bank) errors.push(`${lev}/${aud.id} Q${qi+1} match has no bank`);
        else if(!bank.includes(q.c)) errors.push(`${lev}/${aud.id} Q${qi+1} match answer "${q.c}" not in bank`);
      } else {
        errors.push(`${lev}/${aud.id} Q${qi+1} unknown type ${q.type}`);
      }
      if(q.audio) perQAudio++;
    }
    const fileMode = !!aud.file;
    console.log(`  ${aud.id}: paged=${!!aud.paged} file=${aud.file||'-'} scripts=${(aud.scripts||[]).length} q=${qs.length} per-q-audio=${perQAudio}`);
  }
  console.log(`  TOTAL ${lev}: ${levQs} questions, ${levChars} script chars`);
  totalChars += levChars;
  totalQuestions += levQs;
}

console.log('');
console.log('====================================');
console.log(`Total audio nodes: ${totalAudios}`);
console.log(`Total questions:   ${totalQuestions}`);
console.log(`TOTAL SCRIPT CHARS (A2+B1+B2+C1): ${totalChars}`);
console.log(`Budget cap: 15500 -> ${totalChars <= 15500 ? 'OK' : 'OVER'}`);

if(errors.length){
  console.log('');
  console.log('ERRORS:'); errors.forEach(e => console.log(' -', e));
  process.exit(1);
} else {
  console.log('No structural errors.');
}

// --- list audio output paths that gen_mock3_audio.py will produce
console.log('');
console.log('==== Audio files that gen_mock3_audio.py will produce ====');
for(const lev of ['A2','B1','B2','C1']){
  for(const aud of quiz6[lev].audios){
    if(aud.paged && (aud.questions||[]).some(q=>q.audio)){
      for(const q of aud.questions){
        if(q.audio) console.log(' mp3/' + q.audio);
      }
    } else {
      console.log(' mp3/' + aud.file);
    }
  }
}
