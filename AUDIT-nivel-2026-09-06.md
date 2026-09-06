# CEFR Level Audit — Cambridge MOCK & Practice tests
**Repository:** `C:\Projects\mocks-cambridge`
**Date:** 2026-09-06
**Scope:** Reading & Use of English, Listening, Writing — A2 (Key) · B1 (Preliminary) · B2 (First) · C1 (Advanced)
**Method:** structural mapping of every test bank + close reading of 2–3 representative tests per level per paper (grammar, vocabulary, task types, text length). **Audit only — no test files were edited.**

---

## 1. Where the content lives (architecture)

| Bank | Location | Contains |
|---|---|---|
| Reading Practice 1–3 | `reading-quiz.html` → `EXAMS` (=Practice 1), `PRACTICE2`, `PRACTICE3` | embedded, oldest hand-written |
| Reading MOCK 1–3 | `reading-quiz.html` → `MOCK01`/`MOCK02`(=`tools/new_reading_*.json`), `MOCK03` | embedded |
| Reading MOCK 4–7 | `tools/mocks_more/{LV}_m4..m7.json` → injected as `MOCKS_MORE` | newest, generated |
| Reading Practice 4–18 | `tools/practice_more/{LV}_p4..p18.json` → `PRACTICE_MORE` | newest, generated |
| Listening 1–3 / 4–7 | `listening-quiz.html` → `QUIZ..QUIZ6` + `tools/listening_more/` → `LISTEN_MORE` | 3 embedded + more |
| Writing 1–3 / 4–7 | `writing-quiz.html` → `WRITING..WRITING6` + `tools/writing_more/` → `WRITING_MORE` | 3 embedded + more |

The generated `_more` banks are validated for **shape** by `tools/assemble_*.py` (part count, question count, type per part) — this is why task-type structure is uniformly correct. There is **no** validation of difficulty/level, which is where the drift below lives.

---

## 2. Inventory

Per level, each paper offers **7 mocks (1–7)** and **18 practice tests (1–18)**:

| Level | Reading & UoE | Listening | Writing | Papers present |
|---|---|---|---|---|
| **A2 Key** | 7 mock / 18 practice | 7 / 18 | *(no standalone)* | Reading + UoE cloze + **Writing embedded as Reading Parts 6–7** |
| **B1 Preliminary** | 7 / 18 | 7 / 18 | 7 / 18 | Reading (with cloze), Listening, Writing |
| **B2 First** | 7 / 18 | 7 / 18 | 7 / 18 | Reading + **Use of English** (KWT, word formation), Listening, Writing |
| **C1 Advanced** | 7 / 18 | 7 / 18 | 7 / 18 | Reading + **Use of English**, Listening, Writing |

**Task-type coverage (verified against official papers):**
- A2: mc / matching / mc / MC-cloze / open-cloze (+ writing 25 & 35 words). ✔ matches KET.
- B1: mc / matching / mc(4-opt) / gapped-text matching / MC-cloze / open-cloze (+ writing ~100 words). ✔ matches PET.
- B2: MC-cloze / open-cloze / **word formation** / **key word transformation** / mc / gapped-sentence / multiple-matching (+ essay 140–190). ✔ matches FCE.
- C1: same 8-part shape as B2, longer texts (+ essay 220–260). ✔ matches CAE (one exception — see §5).

**Positive headline:** the papers Cambridge uses to separate the upper levels — **Key Word Transformation and Word Formation** — are present at B2 and C1 and correctly **absent** at A2/B1. Writing word counts are exact (A2 25/35; B1 ~100; B2 140–190; C1 220–260). Listening structure is right at every level. The core scaffolding is sound; the problems are content-level, not structural.

---

## 3. Per-level assessment

### A2 (Key) — **Verdict: ON-LEVEL content, minor format OVER-leveling**
Content is genuinely A2: notices/messages, present simple/continuous, comparatives, everyday vocabulary.

- ✔ `A2_m4` Part 1 notice: *"STUDENTS MUST BE AT THE AIRPORT BY 6.30 A.M. THE COACH LEAVES SCHOOL AT 5.45 A.M…"* → 3-option gist question. Textbook A2.
- ✔ `A2_m4` Part 5 open cloze accepts `is` for *"My class (25)__ going to France next month"* (present continuous), `by` for *"travel (26)__ train"*. A2 grammar.
- ✔ `EXAMS` (Practice 1) Part 4 cloze: `first / one / old` — **3 options**, correct KET format.
- ✖ **Format over-leveling:** the MC-cloze (Part 4) uses **4 options (A–D)** in `A2_m4..m7`, all `practice_more/A2_p*`, `MOCK03`, and `new_reading_A2` (MOCK 1/2). Official A2 Key Reading Part 6 has **3 options**. Example `A2_m4`: `['much','more','most','many']`. Only the three oldest embedded practices (`EXAMS`/`PRACTICE2`/`PRACTICE3`) use the correct 3.
- ✖ **Minor:** Part 2 matching has **7 items** in `EXAMS`/`PRACTICE2`/`PRACTICE3` (official KET = 5; the newer banks correctly use 5).

