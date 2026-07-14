#!/usr/bin/env python3
"""Assemble the 20 generated practice tests (A2/B1/B2/C1 x Practice 4-8) into a
single `const PRACTICE_MORE = {...};` JS block, validating each against its
level template (part count + per-part question count). Prints a report and,
with --emit, writes the JS block to tools/practice_more/_PRACTICE_MORE.js
"""
import json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
MORE = os.path.join(HERE, "practice_more")
LEVELS = ["A2", "B1", "B2", "C1"]
NUMS = [4, 5, 6, 7, 8]


def template_shape(level):
    d = json.load(open(os.path.join(HERE, f"new_reading_{level}.json"), encoding="utf-8"))
    t = d.get("mock1") or d[list(d.keys())[0]]
    return [(p.get("type"), len(p.get("questions", []) or [])) for p in t["parts"]]


def test_shape(obj):
    return [(p.get("type"), len(p.get("questions", []) or [])) for p in obj["parts"]]


def main():
    ok = True
    result = {}
    for lv in LEVELS:
        tmpl = template_shape(lv)
        scored_expected = sum(n for _, n in tmpl)
        tests = []
        for n in NUMS:
            fp = os.path.join(MORE, f"{lv}_p{n}.json")
            if not os.path.exists(fp):
                print(f"MISSING  {lv}_p{n}.json"); ok = False; continue
            try:
                obj = json.load(open(fp, encoding="utf-8"))
            except Exception as e:
                print(f"BADJSON  {lv}_p{n}.json -> {e}"); ok = False; continue
            shp = test_shape(obj)
            scored = sum(nq for _, nq in shp)
            types_ok = [t for t, _ in shp] == [t for t, _ in tmpl]
            counts_ok = shp == tmpl
            flag = "OK " if (types_ok and counts_ok) else "SHAPE!"
            if not (types_ok and counts_ok):
                ok = False
                print(f"{flag} {lv}_p{n}: got {shp} expected {tmpl}")
            else:
                print(f"{flag} {lv}_p{n}: {len(shp)} parts, {scored} scored Qs (title={obj.get('title','?')[:48]})")
            tests.append(obj)
        result[lv] = {"Reading": tests}
        print(f"  -> {lv}: {len(tests)}/5 tests, template scored={scored_expected}\n")

    if "--emit" in sys.argv and ok:
        js = "const PRACTICE_MORE = " + json.dumps(result, ensure_ascii=False, indent=0) + ";\n"
        out = os.path.join(MORE, "_PRACTICE_MORE.js")
        open(out, "w", encoding="utf-8").write(js)
        print(f"EMITTED  {out}  ({len(js)} bytes)")
    print("RESULT:", "ALL_OK" if ok else "PROBLEMS_FOUND")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
