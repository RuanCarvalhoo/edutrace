import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAllUsers } from './user';

const API_URL = 'http://api.test';

type FetchCall = { url: string; init: RequestInit };

let calls: FetchCall[];
let originalFetch: typeof fetch;

function respondWith(status: number, data: unknown) {
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
}

beforeEach(() => {
  calls = [];
  originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_API_EDU_TRACE = API_URL;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('getAllUsers', () => {
  it('lists every user from /users with a GET', async () => {
    const users = [
      { id: 1, email: 'admin@edutrace.com', id_level: 1 },
      { id: 3, email: 'estudante@edutrace.com', id_level: 2 },
    ];
    respondWith(200, users);

    const result = await getAllUsers();

    assert.deepEqual(result, users);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_URL}/users`);
    assert.equal(calls[0].init.method, 'GET');
  });

  it('rejects with the API message when the level is not allowed', async () => {
    respondWith(403, { message: 'Nível de acesso insuficiente' });

    await assert.rejects(getAllUsers(), {
      message: 'Nível de acesso insuficiente',
    });
  });
});
