import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent } from "./utils";

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  name?: string;
}

export interface RegisteredUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  name?: string;
  password?: string;
  createdAt?: string;
}

export const isLoggedIn = (): boolean => {
  const user = safeLocalStorage.getString(STORAGE_KEYS.LOGGED_IN_USER, "");
  return !!user;
};

export const getLoggedInUser = (): string => {
  return safeLocalStorage.getString(STORAGE_KEYS.LOGGED_IN_USER, "");
};

export const getAuthUser = (): AuthUser => {
  const saved = safeLocalStorage.get<AuthUser | null>(STORAGE_KEYS.USER, null);

  if (saved) {
    return {
      firstName: saved.firstName ?? "",
      lastName: saved.lastName ?? "",
      email: saved.email ?? "",
      phone: saved.phone ?? "",
      profilePic: saved.profilePic ?? "",
      name: saved.name ?? "",
    };
  }

  const displayName = getLoggedInUser();
  return {
    firstName: displayName,
    lastName: "",
    email: "",
    phone: "",
    profilePic: "",
    name: displayName,
  };
};

export const saveAuthUser = (profile: AuthUser): void => {
  const displayName =
    `${profile.firstName} ${profile.lastName}`.trim() ||
    profile.firstName ||
    profile.name ||
    "User";

  const toSave = { ...profile, name: displayName };

  safeLocalStorage.set(STORAGE_KEYS.USER, toSave);
  safeLocalStorage.setString(STORAGE_KEYS.LOGGED_IN_USER, displayName);

  try {
    const users = getRegisteredUsers();
    const idx = users.findIndex(
      (u) => (u.email ?? "").toLowerCase() === (profile.email ?? "").toLowerCase()
    );
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        profilePic: profile.profilePic,
        name: displayName,
      };
      safeLocalStorage.set(STORAGE_KEYS.REGISTERED_USERS, users);
    }
  } catch {
    // ignore
  }

  dispatchCustomEvent(EVENTS.AUTH_CHANGED);
  dispatchCustomEvent(EVENTS.PROFILE_UPDATED);
};

export const setLoggedInUser = (displayName: string): void => {
  safeLocalStorage.setString(STORAGE_KEYS.LOGGED_IN_USER, displayName);
  dispatchCustomEvent(EVENTS.AUTH_CHANGED);
  dispatchCustomEvent(EVENTS.USER_LOGGED_IN);
};

export const getRegisteredUsers = (): RegisteredUser[] => {
  return safeLocalStorage.get<RegisteredUser[]>(STORAGE_KEYS.REGISTERED_USERS, []);
};

export const saveRegisteredUsers = (users: RegisteredUser[]): void => {
  safeLocalStorage.set(STORAGE_KEYS.REGISTERED_USERS, users);
};

export const registerUser = (user: RegisteredUser): void => {
  const users = getRegisteredUsers();
  users.push(user);
  saveRegisteredUsers(users);
};

export const findRegisteredUser = (
  predicate: (u: RegisteredUser) => boolean
): RegisteredUser | undefined => {
  return getRegisteredUsers().find(predicate);
};

export const logoutUser = (): void => {
  safeLocalStorage.remove(STORAGE_KEYS.LOGGED_IN_USER);
  safeLocalStorage.remove(STORAGE_KEYS.USER);
  clearAuthTokens();
  dispatchCustomEvent(EVENTS.AUTH_CHANGED);
  dispatchCustomEvent(EVENTS.USER_LOGGED_OUT);
};

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export const getAccessToken = (): string => {
  return safeLocalStorage.getString(STORAGE_KEYS.ACCESS_TOKEN, "");
};

export const getRefreshToken = (): string => {
  return safeLocalStorage.getString(STORAGE_KEYS.REFRESH_TOKEN, "");
};

export const getTokenExpiresAt = (): number => {
  return safeLocalStorage.getNumber(STORAGE_KEYS.TOKEN_EXPIRES_AT, 0);
};

export const isTokenValid = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  const expiresAt = getTokenExpiresAt();
  if (expiresAt === 0) return true;
  return Date.now() < expiresAt;
};

export const setAuthTokens = (tokens: TokenSet): void => {
  safeLocalStorage.setString(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  if (tokens.refreshToken !== undefined) {
    safeLocalStorage.setString(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }
  if (tokens.expiresAt !== undefined) {
    safeLocalStorage.setNumber(STORAGE_KEYS.TOKEN_EXPIRES_AT, tokens.expiresAt);
  }
};

export const clearAuthTokens = (): void => {
  safeLocalStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  safeLocalStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  safeLocalStorage.remove(STORAGE_KEYS.TOKEN_EXPIRES_AT);
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};
