import { createHash, randomBytes } from 'node:crypto';

export const ACTIVATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// O token tem 256 bits aleatórios, então um hash rápido basta para que o banco
// não guarde o valor que abre a conta. Com bcrypt, que tem salt, não daria para
// localizar o usuário pelo token.
export function generateActivationToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashActivationToken(token) };
}

export function hashActivationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// O endereço vem da configuração, nunca do header Host da requisição, que quem
// chama a API controla. O token vai no fragmento (#), que o navegador não envia
// ao servidor do front nem a proxies, e por isso não aparece em log de acesso.
export function buildActivationLink(token: string): string {
  const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim();

  if (!frontendUrl) {
    throw new Error(
      'FRONTEND_URL não configurada, não é possível montar o link de ativação.',
    );
  }

  return `${frontendUrl.replace(/\/+$/, '')}/definir-senha#token=${token}`;
}
