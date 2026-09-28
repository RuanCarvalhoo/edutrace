import {
  sessionCookieName,
  sessionCookieOptions,
} from 'src/common/session-cookie';

describe('session cookie', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should use the __Host- prefix', () => {
      expect(sessionCookieName()).toBe('__Host-edutrace_session');
    });

    it('should be HttpOnly, Secure, SameSite=Lax and scoped to the whole origin', () => {
      expect(sessionCookieOptions()).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });
    });
  });

  describe('outside production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should drop the __Host- prefix, which requires Secure', () => {
      expect(sessionCookieName()).toBe('edutrace_session');
    });

    it('should stay HttpOnly without Secure', () => {
      expect(sessionCookieOptions()).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
    });
  });

  it('should not persist the cookie beyond the browser session', () => {
    const options = sessionCookieOptions();

    expect(options).not.toHaveProperty('maxAge');
    expect(options).not.toHaveProperty('expires');
  });

  it('should not set Domain, which would share the cookie with subdomains', () => {
    expect(sessionCookieOptions()).not.toHaveProperty('domain');
  });
});
