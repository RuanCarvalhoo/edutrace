import { csrfProtection } from 'src/common/csrf-protection';

function run(request: {
  method: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}) {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  csrfProtection(
    { headers: {}, ...request } as any,
    response as any,
    next,
  );

  return { response, next };
}

function expectRejected(result: ReturnType<typeof run>) {
  expect(result.next).not.toHaveBeenCalled();
  expect(result.response.status).toHaveBeenCalledWith(403);
  expect(result.response.json).toHaveBeenCalledWith(
    expect.objectContaining({ statusCode: 403 }),
  );
}

describe('csrfProtection', () => {
  const sessionCookie = { edutrace_session: 'token.da.sessao' };

  it.each(['GET', 'HEAD', 'OPTIONS'])(
    'should let %s through even from another site',
    (method) => {
      const { next, response } = run({
        method,
        headers: { 'sec-fetch-site': 'cross-site' },
        cookies: sessionCookie,
      });

      expect(next).toHaveBeenCalled();
      expect(response.status).not.toHaveBeenCalled();
    },
  );

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'should reject %s sent with the session cookie and without the custom header',
    (method) => {
      expectRejected(run({ method, cookies: sessionCookie }));
    },
  );

  it('should reject a custom header with another value', () => {
    expectRejected(
      run({
        method: 'POST',
        headers: { 'x-requested-with': 'fetch' },
        cookies: sessionCookie,
      }),
    );
  });

  it('should accept a state-changing request with the session cookie and the custom header', () => {
    const { next, response } = run({
      method: 'PATCH',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
        'sec-fetch-site': 'same-site',
      },
      cookies: sessionCookie,
    });

    expect(next).toHaveBeenCalled();
    expect(response.status).not.toHaveBeenCalled();
  });

  it('should reject any state-changing request that the browser marks as cross-site', () => {
    expectRejected(
      run({
        method: 'POST',
        headers: {
          'sec-fetch-site': 'cross-site',
          'x-requested-with': 'XMLHttpRequest',
        },
      }),
    );
  });

  it('should reject a login posted from another site, which has no session cookie yet', () => {
    expectRejected(
      run({ method: 'POST', headers: { 'sec-fetch-site': 'cross-site' } }),
    );
  });

  it('should accept a request without the session cookie, authenticated by the Bearer header', () => {
    const { next } = run({
      method: 'POST',
      headers: { authorization: 'Bearer token.do.header' },
    });

    expect(next).toHaveBeenCalled();
  });

  it('should accept requests when cookie-parser did not populate the cookies', () => {
    const { next } = run({ method: 'POST', cookies: undefined });

    expect(next).toHaveBeenCalled();
  });
});
