import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { activateAccount } from './passwordReset';

const API_URL = 'http://api.test';

let calls: { url: string; init: RequestInit }[];
let originalFetch: typeof fetch;

beforeEach(() => {
  calls = [];
  originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_API_EDU_TRACE = API_URL;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify({ message: 'Senha definida com sucesso.' }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('activateAccount', () => {
  it('posts the token from the link and the chosen password', async () => {
    const result = await activateAccount('token-do-link', 'novaSenha123');

    assert.deepEqual(result, { message: 'Senha definida com sucesso.' });
    assert.equal(calls[0].url, `${API_URL}/auth/activate`);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(
      calls[0].init.body,
      JSON.stringify({ token: 'token-do-link', password: 'novaSenha123' }),
    );
  });

  it('surfaces the message of an invalid or expired link', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ message: 'Link inválido ou expirado.', statusCode: 401 }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      )) as typeof fetch;

    await assert.rejects(activateAccount('token-vencido', 'novaSenha123'), {
      message: 'Link inválido ou expirado.',
    });
  });
});
