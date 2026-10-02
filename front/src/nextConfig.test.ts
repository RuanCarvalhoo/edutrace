import { describe, it } from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config";

describe("next.config headers", () => {
  it("sends no Referer from the page that receives the activation token", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    const rule = rules.find((entry) => entry.source === "/definir-senha");

    assert.deepEqual(rule?.headers, [
      { key: "Referrer-Policy", value: "no-referrer" },
    ]);
  });
});
