import { SetMetadata } from '@nestjs/common';

export const ALLOW_INCOMPLETE_REGISTRATION_KEY = 'allowIncompleteRegistration';

// Libera a rota para quem entrou pelo Google e ainda não cadastrou CPF e senha.
// Não usar @Levels para isso: aquele decorator é uma lista de níveis
// bloqueados, não de permissões.
export const AllowIncompleteRegistration = () =>
  SetMetadata(ALLOW_INCOMPLETE_REGISTRATION_KEY, true);
