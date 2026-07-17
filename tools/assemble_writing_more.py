#!/usr/bin/env python3
"""Assemble the generated Writing tests (B1/B2/C1 x Practice 4-18 + MOCK 4-7)
into a single `const WRITING_MORE = {...};` JS block.

Each source file tools/writing_more/{LEVEL}_p{N}.json / {LEVEL}_m{N}.json holds
ONE level-test object: {title, durationMin, parts:[Part1 compulsory, Part2 choose]}
— the same shape as the inline WRITING..WRITING6 constants in writing-quiz.html.

Validates structure per level and, with --emit, writes
tools/writing_more/_WRITING_MORE.js with shape:
  { B1:{practice:[p4..p18], mocks:[m4..m7]}, B2:{...}, C1:{...} }
"""
import json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
MORE = os.path.join(HERE, "writing_more")
LEVELS = ["B1", "B2", "C1"]
P_NUMS = list(range(4, 19))   # Practice 4..18
M_NUMS = [4, 5, 6, 7]         # MOCK 4..7

RULES = {  # durationMin, Part2 task count, (minWords, maxWords) of Part 1
    "B1": (45, 2, (100, None)),
    "B2": (80, 3, (140, 190)),
    "C1": (90, 3, (220, 260)),
}


def check(lv, name, obj):
    dur, p2n, (mn, mx) = RULES[lv]
    errs = []
    if obj.get("durationMin") != dur:
        errs.append(f"durationMin={obj.get('durationMin')} (want {dur})")
    parts = obj.get("parts") or []
    if len(parts) != 2:
        errs.append(f"{len(parts)} parts (want 2)")
    else:
        p1, p2 = parts
        if not p1.get("compulsory"): errs.append("Part1 not compulsory")
        if len(p1.get("tasks") or []) != 1: errs.append("Part1 tasks != 1")
        if not p2.get("choose"): errs.append("Part2 not choose")
        if len(p2.get("tasks") or []) != p2n: errs.append(f"Part2 tasks={len(p2.get('tasks') or [])} (want {p2n})")
        t1 = (p1.get("tasks") or [{}])[0]
        if t1.get("minWords") != mn: errs.append(f"Part1 minWords={t1.get('minWords')} (want {mn})")
        if mx and t1.get("maxWords") != mx: errs.append(f"Part1 maxWords={t1.get('maxWords')} (want {mx})")
    if errs:
        print(f"SHAPE! {name}: " + "; ".join(errs))
        return False
    print(f"OK  {name}: {obj.get('title','?')[:56]}")
    return True


def main():
    ok = True
    result = {}
    for lv in LEVELS:
        practice, mocks = [], []
        for kind, nums, dest in (("p", P_NUMS, practice), ("m", M_NUMS, mocks)):
            for n in nums:
                name = f"{lv}_{kind}{n}.json"
                fp = os.path.join(MORE, name)
                if not os.path.exists(fp):
                    print(f"MISSING  {name}"); ok = False; continue
                try:
                    obj = json.load(open(fp, encoding="utf-8"))
                except Exception as e:
                    print(f"BADJSON  {name} -> {e}"); ok = False; continue
                if not check(lv, name, obj):
                    ok = False
                dest.append(obj)
        result[lv] = {"practice": practice, "mocks": mocks}
        print(f"  -> {lv}: {len(practice)}/{len(P_NUMS)} practices, {len(mocks)}/{len(M_NUMS)} mocks\n")

    if "--emit" in sys.argv and ok:
        js = "const WRITING_MORE = " + json.dumps(result, ensure_ascii=False, indent=0) + ";\n"
        out = os.path.join(MORE, "_WRITING_MORE.js")
        open(out, "w", encoding="utf-8").write(js)
        print(f"EMITTED  {out}  ({len(js)} bytes)")
    print("RESULT:", "ALL_OK" if ok else "PROBLEMS_FOUND")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
