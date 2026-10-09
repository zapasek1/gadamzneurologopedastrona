# Gabinet — strona neurologopedy

Single-page site (Polish) with five tabs — **O mnie, Oferta, Aktualności, Zadaj pytanie, Kontakt** — built with [Astro](https://astro.build), hosted free on **GitHub Pages**, and editable through **Sveltia CMS** at `/admin/`.

```
src/content/*.json      ← all texts (edited by the CMS or by hand)
src/pages/index.astro   ← the page with tabs
src/styles/global.css   ← design
src/scripts/*.ts        ← tabs, click-to-load embeds, question form
src/site.config.ts      ← Web3Forms key (technical, not in CMS)
public/admin/           ← CMS (index.html + config.yml)
public/uploads/         ← images uploaded through the CMS
.github/workflows/      ← build + deploy to GitHub Pages on every push to main
```

---

## 1. First deploy (≈15 min)

### 1.1 Create the repo
On GitHub: **New repository** → name e.g. `gabinet-site` → **Public** → *don't* add README/.gitignore/license.

### 1.2 Point the code at your repo
Two files contain placeholders:

| File | Change |
|---|---|
| `astro.config.mjs` | `SITE = 'https://<login>.github.io'`, `BASE = '/<repo>'` |
| `public/admin/config.yml` | `repo: <login>/<repo>` |

(Using a custom domain from day one? See section 5 instead.)

### 1.3 Push
```bash
cd gabinet-site
git init -b main
git add .
git commit -m "Pierwsza wersja strony"
git remote add origin https://github.com/<login>/<repo>.git
git push -u origin main
```

### 1.4 Turn on Pages
Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Then **Actions** tab → the run "Publikacja na GitHub Pages" (re-run it if it ran before Pages was enabled). After ~1 min the site is at `https://<login>.github.io/<repo>/`.

---

## 2. Question form → e-mail (Web3Forms)

1. Go to <https://web3forms.com>, enter **the specialist's e-mail** (the address that should receive questions). The access key arrives by e-mail.
2. Paste it into `src/site.config.ts` → `web3formsKey: '...'`, commit, push.

The key is public by design (it's visible in the page source) — it only lets someone send a message *to* that inbox, so it's fine in a public repo. Until a key is set, the form falls back to opening the visitor's mail app with a pre-filled message.

Spam: a hidden honeypot field is included. If spam becomes a problem, Web3Forms supports hCaptcha.

---

## 3. CMS — editing content without code

Panel: `https://<site>/admin/` → **Sign In with Token**.

Sveltia CMS commits every save to `main`; the Action rebuilds and the change is live in ~1–2 min.

### Giving the specialist access — pick one

**A) Your token, limited to this one repo (simplest — she needs no GitHub account)**
1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. Name: `CMS gabinet`, Expiration: up to 1 year (put a reminder in your calendar)
3. Repository access: **Only select repositories** → this repo
4. Permissions → Repository permissions → **Contents: Read and write** (nothing else)
5. Give her the token once (e.g. in person or via a password manager — not plain e-mail). She pastes it on `/admin/`; the browser remembers it.

Commits will appear under your name. The token can't touch `.github/workflows` (that needs the separate *Workflows* permission), so it can't be used to change the build or read Action secrets.

**B) Her own GitHub account**
1. She creates a free GitHub account; you add her: repo → **Settings → Collaborators → Add people** (Write role).
2. She creates a **classic** token with the `public_repo` scope (fine-grained tokens can't target another user's personal repo) and signs in with it. The "Sign In with Token" dialog links to the right page.

Commits then appear under her name. Note: anyone with Write access could in principle modify workflows — relevant only if you later add Action secrets (see 4.3).

### What she can edit
Dane podstawowe · O mnie (zdjęcie, tekst, kwalifikacje) · Oferta (usługi, ceny, kroki pierwszej wizyty) · Aktualności (FB on/off, linki do postów IG) · Formularz (teksty) · Kontakt i mapa (adres, godziny, dojazd) · Polityka prywatności.

Layout and design aren't editable from the CMS — she can't break the site.

A short Polish guide for her is in [`INSTRUKCJA-EDYCJI.md`](INSTRUKCJA-EDYCJI.md).

---

## 4. Social media

A **cookie consent banner** appears on the first visit:
- **Akceptuję** → Facebook, Instagram and the Google map load automatically (now and on later visits).
- **Tylko niezbędne** → nothing from Meta/Google loads; each embed shows a "Pokaż…" button to load just that one.
- **Ustawienia cookies** in the footer (and a button on the privacy page) reopens the banner; withdrawing consent reloads the page to remove loaded embeds.

The choice is stored in the visitor's `localStorage` (key `zgoda-cookies`), not in a cookie. Both buttons have equal weight, as EU regulators expect. Banner text is editable in the CMS ("Pasek zgody na cookies"). Fonts are self-hosted so no Google request happens before consent.

### 4.1 Facebook
Set *Link do Facebooka* in the CMS. Uses the official Page Plugin, which works only for a **Facebook Page** (fanpage), not a personal profile, and the page must be public (no age/country restrictions).

### 4.2 Instagram — three options
1. **Hand-picked posts (default, no keys):** in CMS → Aktualności → *Wybrane posty z Instagrama*, paste post links (⋯ → Kopiuj link). Empty list → a "Obserwuj na Instagramie" button is shown.
2. **Behold widget (auto-updating, no keys in repo):** create a free feed at <https://behold.so>, paste its *Feed ID* into *Behold — ID kanału*. It replaces option 1.
3. **Automatic via Graph API + Actions secret:** not built yet. Requires a Business/Creator account linked to the FB page; token goes into **Settings → Secrets and variables → Actions**, a scheduled workflow fetches posts and rebuilds. Ask if you want it.

### 4.3 Secrets
Nothing in this repo is secret. If you add option 4.2.3 later, the token lives only in Actions secrets (encrypted, masked in logs, not exposed to fork PRs). To protect it from anyone with Write access, put it in a protected **Environment** limited to `main` with you as required reviewer.

---

## 5. Custom domain (e.g. `imie-nazwisko.pl`)

1. Create `public/CNAME` containing one line: `imie-nazwisko.pl`
2. `astro.config.mjs`: `SITE = 'https://imie-nazwisko.pl'`, `BASE = '/'`
3. At your domain registrar, DNS:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `<login>.github.io`
4. Repo → Settings → Pages → Custom domain → enter it → wait for the DNS check → tick **Enforce HTTPS**.
5. Recommended: verify the domain in your GitHub account settings (Settings → Pages → Add a domain) to prevent takeover.

---

## 6. Google Maps

The map is built from *Adres gabinetu* — no API key. If the practice has a **Google Business Profile**, paste its share link into *Link do wizytówki Google*; the "Otwórz w Mapach Google" button will then open the listing (name, rating, hours) instead of a plain pin.

---

## 7. Local development

```bash
npm install
npm run dev        # http://localhost:4321/<repo>/
npm run build      # output in dist/
```

Testing the CMS locally without touching GitHub: run `npm run dev`, open `http://localhost:4321/<repo>/admin/` in Chrome/Edge → **Work with Local Repository** → pick the project folder. Changes are written straight to your files.
