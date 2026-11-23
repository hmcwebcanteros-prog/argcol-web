# Estado del proyecto — Argcol Capital (argcol.com.ar)

> Documento de traspaso para retomar el trabajo en cualquier sesión sin releer toda la conversación.
> Última actualización: **2026-11-23**

---

## 1. TL;DR — para ponerse al corriente en 30 segundos

- El **sitio está terminado y compila**: Astro estático, 51 entradas reales migradas de Blogger, 87 páginas generadas en `dist/` (~1,7 MB).
- El **código ya está en GitHub**: `https://github.com/hmcwebcanteros-prog/argcol-web` (público, rama `main`). Commits: `c8d1f69` (inicial, ya en remoto) y `f1275db` (corrección de Decap, **pendiente de push** desde Desktop).
- Dominio objetivo: **argcol.com.ar** (y `www`). Branding: **Argcol Capital = Argentina + Colombia**.
- **Cloudflare**: el sitio **YA ESTÁ ONLINE** en `https://argcol-website.argcol-capital.workers.dev/` (verificado: HTTP 200, título "Archivo — Argcol Capital", 31 KB HTML, 92 links internos). Hay otro Worker viejo `argcol-web.argcol-capital.workers.dev` que devuelve "Hello world" → borrar.
- Usuario de GitHub en esta PC: **`hmcwebcanteros-prog`** (el mismo de hmcanteros). No cambiar de cuenta: ambos repos viven ahí.
- Pendientes urgentes: hacer **Push origin** en Desktop (commit `f1275db`) y agregar el dominio `argcol.com.ar`.

---

## 2. Objetivo y requisitos del usuario

- Migrar **todo** el contenido del Blogger `notas.argcol.com.ar` a un sitio estático profesional en `argcol.com.ar`.
- Misma funcionalidad / seguridad / forma de entrada que `hmcanteros.com.ar`.
- Stack elegido: **Astro + GitHub + Cloudflare Pages + Decap CMS + Google Apps Script** (formularios).
- Secciones: `mercado`, `inversion`, `economia`, `empresas`, `ratios`, `etf` + colección `etiquetas`.
- Paleta actual de marca (mantener): azul `#0451E4`, fondo `#F8FAFC`, línea `#E2E8F0`, gris `#64748B`, texto `#1E293B`, acento `#F59E0B`. Regla 60-30-10.
- Tipografías: **Playfair Display** (títulos) + **Inter** (cuerpo).
- El usuario quiere que **todo se explique en español** y con pasos concretos (GitHub Desktop / Cloudflare).
- El usuario quiere **un solo login de GitHub** para los dos sitios; cambiar de cuenta es un "lío".

---

## 3. Estado completado

### Contenido
- **51 entradas reales** migradas a `src/content/posts/{seccion}/`, con fechas y slugs reales.
  Distribución: economía 16, inversión 25, empresas 2, ETF 3, mercado 3, ratios 4.
- **233 imágenes** recuperadas de los cuerpos Blogger (estaban dentro de `<a><img></a>` y el primer conversor las descartó; se corrigió con `rehacer_cuerpos.py`).
- Videos de YouTube/Spotify conservados (11 entradas que solo tenían video: MILA, Friedman, etc.).
- 20+ archivos de etiquetas en `src/content/etiquetas/`.
- Se borraron los posts de ejemplo inventados: **solo queda contenido real**.

### Código y páginas
- `package.json` con scripts `dev` / `build` (`astro build`) / `preview`. Se quitaron referencias a `scripts/*.cjs` que no existían.
- `astro.config.mjs`: `site: https://argcol.com.ar`, `trailingSlash: always`, formato `directory`.
- Layout base con SEO, JSON-LD, fuentes, favicon y OG image.
- Páginas: portada, secciones con paginación, artículo, etiquetas, archivo, buscador (`search.json.ts`), `rss.xml.ts`, `sitemap.xml.ts`, `robots.txt.ts`, 404, contacto, sobre, privacidad y `/admin`.
- Diseño completo en `src/styles/global.css` (header sticky, hero, cards, prose de artículo, newsletter, footer, responsive, reduced-motion).
- `public/favicon.svg` y `public/og-default.png` creados (1200×630, degradado azul + "ARGENTINA + COLOMBIA").
- `public/admin/config.yml`: Decap CMS con `git-gateway`, 6 colecciones + etiquetas.
- `.gitignore` (excluye `node_modules/`, `dist/`, `.astro/`) y `README.md`.
- Build verificado: **87 páginas**, `dist/` con 95 archivos. Sin `undefined` en el HTML. Rutas de artículo verificadas con imágenes reales.

