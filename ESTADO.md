# Estado del proyecto — Argcol Capital

> Documento de traspaso para retomar el trabajo en cualquier sesión sin releer toda la conversación.
> Última actualización: **2026-11-23**

---

## 1. En 30 segundos

- El sitio es un **family office**, **no un portal de noticias**. Menú superior, **idéntico en nombres y orden a `argcol.com.ar`**: **Home · Sobre la Cía. · Argcol - E · Notas · Documentos · Contacto**. El **único ítem excluido es "Access"**, por pedido explícito. Aspecto: header sticky con marca AC, paleta rojo/amarillo, **sin banner de monedas**.
- La **home es editorial y sobria** (mucho espacio en blanco, tipografía serif, sin tarjetas de notas ni newsletter) para no parecer un blog barato.
- El nombre visible es **solamente "Argcol Capital"**. Se quitaron "Argentina · Colombia", "Buenos Aires" y "Bogotá" de todo el branding (esos países explicaban el nombre internamente, no deben mostrarse).
- Paleta actual: **rojo `#C8102E` + amarillo `#F2B705`**, fondos/grises claros. Las variables CSS siguen llamándose `--blue` / `--amber` por compatibilidad, pero ya no son azules.
- Código: **Astro estático, 51 notas reales migradas, 88 páginas generadas**, build verificado (`npm.cmd run build` → OK).
- GitHub: **`https://github.com/hmcwebcanteros-prog/argcol-web`** (público, rama `main`). Último commit **`6c62ed8` pusheado correctamente**.
- Cloudflare: account **`argcol-capital`**, Worker **`argcol-website`**, URL **`https://argcol-website.argcol-capital.workers.dev/`**.
- ⚠️ **Pendiente único: republicar `dist/`.** El Worker hoy sigue sirviendo la versión anterior (azul, estilo portal de noticias). El rediseño ya está en GitHub y compilado localmente, pero aún no se subió a Cloudflare. Ver §5.

---

## 2. Cambios de esta sesión (rediseño family office)

| Archivo | Cambio |
|---|---|
| `src/components/Header.astro` | Aspecto del rediseño (marca AC + menú en píldoras, paleta rojo/amarillo) con **los nombres y el orden del menú de Blogger**: Home, Sobre la Cía., Argcol - E, Notas, Documentos, Contacto. **Sin Access** (único ítem excluido a pedido). Marca `/notas/` como activa. |
| `src/pages/index.astro` | Home **editorial y elegante**, sin aspecto de blog: hero sobrio ("El patrimonio, con visión de largo plazo"), declaración "Nuestra mirada", enfoque en 3 filas numeradas y cierre de contacto. **Sin tarjetas de notas, sin panel lateral y sin newsletter en la home.** Las notas viven en `/notas/` y en el footer. |
| `src/pages/sobre.astro` | Página "Sobre la Cía." reescrita como descripción de la firma (qué hacemos, cómo trabajamos, conocimiento abierto). |
| `src/pages/notas/index.astro` | **Nueva**: todas las notas agrupadas por año + filtros por sección, etiquetas, archivo y buscador. |
| `src/pages/contacto.astro` | Texto y `select` de asunto adaptados a family office. |
| `src/components/Footer.astro` | Branding sin países; columnas "La firma / Notas / Archivo". |
| `src/lib/site.ts` | `title: "Argcol Capital — Family Office"`, descripción de family office, `location: ""`, `author: "Argcol Capital"`. |
| `src/layouts/Base.astro` | `theme-color` → `#C8102E`. |
| `src/styles/global.css` | Paleta rojo/amarillo, panel del hero, `.notas-filter`, `.year-count`, `.corporate-about-lead`. Responsive conservado. |
| `public/favicon.svg`, `public/og-default.png` | Rediseñados con rojo/amarillo y texto "Family office · Gestión patrimonial". |
| `wrangler.jsonc`, `package.json` | **Nuevos**: config de deploy (`name: argcol-website`, `assets: ./dist`) y script `npm run deploy`. |

---

## 3. Contenido y páginas

- **51 notas reales** migradas del Blogger `notas.argcol.com.ar` a `src/content/posts/{seccion}/`.
  Distribución: inversión 25, economía 16, mercado 3, ETF 3, ratios 4, empresas 2.
- 233 imágenes recuperadas de los cuerpos y videos (YouTube/Spotify) conservados.
- Secciones: `mercado`, `inversion`, `economia`, `empresas`, `ratios`, `etf`.
- Páginas: `/`, `/sobre/`, `/notas/`, `/contacto/`, `/archivo/`, `/etiquetas/`, `/buscar/`, `/admin/`, `/privacidad/`, secciones con paginación, artículos, `rss.xml`, `sitemap.xml`, `robots.txt`, `search.json`, 404.
- Sitios externos verificados (HTTP 200): `https://ae.argcol.com.ar/` (Argcol - E) y `https://documentos.argcol.com.ar/`.

---

## 4. GitHub

