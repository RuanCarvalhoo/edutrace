// Versões anteriores do front gravavam o token num cookie legível por
// JavaScript. O token de sessão agora vem só no cookie HttpOnly emitido pelo
// back, que a página não lê nem apaga; o que resta aqui é apagar o cookie antigo.
const TOKEN_COOKIE_NAME = 'token';

function securityAttributes() {
  const isHttps =
    typeof location !== 'undefined' && location.protocol === 'https:';

  return `path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`;
}

export function clearTokenCookie() {
  clearCookie(TOKEN_COOKIE_NAME);
}

export function clearCookie(name: string) {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${securityAttributes()}`;
}
