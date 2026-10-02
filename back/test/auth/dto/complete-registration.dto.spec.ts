import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CompleteRegistrationDto } from 'src/auth/dto/complete-registration.dto';

function instance(payload: Record<string, unknown>) {
  return plainToInstance(CompleteRegistrationDto, payload);
}

describe('CompleteRegistrationDto', () => {
  it('should accept a valid CPF and a password with eight characters', () => {
    const errors = validateSync(
      instance({ cpf: '01234567890', password: '12345678' }),
    );

    expect(errors).toHaveLength(0);
  });

  it('should keep only the digits of a masked CPF', () => {
    const dto = instance({ cpf: '012.345.678-90', password: 'senhaSegura123' });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.cpf).toBe('01234567890');
  });

  it('should reject a CPF with wrong check digits', () => {
    const errors = validateSync(
      instance({ cpf: '01234567891', password: 'senhaSegura123' }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      isCpf: 'O campo CPF deve ser um CPF válido.',
    });
  });

  it('should reject a request without the CPF', () => {
    const errors = validateSync(instance({ password: 'senhaSegura123' }));

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('cpf');
  });

  it('should reject a password shorter than eight characters', () => {
    const errors = validateSync(
      instance({ cpf: '01234567890', password: '1234567' }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      minLength: 'A senha deve ter no mínimo 8 caracteres',
    });
  });
});
