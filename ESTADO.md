# Estado del proyecto — Argcol Capital

> Documento de traspaso para retomar el trabajo en cualquier sesión sin releer toda la conversación.
> Última actualización: **2026-11-23**

---

## 1. En 30 segundos

- El sitio es un **family office**, **no un portal de noticias**. Menú superior, **idéntico en nombres y orden a `argcol.com.ar`**: **Home · Sobre la Cía. · Argcol - E · Notas · Documentos · Contacto**. El **único ítem excluido es "Access"**, por pedido explícito.
- Paleta actual: **azul institucional `#0451E4` + ámbar `#F59E0B`**, fondos/grises claros (regla 60-30-10). El usuario probó rojo/amarillo pero pidió volver al tono azul.
- Código: **Astro estático, 51 notas reales migradas, 88 páginas generadas**. Build verificado (`npm.cmd run build` → OK).
- GitHub: **`https://github.com/hmcwebcanteros-prog/argcol-web`** (público, rama `main`). Commit actual **`9adc5f7`** pusheado.
- Cloudflare: **Worker `https://argcol-website.argcol-capital.workers.dev/` ya publicado** con el rediseño nuevo. URL verificada.
- ✅ **Todo cerrado**: contenido, código, GitHub y deploy.

---

## 2. Cambios de esta sesión (vuelta al azul)

| Archivo | Cambio |
|---|---|
| `src/styles/global.css` | Paleta completa vuelta a azul (`#0451E4`) + ámbar (`#F59E0B`). Gradientes, sombras, variables CSS. Sin rojo. |
| `src/layouts/Base.astro` | `theme-color` → `#0451E4`. |
| `public/favicon.svg` | Favicon azul/ámbar. |
| `public/og-default.png` | Imagen Open Graph degradado azul + texto "Family office · Gestión patrimonial". |
| `src/components/Header.astro` | Menú con 6 ítems, **mismo orden y nombres que argcol.com.ar**: Home, Sobre la Cía., **Argcol - E**, Notas, Documentos, Contacto. **Sin Access** (único ítem excluido a pedido). Enlaces externos con flecha ↗ que se abren en pestaña distinta. |
| `src/pages/index.astro` | Home **editorial y elegante**, sin aspecto de blog: hero sobrio, declaración "Nuestra mirada", enfoque en 3 filas numeradas y cierre de contacto. **Sin tarjetas de notas, sin panel lateral y sin newsletter en la home.** |
| `ESTADO.md` | Documento reescrito con paleta azul, home editorial y deployment confirmado. |

---

## 3. Contenido y páginas

- **51 notas reales** migradas del Blogger `notas.argcol.com.ar` a `src/content/posts/{seccion}/`.
  Distribución: inversión 25, economía 16, mercado 3, ETF 3, ratios 4, empresas 2.
- 233 imágenes recuperadas de los cuerpos y videos (YouTube/Spotify) conservados.
- Secciones: `mercado`, `inversion`, `economia`, `empresas`, `ratios`, `etf`.
- Páginas: portada (`/`), secciones con paginación, artículo, etiquetas, archivo (`/archivo/`), buscador (`/buscar/`), `/admin/`, `/privacidad/`, `rss.xml`, `sitemap.xml`, `robots.txt`, `search.json`, 404.

---

## 4. GitHub

| Item | Valor |
|---|---|
| Repo (para conectar / clonar) | **`https://github.com/hmcwebcanteros-prog/argcol-web`** |
| Clone | `https://github.com/hmcwebcanteros-prog/argcol-web.git` |
| Rama | `main` |
| Commit actual | `9adc5f7` — "Volver a la paleta azul institucional en todo el sitio" |
| Estado | ✅ pusheado. `git status` limpio. |

---

## 5. Cloudflare — Deploy confirmado ✅

| URL | Resultado |
|---|---|
| `https://argcol-website.argcol-capital.workers.dev/` | HTTP 200 — Título "Argcol Capital — Family Office", H1 "El patrimonio, con visión de largo plazo", sin Access. |
| `https://argcol-website.argcol-capital.workers.dev/archivo/` | HTTP 200 — Título "Archivo — Argcol Capital", sin Access. |
| `https://argcol-website.argcol-capital.workers.dev/notas/` | HTTP 200 — Sección de notas con filtro por año/etiqueta. |

Deploy hecho con `npm.cmd run build` + `npm run deploy` (wrangler 4.167.0, cuenta `argcol-capital`). La URL `https://argcol-website.argcol-capital.workers.dev/` ya muestra el rediseño nuevo.

---

## 6. Apps Script (formularios)

URL desplegada (hardcodeada en `src/lib/site.ts`):

```
https://script.google.com/macros/s/AKfycbxqGZydGL6ttvuPmc8QS9RCtm8eqSOMvrUDQ_9LmzHKa9LYYJ2i6telRYAQbToxOzBR/exec
```

- Newsletter: `email`, `website` (honeypot), `origen`.
- Contacto: `nombre`, `email`, `asunto`, `mensaje`, `website` (honeypot).

---

## 7. Particularidades del entorno

- La ruta tiene acento: **`Aplicación`**. Usar siempre el parámetro `workdir` de la herramienta `shell`.
- En PowerShell usar **`npm.cmd`** (el `npm.ps1` está bloqueado por política de ejecución).
- Para ejecutar git: el exe de GitHub Desktop indicado en §4.
- La salida de PowerShell muestra mojibake con acentos, pero **los archivos están correctos en UTF-8**.
- Los warnings de Git `LF will be replaced by CRLF` son inofensivos.

---

## 8. Retomar en otra sesión

1. Leer este archivo.
2. El sitio ya está publicado. Si hay que hacer cambios futuros:
   - `npm.cmd run build` → `npm run deploy` (wrangler ya está logueado).
   - O subir la carpeta `dist/` en *Workers & Pages → argcol-website → Settings → Assets* desde el dashboard.
3. Si en el futuro el tema cambia de nuevo (rojo/amarillo/lo que sea), las variables CSS `--blue` / `--amber` mantienen los nombres por compatibilidad.

---

## 9. Cómo se hizo el deploy final

```
1. npx wrangler login          # abrió navegador, cuenta argcol-capital
2. npm.cmd run build           # 88 páginas, build OK
3. npm run deploy              # sube dist/ al Worker argcol-website
4. Verificar con Invoke-WebRequest:
   - Título debe ser "Argcol Capital — Family Office"
   - No debe haber "Access" en el HTML
   - H1 debe ser la home editorial nueva
```

---

## 10. Résumé final

- ✅ Family office, no blog.
- ✅ Menú Blogger sin Access.
- ✅ Paleta azul institucional.
- ✅ Home editorial sobria.
- ✅ GitHub y Cloudflare actualizados y verificados.
- ✅ Documento de estado final.