### B1 (Preliminary) — **Verdict: ON-LEVEL**
No mis-leveling found; the cleanest level in the set.
- ✔ `B1_m4` Part 6 open cloze answers `which`, `whose`, `been`, `if/whether` — relative clauses, present perfect, conditionals: core B1 grammar.
- ✔ `B1_m4` Part 3 uses **4-option** MC (correct for PET Part 3); Part 5 MC-cloze 4-option (correct for PET Part 5).
- ✔ Vocabulary in the Part 5 cloze distractors (`experience/event/practice/incident`; `giving/putting/taking/holding`) is word-family discrimination at B1 level.
- ✔ Correctly has **no** key word transformation (KWT begins at B2).

### B2 (First) — **Verdict: ON-LEVEL, pitched at the harder end (as intended)**
- ✔ `B2_m4` Part 4 KWT tests authentic FCE grammar: `has been ten years since` (since + present perfect), `not take as long as`, `warned the visitors not to` (reported), `should not have ignored` (past modal), `hardly any` (quantifier), `is being repaired` (passive continuous).
- ✔ `B2_m4` Part 3 word formation: `restoration, strengthen, unavoidable, responsibility, knowledge` — level-appropriate derivations.
- ✔ Reading texts are dense and idiomatic (*"disrepair", "purists", "scaffolding", "surveyor"*), reaching the top of B2. No under-leveling anywhere in the B2 sample.

### C1 (Advanced) — **Verdict: MIXED — newest tests are on-level; the oldest embedded ones drift down to B2**
The generated/newest banks are authentically C1; the oldest hand-written Practice 1 (and parts of Practice 3) test B2 grammar wearing a C1 label.

**Genuinely C1 (good):**
- ✔ `C1_m4` Part 4: *"___ was cleaned did experts realise it was a fake"* → `Only when the painting` (**inversion**); `is said to have destroyed` (reporting passive); `no intention of returning` (nominalisation).
- ✔ `MOCK03` C1 Part 4: `Little did I expect` (**inversion**), `came under fire` (idiom), `tired as he was / tired though he was` (**concessive inversion**), `would not dream of lying` (idiom).
- ✔ `C1_p12` Part 4: `came to light`, `no way the biographer could have known` (fronted emphasis); word formation `distrust, inconsistencies, misconceptions, deceptive, portrayal` (negative-prefix / multi-affix).
- ✔ Listening `C1_m4` is dense and abstract (library-closure debate: *"an act of accounting heresy… terminal decline"*), with inference-based options. Clearly C1.

**Under-leveled (reads as B2):**
- ✖ `EXAMS` (**C1 Practice 1**) Part 4 KWT is essentially B2: *"Even though he was very tired, he kept walking → He kept walking **despite being very tired**"* (despite + gerund is B1/B2); *"I regret not learning… → I **wish I had** learnt"* (wish + past perfect = B2); *"…**would rather you didn't mention**…"* (B2). **No inversion, no cleft** — nothing that distinguishes CAE from FCE.
- ✖ `EXAMS` C1 word formation is soft for C1: `popularity, steadily, companionship, appealing, satisfaction, quietly` are B1–B2 formations (compare the `worthlessness / indistinguishable / uncanny` of `C1_m4`).
- ✖ `PRACTICE3` (**C1 Practice 3**) Part 4 mixes in B2 items: *"It's possible that they missed the train → **may have missed**"*; *"The company is likely to announce… → **is expected to announce**"*; *"…**had not helped**…"* (3rd conditional).

---

## 4. Cross-cutting findings

1. **B2 ↔ C1 boundary is blurred by shared/recycled KWT items.** The same transformation appears at both levels:
   - `should not have ignored` is used **verbatim** in `B2_m4` **and** `C1_m4` (and `B2_p9`). A B2 past-modal item is doing duty as a C1 item.
   - `wish I had …` (wish + past perfect, a B2 structure) recurs across `B2_p4/p8/p13` **and** `C1_p6/p11`.
   - Passive reporting (`is said/believed to be`) appears as the "hard" item at both B2 and C1 repeatedly.
   Net effect: several C1 KWT sections do not escalate grammar above B2.

