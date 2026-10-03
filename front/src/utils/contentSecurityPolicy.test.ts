import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildContentSecurityPolicy,
  createNonce,
} from "./contentSecurityPolicy";

function directives(policy: string): Map<string, string[]> {
  return new Map(
    policy.split("; ").map((entry) => {
      const [name, ...sources] = entry.split(" ");
      return [name, sources];
    }),
  );
}

describe("createNonce", () => {
  it("creates 128 random bits in base64", () => {
    const nonce = createNonce();

    assert.match(nonce, /^[A-Za-z0-9+/]{22}==$/);
  });

  it("creates a different nonce each time", () => {
    const nonces = new Set(Array.from({ length: 50 }, () => createNonce()));

    assert.equal(nonces.size, 50);
  });
});

describe("buildContentSecurityPolicy", () => {
  const policy = directives(
    buildContentSecurityPolicy({
      nonce: "abc123",
      apiUrl: "https://edutrace.exemplo/api",
    }),
  );

  it("runs only scripts with the nonce of the response, extended by strict-dynamic", () => {
    const scriptSrc = policy.get("script-src") ?? [];

    assert.ok(scriptSrc.includes("'nonce-abc123'"));
    assert.ok(scriptSrc.includes("'strict-dynamic'"));
    assert.ok(!scriptSrc.includes("'unsafe-inline'"));
    assert.ok(!scriptSrc.includes("'unsafe-eval'"));
  });

  it("blocks plugins, base changes and framing by other sites", () => {
    assert.deepEqual(policy.get("object-src"), ["'none'"]);
    assert.deepEqual(policy.get("base-uri"), ["'none'"]);
    assert.deepEqual(policy.get("frame-ancestors"), ["'none'"]);
    assert.deepEqual(policy.get("form-action"), ["'self'"]);
  });

  it("allows the API origin, Google Identity and Clarity", () => {
    const connectSrc = policy.get("connect-src") ?? [];

    assert.ok(connectSrc.includes("https://edutrace.exemplo"));
    assert.ok(connectSrc.includes("https://accounts.google.com/gsi/"));
    assert.ok(connectSrc.includes("https://*.clarity.ms"));
  });

  it("does not allow the GitHub API, which the login page no longer calls", () => {
    const connectSrc = policy.get("connect-src") ?? [];

    assert.ok(!connectSrc.includes("https://api.github.com"));
  });

  it("allows the Google sign in button iframe and stylesheet", () => {
    assert.deepEqual(policy.get("frame-src"), ["https://accounts.google.com/gsi/"]);
    assert.ok(
      (policy.get("style-src") ?? []).includes("https://accounts.google.com/gsi/style"),
    );
  });

  it("keeps style-src without a nonce, which would disable 'unsafe-inline'", () => {
    const styleSrc = policy.get("style-src") ?? [];

    assert.ok(styleSrc.includes("'unsafe-inline'"));
    assert.ok(!styleSrc.some((source) => source.startsWith("'nonce-")));
  });

  it("allows eval only in development", () => {
    const dev = directives(
      buildContentSecurityPolicy({ nonce: "abc123", isDev: true }),
    );

    assert.ok((dev.get("script-src") ?? []).includes("'unsafe-eval'"));
  });

  it("leaves out an API address that is missing or invalid", () => {
    for (const apiUrl of [undefined, "", "nao-e-url"]) {
      const connectSrc =
        directives(buildContentSecurityPolicy({ nonce: "abc123", apiUrl })).get(
          "connect-src",
        ) ?? [];

      assert.equal(connectSrc[0], "'self'");
      assert.ok(!connectSrc.includes("null"));
      assert.ok(!connectSrc.includes("nao-e-url"));
    }
  });
});
