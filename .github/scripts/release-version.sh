# Cálculo da versão das esteiras de release (backend-pipeline e frontend-pipeline).
# As esteiras e o teste do gate de PR carregam este arquivo com `source`.

# Maior versão X.Y.Z entre as linhas da entrada padrão, pela ordem numérica, e
# não pela data de criação da release. 0.0.0 quando não há nenhuma.
highest_version() {
  local versions
  versions=$(grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' || true)

  if [ -z "$versions" ]; then
    echo "0.0.0"
    return
  fi

  printf '%s\n' "$versions" | sort -V | tail -n 1
}

# Próxima versão a partir de $1, conforme o tipo de mudança $2 marcado na PR.
bump_version() {
  local major minor patch
  IFS=. read -r major minor patch <<< "$1"

  case "$2" in
    bug-fix) patch=$((patch + 1)) ;;
    nova-feature) minor=$((minor + 1)); patch=0 ;;
    marco-no-projeto) major=$((major + 1)); minor=0; patch=0 ;;
    *)
      echo "Tipo de mudança desconhecido: '$2'" >&2
      return 1
      ;;
  esac

  echo "$major.$minor.$patch"
}

# Versão já reservada para o commit $1. A entrada padrão traz linhas
# "<sha> <tag>", no formato de `git ls-remote --tags` sem o prefixo refs/tags/.
# O back e o front do mesmo merge rodam em esteiras separadas e precisam sair
# com a mesma versão.
version_for_commit() {
  sed -E 's/\^\{\}$//' \
    | awk -v sha="$1" '$1 == sha { print $2 }' \
    | highest_version \
    | grep -vx '0.0.0' || true
}

# "true" quando a versão $1 é maior ou igual a todas as releases da entrada
# padrão. Uma release criada depois de outra com número maior, como acontece
# quando merges próximos terminam fora de ordem, não pode virar a Latest.
is_latest_release() {
  local highest
  highest=$( { cat; echo "$1"; } | highest_version)

  if [ "$highest" = "$1" ]; then
    echo "true"
  else
    echo "false"
  fi
}
