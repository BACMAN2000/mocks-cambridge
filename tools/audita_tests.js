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

/* ---------- donde cae la respuesta correcta ----------
   La opcion multiple guarda la clave como NUMERO (answer:1, o c:1 en el
   listening) y el emparejamiento como LETRA (answer:"B"). Esta comprobacion
   solo miraba las letras, asi que el emparejamiento salia repartido de libro y
   la opcion multiple acumulaba el 57% de las claves en la B sin que nadie lo
   viera (auditoria del 6-sep-2026). Cuenta las dos formas. */
const LETRAS = 'ABCDEFGH';
function letraClave(q) {
  const ops = q.options || q.o || q.imgs;
  const clave = q.answer !== undefined ? q.answer : q.c;
  if (typeof clave === 'number' && Array.isArray(ops) && clave >= 0 && clave < ops.length) return LETRAS[clave];
  if (typeof clave === 'string' && /^[A-H]$/i.test(clave.trim())) return clave.trim().toUpperCase();
  return null;   // hueco abierto, key word transformation, emparejar por texto…
}
const repartoGlobal = {};
function revisaReparto(banco, donde, preguntas) {
  const claves = preguntas.map(letraClave).filter(Boolean);
  if (claves.length < 4) return;
  const cuenta = {};
  claves.forEach(l => { cuenta[l] = (cuenta[l] || 0) + 1; repartoGlobal[l] = (repartoGlobal[l] || 0) + 1; });
  const [letra, n] = Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0];
  const pct = n / claves.length;
  if (n === claves.length) apunta(GRAVE, banco, donde, `las ${n} respuestas son «${letra}»`);
  else if (pct >= 0.6 && claves.length >= 5) apunta(MEDIO, banco, donde, `${n} de ${claves.length} respuestas son «${letra}» (${Math.round(pct * 100)}%)`);
}

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
    revisaReparto(banco, donde, preguntas);
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
    revisaReparto(banco, donde, preguntas);
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

/* ---------- estructura contra el formato oficial ----------
   Reading/UoE: A2 Key 7 partes (6,7,5,6,6 + 2 de writing) · B1 Preliminary 6
   (5,5,5,5,6,6) · B2 First 7 (8,8,8,6,6,6,10) · C1 Advanced 8 (8,8,8,6,6,4,6,10).
   Listening: A2 5 partes de 5 · B1 (7,6,6,6) · B2 (8,10,5,7) · C1 (6,8,6,10). */
const OFICIAL = {
  A2: { lectura: [6, 7, 5, 6, 6], escucha: [5, 5, 5, 5, 5] },
  B1: { lectura: [5, 5, 5, 5, 6, 6], escucha: [7, 6, 6, 6] },
  B2: { lectura: [8, 8, 8, 6, 6, 6, 10], escucha: [8, 10, 5, 7] },
  C1: { lectura: [8, 8, 8, 6, 6, 4, 6, 10], escucha: [6, 8, 6, 10] },
};
/* el nivel se sabe por la clave del objeto (A2/B1/B2/C1), no por la ruta */
function repasaEstructura(banco, obj, nivel, paper) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) return obj.forEach((x, i) => repasaEstructura(banco, x, nivel, paper + '[' + (i + 1) + ']'));
  if (obj.parts || obj.audios) {
    if (!nivel || !OFICIAL[nivel]) return;
    const escucha = /listening/i.test(paper) || !!obj.audios;
    const esperadas = escucha ? OFICIAL[nivel].escucha : OFICIAL[nivel].lectura;
    const bloques = (obj.audios || obj.parts || []).filter(p => (p.questions || []).length);
    const donde = `${nivel} ${paper}`.trim();
    if (bloques.length !== esperadas.length)
      apunta(MEDIO, banco, donde, `${bloques.length} partes con preguntas y el examen tiene ${esperadas.length}`);
    bloques.forEach((p, i) => {
      const n = (p.questions || []).length;
      if (esperadas[i] !== undefined && n !== esperadas[i])
        apunta(MEDIO, banco, donde + ' ' + (p.part || p.id || 'p' + (i + 1)), `${n} preguntas y el examen pide ${esperadas[i]}`);
    });
    return;
  }
  for (const [k, v] of Object.entries(obj))
    repasaEstructura(banco, v, /^(A2|B1|B2|C1)$/.test(k) ? k : nivel, /^(A2|B1|B2|C1)$/.test(k) ? paper : (paper ? paper + '/' + k : k));
}
for (const b of ['EXAMS', 'PRACTICE2', 'PRACTICE3', 'MOCK01', 'MOCK02', 'MOCK03', 'MOCKS_MORE', 'PRACTICE_MORE']) {
  const o = saca(rd, b); if (o) repasaEstructura(b, o, null, '');
}
for (const b of ['QUIZ', 'QUIZ2', 'QUIZ3', 'QUIZ4', 'QUIZ5', 'QUIZ6', 'LISTEN_MORE']) {
  const o = saca(ls, b); if (o) repasaEstructura(b, o, null, 'Listening');
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

/* Reparto de la clave en el conjunto. Con las claves bien repartidas ronda el
   33% por letra en las de tres opciones y el 25% en las de cuatro; un pico muy
   por encima significa que el alumno puede acertar por la posicion. */
const totalClaves = Object.values(repartoGlobal).reduce((a, b) => a + b, 0);
if (totalClaves) {
  const linea = Object.keys(repartoGlobal).sort()
    .map(l => `${l} ${repartoGlobal[l]} (${Math.round(100 * repartoGlobal[l] / totalClaves)}%)`).join('   ');
  const pico = Math.max(...Object.values(repartoGlobal)) / totalClaves;
  console.log(`\n--- donde cae la respuesta correcta (${totalClaves} preguntas)\n   ${linea}`);
  if (pico >= 0.38) console.log(`   ✗ una sola letra se lleva el ${Math.round(pico * 100)}%: reparte con  node tools/rebalance_keys.js --escribe reading-quiz.html listening-quiz.html`);
}
