/**
 * NIS English Quizzes — Google Apps Script Web App (doPost endpoint)
 * ------------------------------------------------------------------
 * Drop-in replacement for the existing "Reading Test" script. It keeps your
 * current columns and adds two things you asked for:
 *   1) an "Answers" column (every answer the student gave), and
 *   2) a separate "Writing" tab (full writing text + word count + a provisional
 *      auto-estimate you verify by hand).
 *
 * Tabs created automatically:
 *   • "Reading"   — score + stats (Strongest/Weakest/Verdict) + Answers
 *   • "Listening" — same layout (if you also paste this in the Listening sheet)
 *   • "Writing"   — one row per writing task
 *
 * Works with BOTH ways the quizzes send data:
 *   • Reading / Writing → fetch() JSON body  (e.postData.contents)
 *   • Listening         → hidden-form POST    (e.parameter.data)
 *
 * NOTE on tabs: your old data stays in the "Resultados" tab untouched. New
 * Reading submissions go to the new "Reading" tab (with the Answers column).
 * If you'd rather keep writing into "Resultados", change READING_TAB below to
 * "Resultados" (but then add an "Answers" header to that sheet yourself).
 *
 * DEPLOY: paste this over Código.gs → Save → Implementar (Deploy) →
 * Administrar implementaciones → edit the Web App → Nueva versión → Implementar.
 * Same /exec URL, so nothing changes in the quiz pages.
 */

var TEACHER_EMAIL = 'pbaca@nordic-school.edu.pe';  // '' to disable emails
var SCHOOL_NAME   = 'NIS English';
var SEND_EMAIL    = true;

var READING_TAB   = 'Reading';
var LISTENING_TAB = 'Listening';
var WRITING_TAB   = 'Writing';

function doGet() {
  return json_({ ok: true, service: 'NIS Quizzes endpoint' });
}

