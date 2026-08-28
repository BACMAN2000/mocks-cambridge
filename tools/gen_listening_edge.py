#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera con Edge TTS todo el audio de Listening que falta.

Los generadores anteriores usan ElevenLabs, y los 836 mp3 que quedaban
pendientes suman 532.844 caracteres: casi cuatro veces la cuota mensual del
plan. Por eso llevaban parados desde julio.

Edge TTS es gratis y sin limite, asi que aqui se hace lo mismo con el:
por cada guion se parte el texto por hablante, cada linea se dice con una
voz distinta y las lineas se pegan con una pausa corta, como en un examen
de verdad.

Lee tools/listening_more/{NIVEL}_{p|m}{N}.json — que ya tienen los guiones
escritos — y escribe en mp3/P{N}/ y mp3/M{N}/. Los que ya existen se saltan,
asi que se puede parar y seguir.

    python tools/gen_listening_edge.py              todo lo que falte
    python tools/gen_listening_edge.py A2           solo un nivel
    python tools/gen_listening_edge.py A2_p4        solo un test
    python tools/gen_listening_edge.py --contar     solo dice cuanto falta
"""
import asyncio, glob, io, json, os, re, subprocess, sys, tempfile

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MORE = os.path.join(ROOT, "tools", "listening_more")
MP3 = os.path.join(ROOT, "mp3")

FFMPEG = ("C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/"
          "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/"
          "ffmpeg-8.1.2-full_build/bin/ffmpeg.exe")
if not os.path.exists(FFMPEG):
    FFMPEG = "ffmpeg"

# Una voz por tipo de hablante. Se reparten britanicas y americanas como en
# los examenes de Cambridge, donde no todos los hablantes suenan igual.
NARRADOR = "en-GB-RyanNeural"
VOCES = {
    "female": ["en-GB-SoniaNeural", "en-GB-LibbyNeural", "en-US-JennyNeural"],
    "male":   ["en-GB-ThomasNeural", "en-GB-RyanNeural", "en-US-GuyNeural"],
}
FEMENINOS = {"girl", "woman", "mum", "mother", "sara", "mia", "anna", "carla",
             "emma", "sofia", "lucy", "kate", "helen", "sue", "jane", "amy",
             "clara", "nina", "presenter", "guide", "librarian", "receptionist"}
MASCULINOS = {"boy", "man", "dad", "father", "leo", "tom", "ben", "david",
              "mark", "paul", "james", "peter", "sam", "alex", "harry",
              "interviewer", "reporter", "coach", "manager", "assistant"}

# El ritmo del examen: mas lento cuanto mas bajo el nivel.
RITMO = {"A2": "-14%", "B1": "-8%", "B2": "-4%", "C1": "-2%"}

HABLANTE = re.compile(r"(?:^|(?<=[.!?…]))\s*([A-Z][A-Za-z]{1,14})\s*:\s*")


def voz_de(nombre, usados):
    """Voz fija por hablante dentro de un mismo guion, para que no cambie
    de persona a mitad de la conversacion."""
    n = (nombre or "").strip().lower()
    if n in usados:
        return usados[n]
    if n in FEMENINOS:
        grupo = "female"
    elif n in MASCULINOS:
        grupo = "male"
    else:
        # nombre desconocido: se reparte alternando, para que dos personas
        # seguidas no suenen igual
        grupo = "female" if len(usados) % 2 else "male"
    lista = VOCES[grupo]
    v = lista[len([x for x in usados.values() if x in lista]) % len(lista)]
    usados[n] = v
    return v


def trozos(guion):
    """Parte el guion en (voz, texto). Lo que va antes del primer hablante
    lo dice el narrador: suele ser 'Question one.'"""
    usados = {}
    partes = HABLANTE.split(guion)
    salida = []
    cabeza = partes[0].strip()
    if cabeza:
        salida.append((NARRADOR, cabeza))
    for i in range(1, len(partes), 2):
        texto = partes[i + 1].strip() if i + 1 < len(partes) else ""
        if texto:
            salida.append((voz_de(partes[i], usados), texto))
    if not salida:
        salida = [(NARRADOR, guion.strip())]
    return salida


async def di(texto, voz, ritmo, destino):
    com = edge_tts.Communicate(texto, voz, rate=ritmo)
    with open(destino, "wb") as f:
        async for trozo in com.stream():
            if trozo["type"] == "audio":
                f.write(trozo["data"])


def pega(partes, destino):
    """Une los trozos con una pausa corta entre hablantes."""
    with tempfile.TemporaryDirectory() as tmp:
        lista = os.path.join(tmp, "lista.txt")
        silencio = os.path.join(tmp, "sil.mp3")
        subprocess.run([FFMPEG, "-y", "-v", "error", "-f", "lavfi",
                        "-i", "anullsrc=r=24000:cl=mono", "-t", "0.45",
                        "-q:a", "9", silencio], check=True)
        with io.open(lista, "w", encoding="utf-8") as f:
            for i, p in enumerate(partes):
                if i:
                    f.write("file '%s'\n" % silencio.replace(os.sep, "/"))
                f.write("file '%s'\n" % p.replace(os.sep, "/"))
        subprocess.run([FFMPEG, "-y", "-v", "error", "-f", "concat", "-safe", "0",
                        "-i", lista, "-c", "copy", destino], check=True)


def destino_de(nombre_json):
    """P4/A2/ para practice 4 de A2, M5/B1/ para mock 5 de B1.

    El nivel va DENTRO de la carpeta del test, que es como lo pide el HTML
    y como estan los que ya se publicaron. Sin el, los mp3 caen un nivel
    mas arriba, el generador los da por hechos y en vivo son 404: se
    perdieron 836 asi."""
    m = re.match(r"([A-C][12])_([pm])(\d+)\.json$", nombre_json)
    if not m:
        return None, None
    nivel, tipo, n = m.group(1), m.group(2), int(m.group(3))
    carpeta = ("P%d" % n) if tipo == "p" else ("M%d" % n)
    return nivel, os.path.join(MP3, carpeta, nivel)


def trabajos(filtro):
    """Todo lo que hay que generar: (nivel, carpeta, nombre, guion)."""
    out = []
    for f in sorted(glob.glob(os.path.join(MORE, "*.json"))):
        base = os.path.basename(f)
        if base.startswith("_"):
            continue
        if filtro and not any(base.startswith(x) for x in filtro):
            continue
        nivel, carpeta = destino_de(base)
        if not nivel:
            continue
        d = json.load(io.open(f, encoding="utf-8"))
        for a in d.get("audios", []):
            scripts = a.get("scripts") or []
            if not scripts:
                continue
            if a.get("paged"):
                for i, sc in enumerate(scripts, 1):
                    out.append((nivel, carpeta, "%s-q%d" % (a["id"], i), sc))
            else:
                out.append((nivel, carpeta, a["id"], " ".join(scripts)))
    return out


async def principal(filtro, solo_contar):
    todo = trabajos(filtro)
    pendientes = []
    for nivel, carpeta, nombre, guion in todo:
        destino = os.path.join(carpeta, nombre + ".mp3")
        if os.path.exists(destino) and os.path.getsize(destino) > 1500:
            continue
        pendientes.append((nivel, carpeta, nombre, guion, destino))

    car = sum(len(g) for _, _, _, g, _ in pendientes)
    print("  %d mp3 en total · %d por generar · %s caracteres"
          % (len(todo), len(pendientes), format(car, ",")))
    if solo_contar or not pendientes:
        return

    hechos = fallos = 0
    for nivel, carpeta, nombre, guion, destino in pendientes:
        os.makedirs(carpeta, exist_ok=True)
        ritmo = RITMO.get(nivel, "-8%")
        try:
            with tempfile.TemporaryDirectory() as tmp:
                partes = []
                for i, (voz, texto) in enumerate(trozos(guion)):
                    p = os.path.join(tmp, "%02d.mp3" % i)
                    await di(texto, voz, ritmo, p)
                    if os.path.getsize(p) > 200:
                        partes.append(p)
                if not partes:
                    raise RuntimeError("sin audio")
                if len(partes) == 1:
                    os.replace(partes[0], destino)
                else:
                    pega(partes, destino)
            hechos += 1
            print("OK   %-10s %s" % (nivel, nombre))
        except Exception as e:
            fallos += 1
            print("FALLO %-9s %s — %s" % (nivel, nombre, str(e)[:60]))
    print("")
    print("  %d generados, %d fallidos" % (hechos, fallos))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    asyncio.run(principal(args, "--contar" in sys.argv))
