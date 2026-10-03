import { describe, it } from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config";

async function rules() {
  return (await nextConfig.headers?.()) ?? [];
}

describe("next.config headers", () => {
  it("sends no Referer from the page that receives the activation token", async () => {
    const rule = (await rules()).find((entry) => entry.source === "/definir-senha");

    assert.deepEqual(rule?.headers, [
      { key: "Referrer-Policy", value: "no-referrer" },
    ]);
  });

  it("sends the OWASP security headers on every route", async () => {
    const rule = (await rules()).find((entry) => entry.source === "/:path*");

    assert.deepEqual(rule?.headers, [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ]);
  });

  it("lets the activation page rule override the general Referrer-Policy", async () => {
    const sources = (await rules()).map((entry) => entry.source);

    assert.ok(sources.indexOf("/definir-senha") > sources.indexOf("/:path*"));
  });

  it("does not reveal the server technology in X-Powered-By", () => {
    assert.equal(nextConfig.poweredByHeader, false);
  });
});
