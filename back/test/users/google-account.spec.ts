import {
  GOOGLE_CPF_PREFIX,
  hasPendingGoogleRegistration,
} from 'src/users/google-account';
import { UsersService } from 'src/users/users.service';

describe('google-account', () => {
  it('should treat an account with the Google placeholder as pending', () => {
    expect(hasPendingGoogleRegistration({ cpf: 'google:1234567890' })).toBe(
      true,
    );
  });

  it('should not treat an account with a real CPF as pending', () => {
    expect(hasPendingGoogleRegistration({ cpf: '01234567890' })).toBe(false);
  });

  it('should recognize the placeholder written by the Google sign-in', async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const service = new UsersService(
      { user: { upsert } } as never,
      {} as never,
      {} as never,
    );

    await service.ensureGoogleStudentUser({
      email: 'aluno@discente.ifpe.edu.br',
      fullName: 'Aluno',
      passwordHash: 'hash',
      googleSubject: '1234567890',
    });

    const { create } = upsert.mock.calls[0][0] as { create: { cpf: string } };
    expect(create.cpf.startsWith(GOOGLE_CPF_PREFIX)).toBe(true);
    expect(hasPendingGoogleRegistration(create)).toBe(true);
  });
});