function doPost(e) {
  try {
    var data  = parseInput_(e);

    // Teacher-graded Writing result coming from the NIS portal → email the student.
    if (data.type === 'writing_result') {
      var em = data.studentEmail || '';
      if (em && /^\S+@\S+\.\S+$/.test(em)) {
        var pc = (data.percent != null && data.percent !== '') ? ('  (' + data.percent + '%)') : '';
        var body = 'Hi ' + (data.firstName || data.studentName || '') + ',\n\n'
          + 'Your teacher has marked your ' + (data.level || '') + ' Writing.\n\n'
          + 'Score: ' + data.score + ' / ' + data.total + pc + '\n\n'
          + (data.message || '') + '\n\n— ' + (data.schoolName || SCHOOL_NAME);
        MailApp.sendEmail(em, 'Your Writing result — ' + (data.schoolName || SCHOOL_NAME), body);
      }
      return json_({ ok: true });
    }

    var skill = data.skill || (data.breakdown ? 'Listening' : 'Reading');

    if (skill === 'Writing') {
      writeWritingRows_(data, 'Writing Quiz');
    } else {
      writeScoreRow_(skill === 'Listening' ? LISTENING_TAB : READING_TAB, data);
      try { writeAnswersDetail_(data, skill); } catch (_) {}
      var w = data.writingEvaluation || data.writingAnswers || [];
      if (w.length) writeWritingRows_(data, skill + ' (Parts 6–7)');  // A2 reading has writing
    }

    if (SEND_EMAIL && TEACHER_EMAIL) { try { sendEmails(data, skill); } catch (_) {} }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/* Accept a JSON body (fetch) OR a form field "data" (hidden-form POST). */
function parseInput_(e) {
  if (e && e.postData && e.postData.contents) { try { return JSON.parse(e.postData.contents); } catch (_) {} }
  if (e && e.parameter && e.parameter.data)   { try { return JSON.parse(e.parameter.data); } catch (_) {} }
  return {};
}

/* ---------- Reading / Listening: keeps your columns, adds Answers ---------- */
function writeScoreRow_(tabName, d) {
  var headers = ['Timestamp', 'Student', 'Email', 'Grade', 'Level', 'Level name',
                 'Exam', 'Score', 'Total', '%', 'CEFR', 'Duration (min)',
                 'Strongest', 'Weakest', 'Verdict', 'Answers'];
  var sh = getSheet_(tabName, headers);

  var grade    = d.grade || d.klass || '';
  var minutes  = d.durationMinutes || d.elapsed_min || '';
  var pct      = (d.percent != null) ? d.percent : (d.total ? Math.round(d.score / d.total * 100) : '');

  // Strongest / Weakest single part (by %), from the parts array
  var strongest = '', weakest = '';
  if (d.parts && d.parts.length) {
    var sorted = d.parts.slice().sort(function (a, b) { return b.pct - a.pct; });
    strongest = sorted[0].name + ' (' + sorted[0].pct + '%)';
    weakest   = sorted[sorted.length - 1].name + ' (' + sorted[sorted.length - 1].pct + '%)';
  }

  // Every answer
  var answers = '';
  if (d.detail && d.detail.length) {
    answers = d.detail.map(function (q) {
      return 'Q' + q.q + ': ' + stripHtml_(q.user) +
             ' (correct: ' + stripHtml_(q.correctAns) + ') ' + (q.ok ? '✓' : '✗');
    }).join('  |  ');
  } else if (d.answers) {
    answers = JSON.stringify(d.answers);  // listening stores its answers object
  }

  sh.appendRow([
    new Date(), d.name || '', d.email || '', grade, d.level || '', d.levelName || '',
    d.examTitle || d.examType || tabName, d.score, d.total,
    (pct !== '' ? pct + '%' : ''), d.cefrLabel || '', minutes,
    strongest, weakest, d.verdict || '', answers
  ]);
}

/* ---------- Writing: one row per task, full text persisted ---------- */
function writeWritingRows_(d, sourceLabel) {
  var headers = ['Timestamp', 'Student', 'Email', 'Grade', 'Level', 'Source',
                 'Task', 'Words', 'Answer', 'Provisional band (auto — verify by hand)', 'Auto notes'];
  var sh = getSheet_(WRITING_TAB, headers);
  var grade = d.grade || d.klass || '';
  var tasks = d.writingEvaluation || d.writingAnswers || [];
  tasks.forEach(function (t) {
    var band = (t.provisionalBand != null ? t.provisionalBand : t.band != null ? t.band : '');
    sh.appendRow([
      new Date(), d.name || '', d.email || '', grade, d.level || '', sourceLabel,
      t.part || t.label || t.prompt || '', t.wordCount || '',
      (t.text || ''), (band !== '' ? band + ' / 5' : ''), (t.feedback || '')
    ]);
  });
}

/* ---------- email (teacher + student) ---------- */
function sendEmails(d, skill) {
  var grade = d.grade || d.klass || '';
  var pct = (d.percent != null) ? d.percent : (d.total ? Math.round(d.score / d.total * 100) : '');
  var tasks = d.writingEvaluation || d.writingAnswers || [];

  // --- Teacher email (full) + PDF report attached ---
  var subject = '[' + SCHOOL_NAME + ' · ' + skill + '] ' + (d.name || 'Student') + ' — ' + (d.level || '');
  var lines = ['Student: ' + (d.name || ''), 'Grade: ' + grade, 'Email: ' + (d.email || ''),
               'Level: ' + (d.level || ''), 'Exam: ' + (d.examTitle || d.examType || skill)];
  if (skill !== 'Writing' && d.score != null) lines.push('Score: ' + d.score + ' / ' + d.total + (pct !== '' ? ' (' + pct + '%)' : ''));
  if (tasks.length) {
    lines.push('', '--- Writing (mark by hand) ---');
    tasks.forEach(function (t) { lines.push('', (t.part || t.label || '') + ' [' + (t.wordCount || 0) + ' words]:', (t.text || '(blank)')); });
  }
  var opts = { name: SCHOOL_NAME + ' — Quiz Reports' };
  try {
    var pdf = buildReportPdf_(d, skill, pct, grade, tasks);
    if (pdf) opts.attachments = [pdf];
  } catch (_) {}
  MailApp.sendEmail(TEACHER_EMAIL, subject, lines.join('\n'), opts);

  // --- Student email (their own result) ---
  var sEmail = d.email || '';
  if (sEmail && /^\S+@\S+\.\S+$/.test(sEmail)) {
    var body;
    if (skill === 'Writing') {
      body = 'Hi ' + (d.name || '') + ',\n\nYour writing (' + (d.level || '') + ') has been submitted to your teacher, who will read it and give you a mark by hand.\n\nThank you!\n— ' + SCHOOL_NAME;
    } else {
      body = 'Hi ' + (d.name || '') + ',\n\nHere is your ' + skill + ' result (' + (d.level || '') + '):\n\n' +
             'Score: ' + d.score + ' / ' + d.total + (pct !== '' ? '  (' + pct + '%)' : '') + '\n';
      if (d.parts && d.parts.length) {
        body += '\nBy part:\n' + d.parts.map(function (p) { return '  • ' + p.name + ': ' + p.pct + '%'; }).join('\n') + '\n';
      }
      body += '\nWell done — keep practising!\n— ' + SCHOOL_NAME;
    }
    MailApp.sendEmail(sEmail, 'Your ' + skill + ' result — ' + SCHOOL_NAME, body);
  }
}

/* ---------- normalise per-question detail (Reading uses 'detail', Listening uses 'breakdown') ---------- */
function getDetail_(d) {
  if (d.detail && d.detail.length) return d.detail.map(function (x) { return { q: x.q, ans: x.user, correct: x.correctAns, ok: !!x.ok }; });
  if (d.breakdown && d.breakdown.length && d.breakdown[0] && ('ok' in d.breakdown[0]) && ('given' in d.breakdown[0]))
    return d.breakdown.map(function (x) { return { q: x.q, ans: x.given, correct: x.correct, ok: !!x.ok }; });
  return [];
}

/* ---------- per-question answers, one row each, colour-coded in the Sheet ---------- */
function writeAnswersDetail_(d, skill) {
  var det = getDetail_(d);
  if (!det.length) return;
  var headers = ['Timestamp', 'Student', 'Grade', 'Level', 'Exam', 'N°', 'Student answer', 'Correct answer', 'Result'];
  var sh = getSheet_('Answers Detail', headers);
  var grade = d.grade || d.klass || '';
  var exam = d.examTitle || d.examType || skill;
  var ts = new Date();
  var rows = det.map(function (x, i) {
    var num = (typeof x.q === 'number' || /^\d+$/.test(String(x.q))) ? x.q : (i + 1);
    return [ts, d.name || '', grade, d.level || '', exam, num, stripHtml_(x.ans), stripHtml_(x.correct), x.ok ? '✔ Correct' : '✘ Wrong'];
  });
  var start = sh.getLastRow() + 1;
  sh.getRange(start, 1, rows.length, headers.length).setValues(rows);
  for (var i = 0; i < det.length; i++) {
    sh.getRange(start + i, 6, 1, 4).setBackground(det[i].ok ? '#dcfce7' : '#fee2e2');
  }
}

/* ---------- PDF report (HTML -> PDF, attached to the teacher email) ---------- */
function buildReportPdf_(d, skill, pct, grade, tasks) {
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var parts = d.parts || (d.breakdown && d.breakdown.parts) || (Array.isArray(d.breakdown) ? d.breakdown : []);
  var partsRows = (parts && parts.length) ? parts.map(function (p) {
    var ppct = (p.pct != null) ? p.pct : (p.percent != null ? p.percent : (p.total ? Math.round(p.correct / p.total * 100) : ''));
    return '<tr><td>' + esc(p.name || p.part || 'Part') + '</td><td style="text-align:right">' + (ppct !== '' ? ppct + '%' : '—') + '</td></tr>';
  }).join('') : '';
  var verdict = d.verdict || '';
  var writingHtml = '';
  if (tasks && tasks.length) {
    writingHtml = '<h3>Writing</h3>' + tasks.map(function (t) {
      return '<div style="margin:8px 0;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px"><b>' +
             esc(t.part || t.label || '') + '</b> <span style="color:#64748b">(' + (t.wordCount || 0) + ' words)</span><br>' +
             '<div style="white-space:pre-wrap;margin-top:4px">' + esc(t.text || '(blank)') + '</div></div>';
    }).join('');
  }
  var scoreLine = (skill !== 'Writing' && d.score != null)
    ? ('<div style="font-size:26px;font-weight:800;color:#2d5a8d">' + d.score + ' / ' + d.total + (pct !== '' ? '  (' + pct + '%)' : '') + '</div>')
    : '<div style="color:#64748b">Writing — graded by the teacher</div>';

  // Per-question answers table, colour-coded (green = correct, red = wrong)
  var det = getDetail_(d);
  var answersTable = '';
  if (det.length) {
    var rows = det.map(function (x, i) {
      var bg = x.ok ? '#dcfce7' : '#fee2e2';   // green / red
      var mark = x.ok ? '✔' : '✘';
      var num = (typeof x.q === 'number' || /^\d+$/.test(String(x.q))) ? x.q : (i + 1);
      return '<tr style="background:' + bg + '">' +
               '<td style="padding:4px 8px;text-align:center;font-weight:700">' + esc(num) + '</td>' +
               '<td style="padding:4px 8px">' + esc(stripHtml_(x.ans)) + '</td>' +
               '<td style="padding:4px 8px">' + esc(stripHtml_(x.correct)) + '</td>' +
               '<td style="padding:4px 8px;text-align:center;font-weight:700">' + mark + '</td>' +
             '</tr>';
    }).join('');
    answersTable = '<h3 style="margin-top:16px">Answers</h3>' +
      '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
      '<tr style="background:#4987c6;color:#fff"><th style="padding:5px 8px;text-align:center">N°</th>' +
      '<th style="padding:5px 8px;text-align:left">Student answer</th>' +
      '<th style="padding:5px 8px;text-align:left">Correct answer</th>' +
      '<th style="padding:5px 8px;text-align:center">✓/✗</th></tr>' + rows + '</table>';
  }
  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:700px">' +
      '<div style="border-bottom:3px solid #4987c6;padding-bottom:8px;margin-bottom:14px">' +
        '<div style="font-size:13px;letter-spacing:1px;color:#636465">' + esc(SCHOOL_NAME) + ' — RESULTS REPORT</div>' +
        '<div style="font-size:20px;font-weight:800">' + esc(skill) + ' · ' + esc(d.level || '') + ' · ' + esc(d.examTitle || d.examType || '') + '</div>' +
      '</div>' +
      '<table style="font-size:14px;margin-bottom:10px"><tr><td style="padding:2px 14px 2px 0;color:#636465">Student</td><td><b>' + esc(d.name || '') + '</b></td></tr>' +
        '<tr><td style="color:#636465">Grade</td><td>' + esc(grade) + '</td></tr>' +
        '<tr><td style="color:#636465">Email</td><td>' + esc(d.email || '') + '</td></tr>' +
        '<tr><td style="color:#636465">Date</td><td>' + new Date().toLocaleString() + '</td></tr></table>' +
      scoreLine +
      (partsRows ? ('<h3 style="margin-top:16px">Score by part</h3><table style="width:60%;font-size:14px;border-collapse:collapse">' +
        '<tr style="background:#f2f3ff"><th style="text-align:left;padding:4px 8px">Part</th><th style="text-align:right;padding:4px 8px">%</th></tr>' + partsRows + '</table>') : '') +
      (verdict ? ('<p style="margin-top:14px;padding:10px 12px;background:#f2f3ff;border-left:4px solid #4987c6;border-radius:6px">' + esc(verdict) + '</p>') : '') +
      answersTable +
      writingHtml +
    '</div>';
  var safe = (skill + '-' + (d.level || '') + '-' + (d.name || 'student')).replace(/[^A-Za-z0-9_\-]+/g, '_');
  return Utilities.newBlob(html, 'text/html', safe + '.html').getAs('application/pdf').setName('NIS-' + safe + '.pdf');
}

/* ---------- helpers ---------- */
function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
    sh.setFrozenRows(1);
  }
  return sh;
}
function stripHtml_(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, '').trim(); }
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
