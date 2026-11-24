#!/usr/bin/env python3
"""Marca páginas fijas migradas de Blogger y limpia los listados dinámicos."""
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(BASE)
POSTS = os.path.join(SITE, "src", "content", "posts")

PAGES = [
    "argcol-e/2022-01-18-estrategias.md",
    "argcol-e/2022-01-18-gestor.md",
    "argcol-e/2022-01-18-intrumentos.md",
    "argcol-e/2022-01-18-objetivos.md",
    "argcol-e/2022-01-18-que-es.md",
    "argcol-e/2022-01-18-rendimientos.md",
    "argcol-e/2022-01-19-como-se-invierte.md",
    "argcol-e/2023-01-13-rentabilidad.md",
    "argcol-e/2024-11-30-informes-mensuales.md",
    "documentos/2024-08-01-informes-mensuales.md",
    "documentos/2024-08-05-informes-especiales.md",
    "documentos/2024-08-06-cierres-de-mercados.md",
    "documentos/2024-11-19-informe-semanal-de-mercados.md",
]

BODIES = {
    "argcol-e/2024-11-30-informes-mensuales.md":
        "Informes mensuales de la cartera **ARGCOL E**: evolución, estrategia y rendimiento del portafolio.",
    "documentos/2024-08-01-informes-mensuales.md":
        "Informes mensuales de mercados publicados por Argcol Capital.",
    "documentos/2024-08-05-informes-especiales.md":
        "Informes especiales de mercados publicados por Argcol Capital.",
    "documentos/2024-08-06-cierres-de-mercados.md":
        "Cierre diario de los mercados: principales índices, tasas, divisas y hechos relevantes de cada jornada.",
    "documentos/2024-11-19-informe-semanal-de-mercados.md":
        "Resumen semanal de mercados: evolución de índices, tasas y principales acontecimientos macroeconómicos.",
}


def split_front(text):
    if not text.startswith("---"):
        return "", text
    end = text.find("\n---", 3)
    if end == -1:
        return "", text
    return text[: end + 4], text[end + 4 :]


def main():
    for rel in PAGES:
        path = os.path.join(POSTS, rel)
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        text = text.replace('type: "articulo"', 'type: "pagina"', 1)
        if rel in BODIES:
            front, _ = split_front(text)
            text = front + "\n\n" + BODIES[rel] + "\n"
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        print(f"pagina: {rel}")

    # Página de error del acceso privado: no debe publicarse.
    err = os.path.join(POSTS, "argcol-e/2023-04-19-error.md")
    with open(err, encoding="utf-8") as fh:
        text = fh.read()
    text = text.replace("draft: false", "draft: true", 1)
    with open(err, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print("draft: argcol-e/2023-04-19-error.md")


if __name__ == "__main__":
    main()
