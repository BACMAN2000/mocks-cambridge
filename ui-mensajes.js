/* ===== Mensajes de la plataforma =====

   Sustituye los cuadros del navegador —el recuadro gris/negro del sistema, que
   en Windows sale con el tema oscuro y desencaja con la pagina— por avisos
   propios, con la tipografia, los colores y los bordes del resto de la app.

   Ademas resuelve un problema de fondo: al entregar un examen no habia ninguna
   confirmacion de que el intento se hubiera guardado en la cuenta del alumno.
   `NISUI.entregado()` la da, y dice la verdad cuando el guardado falla.

       NISUI.avisa(texto, {titulo, tono})        -> Promise
       NISUI.pregunta(texto, {titulo, si, no})   -> Promise<boolean>
       NISUI.entregado(estado, {detalle})        -> Promise
       NISUI.aviso(texto, tono)                  -> franja breve, no bloquea

   `tono`: 'info' (por defecto) · 'bien' · 'ojo' · 'mal'

   window.alert queda redirigido aqui, asi que las llamadas que ya existian
   salen con el formato nuevo sin tocarlas. window.confirm NO se toca: el
   nativo es sincrono y un modal no puede serlo sin mentir sobre lo que
   devuelve; esas llamadas se reescriben a NISUI.pregunta() con await.        */

