/* Reparte la posicion de la respuesta correcta en las preguntas de opcion
   multiple de los MOCKS y PRACTICE TESTS.

   El problema que arregla: la clave caia en la B el 57% de las veces en el
   Listening (deberia ser ~33%), con partes enteras donde las 8 preguntas eran
   todas B. Ningun motor baraja las opciones al pintar, asi que la letra del
   archivo es la letra de la pantalla.

       node tools/rebalance_keys.js [--escribe] fichero.html [fichero.html ...]

   Sin --escribe solo informa. La permutacion es determinista (semilla fija),
   asi que dos ejecuciones sobre el mismo archivo dan el mismo resultado.

   Como trabaja: reordena el TEXTO de los elementos del array de opciones, sin
   volver a serializar nada. Asi se conservan intactos los escapes, las
   comillas, los template literals y la sangria; lo unico que cambia de sitio
   son los fragmentos, y el numero de la clave.

   No toca las preguntas cuyas opciones llevan orden propio (cifras, horas,
   precios, «all of the above»): ahi barajar confunde en vez de ayudar. */

const fs = require('fs');
const BS = String.fromCharCode(92);

/* `options` en el reading, `o` en la opcion multiple del listening e `imgs` en
   las preguntas de dibujo del A2 (donde la respuesta es una imagen). */
const OPT_RE = /(["']?)(options|imgs|o)\1\s*:\s*\[/g;
const ANS_RE = /^[\s,]*(["']?)(answer|c)\1\s*:\s*(\d+)/;

/* ---------- lexer: limites de un array y de sus elementos ---------- */
function elementos(src, ini) {           // ini = indice del '['
  let i = ini + 1, prof = 0, inS = null, inTpl = 0;
  const partes = [];
  let desde = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inS) { if (c === BS) { i++; continue; } if (c === inS) inS = null; continue; }
    if (inTpl) { if (c === BS) { i++; continue; } if (c === '`') inTpl = 0; continue; }
    if (c === '"' || c === "'") { inS = c; continue; }
    if (c === '`') { inTpl = 1; continue; }
    if (c === '[' || c === '{') { prof++; continue; }
    if (c === '}') { prof--; continue; }
    if (c === ']') {
      if (prof > 0) { prof--; continue; }
      partes.push([desde, i]);
      return { fin: i, partes };
    }
    if (c === ',' && prof === 0) { partes.push([desde, i]); desde = i + 1; }
  }
  return null;
}

/* ---------- preguntas que NO se deben barajar ---------- */
function ordenPropio(vals) {
  const t = vals.map(v => String(v).trim());
  if (t.every(x => /^[£$€]?\s*\d+([.,]\d+)?\s*%?$/.test(x))) return 'cifras';
  if (t.every(x => /^\d{1,2}[:.]\d{2}\s*(a\.?m\.?|p\.?m\.?)?$/i.test(x))) return 'horas';
  if (t.every(x => /^\d/.test(x))) return 'empiezan por cifra';
  if (t.some(x => /\b(all|none|both|neither)\s+of\s+(the|these)\b/i.test(x))) return 'all/none of the above';
  if (t.some(x => /\b[A-D]\s+(and|&|or)\s+[A-D]\b/.test(x))) return 'cita otras opciones';
  return null;
}

/* ---------- secuencia de destinos equilibrada ---------- */
/* Bloques [0..n-1] barajados: en cualquier ventana de n preguntas seguidas del
   mismo tamano sale cada letra una vez, y nunca hay mas de dos claves iguales
   seguidas. */
function generador(n, semilla) {
  let s = semilla >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  let bolsa = [];
  return () => {
    if (!bolsa.length) {
      bolsa = Array.from({ length: n }, (_, i) => i);
      for (let i = bolsa.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]];
      }
    }
    return bolsa.shift();
  };
}

