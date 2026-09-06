/* Repasa los MOCKS y los PRACTICE TESTS buscando lo que rompe una pregunta en
   pantalla: claves fuera de rango, dos opciones iguales, respuestas vacias,
   huecos del texto que no cuadran con las respuestas y grabaciones que faltan.
   El nivel CEFR se audita aparte (AUDIT-nivel-2026-09-06.md del repo de trabajo).

       node tools/audita_tests.js [carpeta]     (por defecto, la del script)

   Formas de pregunta que existen en los bancos (todas contempladas):
     {stem, answer}                      matching (answer = letra)
     {stem, options, answer}             opcion multiple de reading
     {options, answer}                   cloze de opciones
     {accept}                            cloze abierto
     {root, accept}                      word formation
     {before, keyword, after, accept}    key word transformation
     {type:'gap', label, accept}         hueco de listening
     {type:'mc', q, o, c[, audio]}       opcion multiple de listening
     {type:'pic', q, imgs, c[, audio]}   imagen
     {type:'match', person, c[, bank]}   emparejar hablante con idea
*/
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || path.dirname(__dirname);

const GRAVE = [], MEDIO = [];
const apunta = (l, banco, donde, msg) => l.push(`${banco.padEnd(14)} ${String(donde).padEnd(26)} ${msg}`);

function saca(src, n) {
  const re = new RegExp('(?:const|var|window\\.)\\s*' + n + '\\s*=\\s*', 'g');
  const m = re.exec(src);
  if (!m) return null;
  const i = src.indexOf('{', m.index);
  let prof = 0, dentro = false, esc = false, q = '';
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (dentro) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === q) dentro = false;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { dentro = true; q = c; continue; }
    if (c === '{') prof++;
    else if (c === '}') { prof--; if (prof === 0) { try { return new Function('return ' + src.slice(i, k + 1))(); } catch (e) { return null; } } }
  }
  return null;
}

const norm = s => String(s == null ? '' : s).trim().toLowerCase();

function revisaPregunta(banco, donde, q, qi) {
  const n = `q${qi + 1}`;
  const ops = q.options || q.o || q.imgs;
  const clave = q.answer !== undefined ? q.answer : (q.c !== undefined ? q.c : undefined);

  if (Array.isArray(ops) && ops.length) {
    if (ops.length < 2) apunta(GRAVE, banco, donde, `${n}: solo ${ops.length} opcion`);
    const v = ops.map(norm);
    if (new Set(v).size !== v.length) apunta(GRAVE, banco, donde, `${n}: dos opciones iguales [${ops.join(' | ')}]`);
    if (clave === undefined) apunta(GRAVE, banco, donde, `${n}: sin clave`);
    else if (typeof clave === 'number' && (clave < 0 || clave >= ops.length)) apunta(GRAVE, banco, donde, `${n}: clave ${clave} fuera de ${ops.length} opciones`);
    else if (typeof clave === 'string' && /^[A-Za-z]$/.test(clave) && !ops[clave.toUpperCase().charCodeAt(0) - 65]) apunta(GRAVE, banco, donde, `${n}: clave «${clave}» sin opcion`);
  } else if (Array.isArray(q.accept)) {
    const a = q.accept.map(norm).filter(x => x !== '');
    if (!a.length) apunta(GRAVE, banco, donde, `${n}: accept vacio`);
    if (a.length !== new Set(a).size) apunta(MEDIO, banco, donde, `${n}: variantes repetidas en accept`);
    if (q.keyword) {   // key word transformation: la palabra clave y 2-5 palabras
      if (!a.some(x => x.includes(norm(q.keyword)))) apunta(GRAVE, banco, donde, `${n}: la respuesta no usa la palabra clave «${q.keyword}»`);
      /* el limite es 2-5 palabras en B2 First y 3-6 en C1 Advanced */
      const c1 = /C1|CAE/i.test(banco + ' ' + donde);
      const min = c1 ? 3 : 2, max = c1 ? 6 : 5;
      if (!a.some(x => { const w = x.split(/\s+/).length; return w >= min && w <= max; }))
        apunta(MEDIO, banco, donde, `${n}: ninguna respuesta cabe en ${min}-${max} palabras`);
    }
    if (q.root && a.some(x => x === norm(q.root))) apunta(MEDIO, banco, donde, `${n}: la respuesta es la palabra dada sin transformar (${q.root})`);
  } else if (q.type === 'match' || q.person) {
    if (q.c === undefined || norm(q.c) === '') apunta(GRAVE, banco, donde, `${n}: emparejamiento sin respuesta`);
    else if (Array.isArray(q.bank) && q.bank.length && !q.bank.map(norm).includes(norm(q.c)))
      apunta(GRAVE, banco, donde, `${n}: la respuesta «${String(q.c).slice(0, 28)}» no esta en el banco`);
  } else if (clave === undefined || norm(clave) === '') {
    apunta(GRAVE, banco, donde, `${n}: sin respuesta`);
  }
}

