import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ActivateAccountDto {
  @ApiProperty({
    description: 'Token recebido no link de definição de senha.',
    example: 'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0x1c',
  })
  @IsNotEmpty({ message: 'O campo token não deve estar vazio.' })
  @IsString({ message: 'O campo token deve ser uma string.' })
  token: string;

  @ApiProperty({
    description: 'Senha escolhida pelo usuário com no mínimo 8 caracteres.',
    example: 'senhaSegura123',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'O campo password não deve estar vazio.' })
  @IsString({ message: 'O campo password deve ser uma string' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  password: string;
}
