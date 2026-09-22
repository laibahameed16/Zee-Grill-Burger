import { isBrowser } from "./utils";

export const safeLocalStorage = {
  get<T = any>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw) as T;
      return parsed;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): boolean {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): boolean {
    if (!isBrowser()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  getString(key: string, fallback = ""): string {
    if (!isBrowser()) return fallback;
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },

  setString(key: string, value: string): boolean {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  getNumber(key: string, fallback = 0): number {
    if (!isBrowser()) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const num = Number(raw);
      return Number.isFinite(num) ? num : fallback;
    } catch {
      return fallback;
    }
  },

  setNumber(key: string, value: number): boolean {
    return this.setString(key, String(value));
  },

  getBoolean(key: string, fallback = false): boolean {
    if (!isBrowser()) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return raw === "true";
    } catch {
      return fallback;
    }
  },

  setBoolean(key: string, value: boolean): boolean {
    return this.setString(key, value ? "true" : "false");
  },
};
