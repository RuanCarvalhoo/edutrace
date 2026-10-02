import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // A página de definição de senha recebe o token que abre a conta. Sem
  // Referer, nenhum endereço dela segue para os sites de onde ela carrega algo.
  headers() {
    return [
      {
        source: '/definir-senha',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ];
  },
};

export default nextConfig;
