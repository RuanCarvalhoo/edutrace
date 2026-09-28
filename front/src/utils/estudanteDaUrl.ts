import type { StudentData } from '@/interfaces/StudentData';
import { listarUsuariosDaTabela } from './tabelaUsuarios';

// As telas do estudante levam só o id na URL. O Microsoft Clarity registra o
// endereço de cada página visitada, então e-mail, nome e CPF do estudante não
// podem ir na query string.
export function rotaDoEstudante(caminho: string, id?: number | string | null) {
  if (id === null || id === undefined || id === '') return caminho;
  return `${caminho}?id=${encodeURIComponent(String(id))}`;
}

// Resolve o usuário a partir do id da URL na mesma lista que a tabela da home
// exibe para o nível da sessão: o administrador procura entre todos os
// usuários, e os profissionais, entre os estudantes.
export async function buscarUsuarioPorId(
  id: string | null,
  idLevel?: number,
): Promise<StudentData | null> {
  const idNumerico = Number(id);
  if (!id || !Number.isInteger(idNumerico) || idNumerico <= 0) return null;

  const usuarios: StudentData[] = await listarUsuariosDaTabela(idLevel);
  return usuarios.find((usuario) => usuario.id === idNumerico) ?? null;
}
