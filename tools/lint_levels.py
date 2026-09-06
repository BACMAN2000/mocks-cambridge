#!/usr/bin/env python3
"""Level lint for the mock/practice banks (audit 2026-09-06 follow-up).
Flags the concrete mis-leveling the shape-validators miss. Exit 1 if any WARN.
  python tools/lint_levels.py
"""
import json, glob, os, sys
HERE=os.path.dirname(os.path.abspath(__file__))
# grammar patterns that are B2-level and must NOT be the "hard" item at C1
B2_KWT=["despite being","wish i had","wish that i had","may have missed",
        "is expected to","had not helped","should not have ignored","should have kept"]
warns=[]
def banks():
    for f in glob.glob(os.path.join(HERE,"mocks_more","*.json"))+glob.glob(os.path.join(HERE,"practice_more","*.json"))+glob.glob(os.path.join(HERE,"new_reading_*.json")):
        yield f
kwt_by_level={}
for f in banks():
    base=os.path.basename(f); lv=base.split("_")[0] if "_" in base else base
    try: d=json.load(open(f,encoding="utf-8"))
    except Exception as e: warns.append(f"BADJSON {base}: {e}"); continue
    tests=[d] if "parts" in d else [v for v in d.values() if isinstance(v,dict) and "parts" in v]
    for t in tests:
        for pt in t.get("parts",[]):
            typ=pt.get("type")
            # A2 MC-cloze must have 3 options
            if lv.startswith("A2") and typ=="clozeMC":
                for i,q in enumerate(pt.get("questions",[])):
                    if len(q.get("options",[]))!=3:
                        warns.append(f"{base} {pt.get('part')} Q{i+1}: A2 clozeMC has {len(q.get('options',[]))} options (KET=3)")
            # A2 Reading Part 2 (matching) must have 7 questions (official KET)
            if lv.startswith("A2") and typ=="match":
                nq=len(pt.get("questions",[]))
                if nq!=7:
                    warns.append(f"{base} {pt.get('part')}: A2 match has {nq} questions (KET Part 2 = 7)")
            # C1 KWT must not test B2 grammar
            if lv.startswith("C1") and typ=="transform":
                for i,q in enumerate(pt.get("questions",[])):
                    acc=" ".join(q.get("accept",[])).lower()
                    for p in B2_KWT:
                        if p in acc:
                            warns.append(f"{base} {pt.get('part')} Q{i+1}: C1 KWT uses B2 pattern '{p}'")
            # collect KWT accepts per level for cross-level dedup
            if typ=="transform":
                for q in pt.get("questions",[]):
                    for a in q.get("accept",[]):
                        kwt_by_level.setdefault(a.lower().strip(),set()).add(lv[:2])
# KWT items shared across B2 and C1
for phrase,levels in kwt_by_level.items():
    if "B2" in levels and "C1" in levels:
        warns.append(f"KWT '{phrase}' shared between B2 and C1 banks")
if warns:
    print("LEVEL-LINT: %d warning(s)"%len(warns))
    for w in warns: print("  WARN", w)
    sys.exit(1)
print("LEVEL-LINT: clean")
