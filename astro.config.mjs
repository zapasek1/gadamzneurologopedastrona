import { defineConfig } from 'astro/config';

// ─────────────────────────────────────────────────────────────
// Adres strony. Zmień w zależności od wariantu:
//
// A) Strona projektu GitHub Pages: https://<login>.github.io/<repo>/
//    SITE = 'https://<login>.github.io'   BASE = '/<repo>'
//
// B) Własna domena (plik public/CNAME z domeną):
//    SITE = 'https://twojadomena.pl'      BASE = '/'
// ─────────────────────────────────────────────────────────────
const SITE = 'https://LOGIN.github.io';
const BASE = '/gabinet-site';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
});
