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

export async function apiPost<TBody, TResponse>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ detail: "Unknown error" }));
    const detail =
      typeof err.detail === "string"
        ? err.detail
        : err.detail.map((e) => e.msg).join(", ");
    throw new ApiRequestError(res.status, detail);
  }

  return res.json() as Promise<TResponse>;
}
