export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function parseError(res: Response): Promise<never> {
  let body: { error?: string; code?: string; details?: unknown } = {};
  try {
    body = await res.json();
  } catch {
    
  }
  throw new ApiClientError(
    res.status,
    body.code ?? 'ERRO',
    body.error ?? `falha (${res.status})`,
    body.details,
  );
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

export async function apiJson<T>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T | null> {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body != null ? { 'content-type': 'application/json' } : undefined,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return parseError(res);
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

export async function apiForm<T>(url: string, form: FormData): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    body: form,
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}
