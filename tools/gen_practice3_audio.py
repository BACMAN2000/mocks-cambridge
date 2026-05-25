#!/usr/bin/env python3
"""Generate Práctica 3 (QUIZ5) Listening audio with ElevenLabs. Run from repo root:
    python tools/gen_practice3_audio.py

Reads the scripts directly from listening-quiz.html (const QUIZ5) so the audio
always matches the app exactly. For Part 1 (paged, per-question audio) it makes
one mp3 per conversation; for whole parts it concatenates that part's scripts.
Outputs to mp3/P3/<LEVEL>/<name>.mp3, matching the `audio`/`file` paths in QUIZ5.
Reads the API key from "A2 Level.txt" (gitignored). Key is never printed.
"""
import os, re, json, time, subprocess, tempfile, urllib.request

ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML  = os.path.join(ROOT, "listening-quiz.html")
KEY   = open(os.path.join(ROOT, "A2 Level.txt"), encoding="utf-8").read().strip()
QUIZ_VAR = "QUIZ5"          # Práctica 3
PREFIX   = "P3"             # mp3/P3/<level>/...
MODEL = "eleven_multilingual_v2"; FMT = "mp3_44100_128"

# Young voices from the account (same as the other gen scripts)
V_F = "FGY2WhTYpPnrIDTdsKH5"  # Laura (young female)
V_M = "TX3LPaxmHKxFdv7VOQHJ"  # Liam  (young male)
V_N = "JBFqnCBsd6RMkjVDRZzb"  # George (warm narrator / teacher / interviewer)

FEMALE = {"Girl","Woman","Mum","Mia","Anna","Emma","Kate","Lucy","Grace","Elena","Sofia","Lily","Nora","Ruby","Clara"}
MALE   = {"Boy","Man","Tom","Ben","Sam","Jack","Noah","Daniel","Hugo","Leo","Max","Ethan","Oliver"}
# Anything else (Teacher, Coach, Librarian, Interviewer, narration) -> narrator voice
SPK = re.compile(r'\s*\b(' + '|'.join(sorted(
    FEMALE | MALE | {"Teacher","Coach","Librarian","Interviewer"}, key=len, reverse=True)) + r'):\s*')

def vfor(s): return V_F if s in FEMALE else V_M if s in MALE else V_N

def segs(sc):
    p = SPK.split(sc); out = []
    lead = p[0].strip()
    if lead: out.append((V_N, lead))
    for i in range(1, len(p), 2):
        t = p[i+1].strip() if i+1 < len(p) else ""
        if t: out.append((vfor(p[i]), t))
    return out

def tts(vid, txt, dest):
    body = json.dumps({"text": txt, "model_id": MODEL,
                       "voice_settings": {"stability":0.45,"similarity_boost":0.8}}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format={FMT}",
        data=body, method="POST",
        headers={"xi-api-key":KEY, "Content-Type":"application/json", "Accept":"audio/mpeg"})
    with urllib.request.urlopen(req, timeout=180) as r, open(dest, "wb") as f:
        f.write(r.read())

def extract_obj(varname):
    html = open(HTML, encoding="utf-8").read()
    s = html.index("const " + varname + " = {") + len("const " + varname + " = ")
    i = s; depth = 0
    while i < len(html):
        c = html[i]
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0: return json.loads(html[s:i+1])
        i += 1
    raise RuntimeError("could not find " + varname)

def build_jobs():
    """Return list of (out_path_relative, script_text)."""
    d = extract_obj(QUIZ_VAR)
    jobs = []
    for lev in ["A2","B1","B2","C1"]:
        for a in d[lev]["audios"]:
            scripts = a.get("scripts", [])
            qs = a.get("questions", [])
            if a.get("paged") and any(q.get("audio") for q in qs):
                for idx, q in enumerate(qs):
                    ap = q.get("audio", "")
                    if not ap:
                        continue
                    sc = scripts[idx] if idx < len(scripts) else ""
                    jobs.append((ap, sc))
            else:
                jobs.append((a["file"], " ".join(scripts)))
    return jobs

def main():
    jobs = build_jobs()
    tmp = tempfile.mkdtemp(prefix=PREFIX.lower() + "_")
    sil  = os.path.join(tmp, "s.mp3"); lead = os.path.join(tmp, "l.mp3")
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","0.5","-q:a","9",sil], check=True, capture_output=True)
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","1.5","-q:a","9",lead], check=True, capture_output=True)
    for n,(rel, sc) in enumerate(jobs):
        out = os.path.join(ROOT, "mp3", *rel.split("/"))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        files = [lead]
        for j,(vid,txt) in enumerate(segs(sc)):
            seg = os.path.join(tmp, f"{n}_{j}.mp3")
            print(f"  {rel} seg {j+1}...")
            tts(vid, txt, seg); files += [seg, sil]; time.sleep(0.12)
        lst = os.path.join(tmp, f"{n}.txt")
        open(lst,"w",encoding="utf-8").write("".join(f"file '{f.replace(os.sep,'/')}'\n" for f in files))
        subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c:a","libmp3lame","-q:a","4",out], check=True, capture_output=True)
        print(f"OK {rel} ({os.path.getsize(out)//1024} KB)")
    print("DONE", len(jobs), "files")

if __name__ == "__main__":
    main()
