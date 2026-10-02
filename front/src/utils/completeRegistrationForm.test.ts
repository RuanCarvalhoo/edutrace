import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCompleteRegistration } from "./completeRegistrationForm";

const form = {
  cpf: "012.345.678-90",
  senha: "senhaNovaSegura1",
  confirmarSenha: "senhaNovaSegura1",
};

describe("buildCompleteRegistration", () => {
  it("sends only the CPF digits and the password", () => {
    assert.deepEqual(buildCompleteRegistration(form), {
      ok: true,
      data: { cpf: "01234567890", password: "senhaNovaSegura1" },
    });
  });

  it("refuses a CPF without eleven digits", () => {
    assert.deepEqual(buildCompleteRegistration({ ...form, cpf: "012.345.678" }), {
      ok: false,
      error: "O CPF deve ter 11 dígitos.",
    });
  });

  it("refuses a password shorter than eight characters", () => {
    assert.deepEqual(
      buildCompleteRegistration({ ...form, senha: "curta12", confirmarSenha: "curta12" }),
      { ok: false, error: "A senha deve ter no mínimo 8 caracteres." },
    );
  });

  it("refuses when the confirmation is different", () => {
    assert.deepEqual(
      buildCompleteRegistration({ ...form, confirmarSenha: "outraSenha1" }),
      { ok: false, error: "As senhas não coincidem." },
    );
  });
});
