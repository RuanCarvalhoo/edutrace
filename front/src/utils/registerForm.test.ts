import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildRegisterData } from "./registerForm";

const form = {
  nome: "  Maria Souza  ",
  email: "  Maria.Souza@Escola.Br  ",
  cpf: "111.444.777-35",
  id_level: "3",
};

describe("buildRegisterData", () => {
  it("builds the payload with the cpf digits, the trimmed name and the level as number", () => {
    const result = buildRegisterData(form, true);

    assert.deepEqual(result, {
      ok: true,
      data: {
        full_name: "Maria Souza",
        email: "maria.souza@escola.br",
        cpf: "11144477735",
        id_level: 3,
      },
    });
  });

  it("refuses the submission while the consent term is not accepted", () => {
    assert.deepEqual(buildRegisterData(form, false), {
      ok: false,
      error: "É necessário aceitar o Termo de Consentimento.",
    });
  });

  it("refuses a cpf that does not have eleven digits", () => {
    assert.deepEqual(buildRegisterData({ ...form, cpf: "111.444.777" }, true), {
      ok: false,
      error: "O CPF deve ter 11 dígitos.",
    });
  });
});
