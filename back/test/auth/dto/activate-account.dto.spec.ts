import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ActivateAccountDto } from 'src/auth/dto/activate-account.dto';

function validate(payload: Record<string, unknown>) {
  return validateSync(plainToInstance(ActivateAccountDto, payload));
}

describe('ActivateAccountDto', () => {
  it('should accept a token and a password with eight characters', () => {
    const errors = validate({ token: 'token-do-link', password: '12345678' });

    expect(errors).toHaveLength(0);
  });

  it('should reject a password shorter than eight characters', () => {
    const errors = validate({ token: 'token-do-link', password: '1234567' });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toEqual({
      minLength: 'A senha deve ter no mínimo 8 caracteres',
    });
  });

  it('should reject a request without the token', () => {
    const errors = validate({ password: 'senhaSegura123' });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('token');
  });

  it('should reject a token that is not a string', () => {
    const errors = validate({ token: 123, password: 'senhaSegura123' });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      isString: 'O campo token deve ser uma string.',
    });
  });
});
