/* Marca del sitio para el motor de mocks (17-sep-2026). Los archivos
   compartidos (reading/listening/writing-quiz.app-data.js) son idénticos en
   nis.cohasset.pe, cohasset.pe y el repo standalone, y leen de aquí el logo,
   los colores y los textos que cambian de una web a otra. Cohasset define el
   suyo en coh-bridge.js. */
window.MOCKS_SITE = {
  teacherEmail: 'pbaca@nordic-school.edu.pe',
  schoolName: 'Nordic International School of Lima',
  classLabel: 'NIS English 2026',
  portalName: 'the NIS Portal',
  logo: 'nordic-logo-h.svg',
  logoAlt: 'Nordic',
  emailExample: 'maria.garcia@nordic-school.edu.pe',
  accent: '#4987c6',
  accent2: '#2d5a8d'
};

/* ---- una sola puerta de entrada -------------------------------------------
   El sitio se publica tambien en bacman2000.github.io/nis-portal/, y por ahi
   entraban alumnos: 10 personas distintas solo el 7-sep-2026. Al ser otro
   dominio el navegador les guarda una sesion aparte, asi que quien salta entre
   los dos se encuentra desconectado sin motivo aparente. Y el alumno no debe
   ver github.io ni bacman2000 en la barra (pedido del 13-ago-2026).

   Se manda a nis.cohasset.pe conservando pagina, parametros y ancla.
   replace() y no href: con href el boton Atras devuelve a github.io y rebota. */
(function () {
  if (location.hostname !== 'bacman2000.github.io') return;
  var base = '/nis-portal/';
  var ruta = location.pathname.indexOf(base) === 0
    ? location.pathname.slice(base.length)
    : location.pathname.replace(/^\/+/, '');
  location.replace('https://nis.cohasset.pe/' + ruta + location.search + location.hash);
})();

// Supabase connection for Portal NIS.
// The publishable (anon) key is safe to expose in the browser: Row Level
// Security policies on the database decide what each role can read/write.
window.NIS_CONFIG = {
  SUPABASE_URL: "https://kjrppibltkbflvxmiyib.supabase.co",
  SUPABASE_KEY: "sb_publishable_HINNpxCDLvwXIlecuhKGcw_LDGamS-Z",
  SCHOOL_NAME: "Nordic International School of Lima",
  // Endpoint público (Google Apps Script) que recibe los textos de Writing para
  // archivar. No es un secreto, pero se centraliza aquí en vez de hardcodearlo.
  WRITING_WEBHOOK: "https://script.google.com/macros/s/AKfycbzwn09Be0ZfKxGpwgkjLdp7nIs7awq8h7SVKkMlWN4EjekkOFqpLmnChzGHN_bB6kN-/exec"
};

/* ---- un solo cliente de Supabase por pestana -----------------------------
   El portal carga en la MISMA pagina app.js y anticheat.js, y cada uno llamaba
   por su cuenta a createClient(). Dos clientes con la misma clave de
   almacenamiento renuevan el token a la vez: el primero lo rota y el segundo
   manda el que acaba de caducar. Eso devuelve 400 «Invalid Refresh Token» y la
   libreria responde cerrando la sesion, asi que al alumno le sale que la sesion
   expiro y, al recargar, vuelve a pasar lo mismo. Visto en los registros del
   7-sep-2026: 13:09:26.946 -> 200 y 13:09:27.212 -> 400, mismo navegador.

   Aqui se memoriza createClient por URL+clave: quien lo pida recibe SIEMPRE la
   misma instancia, con lo que solo hay una renovacion en vuelo. Arregla de una
   vez las 266 paginas que crean cliente, sin tocarlas una por una.

   Si alguien pasa opciones propias (otra clave de almacenamiento, sin sesion
   persistente) se le da un cliente nuevo: ese quiere estar aparte a proposito y
   no compite por el mismo token. */
(function () {
  var cache = {};
  function compartir(lib) {
    if (!lib || typeof lib.createClient !== 'function' || lib.__nisCompartido) return lib;
    var original = lib.createClient.bind(lib);
    lib.createClient = function (url, key, opciones) {
      if (opciones) return original(url, key, opciones);
      var k = String(url) + '|' + String(key);
      if (!cache[k]) cache[k] = original(url, key);
      return cache[k];
    };
    lib.__nisCompartido = true;
    return lib;
  }
  // La libreria ya esta cargada (el caso normal: su <script> va antes que este).
  if (window.supabase) { compartir(window.supabase); return; }
  // Y si llega despues, se envuelve en cuanto se asigne.
  try {
    var pendiente;
    Object.defineProperty(window, 'supabase', {
      configurable: true,
      get: function () { return pendiente; },
      set: function (v) { pendiente = compartir(v); }
    });
  } catch (_) { /* si el navegador no deja, se queda como estaba */ }
})();
