// O link de definição de senha leva o token no fragmento (#token=...), que o
// navegador não envia ao servidor. Recebe o location.hash da página.
export function readActivationToken(hash: string): string | null {
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("token");
  return token?.trim() || null;
}
