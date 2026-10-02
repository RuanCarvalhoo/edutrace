import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { describeActivationError, readActivationToken } from "./activationToken";

describe("readActivationToken", () => {
  it("reads the token from the fragment of the link", () => {
    assert.equal(readActivationToken("#token=abc_123-XYZ"), "abc_123-XYZ");
  });

  it("accepts the fragment without the leading #", () => {
    assert.equal(readActivationToken("token=abc"), "abc");
  });

  it("returns null when the link has no token", () => {
    assert.equal(readActivationToken(""), null);
    assert.equal(readActivationToken("#"), null);
    assert.equal(readActivationToken("#outro=valor"), null);
  });

  it("returns null when the token is empty", () => {
    assert.equal(readActivationToken("#token="), null);
    assert.equal(readActivationToken("#token=%20"), null);
  });
});

describe("describeActivationError", () => {
  it("points to the password recovery when the link is invalid or expired", () => {
    assert.equal(
      describeActivationError("Link inválido ou expirado."),
      'Link inválido ou expirado. Use a opção "Esqueci minha senha" para receber um código novo.',
    );
  });

  it("keeps the message of a refused password as it is", () => {
    const message =
      "Esta senha é muito comum ou já apareceu em vazamentos de dados. Escolha outra.";

    assert.equal(describeActivationError(message), message);
  });
});
