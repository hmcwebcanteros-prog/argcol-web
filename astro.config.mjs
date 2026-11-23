import { defineConfig } from "astro/config";

// Sitio estático. Sin servidor, sin base de datos.
export default defineConfig({
  site: "https://argcol.com.ar",
  trailingSlash: "always",
  build: { format: "directory" },
  markdown: {
    shikiConfig: { theme: "github-light" },
  },
});
