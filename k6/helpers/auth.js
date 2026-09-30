import http from 'k6/http';
import { check } from 'k6';

// A API devolve o token num cookie HttpOnly, e não mais no corpo do login. O
// nome leva o prefixo __Host- quando a API roda com NODE_ENV=production.
const SESSION_COOKIE_NAMES = ['__Host-edutrace_session', 'edutrace_session'];

/**
 * Lê o token de sessão do cookie definido na resposta do login.
 *
 * @param {Object} res - Resposta do k6
 * @returns {string | null}
 */
export function sessionTokenFrom(res) {
  for (const name of SESSION_COOKIE_NAMES) {
    const cookies = res.cookies[name];
    if (cookies && cookies.length > 0 && cookies[0].value) {
      return cookies[0].value;
    }
  }
  return null;
}

/**
 * Descarta o cookie de sessão guardado pelo jar do k6. Os testes autenticam pelo
 * header Bearer, que a API continua aceitando; com o cookie no jar, as
 * requisições que alteram estado passariam a exigir o cabeçalho de proteção
 * contra CSRF, e as verificações de "sem token" deixariam de valer.
 *
 * @param {string} baseUrl - URL base da API
 */
export function forgetSessionCookie(baseUrl) {
  http.cookieJar().clear(baseUrl);
}

/**
 * Helper de autenticação para os testes k6 do EduTrace.
 *
 * Realiza login na API e retorna o token JWT + os headers prontos
 * para serem usados em requisições protegidas.
 *
 * @param {string} baseUrl - URL base da API (ex: http://localhost:3000)
 * @param {string} email   - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {{ token: string, headers: Object } | null}
 */
export function login(baseUrl, email, password) {
  const url = `${baseUrl}/auth/login`;

  const payload = JSON.stringify({ email, password });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  const token = sessionTokenFrom(res);
  forgetSessionCookie(baseUrl);

  const ok = check(res, {
    '[auth] login retornou 200': (r) => r.status === 200,
    '[auth] token presente no cookie de sessão': () => typeof token === 'string' && token.length > 0,
  });

  if (!ok) {
    console.error(`[auth] Falha no login para ${email}. Status: ${res.status}. Body: ${res.body}`);
    return null;
  }

  return {
    token,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * Cria os headers de autenticação a partir de um token já obtido.
 *
 * @param {string} token - JWT token
 * @returns {Object} headers prontos para uso no k6
 */
export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Realiza login e retorna apenas o token JWT.
 * Aborta o teste se o login falhar.
 *
 * @param {string} baseUrl
 * @param {string} email
 * @param {string} password
 * @returns {string} JWT token
 */
export function getToken(baseUrl, email, password) {
  const auth = login(baseUrl, email, password);
  if (!auth) {
    throw new Error(`[auth] Não foi possível obter token para ${email}. Verifique as credenciais e se a API está rodando.`);
  }
  return auth.token;
}
