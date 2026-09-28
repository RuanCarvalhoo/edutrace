import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAllStudents, getStudentByEmail } from './students';

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

describe('getAllStudents', () => {
  it('lists the students from /students, and not every user from /users', async () => {
    const students = [{ id: 3, email: 'estudante@edutrace.com', id_level: 2 }];
    respondWith(200, students);

    const result = await getAllStudents();

    assert.deepEqual(result, students);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_URL}/students`);
    assert.equal(calls[0].init.method, 'GET');
  });
});

describe('getStudentByEmail', () => {
  it('looks up the email among the students with a GET to /students/:email', async () => {
    const student = { id: 3, email: 'estudante@edutrace.com', id_level: 2 };
    respondWith(200, student);

    const result = await getStudentByEmail('estudante@edutrace.com');

    assert.deepEqual(result, student);
    assert.equal(calls[0].url, `${API_URL}/students/estudante%40edutrace.com`);
    assert.equal(calls[0].init.method, 'GET');
    assert.equal(calls[0].init.body, undefined);
  });

  it('encodes characters of the email that would change the path', async () => {
    respondWith(200, null);

    await getStudentByEmail('nome/sobrenome?x@edutrace.com');

    assert.equal(
      calls[0].url,
      `${API_URL}/students/nome%2Fsobrenome%3Fx%40edutrace.com`,
    );
  });
});
