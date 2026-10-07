import type { NextConfig } from "next";

// Cabeçalhos da OWASP HTTP Headers Cheat Sheet para todas as respostas. A CSP
// das páginas não está aqui porque leva um nonce novo a cada resposta e é
// montada no middleware. HSTS sem preload: a lista de preload dos navegadores
// vale para o domínio registrado inteiro, e a aplicação roda num subdomínio.
//
// O Cross-Origin-Opener-Policy é o same-origin-allow-popups, e não o
// same-origin que o ZAP recomenda: o botão "Entrar com o Google" abre um popup
// que devolve a credencial por window.opener, e o Google documenta que com
// same-origin o popup abre em branco. Já o Cross-Origin-Embedder-Policy fica de
// fora: o require-corp bloquearia o script e o iframe do Google e o script do
// Clarity, que não enviam o Cross-Origin-Resource-Policy. O CORP same-origin
// vale para tudo o que o front serve, que só é carregado pelas próprias páginas.
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // Política de reserva para o que o middleware não atende: arquivos de
  // /public, /_next e /api, e a página 404 desses caminhos. Nas páginas, o
  // middleware troca este valor pela CSP com nonce, e a resposta sai com uma
  // única CSP. Sem esta reserva, a página 404 de /robots.txt saía sem CSP.
  {
    key: 'Content-Security-Policy',
    value: "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      // A página de definição de senha recebe o token que abre a conta. Sem
      // Referer, nenhum endereço dela segue para os sites de onde ela carrega
      // algo. A regra vem depois da geral porque, quando duas regras definem o
      // mesmo cabeçalho, vale a última.
      {
        source: '/definir-senha',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ];
  },
};

export default nextConfig;
