import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { describeAppVersion } from "./appVersion";

describe("describeAppVersion", () => {
  it("shows the release built into the image, linked to its release page", () => {
    assert.deepEqual(describeAppVersion("1.24.0"), {
      label: "1.24.0",
      url: "https://github.com/jardimdesoftware/edutrace/releases/tag/1.24.0",
    });
  });

  it("shows a build made outside the release pipeline as local", () => {
    assert.deepEqual(describeAppVersion(undefined), { label: "local", url: null });
    assert.deepEqual(describeAppVersion(""), { label: "local", url: null });
  });

  it("does not use a value outside the X.Y.Z format as label or link", () => {
    for (const version of ["latest", "1.24", "v1.24.0", "1.24.0\"><script>"]) {
      assert.deepEqual(describeAppVersion(version), { label: "local", url: null });
    }
  });
});
