// O link de definição de senha leva o token no fragmento (#token=...), que o
// navegador não envia ao servidor. Recebe o location.hash da página.
export function readActivationToken(hash: string): string | null {
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("token");
  return token?.trim() || null;
}

const INVALID_LINK_MESSAGE = "Link inválido ou expirado.";

// A orientação de usar "Esqueci minha senha" só vale para link vencido; numa
// senha recusada a pessoa só precisa escolher outra.
export function describeActivationError(message: string): string {
  return message === INVALID_LINK_MESSAGE
    ? `${message} Use a opção "Esqueci minha senha" para receber um código novo.`
    : message;
}
