#!/usr/bin/env python3
"""Assemble the generated Listening tests (A2/B1/B2/C1 x Practice 4-18 + MOCK 4-7)
into a single `const LISTEN_MORE = {...};` JS block.

Each source file tools/listening_more/{LEVEL}_p{N}.json / {LEVEL}_m{N}.json holds
ONE level-test object: {label, cefr, blurb, audios:[...]} — same shape as one
level of the inline QUIZ..QUIZ6 constants in listening-quiz.html.

Audio file paths must use the prefix that matches the file: practice N -> "P{N}/",
mock N -> "M{N}/" (relative to ./mp3/).

Validates part structure per level and, with --emit, writes
tools/listening_more/_LISTEN_MORE.js with shape:
  { A2:{practice:[p4..p18], mocks:[m4..m7]}, B1:{...}, B2:{...}, C1:{...} }
"""
import json, re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
MORE = os.path.join(HERE, "listening_more")
LEVELS = ["A2", "B1", "B2", "C1"]
P_NUMS = list(range(4, 19))
M_NUMS = [4, 5, 6, 7]

# (question type, count, paged) per part, per level — mirrors QUIZ3 (the practice template).
SHAPES = {
    "A2": [("pic", 5, True), ("gap", 5, False), ("mc", 5, False), ("mc", 5, False), ("match", 5, False)],
    "B1": [("pic", 7, True), ("mc", 6, True), ("gap", 6, False), ("mc", 6, False)],
    "B2": [("mc", 8, True), ("gap", 10, False), ("match", 5, False), ("mc", 7, False)],
    "C1": [("mc", 6, True), ("gap", 8, False), ("mc", 6, False), ("match", 10, False)],
}

LPICS = {"book","ball","cake","park","cafe","library","sunny","rainy","snowy","keys","phone",
         "umbrella","clock8","clock830","clock9","clock400","clock420","clock430","clock700",
         "clock730","sandwich","pizza","bus","bike","car","camera","guitar","bag","hat"}


def check(lv, name, obj, prefix):
    errs = []
    audios = obj.get("audios") or []
    shape = SHAPES[lv]
    if len(audios) != len(shape):
        errs.append(f"{len(audios)} parts (want {len(shape)})")
    for i, (a, (qt, nq, paged)) in enumerate(zip(audios, shape)):
        pid = a.get("id", f"?P{i+1}")
        qs = a.get("questions") or []
        if len(qs) != nq: errs.append(f"{pid}: {len(qs)} Qs (want {nq})")
        types = {q.get("type") for q in qs}
        if types != {qt}: errs.append(f"{pid}: types {types} (want {qt})")
        if bool(a.get("paged")) != paged: errs.append(f"{pid}: paged={bool(a.get('paged'))} (want {paged})")
        scripts = a.get("scripts") or []
        if paged:
            if len(scripts) != nq: errs.append(f"{pid}: {len(scripts)} scripts (want {nq})")
            for j, q in enumerate(qs):
                want = f"{prefix}/{lv}/{lv}-P{i+1}-q{j+1}.mp3"
                if q.get("audio") != want: errs.append(f"{pid} q{j+1}: audio={q.get('audio')} (want {want})")
        else:
            if len(scripts) != 1: errs.append(f"{pid}: {len(scripts)} scripts (want 1)")
            want = f"{prefix}/{lv}/{lv}-P{i+1}.mp3"
            if a.get("file") != want: errs.append(f"{pid}: file={a.get('file')} (want {want})")
        if qt == "pic":
            for j, q in enumerate(qs):
                bad = [im for im in (q.get("imgs") or []) if im not in LPICS]
                if bad: errs.append(f"{pid} q{j+1}: unknown imgs {bad}")
                if not isinstance(q.get("c"), int): errs.append(f"{pid} q{j+1}: c not index")
        if qt == "mc":
            for j, q in enumerate(qs):
                if len(q.get("o") or []) < 3: errs.append(f"{pid} q{j+1}: <3 options")
                if not isinstance(q.get("c"), int): errs.append(f"{pid} q{j+1}: c not index")
        if qt == "gap":
            for j, q in enumerate(qs):
                if not (q.get("accept") or []): errs.append(f"{pid} q{j+1}: empty accept")
        if qt == "match":
            part_bank = a.get("bank") or []
            for j, q in enumerate(qs):
                bank = q.get("bank") or part_bank
                if not bank: errs.append(f"{pid} q{j+1}: no bank")
                elif q.get("c") not in bank: errs.append(f"{pid} q{j+1}: answer not in bank")
    if errs:
        print(f"SHAPE! {name}: " + "; ".join(errs[:6]) + (" …" if len(errs) > 6 else ""))
        return False
    total = sum(len(a.get("questions") or []) for a in audios)
    print(f"OK  {name}: {len(audios)} parts, {total} Qs")
    return True


def main():
    ok = True
    result = {}
    for lv in LEVELS:
        practice, mocks = [], []
        for kind, nums, dest, pfx in (("p", P_NUMS, practice, "P"), ("m", M_NUMS, mocks, "M")):
            for n in nums:
                name = f"{lv}_{kind}{n}.json"
                fp = os.path.join(MORE, name)
                if not os.path.exists(fp):
                    print(f"MISSING  {name}"); ok = False; continue
                try:
                    obj = json.load(open(fp, encoding="utf-8"))
                except Exception as e:
                    print(f"BADJSON  {name} -> {e}"); ok = False; continue
                if not check(lv, name, obj, f"{pfx}{n}"):
                    ok = False
                dest.append(obj)
        result[lv] = {"practice": practice, "mocks": mocks}
        print(f"  -> {lv}: {len(practice)}/{len(P_NUMS)} practices, {len(mocks)}/{len(M_NUMS)} mocks\n")

    if "--emit" in sys.argv and ok:
        js = "const LISTEN_MORE = " + json.dumps(result, ensure_ascii=False, indent=0) + ";\n"
        out = os.path.join(MORE, "_LISTEN_MORE.js")
        open(out, "w", encoding="utf-8").write(js)
        print(f"EMITTED  {out}  ({len(js)} bytes)")
    print("RESULT:", "ALL_OK" if ok else "PROBLEMS_FOUND")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
