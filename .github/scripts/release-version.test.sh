#!/usr/bin/env bash
# Teste de release-version.sh, executado pelo pr-checks.yml.
set -uo pipefail

source "$(dirname "$0")/release-version.sh"

falhas=0

confere() {
  local descricao="$1" esperado="$2" obtido="$3"

  if [ "$esperado" = "$obtido" ]; then
    echo "ok: $descricao"
  else
    echo "FALHA: $descricao (esperado '$esperado', obtido '$obtido')"
    falhas=$((falhas + 1))
  fi
}

# Maior versão pela ordem numérica, e não pela ordem de criação. Em 02/10 a
# 1.22.1 foi criada depois da 1.23.0, e a esteira leu a 1.22.1 como a última.
confere "maior versão ignora a ordem de criação" "1.23.0" \
  "$(printf '1.22.2\n1.22.1\n1.23.0\n1.22.0\n' | highest_version)"
confere "1.10.0 é maior que 1.9.3" "1.10.0" \
  "$(printf '1.9.3\n1.10.0\n1.2.0\n' | highest_version)"
confere "tags fora do padrão X.Y.Z são ignoradas" "1.2.3" \
  "$(printf 'latest\nv9.9.9\n1.2.3\n1.2.3-rc1\n' | highest_version)"
confere "sem nenhuma versão parte de 0.0.0" "0.0.0" \
  "$(printf '' | highest_version)"

confere "bug-fix incrementa o patch" "1.23.1" "$(bump_version 1.23.0 bug-fix)"
confere "nova-feature incrementa o minor e zera o patch" "1.24.0" "$(bump_version 1.23.4 nova-feature)"
confere "marco-no-projeto incrementa o major e zera o resto" "2.0.0" "$(bump_version 1.23.4 marco-no-projeto)"
if bump_version 1.23.0 outro >/dev/null 2>&1; then
  confere "tipo desconhecido falha" "erro" "sem erro"
else
  confere "tipo desconhecido falha" "erro" "erro"
fi

tags=$(printf '%s\n' \
  'aaa111 1.22.0' \
  'bbb222 1.23.0' \
  'ccc333 1.23.1' \
  'ddd444 1.23.1^{}' \
  'eee555 notas-antigas')
confere "commit com versão reservada pela outra esteira reaproveita a versão" "1.23.0" \
  "$(printf '%s\n' "$tags" | version_for_commit bbb222)"
confere "tag anotada é encontrada pelo commit apontado" "1.23.1" \
  "$(printf '%s\n' "$tags" | version_for_commit ddd444)"
confere "commit sem versão reservada não reaproveita nada" "" \
  "$(printf '%s\n' "$tags" | version_for_commit fff666)"
confere "tag fora do padrão no commit não conta como versão" "" \
  "$(printf '%s\n' "$tags" | version_for_commit eee555)"

releases=$(printf '1.22.2\n1.23.0\n1.22.1\n')
confere "versão acima de todas as releases vira a Latest" "true" \
  "$(printf '%s\n' "$releases" | is_latest_release 1.23.1)"
confere "versão abaixo de uma release existente não vira a Latest" "false" \
  "$(printf '%s\n' "$releases" | is_latest_release 1.22.3)"
confere "a release de maior versão continua sendo a Latest" "true" \
  "$(printf '%s\n' "$releases" | is_latest_release 1.23.0)"

# Sequência de 02/10 com as reservas em fila: o bug-fix do #614 e a feature do
# #618 partiram da mesma base, 1.22.0. Reservando uma de cada vez, cada merge
# sai com uma versão própria e a seguinte parte da maior.
reservadas="1.22.0"
v614=$(bump_version "$(printf '%s\n' "$reservadas" | highest_version)" bug-fix)
reservadas=$(printf '%s\n%s' "$reservadas" "$v614")
v618=$(bump_version "$(printf '%s\n' "$reservadas" | highest_version)" nova-feature)
reservadas=$(printf '%s\n%s' "$reservadas" "$v618")
proximo=$(bump_version "$(printf '%s\n' "$reservadas" | highest_version)" bug-fix)
confere "merges em sequência recebem versões distintas e crescentes" "1.22.1 1.23.0 1.23.1" \
  "$v614 $v618 $proximo"

if [ "$falhas" -gt 0 ]; then
  echo "$falhas teste(s) falharam."
  exit 1
fi

echo "Todos os testes de release-version.sh passaram."
