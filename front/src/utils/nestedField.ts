// Os formulários de anamnese, triagem e PEI endereçam campos aninhados por
// caminhos como "family_data.uniao_pais.casados". Um segmento __proto__,
// constructor ou prototype faria a navegação sair do objeto do formulário e
// chegar em Object.prototype, e a atribuição passaria a valer para todo objeto
// da página. Por isso esses segmentos são recusados e a navegação só passa por
// propriedades próprias do objeto.
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

type FieldGroup = Record<string, unknown>;

function isFieldGroup(value: unknown): value is FieldGroup {
  return typeof value === "object" && value !== null;
}

function updateNestedField<T>(
  data: T,
  path: string,
  update: (current: unknown) => unknown,
): T {
  const keys = path.split(".");

  if (keys.some((key) => FORBIDDEN_KEYS.has(key))) {
    return data;
  }

  const copy: T = JSON.parse(JSON.stringify(data));
  const parent = keys.slice(0, -1).reduce<FieldGroup | undefined>((group, key) => {
    const child = group && Object.hasOwn(group, key) ? group[key] : undefined;
    return isFieldGroup(child) ? child : undefined;
  }, isFieldGroup(copy) ? copy : undefined);

  if (!parent) {
    return data;
  }

  const lastKey = keys[keys.length - 1];
  parent[lastKey] = update(parent[lastKey]);
  return copy;
}

export function setNestedField<T>(data: T, path: string, value: unknown): T {
  return updateNestedField(data, path, () => value);
}

export function toggleNestedField<T>(data: T, path: string): T {
  return updateNestedField(data, path, (current) => !current);
}
