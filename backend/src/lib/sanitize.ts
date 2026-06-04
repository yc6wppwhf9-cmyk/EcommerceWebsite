/**
 * Lightweight HTML entity escaping — prevents XSS when user-supplied strings
 * are interpolated into HTML email templates.
 *
 * This is intentionally minimal: we only need to neutralise the five HTML
 * meta-characters. We do NOT need a full sanitiser like DOMPurify because
 * these strings are server-rendered into emails, not a live DOM.
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const ESCAPE_RE = /[&<>"']/g;

/** Escape HTML-special characters in a string. Safe for email templates. */
export function escapeHtml(input: string): string {
  if (!input) return '';
  return input.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch]);
}
