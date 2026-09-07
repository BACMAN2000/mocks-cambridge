# -*- coding: utf-8 -*-
"""Comprueba que las tres copias de los simulacros llevan el mismo banco.

    python tools/compara_copias.py

Los simulacros viven en tres sitios:

    original   C:\\Projects\\mocks-cambridge                       (este repo)
    colegio    C:\\Projects\\nis-portal\\mocks-cambridge            -> nis.cohasset.pe
    publica    C:\\Projects\\cohasset-community\\repo\\cambridge-mocks -> cohasset.pe

Los HTML NO son iguales y no deben serlo: cada copia lleva su logo, su hoja de
estilo y el puente con su plataforma. Lo que sí tiene que ser igual es el banco
de preguntas, y esa parte se copia a mano. El 7-sep-2026 se descubrio que la
copia publica llevaba semanas con la version vieja del Reading: los textos eran
los mismos, pero 120 preguntas de A2 seguian con CUATRO opciones cuando el Key
oficial tiene tres, arreglo que si tenian las otras dos copias.

Esto compara pregunta a pregunta, no archivo contra archivo: para cada una toma
su juego de opciones y el texto de la respuesta correcta, que es lo que decide
lo que ve el alumno. El orden en que estan puestas no cuenta como diferencia.

AVISO sobre lo que NO cubre: el Writing no tiene preguntas de opcion multiple,
asi que aqui sale con cero y "igual" no significa nada para el. Y dos copias con
el mismo banco pueden diferir en el motor que lo pinta; eso hay que mirarlo
aparte.
"""
import io
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)

COPIAS = [
    ('original', RAIZ),
    ('colegio ', r'C:\Projects\nis-portal\mocks-cambridge'),
    ('publica ', r'C:\Projects\cohasset-community\repo\cambridge-mocks'),
]
ARCHIVOS = ['reading-quiz.html', 'listening-quiz.html', 'writing-quiz.html', 'quizzes.html']

RE_LISTA = re.compile(r'["\']?\b(options|opts|choices|imgs|o)\b["\']?\s*:\s*\[')
RE_CLAVE = re.compile(r'\s*,?\s*["\']?(answer|correct|ok|key|c|a)\b["\']?\s*:\s*(\d+)')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


def corta(s, i):
    """Desde el '[' en s[i], devuelve (fin, [(a, b) de cada elemento])."""
    j, hondura, comilla, esc = i + 1, 0, None, False
    ini, trozos = j, []
    while j < len(s):
        ch = s[j]
        if esc:
            esc = False
        elif comilla:
            if ch == '\\':
                esc = True
            elif ch == comilla:
                comilla = None
        elif ch in '"\'`':
            comilla = ch
        elif ch in '([{':
            hondura += 1
        elif ch in ')}':
            hondura -= 1
        elif ch == ']':
            if hondura == 0:
                trozos.append((ini, j))
                return j, trozos
            hondura -= 1
        elif ch == ',' and hondura == 0:
            trozos.append((ini, j))
            k = j + 1
            while k < len(s) and s[k] in ' \n\r\t':
                k += 1
            ini = k
            j = k
            continue
        j += 1
    raise ValueError('lista sin cerrar')


def plano(t):
    t = t.strip()
    if len(t) >= 2 and t[0] in '"\'`' and t[-1] == t[0]:
        t = t[1:-1]
    return t.strip()


def banco(ruta):
    """{(opciones ordenadas, texto de la correcta)} — el orden no cuenta."""
    s = io.open(ruta, encoding='utf-8', errors='replace').read().replace('\r\n', '\n')
    fuera = set()
    for m in RE_LISTA.finditer(s):
        i = s.index('[', m.end() - 1)
        try:
            fin, trozos = corta(s, i)
        except ValueError:
            continue
        if not (2 <= len(trozos) <= 8):
            continue
        mc = RE_CLAVE.match(s, fin + 1)
        if not mc:
            continue
        k = int(mc.group(2))
        if k >= len(trozos):
            continue
        vals = [plano(s[a:b]) for a, b in trozos]
        fuera.add((tuple(sorted(vals)), vals[k]))
    return fuera


def main():
    fallos = 0
    for f in ARCHIVOS:
        bancos = {}
        for et, d in COPIAS:
            p = os.path.join(d, f)
            if os.path.exists(p):
                bancos[et] = banco(p)
        if not bancos:
            print('%-22s (no está en ninguna copia)' % f)
            continue
        base_et, base = sorted(bancos.items())[0]
        igual = all(v == base for v in bancos.values())
        print('%-22s %s  ->  %s'
              % (f, {k: len(v) for k, v in bancos.items()}, 'igual' if igual else 'DIVERGE'))
        if not igual:
            fallos += 1
            for et, v in bancos.items():
                if v is base:
                    continue
                print('      %s: %d preguntas solo suyas, %d que le faltan'
                      % (et, len(v - base), len(base - v)))
    if fallos:
        print('\n%d archivo(s) con las copias descuadradas. Lleva el banco bueno a la que '
              'se quedo atras: tools/porta_bancos.py, o a mano, pero NO copies el HTML '
              'entero — te llevarias la marca de otra web.' % fallos)
    else:
        print('\nlas tres copias llevan el mismo banco')
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