(function () {
  'use strict';
  if (window.NISUI) return;

  var CSS = [
    '.nisui-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;',
    '  padding:20px;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);',
    '  animation:nisui-fade .16s ease-out}',
    '@keyframes nisui-fade{from{opacity:0}to{opacity:1}}',
    '@keyframes nisui-pop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}',
    '.nisui-card{width:min(460px,100%);background:var(--card,var(--white,#fff));color:var(--text,var(--ink,#0f172a));',
    '  border-radius:16px;padding:26px 26px 22px;box-shadow:0 18px 50px rgba(15,23,42,.28);',
    '  font-family:"Gotham","Montserrat","Segoe UI",system-ui,sans-serif;line-height:1.55;text-align:center;',
    '  animation:nisui-pop .18s ease-out;border-top:5px solid var(--accent,var(--blue,#4987c6))}',
    '.nisui-card.bien{border-top-color:var(--good,#16a34a)}',
    '.nisui-card.ojo{border-top-color:#d97706}',
    '.nisui-card.mal{border-top-color:var(--bad,#ef4444)}',
    '.nisui-ic{font-size:2.1rem;line-height:1;margin-bottom:10px}',
    '.nisui-t{font-size:1.15rem;font-weight:700;margin-bottom:8px;color:var(--accent2,var(--blue-d,#2d5a8d))}',
    '.nisui-card.bien .nisui-t{color:var(--good,#16a34a)}',
    '.nisui-card.mal .nisui-t{color:var(--bad,#ef4444)}',
    '.nisui-m{font-size:.98rem;white-space:pre-line;color:var(--text,var(--ink,#0f172a))}',
    '.nisui-m b{font-weight:700}',
    '.nisui-det{margin-top:12px;padding:10px 12px;border-radius:10px;background:var(--bg,#f8fafc);',
    '  border:1px solid var(--line,#e2e8f0);font-size:.86rem;color:var(--muted,#636465);text-align:left;white-space:pre-line}',
    '.nisui-btns{display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap}',
    '.nisui-b{cursor:pointer;border:none;border-radius:10px;padding:11px 22px;font-size:.95rem;font-weight:600;',
    '  font-family:inherit;background:var(--accent,var(--blue,#4987c6));color:#06283d;transition:transform .08s,opacity .15s}',
    '.nisui-b:hover{transform:translateY(-1px)}',
    '.nisui-b:focus-visible{outline:3px solid var(--soft,#d1d2ea);outline-offset:2px}',
    '.nisui-b.ghost{background:transparent;border:1px solid var(--line,#e2e8f0);color:var(--text,var(--ink,#0f172a))}',
    '.nisui-b.peligro{background:var(--bad,#ef4444);color:#fff}',
    '.nisui-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99999;',
    '  max-width:min(520px,92vw);padding:13px 20px;border-radius:12px;background:var(--card,var(--white,#fff));',
    '  color:var(--text,var(--ink,#0f172a));box-shadow:0 12px 34px rgba(15,23,42,.24);border-left:5px solid var(--accent,var(--blue,#4987c6));',
    '  font-family:"Gotham","Montserrat","Segoe UI",system-ui,sans-serif;font-size:.92rem;white-space:pre-line;',
    '  animation:nisui-pop .18s ease-out}',
    '.nisui-toast.bien{border-left-color:var(--good,#16a34a)}',
    '.nisui-toast.ojo{border-left-color:#d97706}',
    '.nisui-toast.mal{border-left-color:var(--bad,#ef4444)}',
    '@media (prefers-reduced-motion:reduce){.nisui-ov,.nisui-card,.nisui-toast{animation:none}}'
  ].join('\n');

  var ICONOS = { info: 'ℹ️', bien: '✅', ojo: '⚠️', mal: '⛔' };

  function estilos() {
    if (document.getElementById('nisui-css')) return;
    var s = document.createElement('style');
    s.id = 'nisui-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Los avisos que ya existian traen el titulo en la primera linea y a veces un
     emoji delante (🔒, ⚠). Se aprovecha: primera linea corta = titulo. */
  function parte(texto) {
    var t = String(texto == null ? '' : texto).trim();
    var lineas = t.split('\n');
    if (lineas.length > 1 && lineas[0].trim() && lineas[0].trim().length <= 72) {
      return { titulo: lineas[0].trim(), cuerpo: lineas.slice(1).join('\n').trim() };
    }
    return { titulo: '', cuerpo: t };
  }

  var abierto = null;

  function pinta(op) {
    estilos();
    cierra();
    var tono = op.tono || 'info';
    var ov = document.createElement('div');
    ov.className = 'nisui-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');

    var botones = (op.botones || []).map(function (b, i) {
      return '<button class="nisui-b' + (b.clase ? ' ' + b.clase : '') + '" data-i="' + i + '">' + esc(b.texto) + '</button>';
    }).join('');

    ov.innerHTML =
      '<div class="nisui-card ' + tono + '">' +
        '<div class="nisui-ic" aria-hidden="true">' + (op.icono || ICONOS[tono] || ICONOS.info) + '</div>' +
        (op.titulo ? '<div class="nisui-t">' + esc(op.titulo) + '</div>' : '') +
        '<div class="nisui-m">' + esc(op.mensaje) + '</div>' +
        (op.detalle ? '<div class="nisui-det">' + esc(op.detalle) + '</div>' : '') +
        '<div class="nisui-btns">' + botones + '</div>' +
      '</div>';
    document.body.appendChild(ov);
    abierto = ov;

    return new Promise(function (resolve) {
      function acaba(v) {
        document.removeEventListener('keydown', tecla, true);
        if (ov.parentNode) ov.remove();
        if (abierto === ov) abierto = null;
        resolve(v);
      }
      ov.querySelectorAll('.nisui-b').forEach(function (b) {
        b.addEventListener('click', function () { acaba(op.botones[+b.dataset.i].valor); });
      });
      function tecla(e) {
        if (e.key === 'Escape' && op.escapa !== false) { e.preventDefault(); acaba(op.valorEscape); }
        else if (e.key === 'Enter') {
          // Enter confirma solo si el foco no esta ya en un boton concreto
          if (document.activeElement && document.activeElement.classList.contains('nisui-b')) return;
          e.preventDefault();
          acaba(op.botones[op.botones.length - 1].valor);
        }
      }
      document.addEventListener('keydown', tecla, true);
      var foco = ov.querySelector('.nisui-b:last-child');
      if (foco) setTimeout(function () { foco.focus(); }, 30);
    });
  }

  function cierra() {
    if (abierto && abierto.parentNode) abierto.remove();
    abierto = null;
  }

  var NISUI = {
    avisa: function (mensaje, op) {
      op = op || {};
      var p = parte(mensaje);
      return pinta({
        mensaje: op.titulo ? mensaje : p.cuerpo,
        titulo: op.titulo || p.titulo,
        tono: op.tono || 'info',
        icono: op.icono,
        detalle: op.detalle,
        valorEscape: undefined,
        botones: [{ texto: op.cerrar || 'Entendido', valor: undefined }]
      });
    },

    pregunta: function (mensaje, op) {
      op = op || {};
      /* Entrega automatica: cuando el anticheat agota las vidas simula el clic
         en Submit y el examen tiene que salir sin preguntar nada. Antes eso lo
         resolvia envolviendo window.confirm para que devolviera true; con los
         avisos propios, la bandera hace ese papel. Sin esto el examen forzado
         se quedaria esperando a un alumno que ya no esta. */
      if (window.NISUI_AUTO_SI) return Promise.resolve(true);
      var p = parte(mensaje);
      return pinta({
        mensaje: op.titulo ? mensaje : p.cuerpo,
        titulo: op.titulo || p.titulo || '¿Confirmas?',
        tono: op.tono || 'ojo',
        icono: op.icono,
        detalle: op.detalle,
        escapa: true,
        valorEscape: false,
        botones: [
          { texto: op.no || 'Cancelar', valor: false, clase: 'ghost' },
          { texto: op.si || 'Continuar', valor: true, clase: op.peligro ? 'peligro' : '' }
        ]
      });
    },

    /* estado: 'guardado' | 'sin-sesion' | 'error'
       Un examen entregado y no guardado es peor que uno no entregado, porque el
       alumno se va convencido. Aqui se dice con todas las letras.

       El texto sigue al idioma de la pagina: los MOCKS y PRACTICE van enteros
       en ingles, y el resto del portal en espanol. */
    entregado: function (estado, op) {
      op = op || {};
      var en = (document.documentElement.lang || '').toLowerCase().indexOf('es') !== 0;
      var T = en ? {
        ok:   ['Submitted', 'Your exam has been submitted and saved to your account.\nYour teacher can already see it in the Portal.', 'See my result'],
        sin:  ['Finished, but not saved', 'You have finished the exam, but it has NOT been saved to any account because you are not signed in to the Portal.\nYour result is below: download the PDF if you need to hand it in.', 'See my result'],
        mal:  ['Could not be saved', 'You have finished the exam, but it could not be saved to your account.\nDownload the PDF and tell your teacher.', 'See my result'],
        motivo: 'Reason: '
      } : {
        ok:   ['Entregado', 'Tu examen ha quedado entregado y guardado en tu cuenta.\nTu profesor ya puede verlo desde el Portal.', 'Ver mi resultado'],
        sin:  ['Terminado, pero sin guardar', 'Has terminado el examen, pero NO se ha guardado en ninguna cuenta porque no has entrado al Portal.\nAbajo tienes tu resultado: descárgalo en PDF si necesitas entregarlo.', 'Ver mi resultado'],
        mal:  ['No se pudo guardar', 'Has terminado el examen, pero no se ha podido guardar en tu cuenta.\nDescarga el PDF y avisa a tu profesor.', 'Ver mi resultado'],
        motivo: 'Motivo: '
      };
      NISUI._motivo = T.motivo;
      var k = estado === 'guardado' ? 'ok' : (estado === 'sin-sesion' ? 'sin' : 'mal');
      var tono = k === 'ok' ? 'bien' : (k === 'sin' ? 'ojo' : 'mal');
      return NISUI.avisa(T[k][1], {
        titulo: T[k][0], tono: tono, icono: k === 'ok' ? '📩' : '📄',
        detalle: op.detalle, cerrar: T[k][2]
      });
    },

    /* Guarda el intento y avisa de como fue. El puente (nis-bridge.js en NIS,
       coh-bridge.js en Cohasset) expone los dos `window.NIS.save`, que devuelve
       {skipped:true} sin sesion, {error} si falla, y la respuesta en crudo si
       fue bien. */
    guardaIntento: function (fila, detalle) {
      if (!window.NIS || !window.NIS.save) {
        return NISUI.entregado('sin-sesion', { detalle: detalle });
      }
      return Promise.resolve()
        .then(function () { return window.NIS.save(fila); })
        .then(function (res) {
          if (res && res.skipped) return NISUI.entregado('sin-sesion', { detalle: detalle });
          if (res && res.error) {
            return NISUI.entregado('error', {
              detalle: (detalle ? detalle + '\n' : '') + (NISUI._motivo||'') + (res.error.message || res.error)
            });
          }
          return NISUI.entregado('guardado', { detalle: detalle });
        })
        .catch(function (e) {
          return NISUI.entregado('error', {
            detalle: (detalle ? detalle + '\n' : '') + (NISUI._motivo||'') + (e && e.message ? e.message : e)
          });
        });
    },

    aviso: function (mensaje, tono, ms) {
      estilos();
      var t = document.createElement('div');
      t.className = 'nisui-toast ' + (tono || 'info');
      t.setAttribute('role', 'status');
      t.textContent = mensaje;
      document.body.appendChild(t);
      setTimeout(function () { if (t.parentNode) t.remove(); }, ms || 4200);
      return t;
    },

    cierra: cierra
  };

  window.NISUI = NISUI;
  window.guardaIntento = NISUI.guardaIntento;

  /* Los alert() que quedan repartidos por la app salen ya con este formato.
     Se guarda el nativo por si hiciera falta depurar. */
  window._alertNativo = window.alert;
  window.alert = function (m) { NISUI.avisa(m); };
})();
