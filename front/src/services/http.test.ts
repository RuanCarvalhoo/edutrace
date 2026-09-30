import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest } from './http';

const API_URL = 'http://api.test';

type FetchCall = { url: string; init: RequestInit };

let calls: FetchCall[];
let originalFetch: typeof fetch;

beforeEach(() => {
  calls = [];
  originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_API_EDU_TRACE = API_URL;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function headersOf(call: FetchCall) {
  return call.init.headers as Record<string, string>;
}

describe('apiRequest', () => {
  it('sends the session cookie with credentials: include', async () => {
    await apiRequest('/students');

    assert.equal(calls[0].init.credentials, 'include');
  });

  it('never sends the token in the Authorization header', async () => {
    await apiRequest('/students');
    await apiRequest('/auth/me', { method: 'PATCH', body: { currentPassword: 'x' } });

    for (const call of calls) {
      assert.equal('Authorization' in headersOf(call), false);
    }
  });

  it('sends the custom header the back requires against CSRF', async () => {
    await apiRequest('/auth/logout', { method: 'POST' });

    assert.equal(headersOf(calls[0])['X-Requested-With'], 'XMLHttpRequest');
  });

  it('sends Content-Type only when there is a body', async () => {
    await apiRequest('/students');
    await apiRequest('/comments', { method: 'POST', body: { comment: 'texto' } });

    assert.equal('Content-Type' in headersOf(calls[0]), false);
    assert.equal(headersOf(calls[1])['Content-Type'], 'application/json');
    assert.equal(calls[1].init.body, JSON.stringify({ comment: 'texto' }));
  });

  it('keeps sending the cookie on public routes', async () => {
    await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: 'a@edutrace.com', password: 'senha' },
      auth: false,
    });

    assert.equal(calls[0].init.credentials, 'include');
  });
});
