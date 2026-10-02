import { createHash } from 'node:crypto';
import {
  ACTIVATION_TOKEN_TTL_MS,
  buildActivationLink,
  generateActivationToken,
  hashActivationToken,
} from 'src/auth/activation-token';

describe('activation-token', () => {
  describe('generateActivationToken', () => {
    it('should generate a 256-bit token encoded as base64url', () => {
      const { token } = generateActivationToken();

      expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it('should generate a different token on each call', () => {
      const tokens = new Set(
        Array.from({ length: 20 }, () => generateActivationToken().token),
      );

      expect(tokens.size).toBe(20);
    });

    it('should return the SHA-256 of the token, never the token itself', () => {
      const { token, hash } = generateActivationToken();

      expect(hash).toBe(createHash('sha256').update(token).digest('hex'));
      expect(hash).not.toContain(token);
    });
  });

  describe('hashActivationToken', () => {
    it('should give the same hash for the same token', () => {
      expect(hashActivationToken('token-de-teste')).toBe(
        hashActivationToken('token-de-teste'),
      );
    });
  });

  it('should keep the link valid for 24 hours', () => {
    expect(ACTIVATION_TOKEN_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });

  describe('buildActivationLink', () => {
    let frontendUrl: string | undefined;

    beforeEach(() => {
      frontendUrl = process.env.FRONTEND_URL;
    });

    afterEach(() => {
      if (frontendUrl === undefined) {
        delete process.env.FRONTEND_URL;
      } else {
        process.env.FRONTEND_URL = frontendUrl;
      }
    });

    it('should put the token in the fragment of the configured front-end address', () => {
      process.env.FRONTEND_URL = 'https://edutrace.example.com';

      expect(buildActivationLink('abc_123-XYZ')).toBe(
        'https://edutrace.example.com/definir-senha#token=abc_123-XYZ',
      );
    });

    it('should use the first origin when FRONTEND_URL lists several', () => {
      process.env.FRONTEND_URL =
        ' https://edutrace.example.com/ , http://localhost:3000';

      expect(buildActivationLink('abc')).toBe(
        'https://edutrace.example.com/definir-senha#token=abc',
      );
    });

    it('should refuse to build the link without FRONTEND_URL', () => {
      delete process.env.FRONTEND_URL;

      expect(() => buildActivationLink('abc')).toThrow(
        'FRONTEND_URL não configurada',
      );
    });
  });
});
