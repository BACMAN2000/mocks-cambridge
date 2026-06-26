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
