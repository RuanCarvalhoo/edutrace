import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findSessionCookie, isSecureSessionCookie } from './sessionCookie';

function reader(cookies: Record<string, string>) {
  return (name: string) => cookies[name];
}

describe('findSessionCookie', () => {
  it('finds the __Host- cookie the back issues in production', () => {
    assert.deepEqual(
      findSessionCookie(reader({ '__Host-edutrace_session': 'token.prod' })),
      { name: '__Host-edutrace_session', value: 'token.prod' },
    );
  });

  it('finds the cookie without prefix issued outside production', () => {
    assert.deepEqual(
      findSessionCookie(reader({ edutrace_session: 'token.dev' })),
      { name: 'edutrace_session', value: 'token.dev' },
    );
  });

  it('ignores the old token cookie written by JavaScript', () => {
    assert.equal(findSessionCookie(reader({ token: 'token.antigo' })), null);
  });

  it('ignores an empty cookie', () => {
    assert.equal(findSessionCookie(reader({ edutrace_session: '' })), null);
  });
});

describe('isSecureSessionCookie', () => {
  it('requires Secure for the __Host- cookie', () => {
    assert.equal(isSecureSessionCookie('__Host-edutrace_session'), true);
  });

  it('does not require Secure for the development cookie', () => {
    assert.equal(isSecureSessionCookie('edutrace_session'), false);
  });
});
