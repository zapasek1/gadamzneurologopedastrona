// Formularz „Zadaj pytanie”: wysyłka przez Web3Forms (e-mail do gabinetu).
// Bez klucza — otwiera program pocztowy z gotową wiadomością.

export function initForm() {
  const form = document.querySelector<HTMLFormElement>('#form');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('.form__status')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const { key, email, subject, thanks } = form.dataset;

  function setStatus(text: string, kind: 'ok' | 'err' | '' = '') {
    status.textContent = text;
    status.dataset.kind = kind;
  }

  function firstProblem(): string | null {
    const f = form!.elements as any;
    if (!f.name.value.trim()) return 'Wpisz imię i nazwisko.';
    if (!f.email.value.trim() || !f.email.checkValidity()) return 'Wpisz poprawny adres e-mail, aby otrzymać odpowiedź.';
    if (!f.message.value.trim()) return 'Wpisz treść pytania.';
    if (!f.consent.checked) return 'Zaznacz zgodę na przetwarzanie danych, aby wysłać wiadomość.';
    return null;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const problem = firstProblem();
    if (problem) return setStatus(problem, 'err');

    const data = new FormData(form);
    if (data.get('botcheck')) return; // spam

    const name = String(data.get('name'));
    const body =
      `${data.get('message')}\n\n—\n${name}\n${data.get('email')}` +
      (data.get('phone') ? `\nTel.: ${data.get('phone')}` : '') +
      `\nTemat: ${data.get('topic')}`;

    if (!key) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject!)}&body=${encodeURIComponent(body)}`;
      return setStatus('Otworzył się program pocztowy z gotową wiadomością — wystarczy kliknąć „Wyślij”.', 'ok');
    }

    button.disabled = true;
    setStatus('Wysyłanie…');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          subject: `${subject}: ${data.get('topic')}`,
          from_name: name,
          name,
          email: data.get('email'),
          phone: data.get('phone') || '—',
          topic: data.get('topic'),
          message: data.get('message'),
          replyto: data.get('email'),
          botcheck: '',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.statusText);
      form.reset();
      setStatus(thanks || 'Dziękuję, wiadomość została wysłana.', 'ok');
    } catch {
      setStatus(`Nie udało się wysłać wiadomości. Spróbuj ponownie albo napisz bezpośrednio na ${email}.`, 'err');
    } finally {
      button.disabled = false;
    }
  });
}