function procesa(fichero, escribe) {
  const src = fs.readFileSync(fichero, 'utf8');
  const gens = {};                       // un generador por numero de opciones
  const ediciones = [];
  const stats = { vistas: 0, movidas: 0, saltadas: {}, antes: {}, despues: {} };
  const LET = 'ABCDEFGH';

  OPT_RE.lastIndex = 0;
  let m;
  while ((m = OPT_RE.exec(src))) {
    const corchete = src.indexOf('[', m.index + m[0].length - 1);
    const arr = elementos(src, corchete);
    if (!arr) continue;
    OPT_RE.lastIndex = arr.fin;

    const frags = arr.partes.map(([a, b]) => src.slice(a, b));
    if (frags.length < 2 || frags.length > 8) continue;

    /* la clave va justo detras del array en los dos formatos del repo */
    const cola = src.slice(arr.fin + 1, arr.fin + 200);
    const am = ANS_RE.exec(cola);
    if (!am) continue;
    const clave = parseInt(am[3], 10);
    if (!(clave >= 0 && clave < frags.length)) continue;

    /* los fragmentos han de ser literales de texto evaluables */
    let vals;
    try { vals = frags.map(f => (0, eval)('(' + f.trim() + ')')); }
    catch (e) { continue; }
    if (!vals.every(v => typeof v === 'string')) continue;

    const n0 = frags.length;
    stats.vistas++;
    (stats.antes[n0] = stats.antes[n0] || {})[LET[clave]] = (stats.antes[n0][LET[clave]] || 0) + 1;

    const motivo = ordenPropio(vals);
    if (motivo) {
      stats.saltadas[motivo] = (stats.saltadas[motivo] || 0) + 1;
      (stats.despues[n0] = stats.despues[n0] || {})[LET[clave]] = (stats.despues[n0][LET[clave]] || 0) + 1;
      continue;
    }

    const n = frags.length;
    if (!gens[n]) gens[n] = generador(n, 0x5EED + n * 977);
    const destino = gens[n]();
    (stats.despues[n] = stats.despues[n] || {})[LET[destino]] = (stats.despues[n][LET[destino]] || 0) + 1;
    if (destino === clave) continue;

    /* intercambio simple: la buena va al destino, el distractor que estaba
       alli ocupa su sitio. Cambia lo minimo imprescindible. */
    const nuevos = frags.slice();
    [nuevos[clave], nuevos[destino]] = [nuevos[destino], nuevos[clave]];

    ediciones.push({ desde: arr.partes[0][0], hasta: arr.fin, texto: nuevos.join(',') });
    const posClave = arr.fin + 1 + am.index + am[0].length - am[3].length;
    ediciones.push({ desde: posClave, hasta: posClave + am[3].length, texto: String(destino) });
    stats.movidas++;
  }

  if (escribe && ediciones.length) {
    ediciones.sort((a, b) => b.desde - a.desde);      // de atras hacia delante
    let out = src;
    for (const e of ediciones) out = out.slice(0, e.desde) + e.texto + out.slice(e.hasta);
    fs.writeFileSync(fichero, out);
  }
  return stats;
}

/* ---------- main ---------- */
const args = process.argv.slice(2);
const escribe = args.includes('--escribe');
const ficheros = args.filter(a => a !== '--escribe');
if (!ficheros.length) { console.error('uso: node tools/rebalance_keys.js [--escribe] fichero.html ...'); process.exit(1); }

/* El reparto se mide por numero de opciones: mezclar las de 3 con las de 4 da
   un porcentaje que no significa nada (con 3 opciones la D no puede salir). */
const pinta = d => {
  const t = Object.values(d).reduce((a, b) => a + b, 0) || 1;
  return Object.keys(d).sort().map(k => `${k} ${(100 * d[k] / t).toFixed(0)}%`).join(' · ') + `   (n=${t})`;
};
for (const f of ficheros) {
  const s = procesa(f, escribe);
  console.log(`\n${f}`);
  console.log(`  preguntas de opcion multiple : ${s.vistas}`);
  console.log(`  claves movidas de sitio      : ${s.movidas}${escribe ? '' : '   (simulacro: no se ha escrito nada)'}`);
  const salt = Object.entries(s.saltadas).map(([k, v]) => `${v} ${k}`).join(', ');
  console.log(`  respetadas por orden propio  : ${salt || 'ninguna'}`);
  for (const n of Object.keys(s.antes).sort()) {
    console.log(`  ${n} opciones`);
    console.log(`     antes   : ${pinta(s.antes[n])}`);
    console.log(`     despues : ${pinta(s.despues[n] || {})}`);
  }
}
