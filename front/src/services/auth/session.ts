import { clearTokenCookie } from './tokenCookie';

const TOKEN_STORAGE_KEY = 'token';

// O token de sessão fica só no cookie HttpOnly do back. As cópias que versões
// anteriores gravavam em localStorage e em cookie comum continuariam legíveis
// por qualquer script da página, então são apagadas.
export function clearSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  clearTokenCookie();
}

// O cookie HttpOnly não é apagado aqui: ao voltar para a página inicial, o
// middleware do Next recebe o 401 do back e descarta o cookie.
export function endSession() {
  clearSession();

  if (typeof window !== 'undefined') {
    window.location.replace('/');
  }
}
