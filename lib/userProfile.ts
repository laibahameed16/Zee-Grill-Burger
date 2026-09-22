import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent } from "./utils";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  name?: string;
}

export function getUserProfile(): UserProfile {
  const profile = safeLocalStorage.get<UserProfile | null>(STORAGE_KEYS.USER, null);
  if (profile) {
    return {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      profilePic: profile.profilePic || "",
      name: profile.name || "",
    };
  }

  const displayName = safeLocalStorage.getString(STORAGE_KEYS.LOGGED_IN_USER) || "";
  return {
    firstName: displayName,
    lastName: "",
    email: "",
    phone: "",
    profilePic: "",
    name: displayName,
  };
}

export function saveUserProfile(profile: UserProfile): void {
  const displayName =
    `${profile.firstName} ${profile.lastName}`.trim() ||
    profile.firstName ||
    profile.name ||
    "User";

  profile.name = displayName;

  safeLocalStorage.set(STORAGE_KEYS.USER, profile);
  safeLocalStorage.setString(STORAGE_KEYS.LOGGED_IN_USER, displayName);

  try {
    const users = safeLocalStorage.get<any[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    if (Array.isArray(users)) {
      const idx = users.findIndex(
        (u: any) =>
          u.email?.toLowerCase() === profile.email?.toLowerCase()
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
    }
  } catch {
    // ignore
  }

  dispatchCustomEvent(EVENTS.AUTH_CHANGED);
  dispatchCustomEvent(EVENTS.PROFILE_UPDATED);
}