---

## 4. Git / GitHub — estado exacto

| Item | Valor |
|---|---|
| Carpeta local | `C:\Users\USUARIO\OneDrive\HMC\Aplicación web\Argcol Capital` |
| Repo local | Inicializado por el asistente con el Git embebido de GitHub Desktop |
| Rama | `main` |
| Commit | `c8d1f69` — "Sitio inicial de Argcol Capital: Astro + 51 entradas migradas de Blogger" |
| Remote origin | `https://github.com/hmcwebcanteros-prog/argcol-web.git` |
| Visibilidad | **Pública** (verificado vía API: `privado=False`) |
| Archivos en raíz remota | `.gitignore`, `README.md`, `_migracion/`, `astro.config.mjs`, `package-lock.json`, `package.json`, `public/`, `src/` |
| Cuenta GitHub en esta PC | `hmcwebcanteros-prog` (credencial guardada en Windows) |
| Repo de hmcanteros | `https://github.com/hmcwebcanteros-prog/Hmcanteros-web.git` |

**Git executable** (no está en el PATH):
```
C:\Users\USUARIO\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe
```

**No hacer**: cambiar de cuenta en Desktop ni usar "Publish repository". Siempre *Push origin* con `hmcwebcanteros-prog`.

### ✅ Corrección de Decap (hecha el 2026-11-23)
`public/admin/config.yml` línea 11 se corrigió a:
```yaml
repo: hmcwebcanteros-prog/argcol-web
```
Commit local `f1275db` creado y build verificado (87 páginas). **Falta el Push origin desde GitHub Desktop**: la terminal del asistente no tiene credenciales de GitHub (`fatal: could not read Username`). Remoto todavía solo tiene `c8d1f69`.

---

## 5. Cloudflare — estado exacto

- Usuario Cloudflare nuevo creado para Argcol: **`argcol-capital`** (distinto del de hmcanteros).
- Por error se creó un **Worker** con Git conectado: `https://argcol-web.argcol-capital.workers.dev/` → devuelve `Hello world` (`text/plain`, 11 bytes). **No es el sitio**; se puede borrar.
- La pantalla que pedía *Deploy command: npx wrangler deploy* era de **Workers**, no de Pages. En Pages no se usa wrangler.
- Se indicó al usuario crear el proyecto en **Workers & Pages → pestaña "Pages" → Create a project → Connect to Git**.
- Link directo: `https://dash.cloudflare.com/?to=/:account/pages/new`
- Configuración correcta del build:

| Campo | Valor |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Deploy command | *(vacío)* |
| Preview command | *(vacío)* |

- **Estado al escribir esto**: el usuario dice "está trabajando" (deploy en curso). Falta la URL `*.pages.dev`.

### Links útiles
- Repo: https://github.com/hmcwebcanteros-prog/argcol-web
- Clone: https://github.com/hmcwebcanteros-prog/argcol-web.git
- Instalar GitHub App si no aparece el repo: https://github.com/apps/cloudflare/installations/new

---

## 6. Pendientes (en orden)

1. **Confirmar deploy de Cloudflare Pages** y obtener la URL `https://<proyecto>.pages.dev` (no `.workers.dev`). Verificar desde acá con `Invoke-WebRequest`: título debe contener "Argcol Capital" y el HTML debe tener links internos.
2. **Corregir `public/admin/config.yml`** → `repo: hmcwebcanteros-prog/argcol-web`, commit + push.
3. **Dominio**: agregar `argcol.com.ar` y `www.argcol.com.ar` en *Pages → Custom domains*.
   - ❓ Pregunta abierta: **¿el DNS de `argcol.com.ar` está en la cuenta Cloudflare nueva (`argcol-capital`) o en la vieja de hmcanteros?** Lo ideal es que Pages y la zona DNS estén en la misma cuenta. Si está en otra, hay que mover la zona o usar CNAME → `<proyecto>.pages.dev`.
