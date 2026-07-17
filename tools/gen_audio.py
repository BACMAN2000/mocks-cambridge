#!/usr/bin/env python3
"""Parametrized ElevenLabs audio generator for the extra Listening tests
(tools/listening_more/*.json). Generalizes gen_mock3_audio.py: instead of
scraping a QUIZ* const out of listening-quiz.html, it reads the JSON source
files directly — the same files assemble_listening_more.py validates/emits.

Usage (from repo root):
    python tools/gen_audio.py --estimate                 # ALL files: char count + cost preview, no API calls
    python tools/gen_audio.py --estimate A2_p4 A2_p5     # estimate a subset
    python tools/gen_audio.py A2_p4                      # generate one test's audio
    python tools/gen_audio.py --level A2                 # generate every A2 test found
    python tools/gen_audio.py --all                      # generate everything (uses skip-if-exists)

Output: mp3/<PREFIX>/<LEVEL>/<name>.mp3 where PREFIX comes from the file name
(A2_p7 -> P7, B2_m4 -> M4), matching the audio/file paths inside the JSON.
Existing files >2 KB are skipped, so reruns only fill gaps.
Reads the API key from "A2 Level.txt" (gitignored). Key is never printed.
Requires ffmpeg on PATH.
"""
import os, re, sys, json, time, glob, tempfile, subprocess, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MORE = os.path.join(ROOT, "tools", "listening_more")
MODEL = "eleven_multilingual_v2"; FMT = "mp3_44100_128"

V_F = "FGY2WhTYpPnrIDTdsKH5"  # Laura (young female)
V_M = "TX3LPaxmHKxFdv7VOQHJ"  # Liam  (young male)
V_N = "JBFqnCBsd6RMkjVDRZzb"  # George (warm narrator / teacher / interviewer)

FEMALE = {"Girl","Woman","Mum","Mia","Anna","Emma","Kate","Lucy","Grace","Elena","Sofia",
          "Lily","Nora","Ruby","Clara","Helena","Rosa","Sandy","Olivia","Sara","Hannah"}
MALE   = {"Boy","Man","Tom","Ben","Sam","Jack","Noah","Daniel","Hugo","Leo","Max","Ethan",
          "Oliver","Dad","Marcus"}
SPK = re.compile(r'\s*\b(' + '|'.join(sorted(
    FEMALE | MALE | {"Teacher","Coach","Librarian","Interviewer","Waiter","Assistant"},
    key=len, reverse=True)) + r'):\s*')

def vfor(s): return V_F if s in FEMALE else V_M if s in MALE else V_N

def segs(sc):
    p = SPK.split(sc); out = []
    lead = p[0].strip()
    if lead: out.append((V_N, lead))
    for i in range(1, len(p), 2):
        t = p[i+1].strip() if i+1 < len(p) else ""
        if t: out.append((vfor(p[i]), t))
    return out

def tts(key, vid, txt, dest):
    body = json.dumps({"text": txt, "model_id": MODEL,
                       "voice_settings": {"stability":0.45,"similarity_boost":0.8}}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format={FMT}",
        data=body, method="POST",
        headers={"xi-api-key":key, "Content-Type":"application/json", "Accept":"audio/mpeg"})
    with urllib.request.urlopen(req, timeout=180) as r, open(dest, "wb") as f:
        f.write(r.read())

def jobs_for(path):
    """(out_path_relative_to_mp3, script_text) pairs for one test JSON."""
    d = json.load(open(path, encoding="utf-8"))
    jobs = []
    for a in d["audios"]:
        scripts = a.get("scripts", [])
        qs = a.get("questions", [])
        if a.get("paged") and any(q.get("audio") for q in qs):
            for idx, q in enumerate(qs):
                ap = q.get("audio", "")
                if ap:
                    jobs.append((ap, scripts[idx] if idx < len(scripts) else ""))
        else:
            jobs.append((a["file"], " ".join(scripts)))
    return jobs

def select_files(argv):
    names = [a for a in argv if not a.startswith("--")]
    level = argv[argv.index("--level")+1] if "--level" in argv else None
    files = sorted(glob.glob(os.path.join(MORE, "*.json")))
    files = [f for f in files if not os.path.basename(f).startswith("_")]
    if names:
        files = [f for f in files if os.path.splitext(os.path.basename(f))[0] in names]
    elif level:
        files = [f for f in files if os.path.basename(f).startswith(level + "_")]
    elif "--all" not in argv and "--estimate" not in argv:
        print(__doc__); sys.exit(1)
    return files

def main():
    argv = sys.argv[1:]
    files = select_files(argv)
    if not files:
        print("no matching files in tools/listening_more/"); return 1

    total_chars = 0; total_jobs = 0; todo = []
    for fp in files:
        for rel, sc in jobs_for(fp):
            out = os.path.join(ROOT, "mp3", *rel.split("/"))
            done = os.path.exists(out) and os.path.getsize(out) > 2000
            n = sum(len(t) for _, t in segs(sc))
            total_jobs += 1
            if not done:
                total_chars += n
                todo.append((rel, sc))
    print(f"{len(files)} test files -> {total_jobs} audio files, {len(todo)} pending, "
          f"~{total_chars:,} chars TTS pendientes (~{total_chars/1000:.0f}k creditos ElevenLabs)")
    if "--estimate" in argv:
        return 0
    if not todo:
        print("nothing to do"); return 0

    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        kf = os.path.join(ROOT, "A2 Level.txt")
        if os.path.exists(kf):
            key = open(kf, encoding="utf-8").read().strip()
    if not key:
        print('FALTA la API key: crea "A2 Level.txt" en la raiz del repo (solo la key, gitignored)'
              " o define la variable de entorno ELEVENLABS_API_KEY.")
        return 1
    tmp = tempfile.mkdtemp(prefix="genaudio_")
    sil = os.path.join(tmp, "s.mp3"); lead = os.path.join(tmp, "l.mp3")
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","0.5","-q:a","9",sil], check=True, capture_output=True)
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","1.5","-q:a","9",lead], check=True, capture_output=True)
    for n, (rel, sc) in enumerate(todo):
        out = os.path.join(ROOT, "mp3", *rel.split("/"))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        files_l = [lead]
        for j, (vid, txt) in enumerate(segs(sc)):
            seg = os.path.join(tmp, f"{n}_{j}.mp3")
            print(f"  {rel} seg {j+1}...")
            tts(key, vid, txt, seg); files_l += [seg, sil]; time.sleep(0.12)
        lst = os.path.join(tmp, f"{n}.txt")
        open(lst, "w", encoding="utf-8").write("".join(f"file '{f.replace(os.sep,'/')}'\n" for f in files_l))
        subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c:a","libmp3lame","-q:a","4",out], check=True, capture_output=True)
        print(f"OK {rel} ({os.path.getsize(out)//1024} KB)")
    print("DONE", len(todo), "files")
    return 0

if __name__ == "__main__":
    sys.exit(main())
