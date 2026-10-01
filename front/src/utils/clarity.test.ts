import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldLoadClarity } from "./clarity";

describe("shouldLoadClarity", () => {
  it("keeps Clarity off the page that receives the activation token", () => {
    assert.equal(shouldLoadClarity("/definir-senha"), false);
    assert.equal(shouldLoadClarity("/definir-senha/"), false);
  });

  it("loads Clarity on the other pages", () => {
    assert.equal(shouldLoadClarity("/login"), true);
    assert.equal(shouldLoadClarity("/home"), true);
    assert.equal(shouldLoadClarity("/definir-senha-outra"), true);
  });

  it("loads Clarity while the path is not known yet", () => {
    assert.equal(shouldLoadClarity(null), true);
  });
});
