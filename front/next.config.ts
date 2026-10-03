import type { NextConfig } from "next";

// Cabeçalhos da OWASP HTTP Headers Cheat Sheet para todas as respostas. A CSP
// não está aqui porque leva um nonce novo a cada resposta e é montada no
// middleware. HSTS sem preload: a lista de preload dos navegadores vale para o
// domínio registrado inteiro, e a aplicação roda num subdomínio.
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
