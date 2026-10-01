import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { setNestedField, toggleNestedField } from "./nestedField";

const form = {
  email: "",
  identification: { nome_completo: "", cep: "" },
  family_data: { uniao_pais: { casados: false, separados: false } },
};

afterEach(() => {
  delete (Object.prototype as Record<string, unknown>).polluted;
});

describe("setNestedField", () => {
  it("sets the nested field in a copy and keeps the original untouched", () => {
    const result = setNestedField(form, "identification.nome_completo", "Maria Souza");

    assert.equal(result.identification.nome_completo, "Maria Souza");
    assert.equal(form.identification.nome_completo, "");
    assert.notEqual(result, form);
  });

  it("sets a top-level field", () => {
    assert.equal(setNestedField(form, "email", "maria@escola.br").email, "maria@escola.br");
  });

  it("creates a field missing from an existing group, as records saved before the field existed need", () => {
    const result = setNestedField(form, "identification.municipio", "Recife");

    assert.equal((result.identification as Record<string, unknown>).municipio, "Recife");
  });

  for (const path of [
    "__proto__.polluted",
    "constructor.prototype.polluted",
    "identification.__proto__.polluted",
    "identification.constructor.prototype.polluted",
  ]) {
    it(`refuses the path ${path} and leaves Object.prototype untouched`, () => {
      const result = setNestedField(form, path, "yes");

      assert.equal(result, form);
      assert.equal(({} as Record<string, unknown>).polluted, undefined);
    });
  }

  it("does not walk through inherited properties", () => {
    const result = setNestedField(form, "toString.polluted", "yes");

    assert.equal(result, form);
    assert.equal((Object.prototype.toString as unknown as Record<string, unknown>).polluted, undefined);
  });

  it("ignores a path whose group does not exist instead of throwing", () => {
    assert.equal(setNestedField(form, "school_information.retido_alguma_vez", "sim"), form);
  });

  it("ignores a path that goes through a field that is not a group", () => {
    assert.equal(setNestedField(form, "identification.cep.digits", "5"), form);
  });
});

describe("toggleNestedField", () => {
  it("inverts the nested boolean in a copy", () => {
    const result = toggleNestedField(form, "family_data.uniao_pais.casados");

    assert.equal(result.family_data.uniao_pais.casados, true);
    assert.equal(result.family_data.uniao_pais.separados, false);
    assert.equal(form.family_data.uniao_pais.casados, false);
  });

  it("refuses prototype paths", () => {
    const result = toggleNestedField(form, "__proto__.polluted");

    assert.equal(result, form);
    assert.equal(({} as Record<string, unknown>).polluted, undefined);
  });
});
