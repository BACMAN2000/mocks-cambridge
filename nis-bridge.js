/* ===== Portal NIS bridge =====
   When a student is logged into Portal NIS (same origin → shared Supabase
   session), this saves each finished exam attempt into the `exam_attempts`
   table under that student's account. If nobody is logged in, it silently
   does nothing (the app keeps working standalone). */
(function(){
  var URL = "https://kjrppibltkbflvxmiyib.supabase.co";
  var KEY = "sb_publishable_HINNpxCDLvwXIlecuhKGcw_LDGamS-Z";
  var _sb = null;
  function client(){
    if(_sb) return _sb;
    if(!window.supabase) return null;
    _sb = window.supabase.createClient(URL, KEY); // default storageKey shares portal session
    return _sb;
  }
  async function currentStudent(){
    var c = client(); if(!c) return null;
    try{
      var u = await c.auth.getUser();
      if(!u || !u.data || !u.data.user) return null;
      var prof = await c.from('profiles').select('id,full_name,first_name,email,grade_id,cefr_level,grades(name)').eq('id',u.data.user.id).maybeSingle();
      var p = prof && prof.data ? prof.data : {};
      return { uid:u.data.user.id, email:u.data.user.email, full_name:p.full_name, first_name:p.first_name,
               grade:(p.grades&&p.grades.name)||'', cefr_level:p.cefr_level||'' };
    }catch(e){ return null; }
  }
  async function save(att){
    var c = client(); if(!c) return {skipped:true};
    try{
      var u = await c.auth.getUser();
      if(!u || !u.data || !u.data.user) return {skipped:true};
      var pct = att.percent;
      if(pct==null && att.score!=null && att.total){ pct = Math.round(att.score/att.total*100); }
      var row = {
        student_id: u.data.user.id,
        skill: att.skill,
        level: att.level,
        mock: ((att.examType && att.examType.indexOf('practice')===0) ? 'practice'
               : (att.examType && /^mock0?(\d+)$/.test(att.examType)) ? ('mock' + att.examType.match(/^mock0?(\d+)$/)[1])
               : 'mock1'),
        score: (att.score!=null?att.score:null),
        total: (att.total!=null?att.total:null),
        percent: (pct!=null?pct:null),
        duration_min: (att.duration_min!=null?att.duration_min:null),
        breakdown: att.breakdown||null,
        answers: att.answers||null
      };
      if(!['Reading','Listening','Writing'].includes(row.skill)) return {skipped:true};
      if(!['A2','B1','B2','C1'].includes(row.level)) return {skipped:true};
      var res = await c.from('exam_attempts').insert(row);
      return res;
    }catch(e){ return {error:e}; }
  }
  /* Returns true if MOCKS are unlocked for the logged-in student's grade.
     Admins/teachers always get access (preview). Standalone / not-logged-in
     users get FALSE (mocks stay locked until the admin unlocks them). */
  async function mocksUnlocked(){
    var c = client(); if(!c) return false;
    try{
      var u = await c.auth.getUser();
      if(!u || !u.data || !u.data.user) return false;
      var prof = await c.from('profiles').select('grade_id,role').eq('id',u.data.user.id).maybeSingle();
      var p = prof && prof.data ? prof.data : null;
      if(!p) return false;
      if(p.role === 'admin' || p.role === 'teacher') return true;
      if(!p.grade_id) return false;
      var r = await c.from('mock_access').select('unlocked').eq('grade_id',p.grade_id).maybeSingle();
      return !!(r && r.data && r.data.unlocked);
    }catch(e){ return false; }
  }
  /* Returns true if PRACTICE TESTS are unlocked for the student's grade.
     Unlike mocks, practices are OPEN BY DEFAULT (fail-open): standalone users,
     missing rows and network errors all resolve to TRUE. A teacher/admin can
     lock them per grade from the NIS Portal (practice_access.unlocked=false). */
  async function practiceUnlocked(){
    var c = client(); if(!c) return true;
    try{
      var u = await c.auth.getUser();
      if(!u || !u.data || !u.data.user) return true;
      var prof = await c.from('profiles').select('grade_id,role').eq('id',u.data.user.id).maybeSingle();
      var p = prof && prof.data ? prof.data : null;
      if(!p) return true;
      if(p.role === 'admin' || p.role === 'teacher') return true;
      if(!p.grade_id) return true;
      var r = await c.from('practice_access').select('unlocked').eq('grade_id',p.grade_id).maybeSingle();
      if(!r || !r.data) return true;           // sin fila ⇒ abierto (default)
      return !!r.data.unlocked;
    }catch(e){ return true; }
  }
  async function signOut(){
    var c = client(); if(!c) return;
    try{ await c.auth.signOut(); }catch(e){}
    try{ localStorage.clear(); }catch(e){}
  }
  window.NIS = { client: client, currentStudent: currentStudent, save: save, mocksUnlocked: mocksUnlocked, practiceUnlocked: practiceUnlocked, signOut: signOut };
})();

