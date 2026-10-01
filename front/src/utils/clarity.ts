// O Clarity grava a URL das páginas que registra. Na página de definição de
// senha a URL leva o token que abre a conta, que não pode sair para terceiros.
const PAGES_WITHOUT_CLARITY = ["/definir-senha"];

export function shouldLoadClarity(pathname: string | null): boolean {
  return !PAGES_WITHOUT_CLARITY.some(
    (page) => pathname === page || pathname?.startsWith(`${page}/`),
  );
}
