const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiError = {
  detail: string | { msg: string; loc: string[] }[];
};

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiRequestError";
  }
}

async function throwApiError(res: Response): Promise<never> {
  const err: ApiError = await res.json().catch(() => ({ detail: "Unknown error" }));
  const detail =
    typeof err.detail === "string"
      ? err.detail
      : err.detail.map((e) => e.msg).join(", ");
  throw new ApiRequestError(res.status, detail);
}

export async function apiPost<TBody, TResponse>(
  path: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) await throwApiError(res);

  return res.json() as Promise<TResponse>;
}

export async function apiGet<TResponse>(
  path: string,
  token: string,
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) await throwApiError(res);

  return res.json() as Promise<TResponse>;
}
