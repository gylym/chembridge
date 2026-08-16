import { describe, expect, it } from "vitest";
import { redactAuditPayload } from "./audit-redaction";

describe("audit payload redaction", () => {
  it("redacts credentials recursively without removing useful context", () => {
    expect(redactAuditPayload({
      userId: "user:1",
      temporaryPassword: "Secret12345",
      nested: { token: "session-token", status: "active" },
    })).toEqual({
      userId: "user:1",
      temporaryPassword: "[REDACTED]",
      nested: { token: "[REDACTED]", status: "active" },
    });
  });
});
