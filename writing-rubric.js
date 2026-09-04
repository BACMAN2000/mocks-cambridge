/* =========================================================================
 *  NIS · Rúbrica de escritura
 * -------------------------------------------------------------------------
 *  Una sola fuente para dos cosas que antes vivían repartidas por el código:
 *
 *    1. Cuánto se espera que escriba un alumno en cada nivel. Estaba escrito
 *       a mano dentro de cada examen (`minWords`, `maxWords` y la frase de
 *       las instrucciones), repetido cientos de veces. Cambiar la exigencia
 *       de un nivel obligaba a tocar todos los exámenes uno por uno, y los
 *       productos finales de unidad ni siquiera coincidían con los mocks.
 *
 *    2. Con qué se le corrige. El alumno escribía a ciegas: sabía la
 *       extensión, pero no contra qué criterios se le iba a medir.
 *
 *  Ahora la extensión sale de PALABRAS y los criterios se le enseñan ANTES
 *  de escribir, en la misma pantalla y con la escala del colegio.
 *
 *  Uso:
 *    NIS_RUBRICA.objetivo('B2')      -> 250
 *    NIS_RUBRICA.conObjetivo(txt,'B2')  reescribe la frase del enunciado
 *    NIS_RUBRICA.html('B2')          -> panel plegable listo para insertar
 *    NIS_RUBRICA.estilos()           -> inyecta el CSS una sola vez
 * ========================================================================= */
