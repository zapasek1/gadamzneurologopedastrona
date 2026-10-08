import { marked } from 'marked';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ścieżka do pliku z /public z uwzględnieniem prefiksu GitHub Pages. */
export function asset(path: string | undefined): string {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  return `${BASE}/${path.replace(/^\//, '')}`;
}

/** Link wewnętrzny z prefiksem bazowym. */
export function href(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`;
}

/** Markdown z CMS → HTML. */
export function md(text: string | undefined): string {
  return text ? (marked.parse(text, { async: false }) as string) : '';
}

/** Numer telefonu do linku tel: */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}
