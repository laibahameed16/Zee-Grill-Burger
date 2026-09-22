import { getAccessToken, isTokenValid, clearAuthTokens, logoutUser } from "./auth";
import { dispatchCustomEvent } from "./utils";
import { EVENTS } from "./constants";

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

export const API_CONFIG: ApiConfig = {
  baseUrl: "/api",
  timeout: 30000,
};

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions extends RequestInit {
  method?: ApiMethod;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
  message?: string;
}

const buildQueryString = (
  params?: Record<string, string | number | boolean | undefined>
): string => {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null
  );
  if (entries.length === 0) return "";
  const search = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  );
  return `?${search.toString()}`;
};

const buildUrl = (endpoint: string, options?: ApiRequestOptions): string => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const query = buildQueryString(options?.params);
  if (API_CONFIG.baseUrl) {
    return `${API_CONFIG.baseUrl}${path}${query}`;
  }
  return `${path}${query}`;
};

const buildHeaders = (options?: ApiRequestOptions): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options?.headers ?? {}),
  };
  if (
    options?.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }
  if (options?.requiresAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponseStatus = async (res: Response): Promise<void> => {
  if (res.status === 401) {
    clearAuthTokens();
    dispatchCustomEvent(EVENTS.AUTH_CHANGED);
    dispatchCustomEvent(EVENTS.USER_LOGGED_OUT);
  }
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, requiresAuth = false, timeout, ...rest } =
    options;

  if (requiresAuth && !isTokenValid()) {
    return {
      ok: false,
      status: 401,
      data: null as unknown as T,
      error: "Unauthorized",
      message: "Your session has expired. Please log in again.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeout ?? API_CONFIG.timeout
  );

  try {
    const url = buildUrl(endpoint, options);
    const init: RequestInit = {
      ...rest,
      method,
      headers: buildHeaders(options),
      signal: controller.signal,
    };
    if (body !== undefined) {
      init.body =
        body instanceof FormData ? body : JSON.stringify(body);
    }

    const res = await fetch(url, init);
    clearTimeout(timer);
    await handleResponseStatus(res);

    let data: any = null;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      try {
        data = await res.text();
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: data as T,
        error:
          (data && typeof data === "object" && "error" in data
            ? String(data.error)
            : res.statusText) || "Request failed",
        message:
          (data && typeof data === "object" && "message" in data
            ? String(data.message)
            : undefined),
      };
    }

    return {
      ok: true,
      status: res.status,
      data: data as T,
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      return {
        ok: false,
        status: 0,
        data: null as unknown as T,
        error: "Timeout",
        message: "Request timed out. Please try again.",
      };
    }
    return {
      ok: false,
      status: 0,
      data: null as unknown as T,
      error: "NetworkError",
      message: err?.message || "Something went wrong. Please try again.",
    };
  }
}

export const api = {
  get: <T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "GET",
    }),

  post: <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body,
    }),

  put: <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body,
    }),

  patch: <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body,
    }),

  delete: <T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, "method" | "body">
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "DELETE",
    }),
};
