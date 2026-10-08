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
const SITE = 'https://zapasek1.github.io';
const BASE = '/gadamzneurologopedastrona';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
});
