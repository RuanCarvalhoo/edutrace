import { BadRequestException } from '@nestjs/common';
import { createValidationPipe } from 'src/common/validation-pipe';
import { CreateScreeningDto } from 'src/screenings/dto/create-screening.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

const screening = {
  full_name: 'João Silva',
  email: 'joao@example.com',
  specific_need: { deficiencia_fisica: true, outros: '' },
  special_service: true,
  physical_disability: {
    necessita_de_transcritor: true,
    acesso_para_cadeirante: false,
    outros: 'Algum outro tipo',
  },
  visual_impairment: { necessita_de_braille: false, outros: '' },
  hearing_impairment: { necessita_de_interprete_oralizador: false, outros: '' },
  global_disorder: { necessita_de_ledor: false, outros: '' },
};

function validate(metatype: new () => object, value: object) {
  return createValidationPipe().transform(value, { type: 'body', metatype });
}

describe('createValidationPipe', () => {
  it('should drop the properties that are not declared in the DTO', async () => {
    const result = await validate(CreateScreeningDto, {
      ...screening,
      id: 999,
      created_at: '1999-12-31T00:00:00.000Z',
    });

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('created_at');
    expect(result).toEqual(screening);
  });

  it('should keep every key inside the JSON fields', async () => {
    const physical_disability = {
      ...screening.physical_disability,
      campo_adicional_do_formulario: true,
    };

    const result = await validate(CreateScreeningDto, {
      ...screening,
      physical_disability,
    });

    expect(result).toHaveProperty('physical_disability', physical_disability);
  });

  it('should hand the DTO instance to the controller', async () => {
    const result = await validate(CreateScreeningDto, screening);

    expect(result).toBeInstanceOf(CreateScreeningDto);
  });

  it('should keep normalizing a masked cpf before it reaches the service', async () => {
    const result = await validate(CreateUserDto, {
      full_name: 'Usuário de Teste',
      email: 'usuario@edutrace.com',
      password: 'senhaSegura123',
      cpf: '012.345.678-90',
    });

    expect(result).toHaveProperty('cpf', '01234567890');
  });

  it('should reject a field with the wrong type', async () => {
    await expect(
      validate(CreateScreeningDto, {
        ...screening,
        physical_disability: 'texto no lugar do objeto',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
