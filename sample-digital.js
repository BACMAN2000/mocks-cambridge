/* ============================================================
   sample-digital.js — formato «examen digital de Cambridge» SOLO para el
   colegio de muestra (sample.cohasset.pe, 16-oct-2026).

   Por qué un archivo aparte: los motores (*-quiz.app-data.js), ui-mensajes.js,
   writing-rubric.js y version.json son idénticos byte a byte en NIS,
   cohasset.pe y la copia standalone, y nis-bridge.js es del puente. Todo lo
   que aquí se hace va por fuera, sin tocarlos: se envuelven funciones
   globales del motor (go/render.*, viewQuiz, startTimer…) y se inyecta CSS.
   Si el motor cambia un id o un nombre, esto deja de actuar en esa parte,
   pero el examen sigue funcionando como siempre.

   Se apaga solo (return inmediato) salvo en sample.* (window.COH_SAMPLE_HOST,
   de config.js) o con ?sampledemo=1 para probar en localhost. NIS y
   cohasset.pe no ven ninguna diferencia.

   Qué añade:
   1. ?level=A2|B1|B2|C1 salta el selector de nivel; ?test=practice|practice2|
      mock01|mock02… abre ese test (pasando por la pantalla 2). Nunca cuando el
      motor va a reanudar un borrador (MDRAFT / LDRAFT / borrador del Writing).
   2. ← → cambian de pregunta (pulsan ◀ ▶ del pie) fuera de campos de texto.
   3. Cabecera fina estilo Cambridge digital y cuerpo de 17 px; en móvil ◀ ▶
      fijos abajo a la derecha.
   4. Avisos a 5 y 1 minuto; en los MOCKS, entrega automática al llegar a 0.
   5. Pantalla «Test information» antes de cada test (+ «Sound check» en
      Listening).
   6. «Práctica N» → «Practice N», título sin duplicar, 🌐 oculto durante el
      examen y PDFs «Cohasset-…» en vez de «NIS-…».
============================================================ */
(function(){
  'use strict';
  var Q;
  try{ Q = new URLSearchParams(location.search); }catch(e){ return; }
  if(!(window.COH_SAMPLE_HOST === true || Q.get('sampledemo') === '1')) return;
  var PAGE = (/(reading|listening|writing)-quiz/.exec(location.pathname) || [])[1];
  if(!PAGE) return;
  var app = document.getElementById('app');
  if(!app) return;
  var root = document.documentElement;
  root.classList.add('sd-on');

  /* El estado del motor es un `const state` del ámbito global: no cuelga de
     window, pero desde otro <script> clásico se alcanza por su nombre. */
  function S(){ try{ return state; }catch(e){ return null; } }
  /* Lo mismo para el resto de globales del motor que se leen aquí. Uno por
     uno y con typeof: en cada página solo existen los de su motor. */
  var GL = {
    render:           function(){ return typeof render !== 'undefined' ? render : null; },
    OFFICIAL:         function(){ return typeof OFFICIAL !== 'undefined' ? OFFICIAL : null; },
    DURATIONS:        function(){ return typeof DURATIONS !== 'undefined' ? DURATIONS : null; },
    MDRAFT:           function(){ return typeof MDRAFT !== 'undefined' ? MDRAFT : null; },
    currentExam:      function(){ return typeof currentExam !== 'undefined' ? currentExam : null; },
    exam:             function(){ return typeof exam !== 'undefined' ? exam : null; },
    BOR_KEY:          function(){ return typeof BOR_KEY !== 'undefined' ? BOR_KEY : null; },
    QUIZ:             function(){ return typeof QUIZ !== 'undefined' ? QUIZ : null; },
    currentQuiz:      function(){ return typeof currentQuiz !== 'undefined' ? currentQuiz : null; },
    LISTEN_DURATIONS: function(){ return typeof LISTEN_DURATIONS !== 'undefined' ? LISTEN_DURATIONS : null; },
    LDRAFT:           function(){ return typeof LDRAFT !== 'undefined' ? LDRAFT : null; },
    MSITE:            function(){ return typeof MSITE !== 'undefined' ? MSITE : null; }
  };
  function G(nombre){ try{ return GL[nombre] ? GL[nombre]() : null; }catch(e){ return null; } }

  /* Selectores reales de cada motor (inspeccionados el 16-oct-2026). */
  var CFG = {
    reading:   { shell:'inspera-shell', hdr:'.inspera-header', left:['.brand','.candidate'], right:['.tools','.right'],
                 prev:'#prevBtn', next:'#nextBtn', title:'.inspera-title h1', open:'_openSubmitPage', fin:'submitFinalBtn' },
    writing:   { shell:'shell', hdr:'.hdr', left:['.brand','.cand'], right:['.right'],
                 prev:'#prev', next:'#next', title:'.main-inner > h2', open:'_wOpenSubmit', fin:'wSubmitFinal' },
    listening: { shell:'ins-shell', hdr:'.ins-hdr', left:['.ins-brand','.ins-cand'], right:['.ins-right'],
                 prev:'#lprev', next:'#lnext', title:'.ins-title h1', open:'_lOpenSubmit', fin:'lSubmitFinal' }
  }[PAGE];

  var EXAM_NAMES = { A2:'A2 Key', B1:'B1 Preliminary', B2:'B2 First', C1:'C1 Advanced' };

  /* «practice» es la Practice 1; «mock01» es MOCK 1. Mismo criterio que
     examTypeLabel() del Reading y que la regex de sampleHide() del puente. */
  function labelOf(t){
    var m = /^mock0?(\d+)$/.exec(t || ''); if(m) return 'MOCK ' + parseInt(m[1], 10);
    var p = /^practice(\d*)$/.exec(t || ''); if(p) return 'Practice ' + (p[1] || '1');
    return t || '';
  }
  function isMock(){ var s = S(); return !!(s && /^mock/.test(s.examType || '')); }
  function inExam(){ var f = app.firstElementChild; return !!(f && f.classList.contains(CFG.shell)); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------- aviso: el de la plataforma si está; si no, uno propio ---------- */
  function avisa(texto, titulo, tono){
    try{ if(window.NISUI && NISUI.avisa){ NISUI.avisa(texto, { titulo:titulo, tono:tono || 'ojo' }); return; } }catch(e){}
    var t = document.createElement('div'); t.className = 'sd-toast'; t.setAttribute('role', 'status');
    t.textContent = titulo + ' — ' + texto; document.body.appendChild(t);
    setTimeout(function(){ if(t.parentNode) t.remove(); }, 6000);
  }

  /* =========================================================
     3. CSS — cabecera fina, temporizador en píldora, cuerpo 17 px, móvil.
     Va con prefijo html.sd-on para ganar a las reglas de cada HTML sin
     depender del orden de las hojas.
  ========================================================= */
  var css = ''
    /* cabecera: tres columnas (candidato · reloj · herramientas); 1fr auto 1fr
       centra el reloj de verdad y, si la derecha no cabe, empuja en vez de pisar */
    + 'html.sd-on .sd-hdr{display:grid!important;grid-template-columns:1fr auto 1fr auto;align-items:center;column-gap:14px;min-height:56px;padding:6px 16px!important;flex-wrap:nowrap!important;box-sizing:border-box}'
    + 'html.sd-on .sd-hdr .sd-hl{display:flex;align-items:center;gap:12px;min-width:0}'
    + 'html.sd-on .sd-hdr .sd-hl img{height:28px!important;width:auto;display:block}'
    + 'html.sd-on .sd-hdr .sd-hl .candidate,html.sd-on .sd-hdr .sd-hl .cand,html.sd-on .sd-hdr .sd-hl .ins-cand{display:block!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.85rem;min-width:0}'
    + 'html.sd-on .sd-hdr .sd-hc{display:flex;justify-content:center}'
    + 'html.sd-on .sd-hdr #timer{border-radius:999px!important;padding:6px 18px!important;min-width:104px;font-size:1.05rem!important;letter-spacing:1.5px;text-align:center;line-height:1.2;box-shadow:inset 0 0 0 1px rgba(0,0,0,.07)}'
    + 'html.sd-on .sd-hdr .sd-hr{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:nowrap}'
    + 'html.sd-on .sd-hdr .sd-hr .right,html.sd-on .sd-hdr .sd-hr .ins-right,html.sd-on .sd-hdr .sd-hr .tools{margin-left:0!important;display:flex;align-items:center;flex-wrap:nowrap!important;gap:6px}'
    + 'html.sd-on .sd-hdr button{white-space:nowrap;font-size:.82rem}'
    /* nis-tema.js mete su grupo (idioma + tema) en la primera barra que
       encuentra, y la del examen es un <header>: se le da su propia columna
       en vez de moverlo (moverlo reabre el bucle de recolocar de nis-tema) */
    + 'html.sd-on .sd-hdr > .nis-ctl{grid-row:1;grid-column:4;margin-left:0!important}'
    /* suelto en una esquina (aún no ha entrado en la cabecera) pisaría el
       reloj o Submit: durante el examen no se pinta; nis-tema lo muda a la
       cabecera en su próxima pasada (cada 4 s) y ahí sí se ve */
    + 'html.sd-exam body > .nis-ctl{display:none!important}'
    + '@media (max-width:900px){html.sd-on .sd-hdr .sd-hl .brand,html.sd-on .sd-hdr .sd-hl .ins-brand{display:none}}'
    + 'html.sd-on .sd-hdr .tool-btn{padding:5px 9px!important}'
    /* el 🌐 no se toca durante el examen (cambiar de idioma repinta textos) */
    + 'html.sd-exam .nis-lang-btn{display:none!important}'
    /* cuerpo de preguntas: 17 px y más aire. En el Reading se respeta A−/A+
       (multiplica la variable --exam-fs del motor en vez de fijarla) */
    + 'html.sd-on .inspera-content,html.sd-on .inspera-content .passage,html.sd-on .inspera-content .q,html.sd-on .inspera-content .source-row,html.sd-on .inspera-content .bank,html.sd-on .inspera-shell .writing-task{font-size:calc(var(--exam-fs,1rem) * 1.0625)!important;line-height:1.65}'
    + 'html.sd-on .inspera-instruction p{font-size:1.0625rem;line-height:1.55}'
    + 'html.sd-on .inspera-main{padding-top:22px!important}'
    + 'html.sd-on .inspera-content .q{margin-bottom:10px}'
    + 'html.sd-on .shell .main{padding-top:22px}'
    + 'html.sd-on .shell .pane .instr p,html.sd-on .shell .pane .left,html.sd-on .shell .pane .left p,html.sd-on .shell .pane .left li{font-size:17px;line-height:1.65}'
    + 'html.sd-on .shell textarea.box{font-size:17px;line-height:1.6}'
    + 'html.sd-on .ins-main{padding-top:22px}'
    + 'html.sd-on .ins-instr p,html.sd-on .ins-content .q{font-size:17px;line-height:1.6}'
    + 'html.sd-on .ins-content .q{padding:16px 20px}'
    /* móvil: cabecera en dos filas compactas y ◀ ▶ fijos abajo a la derecha */
    + '@media (max-width:480px){'
    +   'html.sd-on .sd-hdr{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"c t k" "r r r";row-gap:6px;column-gap:8px;padding:6px 10px!important;min-height:0}'
    +   'html.sd-on .sd-hdr .sd-hl{grid-area:c}html.sd-on .sd-hdr .sd-hc{grid-area:t}html.sd-on .sd-hdr > .nis-ctl{grid-area:k;justify-self:end}'
    +   'html.sd-on .sd-hdr .sd-hr{grid-area:r;min-width:0;justify-content:flex-start;flex-wrap:wrap!important;row-gap:6px}'
    +   'html.sd-on .sd-hdr .sd-hr .tools{flex-wrap:wrap!important}'
    +   'html.sd-on .sd-hdr .sd-hl .brand,html.sd-on .sd-hdr .sd-hl .ins-brand{display:none}'
    +   'html.sd-on .sd-hdr .sd-hl .candidate,html.sd-on .sd-hdr .sd-hl .cand,html.sd-on .sd-hdr .sd-hl .ins-cand{font-size:.75rem}'
    +   'html.sd-on .sd-hdr #timer{min-width:84px;padding:4px 12px!important;font-size:.95rem!important}'
    +   'html.sd-on .sd-hdr button{padding:5px 9px!important;font-size:.76rem!important}'
    +   'html.sd-on .sd-hdr .ins-audio,html.sd-on .sd-hdr .fs-group{display:none}'
    /* botones largos en icono: el texto lo pinta el motor (y lo cambia al
       marcar), así que se oculta con font-size:0 y se pinta uno corto */
    +   'html.sd-on .sd-hdr [data-tool=flag],html.sd-on .sd-hdr #wFlagBtn,html.sd-on .sd-hdr #lFlagBtn,html.sd-on .sd-hdr [data-tool=highlight],html.sd-on .sd-hdr [data-tool=notes]{font-size:0!important}'
    +   'html.sd-on .sd-hdr [data-tool=flag]::before,html.sd-on .sd-hdr #wFlagBtn::before,html.sd-on .sd-hdr #lFlagBtn::before{content:"⚐ Flag";font-size:.76rem}'
    +   'html.sd-on .sd-hdr [data-tool=flag].active::before,html.sd-on .sd-hdr #wFlagBtn.active::before,html.sd-on .sd-hdr #lFlagBtn.active::before{content:"⚑ Flagged"}'
    +   'html.sd-on .sd-hdr [data-tool=highlight]::before{content:"🖍";font-size:.9rem}html.sd-on .sd-hdr [data-tool=notes]::before{content:"📝";font-size:.9rem}'
    +   'html.sd-on .sd-hdr .sd-hr .right,html.sd-on .sd-hdr .sd-hr .ins-right{margin-left:auto!important}'
    +   'html.sd-on .inspera-footer,html.sd-on .shell .ftr,html.sd-on .ins-ftr{padding-right:122px!important}'
    +   'html.sd-on .nav-arrows,html.sd-on .shell .arrows,html.sd-on .ins-arrows{position:fixed!important;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:1300;margin:0!important;padding:0!important;border:0!important;gap:8px}'
    +   'html.sd-on .nav-arrows button,html.sd-on .shell .arrows button,html.sd-on .ins-arrows button{min-width:50px;min-height:44px;box-shadow:0 4px 14px rgba(0,0,0,.25)}'
    +   'html.sd-on .inspera-content,html.sd-on .ins-content .q,html.sd-on .shell .pane .left{font-size:16.5px}'
    + '}'
    /* pantalla «Test information» */
    + '.sd-info{max-width:760px;margin:24px auto;padding:0 16px;box-sizing:border-box;font-family:inherit}'
    + '.sd-info *{box-sizing:border-box}'
    + '.sd-card{background:var(--card,#fff);color:var(--ink,#1f2937);border:1px solid var(--line,#e5e7eb);border-radius:16px;padding:28px 30px;box-shadow:0 10px 30px rgba(15,23,42,.08)}'
    + '.sd-kicker{margin:0 0 6px;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--sd-accent,#2f5f93)}'
    + '.sd-card h1{margin:0 0 4px;font-size:1.6rem;line-height:1.25}'
    + '.sd-test{margin:0 0 18px;color:var(--muted,#64748b);font-weight:600}'
    + '.sd-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 20px;padding:0}'
    + '.sd-facts div{border:1px solid var(--line,#e5e7eb);border-radius:12px;padding:12px 14px;background:var(--bg,#f8fafc)}'
    + '.sd-facts dt{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted,#64748b);margin:0 0 4px}'
    + '.sd-facts dd{margin:0;font-size:1.25rem;font-weight:800}'
    + '.sd-card h2{font-size:1.05rem;margin:0 0 8px}'
    + '.sd-card ul{margin:0 0 18px;padding-left:20px;line-height:1.65;font-size:1rem}'
    + '.sd-sound{border:1px dashed var(--line,#cbd5e1);border-radius:12px;padding:14px 16px;margin:0 0 18px}'
    + '.sd-sound p{margin:8px 0 0}'
    + '.sd-sound .sd-q{font-weight:700}'
    + '.sd-sound .sd-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}'
    + '.sd-ok{color:#15803d;font-weight:700}'
    + '.sd-bad{color:#b45309}'
    + '.sd-actions{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}'
    + '.sd-btn{font:inherit;font-weight:700;border-radius:10px;padding:12px 22px;cursor:pointer;border:1px solid var(--line,#cbd5e1);background:var(--card,#fff);color:var(--ink,#1f2937)}'
    + '.sd-btn.sd-main{background:var(--sd-accent,#2f5f93);border-color:var(--sd-accent,#2f5f93);color:#fff}'
    + '.sd-btn:disabled{opacity:.45;cursor:not-allowed}'
    + '.sd-btn:focus-visible{outline:3px solid var(--sd-accent,#2f5f93);outline-offset:2px}'
    + '.sd-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99999;background:#1f2937;color:#fff;padding:12px 18px;border-radius:10px;font-weight:600}'
    + '@media (max-width:480px){.sd-card{padding:20px 18px}.sd-card h1{font-size:1.3rem}.sd-facts{gap:6px}.sd-facts div{padding:10px}.sd-facts dd{font-size:1.05rem}.sd-actions .sd-btn{flex:1 1 auto}}';
  var st = document.createElement('style'); st.id = 'sdDigitalCss'; st.textContent = css;
  (document.head || root).appendChild(st);
  try{ var MS = G('MSITE'); if(MS && MS.accent) root.style.setProperty('--sd-accent', MS.accent2 || MS.accent); }catch(e){}

  /* La cabecera del motor es una fila flex con el reloj dentro del grupo de
     la derecha. Se reparte en tres cajas (izquierda · centro · derecha)
     moviendo los nodos: el motor los busca por id, así que siguen vivos. */
  function cabecera(){
    var h = app.querySelector(CFG.hdr); if(!h || h.classList.contains('sd-hdr')) return;
    var L = document.createElement('div'); L.className = 'sd-hl';
    var M = document.createElement('div'); M.className = 'sd-hc';
    var R = document.createElement('div'); R.className = 'sd-hr';
    CFG.left.forEach(function(sel){ var e = h.querySelector(sel); if(e) L.appendChild(e); });
    var t = h.querySelector('#timer'); if(t) M.appendChild(t);
    CFG.right.forEach(function(sel){ var e = h.querySelector(sel); if(e) R.appendChild(e); });
    Array.prototype.slice.call(h.children).forEach(function(e){ R.appendChild(e); });   // lo que quede (p. ej. .nis-ctl)
    h.appendChild(L); h.appendChild(M); h.appendChild(R);
    h.classList.add('sd-hdr');
  }

  /* 6. Título del examen: el Reading pinta «… (Practice) — Practice» y el
     Listening «B1 — Intermediate — Listening». Queda «B1 Preliminary —
     Reading (Practice 1)», igual que en la pantalla de información. */
  function nombreExamen(){
    var s = S(); if(!s) return '';
    if(PAGE === 'listening') return (EXAM_NAMES[s.level] || s.level) + ' — Listening';
    var ex = examen(); var t = ex && ex.title ? String(ex.title) : '';
    return t.replace(/\s*\([^)]*\)\s*$/, '') || ((EXAM_NAMES[s.level] || s.level) + ' — ' + (PAGE === 'writing' ? 'Writing' : 'Reading'));
  }
  function titulo(){
    var el = app.querySelector(CFG.title); if(!el || el.getAttribute('data-sd')) return;
    var s = S(); if(!s) return;
    el.textContent = nombreExamen() + ' (' + labelOf(s.examType) + ')';
    el.setAttribute('data-sd', '1');
  }

  /* 6. Listas de tests: «📘 Práctica N» → «📘 Practice N» y «Empezar» →
     «Start». El h2 sigue acabando en «Practice N»/«MOCK N», que es lo que
     busca sampleHide() en nis-bridge.js para esconder tarjetas. */
  function rotulos(){
    try{
      var tw = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, null, false), n;
      while((n = tw.nextNode())){
        var v = n.nodeValue;
        if(v && /Práctica|Empezar/.test(v)) n.nodeValue = v.replace(/Práctica/g, 'Practice').replace(/Empezar/g, 'Start');
      }
    }catch(e){}
  }

  /* =========================================================
     1. Entrada directa: ?level= y ?test=
  ========================================================= */
  var pendLevel = (Q.get('level') || '').toUpperCase();
  if(!/^(A2|B1|B2|C1)$/.test(pendLevel)) pendLevel = '';
  if(PAGE === 'writing' && pendLevel === 'A2') pendLevel = '';      // el Writing es B1–C1
  var pendTest = (Q.get('test') || '').toLowerCase().replace(/^mock(\d)$/, 'mock0$1');
  if(!/^(practice\d*|mock0?\d+)$/.test(pendTest)) pendTest = '';
  function takeLevel(){ var l = pendLevel; pendLevel = ''; return l; }

  function arrancaTest(){
    if(!pendTest) return;
    var t = pendTest, label = labelOf(t);
    var hs = app.querySelectorAll('h2'), card = null;
    for(var i = 0; i < hs.length; i++){
      var m = /(Practice|MOCK)\s+\d+\s*$/.exec(hs[i].textContent || '');
      if(m && m[0].replace(/\s+/g, ' ').trim() === label){ card = hs[i].parentElement; break; }
    }
    if(!card) return;                                  // otra lista (practice vs. mocks): no se fuerza nada
    pendTest = '';
    if(card.style.display === 'none') return;          // fuera de la muestra (sampleHide)
    var b = card.querySelector('button'); if(b && !b.disabled) b.click();
  }

  if(PAGE === 'reading' || PAGE === 'writing'){
    var R = G('render');
    if(R && R.level){
      var oLevel = R.level;
      R.level = function(){
        var l = takeLevel(), s = S();
        var ok = l && s && (PAGE === 'writing' ? ['B1','B2','C1'].indexOf(l) >= 0 : !!(G('OFFICIAL') || {})[l]);
        if(ok){ s.level = l; return window.go('category'); }   // con ?branch la categoría salta sola a la lista
        return oLevel.apply(this, arguments);
      };
    }
  } else {
    if(typeof window.viewLevelSelect === 'function'){
      var oVLS = window.viewLevelSelect;
      window.viewLevelSelect = function(){
        var l = takeLevel(), s = S(), QZ = G('QUIZ');
        if(l && s && QZ && QZ[l]){ s.level = l; return window.viewCategory(); }
        return oVLS.apply(this, arguments);
      };
    }
  }

  /* =========================================================
     5. Pantalla «Test information» (y «Sound check» en Listening)
  ========================================================= */
  function examen(){
    try{
      if(PAGE === 'reading') return G('currentExam') ? currentExam() : null;
      if(PAGE === 'writing') return G('exam') ? exam() : null;
      var s = S(), cq = G('currentQuiz'); return (cq && s) ? currentQuiz()[s.level] : null;
    }catch(e){ return null; }
  }
  /* Respaldo si el motor no da los datos: formato oficial de Cambridge
     (exámenes revisados de 2020) por nivel y destreza: [minutos, partes,
     preguntas]. El Listening del motor dura 40 min en los cuatro niveles
     (franja del colegio), así que se usa el dato del motor cuando existe. */
  var OFICIAL = {
    reading:   { A2:[60,7,32], B1:[45,6,32], B2:[75,7,52], C1:[90,8,56] },
    listening: { A2:[30,5,25], B1:[30,4,25], B2:[40,4,30], C1:[40,4,30] },
    writing:   { B1:[45,2,2],  B2:[80,2,2],  C1:[90,2,2] }
  };
  function datos(){
    var s = S() || {}, ex = examen(), f = (OFICIAL[PAGE] || {})[s.level] || [null, null, null];
    var d = { nombre: nombreExamen(), test: labelOf(s.examType), min: f[0], partes: f[1], preguntas: f[2], extra: '' };
    try{
      if(PAGE === 'reading' && ex && ex.parts){
        var D = G('DURATIONS');
        d.min = (D && D[s.level] && D[s.level][s.skill]) || d.min;
        d.partes = ex.parts.length;
        d.preguntas = ex.parts.reduce(function(a, p){ return a + ((p.type === 'writing' ? p.prompts : p.questions) || []).length; }, 0);
      } else if(PAGE === 'writing' && ex && ex.parts){
        d.min = ex.durationMin || d.min;
        d.partes = ex.parts.length;
        var n2 = (ex.parts[1] && ex.parts[1].tasks) ? ex.parts[1].tasks.length : 0;
        d.preguntas = 2;
        d.extra = 'Part 1 is compulsory. In Part 2, choose ONE of the ' + n2 + ' questions and say which one you are answering.';
      } else if(PAGE === 'listening' && ex && ex.audios){
        var LD = G('LISTEN_DURATIONS');
        d.min = (LD && LD[s.level]) || d.min || 40;
        d.partes = ex.audios.length;
        d.preguntas = ex.audios.reduce(function(a, x){ return a + (x.questions || []).length; }, 0);
      }
    }catch(e){}
    return d;
  }

  /* El motor va a reanudar un examen a medias: entonces no se interpone
     ninguna pantalla (el reloj ya corre desde la hora guardada). */
  function hayBorrador(){
    var s = S(); if(!s) return false;
    try{
      if(PAGE === 'reading'){ var M = G('MDRAFT'); var d = M && M.read(); return !!(d && d.skill === s.skill && d.level === s.level && d.examType === s.examType); }
      if(PAGE === 'listening'){ var L = G('LDRAFT'); var e = L && L.read(); return !!(e && e.level === s.level && e.examType === s.examType); }
      var k = G('BOR_KEY'); if(!k) return false;
      var b = JSON.parse(localStorage.getItem(k) || 'null');
      var conTexto = !!(b && b.cajas && Object.keys(b.cajas).some(function(n){ return (b.cajas[n] || '').trim(); }));
      return conTexto && b.level === s.level && b.examType === s.examType && b.at && (Date.now() - b.at) <= 12*3600*1000;
    }catch(e){ return false; }
  }

  var startKey = null;          // «Start test» pulsado para este nivel+test
  function clave(){ var s = S() || {}; return s.level + '|' + s.examType; }
  function saltaInfo(){
    if(/[?&]official=1/.test(location.search)) return true;   // el puente del mock oficial abre y repone él solo
    if(startKey && startKey === clave()){ startKey = null; return true; }
    return hayBorrador();
  }

  function pitido(){
    var C = window.AudioContext || window.webkitAudioContext; if(!C) return false;
    try{
      var ctx = new C(), o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime;
      o.type = 'sine'; o.frequency.value = 660;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.05);
      g.gain.setValueAtTime(0.35, t0 + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + 1.25);
      o.onended = function(){ try{ ctx.close(); }catch(e){} };
      if(ctx.state === 'suspended' && ctx.resume) ctx.resume();
      return true;
    }catch(e){ return false; }
  }

  function volverALista(){
    var mock = isMock();
    if(PAGE === 'listening'){ var f = mock ? window.viewExamPick : window.viewPracticePick; if(typeof f === 'function') f(); return; }
    window.go(mock ? 'examPick' : 'practicePick');
  }

  function pintaInfo(empieza){
    var d = datos(), mock = isMock(), s = S() || {};
    var conSonido = PAGE === 'listening';
    var instr = [];
    if(d.extra) instr.push(esc(d.extra));
    else instr.push('Answer all the questions.');
    if(conSonido) instr.push('Each part has its own recording. Press play when you are ready and answer while you listen.');
    instr.push('Use <b>◀ ▶</b> or the <b>arrow keys (← →)</b> to move between questions. The numbers at the bottom take you to any question.');
    instr.push('<b>Flag</b> questions to review them later. Before you submit, the Submission page shows what is unanswered or flagged.');
    instr.push(mock
      ? 'When the time runs out, your test is <b>submitted automatically</b>. You will get a warning 5 minutes and 1 minute before the end.'
      : 'You will get a warning 5 minutes and 1 minute before the end. In practice tests the clock keeps running after zero, so you can finish and submit.');
    app.innerHTML = '<div class="sd-info" role="region" aria-labelledby="sdInfoT"><div class="sd-card">'
      + '<p class="sd-kicker">Test information</p>'
      + '<h1 id="sdInfoT">' + esc(d.nombre) + '</h1>'
      + '<p class="sd-test">' + esc(d.test) + (s.name ? ' · Candidate: ' + esc(s.name) : '') + '</p>'
      + '<dl class="sd-facts">'
      +   '<div><dt>Time</dt><dd>' + (d.min ? esc(d.min) + ' min' : '—') + '</dd></div>'
      +   '<div><dt>Parts</dt><dd>' + (d.partes != null ? esc(d.partes) : '—') + '</dd></div>'
      +   '<div><dt>Questions</dt><dd>' + (d.preguntas != null ? esc(d.preguntas) : '—') + '</dd></div>'
      + '</dl>'
      + '<h2>Instructions</h2><ul>' + instr.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ul>'
      + (conSonido ? '<div class="sd-sound" id="sdSound"><h2>Sound check</h2>'
          + '<div class="sd-row"><button type="button" class="sd-btn" id="sdPlay">🔊 Play sound</button></div>'
          + '<div id="sdAsk" hidden><p class="sd-q">Can you hear the sound?</p><div class="sd-row">'
          + '<button type="button" class="sd-btn" id="sdYes">Yes</button><button type="button" class="sd-btn" id="sdNo">No</button></div></div>'
          + '<p id="sdMsg" aria-live="polite"></p></div>' : '')
      + '<div class="sd-actions"><button type="button" class="sd-btn" id="sdBack">← Back</button>'
      + '<button type="button" class="sd-btn sd-main" id="sdStart"' + (conSonido ? ' disabled' : '') + '>Start test</button></div>'
      + '</div></div>';
    try{ window.scrollTo(0, 0); }catch(e){}
    var bStart = document.getElementById('sdStart');
    document.getElementById('sdBack').onclick = volverALista;
    bStart.onclick = function(){ startKey = clave(); empieza(); };
    if(conSonido){
      var msg = document.getElementById('sdMsg');
      document.getElementById('sdPlay').onclick = function(){
        if(!pitido()){
          msg.textContent = 'This browser cannot play the test sound. Check your volume with the first recording.';
          bStart.disabled = false; return;
        }
        document.getElementById('sdAsk').hidden = false; msg.textContent = '';
      };
      document.getElementById('sdYes').onclick = function(){
        msg.className = 'sd-ok'; msg.textContent = '✓ Sound check complete. You can start the test.';
        bStart.disabled = false; bStart.focus();
      };
      document.getElementById('sdNo').onclick = function(){
        msg.className = 'sd-bad'; msg.textContent = 'Turn up the volume or check your headphones, then press Play sound again.';
        bStart.disabled = true;
      };
    } else { try{ bStart.focus(); }catch(e){} }
  }

  if(PAGE === 'reading' || PAGE === 'writing'){
    var R2 = G('render');
    if(R2 && R2.exam){
      var oExam = R2.exam;
      R2.exam = function(){
        if(saltaInfo()) return oExam.apply(this, arguments);
        pintaInfo(function(){ window.go('exam'); });
      };
    }
  } else if(typeof window.viewQuiz === 'function'){
    var oVQ = window.viewQuiz;
    window.viewQuiz = function(){
      if(saltaInfo()) return oVQ.apply(this, arguments);
      pintaInfo(function(){
        /* el botón de la lista ya fijó startTime: el reloj empieza ahora */
        var s = S(); if(s){ s.startTime = Date.now(); s.answers = {}; s.seqOrder = {}; }
        window.viewQuiz();
      });
    };
  }

  /* =========================================================
     4. Reloj: avisos a 5 y 1 minuto; en MOCKS, entrega automática a 0.
     Se envuelve el arranque del reloj del motor para conocer la hora de
     fin; el reloj visible lo sigue pintando el motor.
  ========================================================= */
  var vig = null, vigT = null;
  function paraVigia(){ if(vig){ clearInterval(vig); vig = null; } if(vigT){ clearTimeout(vigT); vigT = null; } }
  function vigia(fin){
    paraVigia();
    var mock = isMock(), w5 = false, w1 = false;
    function tick(){
      var r = Math.ceil((fin - Date.now()) / 1000);
      if(r <= 0){ paraVigia(); if(mock) entregaYa(); return; }
      if(r <= 60 && !w1){ w1 = w5 = true;
        avisa(mock ? '1 minute left. When the time runs out, your test will be submitted automatically.'
                   : '1 minute left. The clock will keep running after zero: finish and press Submit.', '1 minute remaining', 'mal');
      } else if(r <= 300 && !w5){ w5 = true;
        avisa(mock ? '5 minutes left. When the time runs out, your test will be submitted automatically.'
                   : '5 minutes left. Check your answers and any flagged questions.', '5 minutes remaining', 'ojo');
      }
    }
    /* primera comprobación con un respiro: al reanudar, el motor aún está
       reponiendo respuestas cuando arranca el reloj */
    vigT = setTimeout(function(){ vigT = null; tick(); vig = setInterval(tick, 1000); }, 1500);
  }

  /* Entrega sin preguntas: la página de entrega del propio motor + su botón
     final, con NISUI_AUTO_SI (el mismo interruptor que usa el anticheat)
     para que NISUI.pregunta conteste «sí» sin mostrar el diálogo. */
  function entregaYa(){
    if(!inExam()) return;
    try{ if(window.NISUI && NISUI.cierra) NISUI.cierra(); }catch(e){}
    var prev = window.NISUI_AUTO_SI;
    window.NISUI_AUTO_SI = true;
    try{
      if(typeof window[CFG.open] === 'function') window[CFG.open]();
      var b = document.getElementById(CFG.fin); if(b) b.click();
    }catch(e){}
    window.NISUI_AUTO_SI = prev;
    try{ if(window.NISUI && NISUI.aviso) NISUI.aviso('⏰ Time is up. Your test has been submitted.', 'ojo', 7000); }catch(e){}
  }

  if(PAGE === 'reading' && typeof window.startTimer === 'function'){
    var oST = window.startTimer;
    window.startTimer = function(minutes, onExpire, elapsedSec){
      /* en mock el aviso del motor («puedes seguir») no aplica: entrega el vigía */
      var r = oST.call(this, minutes, isMock() ? function(){} : onExpire, elapsedSec);
      vigia(Date.now() + (minutes * 60 - Math.max(0, Math.floor(elapsedSec || 0))) * 1000);
      return r;
    };
  } else if(PAGE === 'writing' && typeof window.startTimer === 'function'){
    var oSTw = window.startTimer;
    window.startTimer = function(min){
      var r = oSTw.apply(this, arguments);
      var s = S(); vigia(((s && s.startTime) || Date.now()) + min * 60000);
      return r;
    };
  } else if(PAGE === 'listening' && typeof window.startListenTimer === 'function'){
    var oSL = window.startListenTimer;
    window.startListenTimer = function(minutes){
      var r = oSL.apply(this, arguments);
      var s = S(); vigia(((s && s.startTime) || Date.now()) + minutes * 60000);
      return r;
    };
  }
  ['stopTimer', 'stopListenTimer'].forEach(function(fn){
    if(typeof window[fn] !== 'function') return;
    var o = window[fn];
    window[fn] = function(){ paraVigia(); return o.apply(this, arguments); };
  });

  /* =========================================================
     2. Teclado: ← → = ◀ ▶ del pie, solo en el examen y fuera de campos.
     El divisor del texto hace preventDefault con las flechas: se respeta.
  ========================================================= */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if(e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if(!inExam()) return;
    var s = S(); if(s && s.submitOpen) return;
    var t = e.target;
    if(t && (t.isContentEditable || (t.closest && t.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),.col-divider,.gap-popup')))) return;
    if(document.querySelector('.nisui-ov')) return;          // hay un aviso abierto
    var b = document.querySelector(e.key === 'ArrowLeft' ? CFG.prev : CFG.next);
    if(!b || b.disabled) return;
    e.preventDefault();
    b.click();
  });

  /* =========================================================
     6. PDF: «NIS-…pdf» → «Cohasset-…pdf». Los tres motores llaman a
     html2pdf().set({filename}) con el nombre escrito dentro; se envuelve
     html2pdf (carga con defer, de ahí que se intente varias veces).
  ========================================================= */
  function pdfNombre(){
    var h = window.html2pdf; if(typeof h !== 'function' || h.__sd) return;
    var w = function(){
      var k = h.apply(this, arguments);
      if(k && typeof k.set === 'function'){
        var set = k.set;
        k.set = function(o){
          if(o && typeof o.filename === 'string') o = Object.assign({}, o, { filename: o.filename.replace(/^NIS-/, 'Cohasset-') });
          return set.call(this, o);
        };
      }
      return k;
    };
    for(var p in h){ try{ w[p] = h[p]; }catch(e){} }
    w.__sd = true;
    window.html2pdf = w;
  }
  document.addEventListener('DOMContentLoaded', pdfNombre);
  window.addEventListener('load', pdfNombre);
  document.addEventListener('click', pdfNombre, true);

  /* =========================================================
     Cada repintado de #app: cabecera/título en el examen; rótulos y ?test=
     en las listas. Solo hijos directos (childList): ni bucles con i18n ni
     coste por cada tecla.
  ========================================================= */
  function alPintar(){
    var ex = inExam();
    root.classList.toggle('sd-exam', ex);
    if(ex){ cabecera(); titulo(); return; }
    rotulos();
    if(pendTest) setTimeout(arrancaTest, 0);
  }
  try{ new MutationObserver(alPintar).observe(app, { childList:true }); }catch(e){}

  /* El arranque del motor es asíncrono (espera a la sesión), pero si ya pintó
     el selector de nivel antes de que cargara este archivo, se salta ahora. */
  (function yaPintado(){
    if(!pendLevel) return alPintar();
    var hayNiveles = app.querySelector('.grid4 .tile[data-l], .level-card, #levels .level');
    if(!hayNiveles) return alPintar();
    if(PAGE === 'listening') window.viewLevelSelect(); else window.go('level');
  })();
})();
