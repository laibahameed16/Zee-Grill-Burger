export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  name?: string;
}

const USER_KEY = "zee-grill-user";
const USERS_KEY = "zee-grill-registered-users";
const LOGGED_IN_USER_KEY = "loggedInUser";

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        profilePic: parsed.profilePic || "",
        name: parsed.name || "",
      };
    }
  } catch {
    // ignore
  }

  const displayName = localStorage.getItem(LOGGED_IN_USER_KEY) || "";
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

  localStorage.setItem(USER_KEY, JSON.stringify(profile));
  localStorage.setItem(LOGGED_IN_USER_KEY, displayName);

  try {
    const usersRaw = localStorage.getItem(USERS_KEY);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
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
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
  } catch {
    // ignore
  }

  window.dispatchEvent(new Event("auth-changed"));
  window.dispatchEvent(new Event("profile-updated"));
}
