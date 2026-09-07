# -*- coding: utf-8 -*-
"""Lleva un banco de preguntas de una copia de los simulacros a otra.

    python porta_bancos.py <origen.html> <destino.html> NOMBRE [NOMBRE ...]
    python porta_bancos.py ... --ver          # solo dice qué haría

Los simulacros viven en tres sitios (el original, la copia del colegio y la de
la web pública) y cada copia tiene su propia marca: logo, hoja de estilo y el
puente con su plataforma. Por eso no se puede copiar el HTML entero de una sobre
otra — se lleva el banco de preguntas y nada más.

Se sustituye el TEXTO del literal, del `=` a su cierre balanceado, sin volver a
serializar nada: así lo que llega al destino es exactamente lo que hay en el
origen, con sus escapes y su sangría.
"""
import io, os, re, sys

CIERRA = {'[': ']', '{': '}', '(': ')'}


def literal(s, i):
    """Desde el paréntesis/corchete/llave en s[i], devuelve el índice de su cierre."""
    abre = s[i]
    fin = CIERRA[abre]
    j, hondura, comilla, esc = i, 0, None, False
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
        elif ch == abre:
            hondura += 1
        elif ch == fin:
            hondura -= 1
            if hondura == 0:
                return j
        j += 1
    raise ValueError('literal sin cerrar')


def span(s, nombre):
    """(inicio, fin) del valor asignado a `nombre`, sin incluir el `=`."""
    m = re.search(r'\b(?:const|var|let)\s+' + re.escape(nombre) + r'\s*=\s*', s)
    if not m:
        return None
    i = m.end()
    while i < len(s) and s[i] in ' \n\r\t':
        i += 1
    if i >= len(s) or s[i] not in CIERRA:
        return None
    return (i, literal(s, i) + 1)


def main():
    args = [a for a in sys.argv[1:] if a != '--ver']
    escribir = '--ver' not in sys.argv
    origen, destino, nombres = args[0], args[1], args[2:]
    so = io.open(origen, encoding='utf-8').read().replace('\r\n', '\n')
    crudo = io.open(destino, 'rb').read()
    nl = '\r\n' if crudo.count(b'\r\n') else '\n'
    sd = crudo.decode('utf-8').replace('\r\n', '\n')

    cambios = []
    for n in nombres:
        a, b = span(so, n) or (None, None), span(sd, n) or (None, None)
        if a[0] is None or b[0] is None:
            print('%-16s no encontrado en %s' % (n, 'el origen' if a[0] is None else 'el destino'))
            continue
        nuevo, viejo = so[a[0]:a[1]], sd[b[0]:b[1]]
        if nuevo == viejo:
            print('%-16s ya era igual' % n)
            continue
        cambios.append((b[0], b[1], nuevo, n, len(viejo), len(nuevo)))

    for ini, fin, nuevo, n, lv, ln in sorted(cambios, key=lambda x: -x[0]):
        sd = sd[:ini] + nuevo + sd[fin:]
        print('%-16s %d -> %d caracteres' % (n, lv, ln))

    if cambios and escribir:
        io.open(destino, 'w', encoding='utf-8', newline=nl).write(sd)
        print('escrito %s' % os.path.basename(destino))
    elif not cambios:
        print('nada que llevar')


if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    main()
