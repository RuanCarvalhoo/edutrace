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
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      {
        key: "Content-Security-Policy",
        value: "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      },
    ]);
  });

  it("keeps the opener policy that lets the Google sign-in popup answer", async () => {
    const rule = (await rules()).find((entry) => entry.source === "/:path*");
    const header = rule?.headers.find((entry) => entry.key === "Cross-Origin-Opener-Policy");

    assert.equal(header?.value, "same-origin-allow-popups");
  });

  it("does not require corp for embedded content, which the Google and Clarity scripts do not send", async () => {
    const rule = (await rules()).find((entry) => entry.source === "/:path*");

    assert.ok(!rule?.headers.some((entry) => entry.key === "Cross-Origin-Embedder-Policy"));
  });

  it("falls back to a CSP that allows nothing and sets every directive without a fallback", async () => {
    const rule = (await rules()).find((entry) => entry.source === "/:path*");
    const csp = rule?.headers.find((entry) => entry.key === "Content-Security-Policy")?.value ?? "";
    const directives = csp.split(";").map((directive) => directive.trim());

    assert.ok(directives.includes("default-src 'none'"));
    assert.ok(directives.includes("base-uri 'none'"));
    assert.ok(directives.includes("form-action 'none'"));
    assert.ok(directives.includes("frame-ancestors 'none'"));
  });

  it("lets the activation page rule override the general Referrer-Policy", async () => {
    const sources = (await rules()).map((entry) => entry.source);

    assert.ok(sources.indexOf("/definir-senha") > sources.indexOf("/:path*"));
  });

  it("does not reveal the server technology in X-Powered-By", () => {
    assert.equal(nextConfig.poweredByHeader, false);
  });
});
