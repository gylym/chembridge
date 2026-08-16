const secretKeys = /^(?:password|passwordConfirm|temporaryPassword|token|authorization|secret)$/i;

export function redactAuditPayload(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload.map(redactAuditPayload);
  if (!payload || typeof payload !== "object") return payload;
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [
    key,
    secretKeys.test(key) ? "[REDACTED]" : redactAuditPayload(value),
  ]));
}