4. **Decap CMS / DecapBridge**: los campos de autenticación están comentados como PENDIENTE en `config.yml`. Hay que registrar el sitio en DecapBridge (o GitHub OAuth / Netlify Identity), completar y volver a desplegar. Sin esto `/admin/` no permite editar.
5. **Probar formularios** contra el Apps Script desplegado (newsletter y contacto).
6. **Borrar el Worker "Hello world"** para evitar confusión.
7. Verificación final de rutas: `/`, `/mercado/`, `/ratios/2025/01/sortino-y-sqn/`, `/etiquetas/`, `/buscar/`, `/admin/`.

---

## 7. Apps Script (formularios)

URL desplegada (ya hardcoded en `src/lib/site.ts`, newsletter y contacto):
```
https://script.google.com/macros/s/AKfycbxqGZydGL6ttvuPmc8QS9RCtm8eqSOMvrUDQ_9LmzHKa9LYYJ2i6telRYAQbToxOzBR/exec
```

- Newsletter envía: `email`, `website` (honeypot), `origen`.
- Contacto envía: `nombre`, `email`, `asunto`, `mensaje`, `website` (honeypot). El disparador es `mensaje` no vacío.
- Código fuente del script: `_migracion/apps-script-sitio.gs`.
- Email usado en `git config user.email` local: `contacto@argcol.com.ar`.

---

## 8. Archivos clave

Todos bajo `C:\Users\USUARIO\OneDrive\HMC\Aplicación web\Argcol Capital\`:

| Archivo | Para qué sirve |
|---|---|
| `ESTADO.md` | Este resumen |
| `README.md` | Documentación del proyecto |
| `src/styles/global.css` | Sistema de diseño completo |
| `src/layouts/Base.astro` | SEO, fuentes, JSON-LD, header/footer |
| `src/lib/site.ts` | SECTIONS, SITE, URLs de Apps Script |
| `src/lib/posts.ts` | Fechas, rutas, portadas, excerpts, relacionados |
| `src/pages/[section]/[year]/[month]/[slug].astro` | Plantilla de artículo (import depth `../../../../`) |
| `public/admin/config.yml` | Decap CMS (⚠️ repo a corregir) |
| `public/favicon.svg`, `public/og-default.png` | Identidad visual |
| `_migracion/migrar_v2.py` | Migración original desde el feed de Blogger |
| `_migracion/rehacer_cuerpos.py` | Reescritura de cuerpos conservando imágenes/iframes |

El feed `https://notas.argcol.com.ar/feeds/posts/default?alt=json&max-results=500` devuelve solo 52 entradas (51 migradas + 1 descartada).

---

## 9. Particularidades del entorno (para no repetir errores)

- La ruta tiene acento: **`Aplicación`**. Usar el parámetro `workdir` del tool `shell` para no romperla.
- En PowerShell usar **`npm.cmd`** (el `npm.ps1` está bloqueado por política de ejecución).
- `git` no está en el PATH; usar el exe de GitHub Desktop indicado arriba.
- Las herramientas de **browser** dan timeout (app de escritorio no adjunta). Verificar páginas con `Invoke-WebRequest`.
- Este modelo **no puede leer imágenes**: si el usuario manda capturas, pedir que **pegue el texto del error**.
- La salida de PowerShell muestra mojibake ( código de página ), pero **los archivos están bien en UTF-8**.
- Los warnings de Git sobre `LF will be replaced by CRLF` son inofensivos.
- No hay repo git en la carpeta de hmcanteros que se deba tocar; es independiente.

---

## 10. Cómo retomar en la próxima sesión

1. Leer este archivo.
2. Preguntar: "¿Tenés ya la URL `pages.dev` de Cloudflare?" y verificarla.
3. Si hay error, pedir **texto**, no captura.
4. Seguir la lista de pendientes del punto 6.
