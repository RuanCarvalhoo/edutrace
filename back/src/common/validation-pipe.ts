import { ValidationPipe } from '@nestjs/common';

// transform: true faz o controller receber a instância do DTO, e não o corpo
// cru. Sem isso o @Transform do CPF normalizaria apenas o objeto usado na
// validação, e o valor com máscara chegaria ao banco assim mesmo.
//
// whitelist: true descarta as propriedades sem decorator de validação antes de
// o corpo chegar ao service, que o repassa inteiro ao Prisma. Sem isso qualquer
// coluna do model enviada no corpo, como id ou created_at, seria gravada.
// forbidNonWhitelisted fica desligado porque as telas de edição reenviam o
// registro lido no GET, com id e datas, e passariam a receber 400.
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({ transform: true, whitelist: true });
}
