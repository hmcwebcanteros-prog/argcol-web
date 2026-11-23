# Argcol Capital — argcol.com.ar

Sitio estático de **Argcol Capital** (Argentina + Colombia): análisis de mercados, inversión,
economía, empresas, ratios y ETFs. Astro + CSS plano, sin base de datos ni servidor.
Se publica en Cloudflare Pages desde GitHub. El contenido se escribe desde el panel
en **/admin/** (Decap CMS).

## Estructura

```
src/
  content.config.ts      modelo de cada entrada (frontmatter)
  content/posts/         las entradas en Markdown, por sección
  content/etiquetas/     fichas de etiquetas (panel)
  lib/site.ts            dominio, secciones, URLs del Apps Script
  styles/global.css      todo el diseño
public/
  admin/config.yml       configuración del panel Decap CMS
_migracion/
  apps-script-sitio.gs   newsletter + contacto + lista privada + aviso RSS
  migrar_desde_blogger.py  migración del blog notas.argcol.com.ar
```

## Secciones

- **mercado** — cierres diarios, resúmenes, análisis técnico
- **inversion** — estrategias, carteras, lazy portfolios
- **economia** — indicadores macro, tasas, inflación
- **empresas** — perfiles y análisis corporativo
- **ratios** — ratios financieros y fundamentos
- **etf** — fondos indexados y ETFs

## Comandos

```bash
npm install      # una vez
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview  # sirve dist/
```

En Windows/PowerShell usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

## Google Apps Script

`_migracion/apps-script-sitio.gs` atiende el newsletter, el formulario de contacto,
la lista privada de suscriptores y el aviso diario por RSS. La URL `/exec` se guarda en
`SITE.newsletter` y `SITE.contactForm` (`src/lib/site.ts`).

## Despliegue

1. Repositorio en GitHub con este código.
2. Cloudflare Pages → *Create project* → conecta el repo.
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
3. Dominio `argcol.com.ar` en *Custom domains*.

## Paleta

Azul institucional `#0451E4` (identidad Argentina + Colombia), grises `#F8FAFC`/`#E2E8F0`,
texto `#1E293B`, acento `#F59E0B`.
