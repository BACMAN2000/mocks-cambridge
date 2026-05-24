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
        mock: (att.examType==='mock02' ? 'mock2' : att.examType==='practice' ? 'practice' : 'mock1'),
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
  window.NIS = { client: client, currentStudent: currentStudent, save: save };
})();