/* ===== Volver a donde se venia =====
   El portal enlaza a estas apps con ?back=./#ruta (contando desde su raiz).
   Aqui, una carpeta mas abajo, eso es ../#ruta. Se recuerda en sessionStorage
   para que el "Back" de las tres apps y el "NIS Portal" del indice devuelvan
   al alumno a la vista de la que salio (Practice, Mocks, Cambridge...) y no al
   inicio del portal, que le obligaba a rehacer todo el camino. */
(function(){
  var CLAVE = 'mocks-back';
  function seguro(u){ return !!u && !/^[a-z][a-z0-9+.\-]*:/i.test(u) && u.slice(0,2) !== '//'; }
  var back = null;
  try{
    var q = new URLSearchParams(location.search).get('back');
    if(seguro(q)){
      back = q.slice(0,2) === './' ? '../' + q.slice(2) : (q.charAt(0) === '#' ? '../' + q : q);
      sessionStorage.setItem(CLAVE, back);
    } else back = sessionStorage.getItem(CLAVE);
  }catch(_){ back = null; }
  if(!seguro(back)) return;
  function arregla(){
    var as = document.querySelectorAll('a[href="/"], a[href="./"], a[href="../"], a[href="index.html"]');
    for(var i=0;i<as.length;i++){ if(as[i].getAttribute('data-back-ok')) continue; as[i].setAttribute('href', back); as[i].setAttribute('data-back-ok','1'); }
  }
  function listo(){ arregla(); try{ new MutationObserver(arregla).observe(document.body, {childList:true, subtree:true}); }catch(_){ } }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
  window.NIS_MOCKS_BACK = back;
})();

/* ===== MOCK MODE (18-sep-2026) =====
   Con ?official=1 en la URL (asi abre el portal la tarjeta del mock) la RUTA
   es cerrada: un velo tapa el motor hasta que el examen arranca solo (nivel y
   mock los confirman las tablas mock_individual / mock_official + mock_access,
   la URL solo trae una pista), y toda salida —Exit, «Back to the Portal»,
   «Change level», el logo, «All quizzes»— vuelve al portal, nunca a las
   tarjetas de nivel/categoria/mocks del motor. Ese dia el candado solo deja
   pasar ese mock en ese nivel. Ademas, el alumno ya no ve la tarjeta MOCKS
   bloqueada del motor ni la seccion MOCKS de quizzes.html: son del staff.
   PANTALLA COMPLETA (19-sep-2026): el examen arranca desde un boton del velo
   (hace falta un gesto del alumno) y entra en pantalla completa; en Chrome/
   Edge de escritorio ademas se bloquean Esc, Alt+Tab y la tecla Windows
   (Keyboard Lock). Si el alumno sale de pantalla completa, un aviso tapa el
   examen hasta que vuelve; cada salida y cada cambio de pestaña se cuenta y
   viaja en breakdown.mock_mode del intento. Ninguna web puede IMPEDIR
   minimizar o cambiar de app: eso es Acceso Guiado (iPad) o Chrome en modo
   kiosco. En iPhone no hay pantalla completa: el examen arranca igual.
   NOTA: los tres motores declaran `const state` (lexico global, NO propiedad
   de window): se resuelve por identificador en el momento de la llamada. */