2. **A2 MC-cloze presents 4 options instead of 3** in every bank except the three oldest embedded practices (see §3). Vocabulary is A2; only the *format* is over-leveled, but it is systematic (all mocks 4–7, all practice 4–18, MOCK 1/2/3).

3. **Difficulty tracks vintage, not level.** The newest generated banks (`mocks_more` m4–7, `practice_more` p4–18, `MOCK03`, `new_reading` M1/M2) are consistently well-leveled and well-differentiated. The weak spots are the **oldest hand-embedded Practice 1 sets in `reading-quiz.html`** — concentrated at C1. A student meeting "C1 Practice 1" first would find it noticeably easier than "C1 MOCK 4".

4. **No paper is missing its signature task type.** Contrary to a common failure mode, KWT and word formation *are* present at B2/C1 — this is a strength, not a gap. The issue is item difficulty within those tasks, not their absence.

5. **A structural inconsistency at C1:** `EXAMS` (C1 Practice 1) has only **7 parts** (missing one multiple-matching section); every other C1 reading test has the correct **8**.

---

## 5. Prioritised recommendations (no changes made — specifications only)

1. **Rebuild the C1 Practice 1 KWT + add the missing part.** In `reading-quiz.html` → `EXAMS.C1.Reading`: replace the Part 4 items (`despite being very tired`, `wish I had`, `would rather you didn't mention`) with inversion/cleft/advanced-pattern items on the model of `C1_m4` (`Only when… did…`, `Little did I…`). Also add the 8th part (multiple matching) so it matches all other C1 tests.

2. **Lift C1 Practice 3 KWT to level.** In `reading-quiz.html` → `PRACTICE3.C1.Reading` Part 4: replace `may have missed`, `is expected to announce`, `had not helped` with C1-grade structures (inversion, concessive inversion, cleft, advanced idiom).

3. **Fix the A2 MC-cloze to 3 options.** Reduce Part 4 options from 4 to 3 (A/B/C) across `tools/mocks_more/A2_m4..m7.json`, `tools/practice_more/A2_p4..p18.json`, `tools/new_reading_A2.json` (MOCK 1/2), and `MOCK03.A2` (in `reading-quiz.html`), to match KET Reading Part 6. (Re-run `tools/assemble_*` + `tools/inject_more_blocks.py` after editing the JSON.)

4. **De-duplicate KWT items across the B2/C1 boundary.** Remove `should not have ignored` from the C1 banks (keep it B2-only): it is shared by `B2_m4` and `C1_m4`. Likewise stop reusing `wish I had …` at C1 (`C1_p6`, `C1_p11`). Give each C1 item a structure not already used at B2.

5. **Raise C1 word-formation difficulty in `EXAMS.C1`** (and audit `PRACTICE3.C1`): swap B1–B2 derivations (`popularity`, `steadily`, `quietly`) for multi-affix / negative-prefix targets in the style of `C1_m4` (`indistinguishable`, `worthlessness`, `authenticity`).

6. **Normalise A2 Part 2 matching to 5 items** in `EXAMS`/`PRACTICE2`/`PRACTICE3` (currently 7; official KET = 5; the newer banks already use 5).

7. **(Process) Add a difficulty/level check to the assemblers.** `tools/assemble_*.py` validate shape only. A lightweight lint — e.g. flag C1 KWT items whose target grammar is on a B2 list, or A2 cloze parts with 4 options — would catch every issue above automatically before deploy.

**Effort order:** #3 and #6 are mechanical (option/count fixes, scriptable). #1, #2, #4, #5 require writing new items but are localised to the C1 embedded banks in `reading-quiz.html`. #7 is the durable fix.

---

*Files examined in depth:* `tools/mocks_more/{A2,B1,B2,C1}_m4.json`, `tools/practice_more/C1_p12.json` (+ A2/C1 option scans across the bank), `tools/new_reading_{A2,C1}.json`, `tools/writing_more/{B1,B2,C1}_m4.json`, `tools/listening_more/{A2,C1}_m4.json`, and the embedded `EXAMS`/`PRACTICE2`/`PRACTICE3`/`MOCK03` constants in `reading-quiz.html`, plus the resolver/registry logic in `reading-quiz.html`, `writing-quiz.html`, `listening-quiz.html`.
