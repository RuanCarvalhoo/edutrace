import { getAllStudents } from '@/api/students';
import { getAllUsers } from '@/api/user';
import { ADMIN } from '@/consts';

// Só o administrador lista todos os usuários. Qualquer outro nível, inclusive
// sessão sem nível, recebe apenas os estudantes.
export function listarUsuariosDaTabela(idLevel?: number) {
  return idLevel === ADMIN ? getAllUsers() : getAllStudents();
}
