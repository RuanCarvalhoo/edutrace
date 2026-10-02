import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readActivationToken } from "./activationToken";

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
