import type { CookieOptions } from 'express';

// O token de sessão trafega só neste cookie. HttpOnly impede a leitura por
// JavaScript, e o prefixo __Host- exige Secure, Path=/ e nenhum Domain, o que
// prende o cookie à origem que o emitiu. Fora de produção o front e a API podem
// rodar em HTTP num host que não é localhost, onde o navegador recusa cookie
// Secure, então o nome fica sem o prefixo. Sem Max-Age o cookie não persiste
// depois que o navegador fecha; a
// validade da sessão continua sendo o exp do JWT.
export function isSecureSessionCookie(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function sessionCookieName(): string {
  return isSecureSessionCookie()
    ? '__Host-edutrace_session'
    : 'edutrace_session';
}

export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isSecureSessionCookie(),
    sameSite: 'lax',
    path: '/',
  };
}
