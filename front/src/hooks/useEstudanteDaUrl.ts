"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ESTUDANTE } from "@/consts";
import type { StudentData } from "@/interfaces/StudentData";
import { buscarUsuarioPorId } from "@/utils/estudanteDaUrl";

type Resultado = { id: string | null; registro: StudentData | null };

// O estudante acessa os próprios dados pela sessão. O profissional recebe o id
// do estudante na URL e resolve e-mail e nome pela API.
export function useEstudanteDaUrl() {
  const id = useSearchParams().get("id");
  const { user } = useAuth();
  const isStudent = user?.id_level === ESTUDANTE;
  const precisaBuscar = !!user && !isStudent;
  const nivel = user?.id_level;

  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    if (!precisaBuscar) return;

    let ativo = true;
    buscarUsuarioPorId(id, nivel)
      .catch((erro) => {
        console.error("Erro ao identificar o estudante:", erro);
        return null;
      })
      .then((registro) => {
        if (ativo) setResultado({ id, registro });
      });

    return () => {
      ativo = false;
    };
  }, [id, nivel, precisaBuscar]);

  if (isStudent && user) {
    return { id, email: user.email, nome: user.name, registro: null, carregando: false };
  }

  const registro = resultado?.id === id ? resultado.registro : null;
  return {
    id,
    email: registro?.email ?? null,
    nome: registro?.full_name ?? null,
    registro,
    carregando: precisaBuscar && resultado?.id !== id,
  };
}
