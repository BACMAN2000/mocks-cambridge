# MOCKS CAMBRIDGE — Nordic International School of Lima

Two full Cambridge-format **mock exams** (MOCK 1 & MOCK 2) for A2 · B1 · B2 · C1, styled like the Inspera test player. A mirror of `nis-quizzes`, pitched at the harder end of each level, grounded in official FCE/CAE sample material.

## Apps
- **`quizzes.html`** — hub linking the three mocks.
- **`listening-quiz.html`** — Listening (A2/B1/B2/C1). Two mocks per level with real ElevenLabs audio (`mp3/` = MOCK 1, `mp3/M2/` = MOCK 2).
- **`reading-quiz.html`** — Reading & Use of English (KET/PET/FCE/CAE format) with timer. Choose MOCK 1 or MOCK 2.
- **`writing-quiz.html`** — Writing (B1/B2/C1): Part 1 compulsory + Part 2 choose-one. Two mocks. Offline rubric self-check; not graded for students.

## Flow
Sign in → choose level → choose **MOCK 1 / MOCK 2** → take the exam. Reading & Listening are auto-scored; Writing is sent to the teacher to mark by hand.

## Live
**https://nis.cohasset.pe/mocks-cambridge/** — same origin as the portal, so the student never leaves the school domain and the Supabase session (same `localStorage`) is shared: the quizzes skip the name/grade/email screen. This is the URL to share.

GitHub Pages (`https://bacman2000.github.io/mocks-cambridge/`) stays alive **only as an emergency fallback**: the portal uses it just when `/mocks-cambridge/` does not answer on its own origin. Note the `href="/"` back-links assume the portal is at the root, so they only work on `nis.cohasset.pe`.

## Deploy
Push to `main` → the server auto-pulls `/opt/mocks-cambridge` (and GitHub Pages rebuilds the fallback, ~1–2 min). **Bump the `version` in `version.json`** on every deploy so students auto-load the latest version without clearing their cache.

## Audio
MOCK 2 audio is generated with `tools/gen_mock2_audio.py` (ElevenLabs; reads the API key from gitignored `A2 Level.txt`). Output: `mp3/M2/<LEVEL>/`.

## Notes
- The ElevenLabs API key lives in `A2 Level.txt`, which is **gitignored — never commit it**.
- Results post to the configured Apps Script webhook and can be downloaded as PDF.