| Item | Valor |
|---|---|
| Repo (para conectar Cloudflare / clonar) | **`https://github.com/hmcwebcanteros-prog/argcol-web`** |
| Clone | `https://github.com/hmcwebcanteros-prog/argcol-web.git` |
| Rama | `main` |
| Commit actual | `6c62ed8` — "Rediseño family office: menú corporativo, paleta rojo/amarillo, página Notas y quitar Argentina/Colombia" |
| Estado | ✅ pusheado. `git status` limpio. No hace falta tocar GitHub Desktop. |
| Cuenta GitHub en esta PC | `hmcwebcanteros-prog` (no cambiar de cuenta: el repo de hmcanteros también vive ahí) |

Si en el futuro el push desde la terminal vuelve a pedir usuario (Git Credential Manager abre un diálogo que se cancela), usar **GitHub Desktop → Push origin**, o el token OAuth guardado en el Administrador de credenciales de Windows.
Git no está en el PATH: `C:\Users\USUARIO\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe`.

---

## 5. Cloudflare — cómo terminar el deploy (único paso pendiente)

Estado actual verificado:

| URL | Resultado |
|---|---|
| `https://argcol-website.argcol-capital.workers.dev/` | HTTP 200 — **versión vieja** ("Argcol Capital — Mercados, inversión y economía") |
| `https://argcol-website.argcol-capital.workers.dev/archivo/` | HTTP 200 — versión vieja |
| `https://argcol-web.argcol-capital.workers.dev/` | HTTP 200, 11 bytes, "Hello world" → **Worker viejo, se puede borrar** |

### Opción A — dashboard (la más simple, sin instalar nada)
1. Entrar a `https://dash.cloudflare.com/` con la cuenta **`argcol-capital`**.
2. **Workers & Pages → argcol-website → Settings → Assets** (o la pestaña *Deployments* / *Build*).
3. Subir/arrastrar la carpeta **`dist`** completa:
   `C:\Users\USUARIO\OneDrive\HMC\Aplicación web\Argcol Capital\dist`
4. Esperar el deployment y recargar la URL con `Ctrl+F5`.

### Opción B — Wrangler (recomendado para futuras actualizaciones)
Ya quedó preparado `wrangler.jsonc` y el script `npm run deploy`. Solo la primera vez:

```
npx wrangler login
```

Después, cada vez que haya cambios:

```
npm.cmd run build
npm run deploy
```

Si wrangler pregunta qué cuenta usar, elegir **`argcol-capital`**. El `name` del Worker ya es `argcol-website`, así que se actualiza el mismo sitio.

### Verificación después de publicar
- El header debe mostrar la marca **AC / Argcol Capital** y el menú con 6 ítems en este orden: Home · Sobre la Cía. · Argcol - E · Notas · Documentos · Contacto. **No debe aparecer "Access" ni el banner de monedas**.
- La home debe mostrar **"Gestión patrimonial con visión de largo plazo"**.
- El `<title>` debe ser **"Argcol Capital — Family Office"**.
- No debe aparecer "Argentina", "Colombia", "Buenos Aires" ni "Bogotá" en header/footer.
- Comando rápido:
  ```
  $u="https://argcol-website.argcol-capital.workers.dev/"; $h=(Invoke-WebRequest $u -UseBasicParsing).Content; [regex]::Match($h,'<title>(.*?)</title>').Groups[1].Value; $h.Contains("visi")
  ```

### Tareas opcionales posteriores
- Agregar el dominio **`argcol.com.ar`** y `www.argcol.com.ar` en *Workers & Pages → argcol-website → Settings → Domains & Routes* (requiere que la zona DNS esté en la cuenta `argcol-capital`).
- Borrar el Worker `argcol-web` ("Hello world") para evitar confusión.
- Decap CMS `/admin/`: sigue con autenticación pendiente (git-gateway / DecapBridge). No bloquea el sitio público.

---

## 6. Apps Script (formularios)

URL desplegada (hardcodeada en `src/lib/site.ts`):

```
https://script.google.com/macros/s/AKfycbxqGZydGL6ttvuPmc8QS9RCtm8eqSOMvrUDQ_9LmzHKa9LYYJ2i6telRYAQbToxOzBR/exec
```

- Newsletter: `email`, `website` (honeypot), `origen`.
- Contacto: `nombre`, `email`, `asunto`, `mensaje`, `website` (honeypot).
- Código fuente: `_migracion/apps-script-sitio.gs`.

---

## 7. Particularidades del entorno (para no repetir errores)

- La ruta tiene acento: **`Aplicación`**. Usar siempre el parámetro `workdir` de la herramienta `shell`.
- En PowerShell usar **`npm.cmd`** (el `npm.ps1` está bloqueado por política de ejecución) y `powershell.exe -ExecutionPolicy Bypass` para scripts `.ps1` propios.
- Para ejecutar git: el exe de GitHub Desktop indicado en §4.
- La salida de PowerShell muestra mojibake con acentos, pero **los archivos están correctos en UTF-8**.
- Los warnings de Git `LF will be replaced by CRLF` son inofensivos.
- Las herramientas de browser suelen dar timeout en este entorno; verificar páginas con `Invoke-WebRequest`.

---

## 8. Retomar en otra sesión

1. Leer este archivo.
2. Si el sitio sigue con el diseño azul, seguir **§5 Opción A o B** y verificar.
3. Todo lo demás (contenido, código, GitHub) ya está listo.
