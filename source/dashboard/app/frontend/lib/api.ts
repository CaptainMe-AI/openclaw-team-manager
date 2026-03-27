import { getCsrfToken } from "./csrf";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>;

export async function apiFetch<T>(
  path: string,
  params?: QueryParams,
  options?: RequestInit,
): Promise<T> {
  const url = new URL(path, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token": getCsrfToken(),
    },
    credentials: "same-origin",
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  return response.json() as Promise<T>;
}

// Convenience for mutation requests (POST, PATCH, DELETE)
export async function apiMutate<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>,
): Promise<T> {
  return apiFetch<T>(path, undefined, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}