(function(){
  var LEVELS = ['A2','B1','B2','C1'];
  var LEVEL_NAMES = { A2:'A2 Key', B1:'B1 Preliminary', B2:'B2 First', C1:'C1 Advanced' };
  function qs(k){ try{ return new URLSearchParams(location.search).get(k); }catch(e){ return null; } }
  var OFFICIAL_URL = qs('official') === '1';
  function page(){
    return /listening-quiz/.test(location.pathname) ? 'Listening'
         : /writing-quiz/.test(location.pathname) ? 'Writing'
         : /reading-quiz/.test(location.pathname) ? 'Reading' : '';
  }
  function S(){ try{ return (typeof state !== 'undefined') ? state : (window.state || null); }catch(e){ return window.state || null; } }
  function backToPortal(){ exitFs(); window.location.href = window.NIS_MOCKS_BACK || '../'; }
  window.nisBackToPortal = backToPortal;

  /* ---- pantalla completa ---- */
  var FS_EL = document.documentElement;
  var _fsExits = 0, _tabSwitches = 0, _examOn = false, _examDone = false, _kbLock = false;
  // En iPad/iPhone NO se usa la Fullscreen API: Safari sale de pantalla
  // completa en cuanto un campo recibe el foco (el motor enfoca la pregunta al
  // pulsar su numero o las flechas, y el Writing es un textarea), asi que el
  // aviso de pausa saltaba a cada toque (19-sep-2026). Ahi la pantalla
  // completa es la web app en la pantalla de inicio + Acceso Guiado.
  var IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function fsSupported(){ return !IOS && !!(FS_EL.requestFullscreen || FS_EL.webkitRequestFullscreen); }
  function isFs(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  var _fsError = '';
  function fsPide(el){
    if(el.requestFullscreen) return el.requestFullscreen({ navigationUI:'hide' });
    if(el.webkitRequestFullscreen){ el.webkitRequestFullscreen(); return Promise.resolve(); }
    return Promise.reject(new Error('no API'));
  }
  function enterFs(){
    _fsError = '';
    if(!fsSupported()) return;
    // Primero el <body>; si falla, el <html>. En el iPad hay WebKits que no
    // aceptan la raiz. Y se dice por que no entro, para poder diagnosticarlo
    // desde el propio aparato (19-sep-2026: «no se ve pantalla completa»).
    var p;
    try{ p = fsPide(document.body); }catch(e){ p = Promise.reject(e); }
    p.catch(function(e1){
      var q; try{ q = fsPide(FS_EL); }catch(e){ q = Promise.reject(e); }
      return q.catch(function(e2){ _fsError = (e2 && (e2.name + ': ' + e2.message)) || String(e2); });
    }).then(function(){
      setTimeout(function(){
        if(isFs() || !fsSupported()) return;
        var m = 'Full screen not available here' + (_fsError ? ' (' + _fsError + ')' : '') + ' · ' + navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 90);
        if(window.NISUI && NISUI.aviso) NISUI.aviso(m, 'warn', 9000);
      }, 800);
    });
    // Chrome/Edge de escritorio: captura Esc, Alt+Tab y la tecla Windows mientras dure la pantalla completa.
    try{ if(navigator.keyboard && navigator.keyboard.lock){ navigator.keyboard.lock().then(function(){ _kbLock = true; }).catch(function(){}); } }catch(e){}
  }
  function exitFs(){
    try{ if(navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock(); }catch(e){}
    try{ if(isFs()){ if(document.exitFullscreen) document.exitFullscreen(); else if(document.webkitExitFullscreen) document.webkitExitFullscreen(); } }catch(e){}
  }
  function examFinished(){ if(_examDone) return; _examDone = true; _examOn = false; var pz = document.getElementById('nisFsPause'); if(pz) pz.remove(); exitFs(); }
  /* Se salio de pantalla completa con el examen en marcha: se tapa hasta que vuelva. */
  function pausa(){
    if(document.getElementById('nisFsPause')) return;
    var v = document.createElement('div'); v.id = 'nisFsPause'; v.setAttribute('data-i18n', 'off');
    v.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;'
      + 'background:rgba(15,23,42,.96);color:#fff;font-family:"DM Sans",Montserrat,system-ui,sans-serif;text-align:center;padding:24px';
    v.innerHTML = '<div style="font-size:2.4rem">⏸️</div>'
      + '<div style="font-weight:800;font-size:1.3rem">You left full screen — the exam is paused</div>'
      + '<div style="max-width:52ch;opacity:.85">The timer keeps running. Go back to full screen to continue. Every exit is recorded for your teacher (' + _fsExits + ' so far).</div>'
      + '<button type="button" id="nisFsBack" style="margin-top:6px;background:#fff;color:#244c77;-webkit-text-fill-color:#244c77;-webkit-appearance:none;appearance:none;border:none;border-radius:10px;padding:12px 22px;font-weight:800;font-size:1rem;cursor:pointer;font-family:inherit">⛶ Return to full screen and continue</button>';
    document.body.appendChild(v);
    // Si el navegador no concede la pantalla completa, el aviso se quita igual:
    // la salida ya quedo contada y un alumno atrapado seria peor que un alumno sin pantalla completa.
    document.getElementById('nisFsBack').onclick = function(){ enterFs(); setTimeout(function(){ v.remove(); }, 600); };
  }
  var _pausaTimer = null;
  function onFsChange(){
    if(!_examOn || _examDone || !fsSupported()) return;
    if(!isFs()){
      // Con carencia: una salida momentanea (el navegador recoloca, un foco)
      // no es «se fue del examen». Solo si sigue fuera 1,5 s despues.
      if(_pausaTimer) return;
      _pausaTimer = setTimeout(function(){ _pausaTimer = null; if(_examOn && !_examDone && !isFs()){ _fsExits++; pausa(); } }, 1500);
    } else {
      if(_pausaTimer){ clearTimeout(_pausaTimer); _pausaTimer = null; }
      var pz = document.getElementById('nisFsPause'); if(pz) pz.remove();
    }
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  document.addEventListener('visibilitychange', function(){ if(_examOn && !_examDone && document.hidden) _tabSwitches++; });
  /* Lo que el alumno hizo con la pantalla viaja con el intento (breakdown.mock_mode).
     Y en mock mode el guardado se sigue desde aqui (_saveState) para que el velo
     de «entregado» diga la verdad: guardado, o NO guardado y por que. */
  var _save = NIS.save, _saveState = 'saving', _saveWhy = '', _lastAtt = null;
  function _saveDone(res){
    if(res && res.skipped){ _saveState = 'error'; _saveWhy = 'not signed in to the Portal'; }
    else if(res && res.error){ _saveState = 'error'; _saveWhy = (res.error.message || String(res.error)); }
    else { _saveState = 'saved'; _saveWhy = ''; }
    paintDone();
  }
  NIS.save = function(att){
    if(_off && att){
      att.breakdown = Object.assign({}, att.breakdown || {}, { mock_mode: { mode:_off.mode, fullscreen_exits:_fsExits, tab_switches:_tabSwitches, fullscreen_supported:fsSupported(), fullscreen_error:_fsError || null, keyboard_lock:_kbLock, ua:navigator.userAgent.slice(0,120) } });
      _lastAtt = att; _saveState = 'saving'; paintDone();
      return Promise.resolve().then(function(){ return _save.call(NIS, att); })
        .then(function(res){ _saveDone(res); return res; }, function(e){ _saveDone({error:e}); return {error:e}; });
    }
    return _save.apply(this, arguments);
  };
  window.nisSaveAgain = function(){ if(_lastAtt) NIS.save(_lastAtt); };

  /* ===== ENTREGADO, SIN RESULTADO (21-sep-2026) =====
     En mock mode el alumno no ve su puntaje ni recibe correo al entregar: los
     resultados salen en UN solo informe cuando los profesores terminan de
     corregir los Writings (pedido de Paolo para el Official Mock 2). El motor
     sigue pintando su pantalla de resultado (ahi es donde guarda el intento),
     pero un velo la tapa con «entregado» + el estado del guardado, y los dos
     envios al Apps Script (que manda correo al alumno) se anulan. */
  function quietWebhooks(){
    var nunca = function(){ return new Promise(function(){}); };   // no resuelve: el motor no escribe «✓ sent» ni «⚠ error»
    try{ window.sendResultToWebhook = nunca; }catch(e){}
    try{ window.enviaWebhook = nunca; }catch(e){}
  }
  var _doneShown = false;
  function paintDone(){
    if(!_doneShown) return;
    var st = document.getElementById('nisDoneStatus'); if(!st) return;
    if(_saveState === 'saved'){
      st.innerHTML = '<div style="font-weight:800;color:#bbf7d0">✓ Saved to your account.</div><div style="opacity:.9;margin-top:4px">Your teachers will mark it. You will receive one report with all your results.</div>';
    } else if(_saveState === 'error'){
      st.innerHTML = '<div style="font-weight:800;color:#fecaca">⚠ NOT saved: ' + String(_saveWhy).replace(/</g,'&lt;') + '</div>'
        + '<div style="opacity:.9;margin-top:4px">Raise your hand and tell the invigilator. Do not close this page.</div>'
        + '<button type="button" onclick="nisSaveAgain()" style="margin-top:10px;background:#fff;color:#244c77;-webkit-text-fill-color:#244c77;-webkit-appearance:none;appearance:none;border:none;border-radius:10px;padding:10px 18px;font-weight:800;font-size:.95rem;cursor:pointer;font-family:inherit">↻ Try to save again</button>';
    } else {
      st.innerHTML = '<div style="opacity:.9">Saving to your account…</div>';
    }
  }
  function doneVeil(){
    if(!_off) return;
    _doneShown = true;
    var v = veil('', false);
    v.innerHTML = '<div style="font-size:3rem">✅</div>'
      + '<div style="font-weight:800;font-size:1.7rem">Paper submitted</div>'
      + '<div style="font-size:1.05rem;opacity:.95">' + page() + ' · ' + (_off.level ? LEVEL_NAMES[_off.level] + ' · ' : '') + mockLabel(_off) + '</div>'
      + '<div id="nisDoneStatus" style="max-width:52ch;font-size:.98rem;margin-top:4px"></div>'
      + '<button type="button" onclick="nisBackToPortal()" style="margin-top:10px;background:#fff;color:#244c77;-webkit-text-fill-color:#244c77;-webkit-appearance:none;appearance:none;border:none;border-radius:12px;padding:14px 26px;font-weight:800;font-size:1.05rem;cursor:pointer;font-family:inherit">🏫 Back to the Portal</button>'
      + '<style>@keyframes nisVeilSpin{to{transform:rotate(360deg)}}</style>';
    paintDone();
  }
  /* El velo de arranque: un boton, porque la pantalla completa exige un gesto. */
  function veilStart(o){
    window.__nisVeilFinal = true;   // que el «Preparing…» de DOMContentLoaded no pise el boton si llega despues (conexion rapida)
    var pg = page();
    var v = veil('', false);
    v.innerHTML = '<div style="font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);padding:5px 12px;border-radius:999px">🎓 ' + (o.mode === 'individual' ? 'Individual mock' : 'Official mock') + '</div>'
      + '<div style="font-weight:800;font-size:1.7rem">' + (o.level ? LEVEL_NAMES[o.level] + ' · ' : '') + mockLabel(o) + '</div>'
      + '<div style="font-size:1.05rem;opacity:.95">' + pg + '</div>'
      + '<div style="max-width:52ch;opacity:.85;font-size:.95rem">' + (fsSupported() ? 'The exam opens in full screen. Stay in it until you submit: leaving it pauses the exam and is recorded for your teacher.' : (IOS ? 'Stay in the exam until you submit: leaving the app is recorded for your teacher. For full screen on iPad, open the Portal from its Home Screen icon.' : 'Stay on this page until you submit: leaving it is recorded for your teacher.')) + '</div>'
      + '<button type="button" id="nisFsStart" style="margin-top:8px;background:#fff;color:#244c77;-webkit-text-fill-color:#244c77;-webkit-appearance:none;appearance:none;border:none;border-radius:12px;padding:14px 26px;font-weight:800;font-size:1.05rem;cursor:pointer;font-family:inherit">▶ ' + (fsSupported() ? 'Start in full screen' : 'Start') + '</button>'
      + '<div style="position:absolute;bottom:10px;right:14px;font-size:.7rem;opacity:.55">v ' + (qs('v') || '?') + (IOS ? ' · iPad' : '') + '</div>'
      + '<style>@keyframes nisVeilSpin{to{transform:rotate(360deg)}}</style>';
    document.getElementById('nisFsStart').onclick = function(){ enterFs(); startOfficial(); };
  }

  /* ---- el velo ---- */
  function veil(texto, boton){
    if(boton) window.__nisVeilFinal = true;   // mensaje final: que el «Preparing…» tardio no lo pise
    var v = document.getElementById('nisOfficialVeil');
    if(!v){
      v = document.createElement('div'); v.id = 'nisOfficialVeil';
      v.setAttribute('data-i18n', 'off');   // las instrucciones del mock van en ingles aunque el alumno tenga el portal en espanol
      v.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;'
        + 'background:linear-gradient(135deg,#244c77,#4987c6 55%,#6d4fc2);color:#fff;font-family:"DM Sans",Montserrat,system-ui,sans-serif;text-align:center;padding:24px';
      (document.body || document.documentElement).appendChild(v);
    }
    v.innerHTML = '<div style="width:46px;height:46px;border:4px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:nisVeilSpin .8s linear infinite' + (boton ? ';display:none' : '') + '"></div>'
      + '<div style="font-weight:800;font-size:1.25rem">' + texto + '</div>'
      + (boton ? '<button type="button" onclick="nisBackToPortal()" style="margin-top:6px;background:#fff;color:#244c77;-webkit-text-fill-color:#244c77;-webkit-appearance:none;appearance:none;border:none;border-radius:10px;padding:11px 20px;font-weight:800;font-size:.95rem;cursor:pointer;font-family:inherit">🏫 Back to the Portal</button>' : '')
      + '<style>@keyframes nisVeilSpin{to{transform:rotate(360deg)}}</style>';
    return v;
  }
  function unveil(){ var v = document.getElementById('nisOfficialVeil'); if(v) v.remove(); }
  if(OFFICIAL_URL){
    if(document.body) veil('Preparing your mock…'); else document.addEventListener('DOMContentLoaded', function(){ if(!window.__nisOfficialStarted && !window.__nisVeilFinal) veil('Preparing your mock…'); });
  }

  /* ---- que le toca hoy al alumno ---- */
  var _off = null, _offPromise = null, _role = '';
  async function resolveOfficial(){
    var c = window.NIS && NIS.client(); if(!c) return null;
    try{
      var u = await c.auth.getUser(); if(!u || !u.data || !u.data.user) return null;
      var uid = u.data.user.id;
      var prof = (await c.from('profiles').select('role,grade_id,cefr_level').eq('id',uid).maybeSingle()).data;
      if(!prof) return null;
      _role = prof.role || '';
      if(prof.role !== 'student') return null;
      var mode = null, mock = null, fijo = null, shown = null;
      var ind = (await c.from('mock_individual').select('mock,level').eq('student_id',uid).maybeSingle()).data;
      if(ind && ind.mock){ mode = 'individual'; mock = ind.mock; shown = mock; fijo = ind.level || null; }
      else {
        var off = (await c.from('mock_official').select('mock,shown_as').eq('id',1).maybeSingle()).data;
        var acc = prof.grade_id != null ? (await c.from('mock_access').select('unlocked').eq('grade_id',prof.grade_id).maybeSingle()).data : null;
        if(off && off.mock && acc && acc.unlocked){ mode = 'official'; mock = off.mock; shown = off.shown_as || mock; }
      }
      if(!mode) return null;
      var cefr = String(prof.cefr_level || '').toUpperCase();
      var levels = fijo ? [fijo] : (LEVELS.indexOf(cefr) >= 0 ? [cefr] : LEVELS.slice());
      // Si ya entrego un paper de este mock hoy, el nivel es ese: no se cambia
      // de nivel a mitad de mock aunque la URL traiga otro.
      if(levels.length > 1){
        var hoy = new Date(Date.now() - 5*3600e3).toISOString().slice(0,10) + 'T05:00:00.000Z';
        var hechos = (await c.from('exam_attempts').select('level').eq('student_id', uid).eq('mock', 'mock' + mock).gte('submitted_at', hoy)).data || [];
        var ya = hechos.map(function(a){ return String(a.level || '').toUpperCase(); }).filter(function(l){ return levels.indexOf(l) >= 0; })[0];
        if(ya) levels = [ya];
      }
      var hint = (qs('level') || '').toUpperCase();
      var level = levels.length === 1 ? levels[0] : (levels.indexOf(hint) >= 0 ? hint : null);
      return { mode: mode, mock: mock, shown: shown, examType: 'mock0' + mock, level: level, levels: levels };
    }catch(e){ return null; }
  }
  /* Lo que lee el alumno: OFFICIAL MOCK n con n = mock_official.shown_as (el
     ordinal del colegio, no el numero del banco: 21-sep-2026 se rinde el MOCK 3
     del banco y es su segundo mock). El motor sigue con examType mock0N. */
  function mockLabel(o){ return (o.mode === 'individual' ? 'INDIVIDUAL MOCK ' : 'OFFICIAL MOCK ') + (o.shown || o.mock); }
  function official(){ if(!_offPromise) _offPromise = resolveOfficial().then(function(o){ _off = o; applyStudentCss(); return o; }); return _offPromise; }
  window.NIS.official = official;

  /* Mock mode manda sobre los candados de siempre: el mock si, la practica no. */
  var _mu = NIS.mocksUnlocked, _pu = NIS.practiceUnlocked, _cs = NIS.currentStudent;
  NIS.mocksUnlocked = async function(){ var o = await official(); return o ? true : _mu.apply(this, arguments); };
  NIS.practiceUnlocked = async function(){ var o = await official(); return o ? false : _pu.apply(this, arguments); };
  /* El motor llama a currentStudent() y acto seguido a go('level'): con
     ?official=1 se espera aqui a saber el mock y se arranca justo despues. */
  NIS.currentStudent = async function(){
    var s = await _cs.apply(this, arguments);
    if(OFFICIAL_URL && !window.__nisOfficialStarted){
      try{
        var o = await official();
        if(o) setTimeout(function(){ if(!o.level){ veil('Choose your level on the Portal first.', true); return; } veilStart(o); }, 0);
        else setTimeout(function(){ veil('You have no mock active today.', true); }, 0);
      }catch(e){ setTimeout(function(){ veil('Could not check your mock. Go back to the Portal and try again.', true); }, 0); }
    }
    return s;
  };

  function startOfficial(){
    if(window.__nisOfficialStarted) return;
    var o = _off; if(!o) return;
    var pg = page();
    if(!o.level){ veil('Choose your level on the Portal first.', true); return; }
    if((o.level === 'A2' && pg === 'Writing') || !pg){ veil('Your mock has no ' + pg + ' paper.', true); return; }
    var st = S(); if(!st){ setTimeout(startOfficial, 200); return; }
    window.__nisOfficialStarted = true;
    _examOn = true;
    quietWebhooks();
    lockExits();
    st.level = o.level;
    if(pg === 'Reading'){
      st.skill = 'Reading'; st.examType = o.examType; st.answers = {}; st._tabSwitches = 0;
      if(typeof window.go === 'function') window.go('exam');
    } else if(pg === 'Writing'){
      if(typeof window._pickExam === 'function') window._pickExam(o.examType);
      else { st.examType = o.examType; if(typeof window.go === 'function') window.go('exam'); }
    } else if(pg === 'Listening'){
      st.examType = o.examType; st.startTime = Date.now(); st.answers = {}; st.seqOrder = {};
      if(typeof window.viewQuiz === 'function') window.viewQuiz();
    }
    setTimeout(unveil, 150);
  }

  /* ---- el candado por test (solo en mock mode): ese mock, en ese nivel ---- */
  function allowedSync(examType){
    if(!_off) return true;
    var st = S();
    return examType === _off.examType && (!st || !st.level || st.level === _off.level);
  }
  function lockMsg(){
    var m = _off ? ('🔒 Today you only sit your ' + (_off.mode === 'individual' ? 'individual mock' : 'official mock') + ': ' + (_off.level ? LEVEL_NAMES[_off.level] + ' · ' : '') + mockLabel(_off) + '.') : '🔒 Locked.';
    if(window.NISUI && NISUI.avisa) NISUI.avisa(m, {titulo:'Mock mode'}); else alert(m);
  }
  function wrapGates(){
    if(typeof window.go === 'function' && !window.go.__nisGate){
      var _go = window.go;
      var w = function(s){ var st = S(); if(s === 'exam' && st && st.examType && !allowedSync(st.examType)){ lockMsg(); return; } return _go.apply(this, arguments); };
      w.__nisGate = true; window.go = w;
    }
    if(typeof window.viewQuiz === 'function' && !window.viewQuiz.__nisGate){
      var _vq = window.viewQuiz;
      var wv = function(){ var st = S(); if(st && st.examType && !allowedSync(st.examType)){ lockMsg(); return; } return _vq.apply(this, arguments); };
      wv.__nisGate = true; window.viewQuiz = wv;
    }
  }

  /* ---- la salida, una sola: al portal ---- */
  var EXIT_SCREENS = { level:1, category:1, examPick:1, practicePick:1, welcome:1, login:1, skill:1 };
  function lockExits(){
    if(window.__nisExitsLocked) return;
    window.__nisExitsLocked = true;
    var css = document.createElement('style');
    css.textContent = 'button.ghost[onclick="go(\'category\')"],button.ghost[onclick="go(\'level\')"],button.btn.ghost[onclick="go(\'level\')"],'
      + '#lAgain,a.link[href="quizzes.html"],a.btn.secondary[href="quizzes.html"],a.link[href="listening-quiz.html"]{display:none!important}'
      + '#sendStatus,#lSendStatus,#sendEmailBtn,#lSendEmail,#sendEmail{display:none!important}'
      + 'a.brand{pointer-events:none}';
    document.head.appendChild(css);
    document.addEventListener('click', function(ev){
      var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
      if(!a || a.target === '_blank') return;
      var h = a.getAttribute('href') || '';
      if(h === '/' || h === './' || h === '../' || /^(\.\.\/)?#/.test(h) || /^(\.\.\/)?(quizzes|reading-quiz|listening-quiz|writing-quiz)\.html/.test(h)){
        ev.preventDefault(); ev.stopPropagation(); backToPortal();
      }
    }, true);
    if(typeof window.go === 'function' && !window.go.__nisExit){
      var _go2 = window.go;
      // 'result': el motor pinta su pantalla de resultado (y ahi guarda el intento);
      // acto seguido se tapa con el velo de «entregado». Ver doneVeil().
      var w2 = function(s){ if(EXIT_SCREENS[s]){ backToPortal(); return; } if(s === 'result') examFinished(); var r = _go2.apply(this, arguments); if(s === 'result') doneVeil(); return r; };
      w2.__nisExit = true; w2.__nisGate = _go2.__nisGate; window.go = w2;
    }
    ['viewLevelSelect','viewCategory','viewExamPick','viewPracticePick','viewWelcome'].forEach(function(fn){
      if(typeof window[fn] === 'function' && !window[fn].__nisExit){ var w3 = function(){ backToPortal(); }; w3.__nisExit = true; window[fn] = w3; }
    });
    if(typeof window._pickLevel === 'function') window._pickLevel = function(){ backToPortal(); };
    if(typeof window.viewResult === 'function' && !window.viewResult.__nisExit){
      var _vr = window.viewResult; var w4 = function(){ examFinished(); var r = _vr.apply(this, arguments); doneVeil(); return r; }; w4.__nisExit = true; window.viewResult = w4;
    }
  }

  /* ---- lo que el alumno no debe ver: la tarjeta MOCKS bloqueada del motor
     (reading/listening: #catMocks con opacity inline cuando esta cerrada;
     writing: la card cuyo onclick es _mockLocked) y la seccion MOCKS de
     quizzes.html. En mock mode se esconde la de PRACTICE, que ese dia es la
     cerrada. ---- */
  function applyStudentCss(){
    var staff = _role === 'admin' || _role === 'teacher';
    var css = '';
    if(!staff){
      css += '#catMocks[style*="opacity"],.card[onclick="window._mockLocked()"]{display:none!important}';
      if(_off) css += '#catPractice[style*="opacity"],.card[onclick="window._practiceLocked()"]{display:none!important}';
    }
    var el = document.getElementById('nisStudentCss');
    if(!el){ el = document.createElement('style'); el.id = 'nisStudentCss'; document.head.appendChild(el); }
    el.textContent = css;
    var sec = document.getElementById('mocksSection'); if(sec) sec.hidden = !(staff || _off);
    var pr = document.getElementById('practiceSection'); if(pr && _off) pr.hidden = true;
    var ban = document.getElementById('officialBanner');
    if(ban && _off){ ban.hidden = false; ban.setAttribute('data-i18n', 'off'); ban.textContent = '🎓 Today you sit your ' + (_off.mode === 'individual' ? 'individual' : 'official') + ' mock: ' + (_off.level ? LEVEL_NAMES[_off.level] + ' · ' : '') + mockLabel(_off) + '. It is the only thing open.'; }
  }
  function boot(){ wrapGates(); official(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(wrapGates, 400); setTimeout(wrapGates, 1500);
})();
