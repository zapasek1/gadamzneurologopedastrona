// Zgoda na treści zewnętrzne (Facebook, Instagram, Mapy Google).
// Wybór zapisujemy w localStorage przeglądarki odwiedzającego — to nie jest plik cookie śledzący.

export type Consent = 'all' | 'necessary' | null;

const KEY = 'zgoda-cookies';
const EVENT = 'consent-change';

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'all' || v === 'necessary' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Exclude<Consent, null>) {
  const before = getConsent();
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* tryb prywatny — wybór działa do końca wizyty */
  }
  // Wycofanie zgody: przeładowanie usuwa już wczytane ramki Facebooka/Google.
  if (before === 'all' && value === 'necessary') {
    location.reload();
    return;
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function onConsent(fn: (value: Exclude<Consent, null>) => void) {
  window.addEventListener(EVENT, (e) => fn((e as CustomEvent).detail));
}

/** Pasek zgody na dole ekranu + link „Ustawienia cookies” w stopce. */
export function initConsentBanner() {
  const banner = document.querySelector<HTMLElement>('#cookie-banner');
  if (!banner) return;

  const show = () => {
    banner.hidden = false;
  };
  const hide = () => (banner.hidden = true);

  banner.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach((btn) =>
    btn.addEventListener('click', () => {
      setConsent(btn.dataset.consent as 'all' | 'necessary');
      hide();
    }),
  );

  document.querySelectorAll('[data-open-consent]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      show();
    }),
  );

  if (getConsent() === null) show();
}
