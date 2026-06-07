const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api/v1";

/** Инкапсулирует хранение JWT-токена поверх localStorage. */
class TokenStorage {
  constructor(private readonly key: string) {}

  get(): string | null {
    return localStorage.getItem(this.key);
  }

  set(token: string | null): void {
    if (token) localStorage.setItem(this.key, token);
    else localStorage.removeItem(this.key);
  }
}

export const tokenStorage = new TokenStorage("ni_at");

export function getToken(): string | null {
  return tokenStorage.get();
}

export function setToken(t: string | null): void {
  tokenStorage.set(t);
}

/**
 * HTTP-клиент приложения: единая точка доступа к REST API.
 * Отвечает за подстановку токена, сериализацию тела и обработку ошибок.
 */
export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokens: TokenStorage,
  ) {}

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: this.serialize(body) });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body: this.serialize(body) });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  private serialize(body: unknown): string | undefined {
    return body !== undefined ? JSON.stringify(body) : undefined;
  }

  private async request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const headers = new Headers(opts.headers);
    if (!headers.has("content-type") && opts.body) headers.set("content-type", "application/json");
    const tok = this.tokens.get();
    if (tok) headers.set("authorization", `Bearer ${tok}`);
    const res = await fetch(`${this.baseUrl}${path}`, { ...opts, headers });
    if (res.status === 401) {
      this.tokens.set(null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("unauthorized");
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
}

export const api = new ApiClient(BASE, tokenStorage);
