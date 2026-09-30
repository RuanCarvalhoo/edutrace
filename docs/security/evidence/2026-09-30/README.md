# Evidências de segurança — 30/09/2026

## OWASP ZAP

Varredura baseline/passiva executada contra `https://edutrace.valerialima.me`, sem ataques ativos e sem sessão autenticada.

- 41 URLs descobertas;
- 56 verificações aprovadas;
- 0 falhas classificadas pelo baseline;
- 11 categorias reportadas como aviso;
- principais sinais: CSP, HSTS e outros cabeçalhos de segurança ausentes ou incompletos.

Evidências: `zap/edutrace-zap.html`, `zap/edutrace-zap.json` e `zap/edutrace-zap.md`.

## Semgrep CE

Análise estática com configuração `auto`; arquivos `.env*`, dependências e artefatos de build foram excluídos.

- 232 arquivos analisados por 257 regras;
- 73 resultados: 4 `ERROR`, 2 `MEDIUM` e 67 `WARNING`;
- concentração principal: Actions com referências mutáveis, possíveis acessos sujeitos a prototype pollution e containers sem usuário não-root.

Evidências: `semgrep/edutrace-semgrep.txt`, `semgrep/edutrace-semgrep.json` e `semgrep/edutrace-semgrep.sarif`.

Os resultados representam ocorrências de regras e podem conter repetições ou falsos positivos. Uma triagem manual é necessária antes de classificá-los como vulnerabilidades confirmadas.

