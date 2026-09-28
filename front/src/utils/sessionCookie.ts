// O back emite o token de sessão num cookie HttpOnly, com o prefixo __Host- em
// produção e sem ele fora de produção (back/src/common/session-cookie.ts).
export const SESSION_COOKIE_NAMES = [
  '__Host-edutrace_session',
  'edutrace_session',
] as const;

export type SessionCookie = { name: string; value: string };

export function findSessionCookie(
  read: (name: string) => string | undefined,
): SessionCookie | null {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = read(name);
    if (value) return { name, value };
  }

  return null;
}

// Um cookie com prefixo __Host- só é aceito, inclusive para ser apagado, com
// Secure e Path=/.
export function isSecureSessionCookie(name: string) {
  return name.startsWith('__Host-');
}
