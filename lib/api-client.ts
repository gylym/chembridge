export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  const payload = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? "Сұрау орындалмады" : payload.error.message);
  }
  return payload.data;
}
