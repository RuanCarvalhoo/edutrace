// Origens de terceiros que a aplicação usa: o login com Google (Google Identity
// Services), a versão exibida na tela de login (API de releases do GitHub) e o
// Microsoft Clarity. Os valores seguem a documentação de CSP de cada serviço.
const GOOGLE_IDENTITY_CLIENT = "https://accounts.google.com/gsi/client";
const GOOGLE_IDENTITY = "https://accounts.google.com/gsi/";
const GOOGLE_IDENTITY_STYLE = "https://accounts.google.com/gsi/style";
const GITHUB_API = "https://api.github.com";
const CLARITY = ["https://*.clarity.ms", "https://c.bing.com"];

type ContentSecurityPolicyOptions = {
  nonce: string;
  apiUrl?: string;
  isDev?: boolean;
};

// Nonce novo a cada resposta, como pede a OWASP Content Security Policy Cheat
// Sheet: 128 bits aleatórios em base64.
export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

// Política estrita da OWASP para scripts: só roda script com o nonce da
// resposta, e 'strict-dynamic' estende a confiança aos scripts que ele carrega
// (o do Google e o do Clarity). As origens listadas em script-src só valem para
// navegadores sem suporte a 'strict-dynamic'. Os estilos aceitam 'unsafe-inline'
// porque o SweetAlert2 injeta o próprio CSS num <style> sem nonce; com um nonce
// em style-src, o navegador ignoraria o 'unsafe-inline' e os alertas ficariam
// sem estilo.
export function buildContentSecurityPolicy({
  nonce,
  apiUrl,
  isDev = false,
}: ContentSecurityPolicyOptions): string {
  const apiOrigin = originOf(apiUrl);

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      GOOGLE_IDENTITY_CLIENT,
      ...CLARITY,
      // O React usa eval só em desenvolvimento, para reconstruir a pilha de
      // erros do servidor no navegador.
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'", GOOGLE_IDENTITY_STYLE],
    "img-src": ["'self'", "data:", "blob:", ...CLARITY],
    "font-src": ["'self'"],
    "connect-src": [
      "'self'",
      ...(apiOrigin ? [apiOrigin] : []),
      GITHUB_API,
      GOOGLE_IDENTITY,
      ...CLARITY,
    ],
    "frame-src": [GOOGLE_IDENTITY],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}

// O front chama a API pelo endereço publicado no host, que pode ser outra
// origem (outra porta em desenvolvimento). Endereço inválido fica de fora.
function originOf(url: string | undefined): string | null {
  if (!url) return null;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
