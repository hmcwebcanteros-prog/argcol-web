#!/usr/bin/env python3
"""Rehace el cuerpo Markdown de las 51 entradas migradas.

Corrige dos problemas del primer conversor:
  1. Las imágenes de Blogger venían dentro de <a><img></a> y se perdían.
  2. Los iframes (videos) se borraban y dejaban la entrada vacía.

Conserva frontmatter intacto y reescribe solo el cuerpo.
"""
import glob
import html
import json
import os
import re

import requests

BASE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(BASE)
POSTS = os.path.join(SITE, "src", "content", "posts")
BLOG = "https://notas.argcol.com.ar"


def fragment(fragmento: str) -> str:
    if not fragmento:
        return ""

    s = fragmento

    # 1) guardar iframes
    iframes = {}

    def save_iframe(match):
        key = f"@@IFRAME{len(iframes)}@@"
        iframes[key] = match.group(0)
        return "\n\n" + key + "\n\n"

    s = re.sub(r"<iframe[^>]*>.*?</iframe>", save_iframe, s, flags=re.I | re.S)
    s = re.sub(r"<iframe[^>]*/?>", save_iframe, s, flags=re.I)

    # 2) imágenes ANTES que los enlaces (Blogger las envuelve en <a>)
    def save_image(match):
        src = match.group(1)
        return f"\n\n![]({src})\n\n"

    s = re.sub(
        r'<a\s+[^>]*href=["\'][^"\']+["\'][^>]*>\s*<img[^>]*src=["\']([^"\']+)["\'][^>]*>\s*</a>',
        save_image,
        s,
        flags=re.I | re.S,
    )
    s = re.sub(
        r'<img[^>]*src=["\']([^"\']+)["\'][^>]*>',
        save_image,
        s,
        flags=re.I,
    )

    # 3) bloques
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</(p|div|section|article|header|footer|tr)\s*>", "\n\n", s, flags=re.I)
    s = re.sub(r"<(p|div|section|article|header|footer|tr)[^>]*>", "", s, flags=re.I)

    # 4) títulos
    for level in range(1, 7):
        s = re.sub(
            rf"<h{level}[^>]*>(.*?)</h{level}>",
            lambda m, n=level: "\n\n" + ("#" * n) + " " + re.sub(r"<[^>]+>", "", m.group(1)).strip() + "\n\n",
            s,
            flags=re.I | re.S,
        )

    # 5) listas
    s = re.sub(r"<li[^>]*>", "\n- ", s, flags=re.I)
    s = re.sub(r"</li\s*>", "", s, flags=re.I)
    s = re.sub(r"</?(ul|ol)[^>]*>", "\n", s, flags=re.I)

    # 6) énfasis
    s = re.sub(r"</?(strong|b)\s*>", "**", s, flags=re.I)
    s = re.sub(r"</?(em|i)\s*>", "*", s, flags=re.I)

    # 7) citas
    s = re.sub(
        r"<blockquote[^>]*>(.*?)</blockquote>",
        lambda m: "\n\n> " + re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.group(1))).strip() + "\n\n",
        s,
        flags=re.I | re.S,
    )

    # 8) enlaces con texto
    s = re.sub(
        r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        lambda m: f"[{re.sub(r'<[^>]+>', '', m.group(2)).strip()}]({m.group(1)})"
        if re.sub(r"<[^>]+>", "", m.group(2)).strip()
        else "",
        s,
        flags=re.I | re.S,
    )

    # 9) restos
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = s.replace("\u00a0", " ")

    # 10) restaurar iframes
    for key, value in iframes.items():
        s = s.replace(key, value)

    # 11) limpieza de espacios
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    lines = [line.rstrip() for line in s.split("\n")]
    return "\n".join(lines).strip()


def main():
    response = requests.get(f"{BLOG}/feeds/posts/default?alt=json&max-results=500", timeout=40)
    response.encoding = "utf-8"
    entries = response.json().get("feed", {}).get("entry", [])

    by_link = {}
    for entry in entries:
        link = ""
        for item in entry.get("link", []):
            if item.get("rel") == "alternate":
                link = item.get("href", "")
                break
        content = entry.get("content", {}).get("$t", "")
        if link:
            by_link[link] = content

    total = 0
    images = 0
    for path in glob.glob(os.path.join(POSTS, "**", "*.md"), recursive=True):
        text = open(path, encoding="utf-8-sig").read()
        end = text.find("\n---", 3)
        if end == -1:
            continue
        front = text[3:end]
        match = re.search(r'^oldUrl:\s*"(.*)"\s*$', front, re.M)
        if not match:
            continue
        content = by_link.get(match.group(1), "")
        if not content:
            continue
        body = fragment(content)
        if len(body.strip()) < 5:
            continue
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("---" + front + "\n---\n\n" + body + "\n")
        total += 1
        images += body.count("![](")

    print(f"Entradas reescritas: {total} · imágenes conservadas: {images}")


if __name__ == "__main__":
    main()
