#!/usr/bin/env python3
"""Migra Argcol-E y Documentos (posts + páginas) desde feeds de Blogger."""
import html, json, os, re, unicodedata
from datetime import datetime, timedelta, timezone
import requests

BASE = os.path.dirname(os.path.abspath(__file__))
SITE_ROOT = os.path.dirname(BASE)
OUT_POSTS = os.path.join(SITE_ROOT, "src", "content", "posts")
ARG = timezone(timedelta(hours=-3))

SOURCES = [
    {
        "name": "argcol-e",
        "section": "argcol-e",
        "feeds": [
            "https://ae.argcol.com.ar/feeds/posts/default?alt=json&max-results=500",
            "https://ae.argcol.com.ar/feeds/pages/default?alt=json&max-results=500",
        ],
    },
    {
        "name": "documentos",
        "section": "documentos",
        "feeds": [
            "https://documentos.argcol.com.ar/feeds/posts/default?alt=json&max-results=500",
            "https://documentos.argcol.com.ar/feeds/pages/default?alt=json&max-results=500",
        ],
    },
]

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
    for c in [raw, raw.replace("Z", "+00:00")]:
        try:
            return datetime.fromisoformat(c)
        except Exception:
            pass
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f%z","%Y-%m-%dT%H:%M:%S%z","%Y-%m-%dT%H:%M:%S.%fZ","%Y-%m-%dT%H:%M:%SZ","%Y-%m-%d"):
        try:
            return datetime.strptime(raw, fmt)
        except Exception:
            pass
    return None

def ar_date(dt):
    if dt is None:
        dt = datetime.now(tz=ARG)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(ARG).strftime("%Y-%m-%dT%H:%M:%S.000-03:00")

def html_to_md(fragment: str) -> str:
    if not fragment:
        return ""
    s = fragment
    # remove scripts/styles
    s = re.sub(r"<script[\s\S]*?</script>", "", s, flags=re.I)
    s = re.sub(r"<style[\s\S]*?</style>", "", s, flags=re.I)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</(p|div|section|article|header|footer|tr)\s*>", "\n\n", s, flags=re.I)
    s = re.sub(r"<(p|div|section|article|header|footer|tr)[^>]*>", "", s, flags=re.I)
    for level in range(1, 7):
        s = re.sub(rf"<h{level}[^>]*>(.*?)</h{level}>",
                   lambda m, n=level: "\n\n" + "#"*n + " " + re.sub(r'<[^>]+>','',m.group(1)).strip() + "\n\n",
                   s, flags=re.I|re.S)
    s = re.sub(r"<li[^>]*>", "\n- ", s, flags=re.I)
    s = re.sub(r"</li\s*>", "", s, flags=re.I)
    s = re.sub(r"</?(ul|ol)[^>]*>", "\n", s, flags=re.I)
    s = re.sub(r"</?(strong|b)\s*>", "**", s, flags=re.I)
    s = re.sub(r"</?(em|i)\s*>", "*", s, flags=re.I)
    s = re.sub(r"<blockquote[^>]*>(.*?)</blockquote>",
               lambda m: "\n\n> " + re.sub(r"\s+"," ",re.sub(r'<[^>]+>','',m.group(1))).strip() + "\n\n",
               s, flags=re.I|re.S)
    s = re.sub(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
               lambda m: f"[{re.sub(r'<[^>]+>','',m.group(2)).strip()}]({m.group(1)})",
               s, flags=re.I|re.S)
    # images - keep alt if present
    def img_repl(m):
        tag = m.group(0)
        src = re.search(r'src=["\']([^"\']+)["\']', tag, re.I)
        alt = re.search(r'alt=["\']([^"\']*)["\']', tag, re.I)
        if not src: return ""
        a = alt.group(1).strip() if alt else ""
        return f"\n\n![{a}]({src.group(1)})\n\n"
    s = re.sub(r"<img\b[^>]*>", img_repl, s, flags=re.I)
    # iframes (keep as html)
    s = re.sub(r"(<iframe[\s\S]*?</iframe>)", lambda m: "\n\n" + m.group(1) + "\n\n", s, flags=re.I)
    s = re.sub(r"<(?!iframe|/iframe)[^>]+>", "", s)
    s = html.unescape(s)
    s = s.replace("\u00a0", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    lines = [ln.rstrip() for ln in s.split("\n")]
    return "\n".join(lines).strip()

def fetch_entries(url):
    r = requests.get(url, timeout=30)
    r.encoding = "utf-8"
    return r.json().get("feed", {}).get("entry", [])

def first_img(html_text):
    m = re.search(r'<img\b[^>]*src=["\']([^"\']+)["\']', html_text or "", re.I)
    return m.group(1) if m else ""

def clean_desc(text, limit=180):
    t = re.sub(r"\s+", " ", text or "").strip()
    if len(t) <= limit: return t
    cut = t[:limit].rsplit(" ",1)[0]
    return cut + "..."

def main():
    total = 0
    for src in SOURCES:
        section = src["section"]
        out_dir = os.path.join(OUT_POSTS, section)
        os.makedirs(out_dir, exist_ok=True)
        seen = set()
        for feed in src["feeds"]:
            entries = fetch_entries(feed)
            print(f"{src['name']} feed {feed.split('/')[-2]} -> {len(entries)}")
            for entry in entries:
                title = str(entry.get("title", {}).get("$t", "Sin título")).strip() or "Sin título"
                published = entry.get("published", {}).get("$t", "") or entry.get("updated",{}).get("$t","")
                dt = parse_date(published)
                date_str = ar_date(dt)
                content = entry.get("content", {}).get("$t", "")
                body = html_to_md(content)
                if not body.strip():
                    continue
                tags = [str(c.get("term","")).strip() for c in entry.get("category",[]) if c.get("term")]
                link = ""
                for lnk in entry.get("link", []):
                    if lnk.get("rel") == "alternate":
                        link = lnk.get("href","")
                        break
                slug = slugify(title)
                key = (title.lower(), date_str[:10])
                if key in seen:
                    continue
                seen.add(key)
                hero = first_img(content)
                plain = re.sub(r'!?\[[^\]]*\]\([^)]+\)',' ', body)
                plain = re.sub(r'[#>*_`-]',' ', plain)
                desc = clean_desc(plain)
                filename = f"{date_str[:10]}-{slug or 'post'}.md"
                path = os.path.join(out_dir, filename)
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
                    "type: \"articulo\"\n"
                    f"tags: {json.dumps(tags, ensure_ascii=False)}\n"
                    f"description: {json.dumps(desc, ensure_ascii=False)}\n"
                    f"hero: {json.dumps(hero, ensure_ascii=False)}\n"
                    "heroAlt: \"\"\n"
                    f"oldUrl: {json.dumps(link, ensure_ascii=False)}\n"
                    "draft: false\n"
                    "---\n\n"
                )
                with open(path, "w", encoding="utf-8", newline="\n") as fh:
                    fh.write(fm + body + "\n")
                total += 1
                print(f"  [{section}] {os.path.basename(path)}")
    print(f"TOTAL: {total}")

if __name__ == "__main__":
    main()
