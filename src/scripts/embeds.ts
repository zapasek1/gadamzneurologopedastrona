// Treści zewnętrzne (Facebook, Instagram, Mapa Google).
// Zgoda „Akceptuję” w pasku cookies → wszystko ładuje się automatycznie.
// Bez zgody → w miejscu treści przycisk „Pokaż…”, który wczytuje tylko tę jedną rzecz.

import { getConsent, onConsent } from './consent';

function loadScript(src: string, module = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (module) s.type = 'module';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(src));
    document.body.appendChild(s);
  });
}

function iframe(src: string, title: string, height: number) {
  const f = document.createElement('iframe');
  f.src = src;
  f.title = title;
  f.loading = 'lazy';
  f.height = String(height);
  f.style.border = '0';
  f.allow = 'encrypted-media; clipboard-write';
  f.referrerPolicy = 'no-referrer-when-downgrade';
  return f;
}

function load(box: HTMLElement) {
  if (box.classList.contains('is-loaded')) return;
  const type = box.dataset.embed!;
  const holder = document.createElement('div');
  holder.className = 'embed__content';

  if (type === 'facebook') {
    holder.appendChild(iframe(box.dataset.src!, 'Posty z Facebooka', 640));
  } else if (type === 'map') {
    holder.appendChild(iframe(box.dataset.src!, 'Mapa dojazdu do gabinetu', 380));
  } else if (type === 'instagram') {
    const posts: string[] = JSON.parse(box.dataset.posts || '[]');
    posts.forEach((url) => {
      const q = document.createElement('blockquote');
      q.className = 'instagram-media';
      q.setAttribute('data-instgrm-permalink', url);
      q.setAttribute('data-instgrm-version', '14');
      const a = document.createElement('a');
      a.href = url;
      a.textContent = 'Zobacz post na Instagramie';
      q.appendChild(a);
      holder.appendChild(q);
    });
    loadScript('https://www.instagram.com/embed.js').then(() =>
      (window as any).instgrm?.Embeds?.process(),
    );
  } else if (type === 'behold') {
    const w = document.createElement('behold-widget');
    w.setAttribute('feed-id', box.dataset.feed!);
    holder.appendChild(w);
    loadScript('https://w.behold.so/widget.js', true);
  }

  box.querySelector('.embed__gate')?.remove();
  box.appendChild(holder);
  box.classList.add('is-loaded');
}

export function initEmbeds() {
  const boxes = Array.from(document.querySelectorAll<HTMLElement>('.embed[data-embed]'));
  const loadAll = () => boxes.forEach(load);

  boxes.forEach((box) =>
    box.querySelector('[data-embed-load]')?.addEventListener('click', () => load(box)),
  );

  if (getConsent() === 'all') loadAll();
  onConsent((value) => value === 'all' && loadAll());
}
