#!/usr/bin/env python3
"""Genera el audio que falta de los tests extra (LISTEN_MORE) con ElevenLabs.

    python tools/gen_more_audio.py practice 4 7 --dry-run   # no gasta creditos
    python tools/gen_more_audio.py practice 4 7 --yes       # genera de verdad
    python tools/gen_more_audio.py mocks 4 7 --yes          # los MOCK 4-7

Sustituye a los gen_practiceN_audio.py de un solo test: las Practicas 4-18 y los
MOCK 4-7 viven en `const LISTEN_MORE` (no en QUIZ..QUIZ6), asi que se leen de ahi.
Como los otros generadores, lee los guiones del propio listening-quiz.html para que
el audio coincida EXACTAMENTE con las preguntas que ve el alumno.

Salida: mp3/<PREFIJO>/<NIVEL>/<archivo>.mp3 — las rutas salen del propio JSON
(`audio`/`file`), no se inventan aqui.

La API key se lee de "A2 Level.txt" en la raiz del repo (gitignored). Nunca se
imprime ni se pasa por linea de comandos.

Dos protecciones que costaron dinero aprender:
  * PREFLIGHT de hablantes: si un guion trae una etiqueta ("Marcus:") que no esta
    en las listas de voces, el splitter no la reconoce y el TTS la LEE EN VOZ ALTA
    ("Marcus: hola"). Se aborta antes de gastar un solo credito.
  * REANUDABLE: los mp3 ya generados se saltan. Si la corrida se corta a la mitad,
    relanzar no vuelve a cobrar lo ya hecho.
"""
import os, re, sys, json, time, subprocess, tempfile, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "listening-quiz.html")
KEYFILE = os.path.join(ROOT, "A2 Level.txt")

MODEL = "eleven_multilingual_v2"
FMT = "mp3_44100_128"

# Mismas voces que P1-P3, para que no cambie el timbre entre practicas.
V_F = "FGY2WhTYpPnrIDTdsKH5"  # Laura  (femenina joven)
V_M = "TX3LPaxmHKxFdv7VOQHJ"  # Liam   (masculina joven)
V_N = "JBFqnCBsd6RMkjVDRZzb"  # George (narrador / entrevistador / roles)

FEMALE = {"Girl","Woman","Mum","Mia","Anna","Emma","Kate","Lucy","Grace","Elena",
          "Sofia","Lily","Nora","Ruby","Clara","Hannah","Sophie","Laura","Julia",
          "Maria","Sarah","Chloe","Amy","Ella","Zoe","Isabel","Rosa"}
MALE   = {"Boy","Man","Tom","Ben","Sam","Jack","Noah","Daniel","Hugo","Leo","Max",
          "Ethan","Oliver","Dad","Marcus","David","Peter","James","Luis","Carlos",
          "Andrew","Robert","Michael","Chris","Paul"}
# Roles -> voz de narrador (igual que en los generadores previos)
ROLES  = {"Teacher","Coach","Librarian","Interviewer","Assistant","Presenter",
          "Narrator","Guide","Receptionist","Manager","Announcer","Host","Doctor",
          "Waiter","Guard","Clerk","Officer","Speaker"}

# Palabras que llevan dos puntos pero NO son un hablante.
NON_SPEAKER = {"Part","Question","Note","Track","Section","Example","Task","Answer"}

KNOWN = FEMALE | MALE | ROLES

# Splitter: solo reconoce nombres conocidos (si no, no parte y se leeria el nombre).
SPK = re.compile(r'\s*\b(' + '|'.join(sorted(KNOWN, key=len, reverse=True)) + r'):\s*')
# Detector generico, solo para el preflight.
LABEL = re.compile(r'(?:^|(?<=[.!?"’\')\]])\s|\n)\s*([A-Z][A-Za-z\'\-]{1,20})\s*:\s')


def vfor(name):
    return V_F if name in FEMALE else V_M if name in MALE else V_N


def segs(script):
    """Parte un guion en [(voice_id, texto)] segun la etiqueta de hablante."""
    p = SPK.split(script)
    out = []
    lead = p[0].strip()
    if lead:
        out.append((V_N, lead))
    for i in range(1, len(p), 2):
        t = p[i + 1].strip() if i + 1 < len(p) else ""
        if t:
            out.append((vfor(p[i]), t))
    return out