(function(){
'use strict';
if(window.NIS_RUBRICA) return;

/* Extensión esperada del trabajo final de cada nivel. Es la cifra del
   colegio, no la de Cambridge: los exámenes oficiales piden menos (B2 First
   pide 140–190 y C1 Advanced 220–260), y aquí se exige por encima a
   propósito, para que el examen real se le quede corto al alumno. */
var PALABRAS = { A2:140, B1:190, B2:250, C1:400, C2:700 };

/* La escala del colegio, la misma de los readers. */
var ESCALA = [
  { k:'AD', desde:90, nombre:'Logro destacado' },
  { k:'A',  desde:70, nombre:'Logro esperado'  },
  { k:'B',  desde:55, nombre:'En proceso'      },
  { k:'C',  desde:0,  nombre:'En inicio'       }
];

/* Los cuatro criterios de Cambridge, dichos como para que un alumno de
   secundaria sepa qué hacer con ellos, más la extensión. */
var CRITERIOS = [
  { id:'content', titulo:'Content',
    pregunta:'Did you do everything the task asked?',
    AD:'Every point is covered and developed with detail or examples of your own.',
    A :'Every point is covered, though some more briefly than others.',
    B :'A point is missing or only mentioned in passing.',
    C :'Several points are missing, or the text answers a different task.' },

  { id:'communication', titulo:'Communicative achievement',
    pregunta:'Is it written for the right reader?',
    AD:'The register is right all the way through and the text has a real effect on the reader.',
    A :'The register is right and the reader gets the message without effort.',
    B :'The register slips — too formal or too casual — in places.',
    C :'The register makes the text unsuitable for its purpose.' },

  { id:'organisation', titulo:'Organisation',
    pregunta:'Can the reader follow it?',
    AD:'Paragraphs and linking carry the reader from the first line to the last without a stumble.',
    A :'Clear paragraphs and linking, with the odd jump.',
    B :'The ideas are there, but the order makes the reader work.',
    C :'Little or no structure: one block of text.' },

  { id:'language', titulo:'Language',
    pregunta:'How wide is your range, and how accurate?',
    AD:'Wide vocabulary and varied structures, used accurately; slips are rare and never confuse.',
    A :'Good range; the errors do not get in the way of the meaning.',
    B :'Limited or repetitive range; some errors obscure the meaning.',
    C :'The errors make the text hard to understand.' }
];

function nivelNormal(n){ return String(n||'').toUpperCase(); }

function objetivo(nivel){ return PALABRAS[nivelNormal(nivel)] || 0; }

/* Reescribe la extensión que pide un enunciado con la del nivel. Se hace
   sobre el texto y no sobre los datos porque la cifra vive repetida en
   cientos de tareas — incluidas las inyectadas desde tools/ — y tocarlas
   una a una es justo lo que hace que se desincronicen. */
function conObjetivo(txt, nivel){
  var n = objetivo(nivel);
  if(!n || txt == null) return txt;
  return String(txt)
    /* "Write 140-190 words in an appropriate style." */
    .replace(/\b(?:about\s+)?\d+\s*[–-]\s*\d+\s+words\b/i, 'about ' + n + ' words')
    /* "Write your answer in about 100 words." */
    .replace(/\babout\s+\d+\s+words\b/i, 'about ' + n + ' words')
    /* "Write at least 120 words." */
    .replace(/\b(?:at least|around|approximately)\s+\d+\s+words\b/i, 'about ' + n + ' words');
}

/* Cómo va de extensión ahora mismo: sirve para el contador que ve mientras
   escribe. La banda baja es a propósito generosa por abajo — quedarse corto
   se avisa antes que pasarse, porque es el error que cuesta nota. */
function estadoLongitud(palabras, nivel){
  var n = objetivo(nivel);
  if(!n) return { clase:'', texto:'' };
  if(palabras === 0)      return { clase:'',     texto:'target ' + n };
  if(palabras < n * 0.8)  return { clase:'corto', texto:'target ' + n + ' — keep going' };
  if(palabras > n * 1.3)  return { clase:'largo', texto:'target ' + n + ' — trim it' };
  return { clase:'bien', texto:'target ' + n + ' ✓' };
}

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}

var puesto = false;
function estilos(){
  if(puesto) return;
  puesto = true;
  var s = document.createElement('style');
  s.textContent =
    '.nisr{border:1px solid #cbd5e1;border-radius:10px;background:#fff;margin-top:12px;font-size:.86rem}' +
    '.nisr>summary{cursor:pointer;padding:10px 14px;font-weight:700;color:#2f6aa8;list-style:none;' +
      'display:flex;align-items:center;gap:8px}' +
    '.nisr>summary::-webkit-details-marker{display:none}' +
    '.nisr>summary::before{content:"\\25B8";transition:transform .15s;display:inline-block}' +
    '.nisr[open]>summary::before{transform:rotate(90deg)}' +
    '.nisr .meta{margin-left:auto;font-weight:600;color:#64748b;font-size:.8rem}' +
    '.nisr .cuerpo{padding:0 14px 12px}' +
    '.nisr .lead{color:#64748b;margin:0 0 10px;line-height:1.5}' +
    '.nisr table{width:100%;border-collapse:collapse}' +
    '.nisr th,.nisr td{border:1px solid #e2e8f0;padding:7px 9px;text-align:left;vertical-align:top;line-height:1.45}' +
    '.nisr th{background:#f1f5f9;font-size:.78rem;letter-spacing:.02em}' +
    '.nisr td.c{width:26%}' +
    '.nisr td.c b{display:block;color:#0f172a}' +
    '.nisr td.c span{color:#64748b;font-weight:500;font-size:.8rem}' +
    '.nisr .b{font-weight:800;padding:1px 6px;border-radius:5px;font-size:.74rem}' +
    '.nisr .b.AD{background:#dcfce7;color:#166534}.nisr .b.A{background:#dbeafe;color:#1e40af}' +
    '.nisr .b.B{background:#fef9c3;color:#854d0e}.nisr .b.C{background:#fee2e2;color:#991b1b}' +
    '.nisr .escala{margin:10px 0 0;color:#64748b;font-size:.78rem;line-height:1.6}' +
    /* El contador de palabras del examen: sus estados los decide esta
       rubrica, asi que su color tambien vive aqui. */
    '.wc.corto{color:#b45309}.wc.bien{color:#16a34a;font-weight:700}.wc.largo{color:#b45309}' +
    '@media(max-width:820px){.nisr table,.nisr tbody,.nisr tr,.nisr td{display:block;width:auto}' +
      '.nisr thead{display:none}.nisr tr{border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;padding:4px}' +
      '.nisr td{border:none;padding:5px 8px}.nisr td.c{width:auto;border-bottom:1px solid #e2e8f0}}';
  document.head.appendChild(s);
}

/* El panel. Va plegado: durante el examen la pantalla es del enunciado y de
   la caja de escribir, no de la rúbrica. Pero se abre sin salir de la
   página, que es lo que hace que se consulte de verdad. */
function html(nivel, opciones){
  estilos();
  var o = opciones || {};
  var n = objetivo(nivel);
  var bandas = ['AD','A','B','C'];
  var filas = CRITERIOS.map(function(c){
    return '<tr><td class="c"><b>' + esc(c.titulo) + '</b><span>' + esc(c.pregunta) + '</span></td>' +
      bandas.map(function(b){ return '<td>' + esc(c[b]) + '</td>'; }).join('') + '</tr>';
  }).join('');

  /* La extensión es un criterio más, y el único con una cifra exacta: se
     pone al final para que se lea como lo que es, un requisito. */
  if(n){
    filas += '<tr><td class="c"><b>Length</b><span>About ' + n + ' words</span></td>' +
      '<td>Within the target, and every word earns its place.</td>' +
      '<td>Within the target, or very close to it.</td>' +
      '<td>Noticeably short, or padded out to reach the count.</td>' +
      '<td>Far from the target.</td></tr>';
  }

  return '<details class="nisr"' + (o.abierto ? ' open' : '') + '>' +
    '<summary>How this will be marked' +
      (n ? '<span class="meta">' + esc(nivelNormal(nivel)) + ' · about ' + n + ' words</span>' : '') +
    '</summary>' +
    '<div class="cuerpo">' +
      '<p class="lead">Read this before you start. Your teacher marks with these five criteria.</p>' +
      '<table><thead><tr><th>Criterion</th>' +
        bandas.map(function(b){
          var e = ESCALA.filter(function(x){ return x.k === b; })[0];
          return '<th><span class="b ' + b + '">' + b + '</span> ' + esc(e.nombre) + '</th>';
        }).join('') +
      '</tr></thead><tbody>' + filas + '</tbody></table>' +
      '<p class="escala">AD from 90 · A from 70 · B from 55 · C below 55.</p>' +
    '</div></details>';
}

window.NIS_RUBRICA = {
  PALABRAS: PALABRAS,
  ESCALA: ESCALA,
  CRITERIOS: CRITERIOS,
  objetivo: objetivo,
  conObjetivo: conObjetivo,
  estadoLongitud: estadoLongitud,
  estilos: estilos,
  html: html
};
})();
