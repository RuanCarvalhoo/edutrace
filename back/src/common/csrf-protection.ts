import type { NextFunction, Request, Response } from 'express';
import { sessionCookieName } from './session-cookie';

export const CSRF_HEADER = 'x-requested-with';
export const CSRF_HEADER_VALUE = 'XMLHttpRequest';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Com o token em cookie, o navegador envia a credencial em qualquer requisição
// para a API, inclusive as disparadas por outro site. SameSite=Lax é só defesa
// em profundidade (OWASP CSRF Prevention Cheat Sheet), então as requisições que
// alteram estado passam por duas verificações:
// - Sec-Fetch-Site: cross-site é recusado, o que cobre também o login, que
//   ainda não tem cookie de sessão;
// - quem envia o cookie de sessão precisa enviar o cabeçalho customizado, que
//   outro site só consegue definir se o CORS liberar a origem dele.
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const crossSite = req.headers['sec-fetch-site'] === 'cross-site';
  const cookies = req.cookies as Record<string, string> | undefined;
  const hasSessionCookie = Boolean(cookies?.[sessionCookieName()]);
  const hasCsrfHeader = req.headers[CSRF_HEADER] === CSRF_HEADER_VALUE;

  if (crossSite || (hasSessionCookie && !hasCsrfHeader)) {
    res.status(403).json({
      statusCode: 403,
      message: 'Requisição recusada pela proteção contra CSRF.',
      error: 'Forbidden',
    });
    return;
  }

  next();
}
