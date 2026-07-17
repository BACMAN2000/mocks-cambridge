#!/usr/bin/env python3
"""Inject/refresh the generated *_MORE blocks into the quiz HTML files.
Idempotent: replaces the existing block if present, inserts it otherwise.

  PRACTICE_MORE + MOCKS_MORE -> reading-quiz.html
  WRITING_MORE               -> writing-quiz.html
  LISTEN_MORE                -> listening-quiz.html (skipped if not yet emitted)

Run from repo root after the assemblers' --emit:
  python tools/inject_more_blocks.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def find_block_end(s, start):
    """start = index of 'const NAME = '; return index just past the closing '};'."""
    i = s.index("{", start)
    depth = 0
    in_str = False
    esc = False
    q = ""
    while i < len(s):
        c = s[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == q:
                in_str = False
        else:
            if c == '"' or c == "'":
                in_str = True
                q = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    j = i + 1
                    if s[j:j + 1] == ";":
                        j += 1
                    return j
        i += 1
    raise RuntimeError("unbalanced braces")


def upsert(html, const_name, block_js, insert_anchor, comment):
    """Replace `const const_name = {...};` or insert block before insert_anchor."""
    marker = f"const {const_name} = "
    block = comment + block_js.rstrip("\n")
    if marker in html:
        start = html.index(marker)
        # extend start back to a preceding comment line if it is ours
        line_start = html.rfind("\n", 0, start) + 1
        prev_line_start = html.rfind("\n", 0, line_start - 1) + 1
        prev_line = html[prev_line_start:line_start]
        if prev_line.lstrip().startswith("/*") and "inyectado" in prev_line:
            start = prev_line_start
        end = find_block_end(html, html.index(marker))
        return html[:start] + block + html[end:], "replaced"
    i = html.index(insert_anchor)
    return html[:i] + block + "\n\n" + html[i:], "inserted"


def main():
    # reading: PRACTICE_MORE then MOCKS_MORE right after it
    rp = os.path.join(ROOT, "reading-quiz.html")
    html = open(rp, encoding="utf-8").read()
    orig = len(html)
    pm = open(os.path.join(ROOT, "tools/practice_more/_PRACTICE_MORE.js"), encoding="utf-8").read()
    html, how1 = upsert(html, "PRACTICE_MORE", pm, "function currentExam(){",
                        "/* === Practice tests extra (A2/B1/B2/C1 x Practice 4-18), inyectado desde tools/practice_more === */\n")
    # drop the stale 4-8 comment if it survived
    html = html.replace("/* === 20 practice tests extra (A2/B1/B2/C1 x Practice 4-8), inyectado desde tools/practice_more === */\n", "")
    mm = open(os.path.join(ROOT, "tools/mocks_more/_MOCKS_MORE.js"), encoding="utf-8").read()
    html, how2 = upsert(html, "MOCKS_MORE", mm, "function currentExam(){",
                        "/* === Mocks extra (A2/B1/B2/C1 x MOCK 4-7), inyectado desde tools/mocks_more === */\n")
    open(rp, "w", encoding="utf-8").write(html)
    print(f"reading-quiz.html: PRACTICE_MORE {how1}, MOCKS_MORE {how2}  ({orig} -> {len(html)} bytes)")

    # writing: WRITING_MORE before the state const
    wp = os.path.join(ROOT, "writing-quiz.html")
    whtml = open(wp, encoding="utf-8").read()
    worig = len(whtml)
    wm = open(os.path.join(ROOT, "tools/writing_more/_WRITING_MORE.js"), encoding="utf-8").read()
    whtml, how = upsert(whtml, "WRITING_MORE", wm, "const state={name:''",
                        "/* === Writing tests extra (B1/B2/C1 x Practice 4-18 + MOCK 4-7), inyectado desde tools/writing_more === */\n")
    open(wp, "w", encoding="utf-8").write(whtml)
    print(f"writing-quiz.html: WRITING_MORE {how}  ({worig} -> {len(whtml)} bytes)")

    # listening: LISTEN_MORE before currentQuiz
    lm_path = os.path.join(ROOT, "tools/listening_more/_LISTEN_MORE.js")
    if os.path.exists(lm_path):
        lp = os.path.join(ROOT, "listening-quiz.html")
        lhtml = open(lp, encoding="utf-8").read()
        lorig = len(lhtml)
        lm = open(lm_path, encoding="utf-8").read()
        lhtml, how = upsert(lhtml, "LISTEN_MORE", lm, "function currentQuiz(){",
                            "/* === Listening tests extra (A2/B1/B2/C1 x Practice 4-18 + MOCK 4-7), inyectado desde tools/listening_more === */\n")
        open(lp, "w", encoding="utf-8").write(lhtml)
        print(f"listening-quiz.html: LISTEN_MORE {how}  ({lorig} -> {len(lhtml)} bytes)")
    else:
        print("listening: _LISTEN_MORE.js not emitted yet — skipped")


if __name__ == "__main__":
    main()
