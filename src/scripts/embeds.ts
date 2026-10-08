// Treści zewnętrzne (Facebook, Instagram, Mapa Google) ładują się dopiero po kliknięciu.
// Po pierwszej zgodzie przeglądarka zapamiętuje wybór dla danej usługi.

const KEY = 'zgoda-osadzenia';

function remembered(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function remember(type: string) {
  try {
    const list = new Set(remembered());
    list.add(type);
    localStorage.setItem(KEY, JSON.stringify([...list]));
  } catch {
    /* tryb prywatny itp. — trudno */
  }
}

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
  const ok = remembered();
  document.querySelectorAll<HTMLElement>('.embed[data-embed]').forEach((box) => {
    const type = box.dataset.embed!;
    if (ok.includes(type)) return load(box);
    box.querySelector('[data-embed-load]')?.addEventListener('click', () => {
      remember(type);
      load(box);
    });
  });
}