/* ---------- reading & use of english ---------- */
function revisaTest(banco, etiqueta, test) {
  (test.parts || test.sections || []).forEach((p, pi) => {
    const donde = `${etiqueta} ${p.part || 'p' + (pi + 1)}`;
    const preguntas = p.questions || p.items || [];
    if (!preguntas.length) {
      if (!(p.prompts || p.pictures || p.tasks)) apunta(GRAVE, banco, donde, 'parte sin preguntas');
      return;
    }
    preguntas.forEach((q, qi) => revisaPregunta(banco, donde, q, qi));
    const cuerpo = p.body || p.passage || p.text || '';
    const huecos = [...String(cuerpo).matchAll(/\((\d+)\)\s*_{2,}/g)].length;
    if (huecos && huecos !== preguntas.length) apunta(GRAVE, banco, donde, `${huecos} huecos en el texto y ${preguntas.length} respuestas`);
    const claves = preguntas.map(q => q.answer).filter(x => typeof x === 'string' && /^[A-Za-z]$/.test(x));
    if (claves.length >= 4 && new Set(claves).size === 1) apunta(MEDIO, banco, donde, `todas las respuestas son «${claves[0]}»`);
  });
}

/* ---------- listening ---------- */
const mp3Pedidos = new Set(), mp3Faltan = new Set();
function revisaListening(banco, etiqueta, nodo) {
  (nodo.audios || []).forEach((a, ai) => {
    const donde = `${etiqueta} ${a.id || 'a' + (ai + 1)}`;
    const preguntas = a.questions || [];
    const ficheros = [].concat(a.file || []).concat(preguntas.map(q => q.audio).filter(Boolean));
    ficheros.forEach(f => {
      mp3Pedidos.add(f);
      if (!fs.existsSync(path.join(BASE, 'mp3', String(f).replace(/^\.?\//, '')))) mp3Faltan.add(f);
    });
    if (!ficheros.length) apunta(GRAVE, banco, donde, 'ejercicio de audio sin ninguna grabacion');
    preguntas.forEach((q, qi) => {
      revisaPregunta(banco, donde, q, qi);
      const guion = (a.scripts || []).join(' ').toLowerCase();
      if (!guion) return;
      const ops = q.options || q.o;
      /* solo en los huecos la respuesta se oye literal; en la opcion multiple la
         buena es una parafrasis de lo que dice el audio, asi que no se comprueba */
      if (q.type === 'gap' && Array.isArray(q.accept)) {
        const alguna = q.accept.some(x => guion.includes(norm(x).replace(/^(a|an|the) /, '')));
        if (!alguna) apunta(MEDIO, banco, donde, `q${qi + 1}: el guion no dice ninguna forma de «${String(q.accept[0]).slice(0, 30)}»`);
      }
    });
  });
}

function recorre(banco, obj, ruta, visita) {
  if (!obj || typeof obj !== 'object') return;
  if (obj.parts || obj.sections || obj.audios) { visita(banco, ruta || 'test', obj); return; }
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) v.forEach((t, i) => recorre(banco, t, `${ruta}${ruta ? '/' : ''}${k}[${i + 1}]`, visita));
    else recorre(banco, v, ruta ? `${ruta}/${k}` : k, visita);
  }
}

const rd = fs.readFileSync(path.join(BASE, 'reading-quiz.html'), 'utf8');
for (const b of ['EXAMS', 'PRACTICE2', 'PRACTICE3', 'MOCK01', 'MOCK02', 'MOCK03', 'MOCKS_MORE', 'PRACTICE_MORE']) {
  const o = saca(rd, b); if (o) recorre(b, o, '', revisaTest);
}
const ls = fs.readFileSync(path.join(BASE, 'listening-quiz.html'), 'utf8');
for (const b of ['QUIZ', 'QUIZ2', 'QUIZ3', 'QUIZ4', 'QUIZ5', 'QUIZ6', 'LISTEN_MORE']) {
  const o = saca(ls, b); if (o) recorre(b, o, '', revisaListening);
}

console.log('='.repeat(78));
console.log('MOCKS Y PRACTICE TESTS — ' + BASE);
console.log(`\n--- preguntas rotas: ${GRAVE.length}`);
GRAVE.slice(0, 40).forEach(x => console.log('   ✗ ' + x));
if (GRAVE.length > 40) console.log(`   … y ${GRAVE.length - 40} mas`);
console.log(`\n--- a revisar: ${MEDIO.length}`);
MEDIO.slice(0, 25).forEach(x => console.log('   • ' + x));
if (MEDIO.length > 25) console.log(`   … y ${MEDIO.length - 25} mas`);
console.log(`\n--- audio: ${mp3Pedidos.size} grabaciones pedidas, ${mp3Faltan.size} sin archivo`);
[...mp3Faltan].slice(0, 15).forEach(x => console.log('   ✗ mp3/' + x));
