#!/usr/bin/env python3
"""Migración correcta del blog notas.argcol.com.ar.

- Guarda en la carpeta REAL del sitio: ../src/content/posts/<seccion>/
- Fechas reales (parsea el published de Blogger, zona Argentina)
- Sección según las etiquetas del post
- Convierte el HTML a Markdown conservando títulos, párrafos, listas,
  negritas, enlaces e imágenes
- Evita duplicados (mismo título + fecha)
"""
import html
import json
import os
import re
import time
import unicodedata
from datetime import datetime, timedelta, timezone

import requests

BASE = os.path.dirname(os.path.abspath(__file__))
SITE_ROOT = os.path.dirname(BASE)  # carpeta Argcol Capital
OUT_POSTS = os.path.join(SITE_ROOT, "src", "content", "posts")
OUT_TAGS = os.path.join(SITE_ROOT, "src", "content", "etiquetas")
BLOG = "https://notas.argcol.com.ar"

ARG = timezone(timedelta(hours=-3))


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    value = re.sub(r"-{2,}", "-", value)
    return value[:90] or "post"


def parse_date(raw: str):
    raw = (raw or "").strip()
    if not raw:
        return None
    candidates = [raw, raw.replace("Z", "+00:00")]
    for c in candidates:
        try:
            return datetime.fromisoformat(c)
        except Exception:
            pass
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z",
                "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw, fmt)
        except Exception:
            pass
    return None


def ar_date(dt) -> str:
    if dt is None:
        dt = datetime.now()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    dt = dt.astimezone(ARG)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000-03:00")


def pick_section(tags):
    low = [t.lower().strip() for t in tags]
    def has(*words):
        return any(w in " | ".join(low) for w in words)
    if has("etf", "etfs", "fondo indexado"):
        return "etf"
    if has("ratio", "ratios", "indicador", "indicadores"):
        return "ratios"
    if has("empresa", "empresas", "brk", "berkshire"):
        return "empresas"
    if has("economía", "economia", "economía", "macro", "inflación", "pib"):
        return "economia"
    if has("inversión", "inversion", "bolsa", "dividendo", "cartera", "portfolio",
           "lazy", "mila", "plazo fijo", "pyme"):
        return "inversion"
    return "mercado"


# ----------------------------------------------------------------- HTML → MD
def html_to_md(fragment: str) -> str:
    if not fragment:
        return ""
    s = fragment

    # Bloques que aportan saltos
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</(p|div|section|article|header|footer|tr)\s*>", "\n\n", s, flags=re.I)
    s = re.sub(r"<(p|div|section|article|header|footer|tr)[^>]*>", "", s, flags=re.I)

    # Títulos
    for level in range(1, 7):
        s = re.sub(
            rf"<h{level}[^>]*>(.*?)</h{level}>",
            lambda m, n=level: "\n\n" + ("#" * n) + " " + m.group(1).strip() + "\n\n",
            s, flags=re.I | re.S,
        )

    # Listas
    s = re.sub(r"<li[^>]*>", "\n- ", s, flags=re.I)
    s = re.sub(r"</li\s*>", "", s, flags=re.I)
    s = re.sub(r"</?(ul|ol)[^>]*>", "\n", s, flags=re.I)

    # Negritas e itálicas
    s = re.sub(r"</?(strong|b)\s*>", "**", s, flags=re.I)
    s = re.sub(r"</?(em|i)\s*>", "*", s, flags=re.I)

    # Blockquote
    s = re.sub(r"<blockquote[^>]*>(.*?)</blockquote>",
               lambda m: "\n\n> " + re.sub(r"\s+", " ", m.group(1)).strip() + "\n\n",
               s, flags=re.I | re.S)

    # Enlaces
    s = re.sub(
        r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        lambda m: f"[{re.sub(r'<[^>]+>', '', m.group(2)).strip()}]({m.group(1)})",
        s, flags=re.I | re.S,
    )

    # Imágenes
    s = re.sub(
        r'<img\s+[^>]*src=["\']([^"\']+)["\'][^>]*>',
        lambda m: f"\n\n![]({m.group(1)})\n\n",
        s, flags=re.I,
    )

    # Restos
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = s.replace("\u00a0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    lines = [ln.rstrip() for ln in s.split("\n")]
    return "\n".join(lines).strip()


def fetch_all():
    url = f"{BLOG}/feeds/posts/default?alt=json&max-results=500"
    r = requests.get(url, timeout=25)
    r.encoding = "utf-8"
    return r.json().get("feed", {}).get("entry", [])


def main():
    os.makedirs(OUT_POSTS, exist_ok=True)
    os.makedirs(OUT_TAGS, exist_ok=True)
    entries = fetch_all()
    print(f"Entradas recibidas: {len(entries)}")

    seen = set()
    saved = 0
    tags_all = set()

    for entry in entries:
        title = str(entry.get("title", {}).get("$t", "Sin título")).strip()
        published = entry.get("published", {}).get("$t", "")
        dt = parse_date(published)
        date_str = ar_date(dt)

        content = entry.get("content", {}).get("$t", "")
        body = html_to_md(content)

        tags = [str(c.get("term", "")).strip() for c in entry.get("category", []) if c.get("term")]
        tags = [t for t in tags if t]
        for t in tags:
            tags_all.add(t)

        link = ""
        for lnk in entry.get("link", []):
            if lnk.get("rel") == "alternate":
                link = lnk.get("href", "")
                break

        section = pick_section(tags)
        slug = slugify(title)

        key = (title.lower(), date_str[:10])
        if key in seen:
            continue
        seen.add(key)

        filename = f"{date_str[:10]}-{slug or 'post'}.md"
        out_dir = os.path.join(OUT_POSTS, section)
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, filename)
        # evita pisar
        n = 1
        while os.path.exists(path):
            path = os.path.join(out_dir, f"{date_str[:10]}-{slug}-{n}.md")
            n += 1

        fm = (
            "---\n"
            f"title: {json.dumps(title, ensure_ascii=False)}\n"
            f"date: {json.dumps(date_str, ensure_ascii=False)}\n"
            f"slug: {json.dumps(slug, ensure_ascii=False)}\n"
            f"section: {json.dumps(section, ensure_ascii=False)}\n"
            'type: "articulo"\n'
            f"tags: {json.dumps(tags, ensure_ascii=False)}\n"
            'description: ""\n'
            'hero: ""\n'
            'heroAlt: ""\n'
            f"oldUrl: {json.dumps(link, ensure_ascii=False)}\n"
            "draft: false\n"
            "---\n\n"
        )
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(fm + body + "\n")
        saved += 1
        print(f"  [{section}] {filename}")

    # Etiquetas
    created = 0
    for tag in sorted(tags_all):
        slug = slugify(tag)
        tag_path = os.path.join(OUT_TAGS, f"{slug}.md")
        if not os.path.exists(tag_path):
            with open(tag_path, "w", encoding="utf-8", newline="\n") as fh:
                fh.write("---\n" f"name: {json.dumps(tag, ensure_ascii=False)}\n" "---\n")
            created += 1

    print(f"\nPosts guardados: {saved} · etiquetas nuevas: {created}")


if __name__ == "__main__":
    main()
