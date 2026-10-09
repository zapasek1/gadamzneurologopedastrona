// Zakładki: bez JS wszystkie sekcje są widoczne; z JS — pokazujemy jedną i synchronizujemy z #adresem.
export function initTabs() {
  const tabs = Array.from(document.querySelectorAll<HTMLAnchorElement>('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  if (!tabs.length) return;
  const ids = tabs.map((t) => t.getAttribute('aria-controls')!);

  function show(id: string, opts: { focus?: boolean; push?: boolean } = {}) {
    if (!ids.includes(id)) id = ids[0];
    tabs.forEach((t) => {
      const on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) {
        // Przewiń tylko pasek zakładek w poziomie (mobile) — nigdy całą stronę.
        const list = t.parentElement!;
        const left = t.offsetLeft - list.offsetLeft;
        if (left < list.scrollLeft || left + t.offsetWidth > list.scrollLeft + list.clientWidth) {
          list.scrollLeft = left - 16;
        }
      }
    });
    panels.forEach((p) => (p.hidden = p.id !== id));
    window.dispatchEvent(new CustomEvent('tab-shown', { detail: id }));
    if (opts.push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    if (opts.focus) {
      const tab = tabs.find((t) => t.getAttribute('aria-controls') === id);
      tab?.focus();
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      show(tab.getAttribute('aria-controls')!, { push: true });
    });
    tab.addEventListener('keydown', (e) => {
      let next = -1;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next >= 0) {
        e.preventDefault();
        show(ids[next], { focus: true, push: true });
      }
    });
  });

  // Linki w treści prowadzące do zakładki (np. „Zadaj pytanie” w nagłówku).
  document.querySelectorAll<HTMLAnchorElement>('[data-tab-link]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.dataset.tabLink!;
      show(id, { push: true });
      document.querySelector('.tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('popstate', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));
}
