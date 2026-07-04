/**
 * Typed API client. Attaches the access token, and transparently refreshes it
 * once on a 401 using the httpOnly refresh cookie.
 */
import { useAuthStore } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { pagination?: { page: number; limit: number; total: number; totalPages: number } };
}

export class ApiClientError extends Error {
  status: number;
  errors?: unknown;
  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  _retried?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { auth = true, headers, _retried, ...rest } = options;
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401 && auth && !_retried) {
    // Attempt a single silent refresh, then retry.
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, { ...options, _retried: true });
  }

  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T> & { errors?: unknown };
  if (!res.ok || body.success === false) {
    throw new ApiClientError(res.status, body.message ?? 'Request failed', body.errors);
  }
  return body;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const body = await res.json();
    useAuthStore.getState().setSession(body.data.user, body.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};
