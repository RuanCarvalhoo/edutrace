import { BadRequestException, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  COMPROMISED_PASSWORD_MESSAGE,
  CompromisedPasswordService,
} from 'src/auth/compromised-password.service';

describe('CompromisedPasswordService', () => {
  let service: CompromisedPasswordService;
  let originalFetch: typeof fetch;
  let fetchMock: jest.Mock;
  let warn: jest.SpyInstance;

  const sha1 = (value: string) =>
    createHash('sha1').update(value).digest('hex').toUpperCase();

  const rangeResponse = (lines: string[]) =>
    new Response(lines.join('\r\n'), { status: 200 });

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = jest.fn().mockResolvedValue(rangeResponse([]));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    service = new CompromisedPasswordService();
    warn = jest
      .spyOn((service as unknown as { logger: Logger }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('lista local', () => {
    it('should ship at least the top 3000 passwords that fit the eight-character policy', () => {
      const entries = readFileSync(
        join(__dirname, '../../src/auth/data/common-passwords.txt'),
        'utf8',
      )
        .split('\n')
        .filter((line) => line && !line.startsWith('#'));

      expect(entries.length).toBeGreaterThanOrEqual(3000);
      expect(entries.every((entry) => entry.length >= 8)).toBe(true);
    });

    it('should refuse a common password without asking Pwned Passwords', async () => {
      await expect(service.assertNotCompromised('password123')).rejects.toThrow(
        new BadRequestException(COMPROMISED_PASSWORD_MESSAGE),
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should refuse a common password typed with uppercase letters', async () => {
      await expect(service.assertNotCompromised('PassWord123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Pwned Passwords', () => {
    const password = 'edutrace-senha-teste-2026';
    const hash = sha1(password);

    it('should send only the first five characters of the SHA-1, with padding', async () => {
      await service.assertNotCompromised(password);

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`,
      );
      expect(url).not.toContain(hash.slice(5));
      expect(init.headers).toEqual({ 'Add-Padding': 'true' });
    });

    it('should accept a password that is not in the range response', async () => {
      fetchMock.mockResolvedValue(
        rangeResponse(['0018A45C4D1DEF81644B54AB7F969B88D65:3', 'ABCDEF:1']),
      );

      await expect(
        service.assertNotCompromised(password),
      ).resolves.toBeUndefined();
    });

    it('should refuse a password found in a breach', async () => {
      fetchMock.mockResolvedValue(
        rangeResponse(['0018A45C4D1DEF81644B54AB7F969B88D65:3', `${hash.slice(5)}:12`]),
      );

      await expect(service.assertNotCompromised(password)).rejects.toThrow(
        new BadRequestException(COMPROMISED_PASSWORD_MESSAGE),
      );
    });

    it('should ignore a padding entry, which has count zero', async () => {
      fetchMock.mockResolvedValue(rangeResponse([`${hash.slice(5)}:0`]));

      await expect(
        service.assertNotCompromised(password),
      ).resolves.toBeUndefined();
    });

    it('should accept and warn when the service does not answer', async () => {
      fetchMock.mockRejectedValue(new Error('timeout'));

      await expect(
        service.assertNotCompromised(password),
      ).resolves.toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        'Pwned Passwords indisponível, senha verificada só pela lista local: timeout',
      );
      expect(JSON.stringify(warn.mock.calls)).not.toContain(password);
    });

    it('should accept and warn when the service answers with an error', async () => {
      fetchMock.mockResolvedValue(new Response('', { status: 503 }));

      await expect(
        service.assertNotCompromised(password),
      ).resolves.toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        'Pwned Passwords indisponível, senha verificada só pela lista local: HTTP 503',
      );
    });
  });
});