def extract_obj(varname):
    html = open(HTML, encoding="utf-8").read()
    s = html.index("const " + varname + " = {") + len("const " + varname + " = ")
    i, depth = s, 0
    while i < len(html):
        c = html[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return json.loads(html[s:i + 1])
        i += 1
    raise RuntimeError("no se encontro " + varname)


def build_jobs(kind, lo, hi):
    """kind: 'practice' | 'mocks'. Devuelve [(ruta_relativa, guion)]."""
    d = extract_obj("LISTEN_MORE")
    jobs = []
    for lev in ["A2", "B1", "B2", "C1"]:
        bank = d[lev][kind]
        for n in range(lo, hi + 1):
            idx = n - 4                      # practice[0] == Practica 4
            if idx < 0 or idx >= len(bank):
                continue
            for a in bank[idx]["audios"]:
                scripts = a.get("scripts", [])
                qs = a.get("questions", [])
                if a.get("paged") and any(q.get("audio") for q in qs):
                    for i, q in enumerate(qs):
                        if q.get("audio"):
                            jobs.append((q["audio"], scripts[i] if i < len(scripts) else ""))
                else:
                    jobs.append((a["file"], " ".join(scripts)))
    return jobs


def preflight(jobs):
    """Aborta si hay etiquetas de hablante que el splitter no reconoce."""
    seen = {}
    for rel, sc in jobs:
        for lab in LABEL.findall(sc):
            if lab not in KNOWN and lab not in NON_SPEAKER:
                seen.setdefault(lab, []).append(rel)
    if seen:
        print("\n*** ABORTADO: etiquetas de hablante desconocidas ***")
        print("Se leerian en voz alta dentro del audio. Anadelas a FEMALE/MALE/ROLES:\n")
        for lab in sorted(seen):
            print("   %-16s %d apariciones  (ej. %s)" % (lab, len(seen[lab]), seen[lab][0]))
        sys.exit(1)


def tts(key, vid, txt, dest, tries=4):
    body = json.dumps({"text": txt, "model_id": MODEL,
                       "voice_settings": {"stability": 0.45, "similarity_boost": 0.8}}).encode()
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=%s" % (vid, FMT),
        data=body, method="POST",
        headers={"xi-api-key": key, "Content-Type": "application/json",
                 "Accept": "audio/mpeg"})
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                data = r.read()
            if not data:
                raise RuntimeError("respuesta vacia")
            with open(dest, "wb") as f:
                f.write(data)
            return
        except urllib.error.HTTPError as e:
            # 401/422 = key o peticion mal: no reintentar, no quemar creditos.
            if e.code in (401, 403, 422):
                sys.exit("\nERROR HTTP %d de ElevenLabs. Revisa la API key o el plan." % e.code)
            if attempt == tries - 1:
                raise
            time.sleep(2 ** attempt)
        except Exception:
            if attempt == tries - 1:
                raise
            time.sleep(2 ** attempt)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if len(args) != 3:
        sys.exit(__doc__)
    kind, lo, hi = args[0], int(args[1]), int(args[2])
    if kind not in ("practice", "mocks"):
        sys.exit("kind debe ser 'practice' o 'mocks'")

    jobs = build_jobs(kind, lo, hi)
    preflight(jobs)

    pending = [(rel, sc) for rel, sc in jobs
               if not os.path.exists(os.path.join(ROOT, "mp3", *rel.split("/")))]
    done = len(jobs) - len(pending)
    chars = sum(len(sc) for _, sc in pending)

    print("%s %d-%d  ->  %d mp3 en total" % (kind, lo, hi, len(jobs)))
    if done:
        print("   ya existen: %d (se saltan, no se recobran)" % done)
    print("   por generar: %d mp3" % len(pending))
    print("   creditos estimados: %s" % format(chars, ","))
    if "--dry-run" in flags:
        print("\n[dry-run] no se llamo a la API. Muestra de reparto de voces:")
        for rel, sc in pending[:3]:
            who = ["F" if v == V_F else "M" if v == V_M else "N" for v, _ in segs(sc)]
            print("   %-28s %d segmentos  %s" % (rel, len(who), "".join(who)))
        return
    if "--yes" not in flags:
        sys.exit("\nAnade --yes para gastar creditos de verdad.")
    if not pending:
        print("Nada que hacer.")
        return

    # utf-8-sig: el Notepad de Windows guarda con BOM y el BOM invalidaria la key.
    key = open(KEYFILE, encoding="utf-8-sig").read().strip()
    if not key:
        sys.exit("La API key esta vacia: %s" % KEYFILE)

    tmp = tempfile.mkdtemp(prefix="more_")
    sil = os.path.join(tmp, "s.mp3")
    lead = os.path.join(tmp, "l.mp3")
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                    "-t", "0.5", "-q:a", "9", sil], check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                    "-t", "1.5", "-q:a", "9", lead], check=True, capture_output=True)

    for n, (rel, sc) in enumerate(pending, 1):
        out = os.path.join(ROOT, "mp3", *rel.split("/"))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        parts = segs(sc)
        files = [lead]
        for j, (vid, txt) in enumerate(parts):
            seg = os.path.join(tmp, "%d_%d.mp3" % (n, j))
            tts(key, vid, txt, seg)
            files += [seg, sil]
            time.sleep(0.15)
        lst = os.path.join(tmp, "%d.txt" % n)
        open(lst, "w", encoding="utf-8").write(
            "".join("file '%s'\n" % f.replace(os.sep, "/") for f in files))
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                        "-c:a", "libmp3lame", "-q:a", "4", out],
                       check=True, capture_output=True)
        print("[%d/%d] %-30s %d seg  %d KB" %
              (n, len(pending), rel, len(parts), os.path.getsize(out) // 1024))

    print("LISTO: %d mp3 generados" % len(pending))


if __name__ == "__main__":
    main()
