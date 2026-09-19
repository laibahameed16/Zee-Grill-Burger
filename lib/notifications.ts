export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationData {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// =========================================================
// TOAST (top-right temporary pop-up)
// =========================================================

export function showNotification(
  type: NotificationType,
  message: string,
  duration: number = 3500
) {
  const data: NotificationData = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    type,
    message,
    duration,
  };

  window.dispatchEvent(
    new CustomEvent("show-notification", { detail: data })
  );
}

// =========================================================
// PERSISTENT NOTIFICATION (saved to localStorage)
// Appears in /account/notifications page
// =========================================================

export type PersistentNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "order" | "loyalty" | "wallet" | "coupon" | "info" | "promo";
  read: boolean;
};

const STORAGE_KEY = "zee-grill-notifications";

export function addPersistentNotification(
  title: string,
  message: string,
  type: PersistentNotification["type"] = "info"
) {
  if (typeof window === "undefined") return;

  let existing: PersistentNotification[] = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed;
    }
  } catch {
    existing = [];
  }

  const newNotif: PersistentNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    message,
    time: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    type,
    read: false,
  };

  const updated = [newNotif, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Notify the notifications page to re-render
  window.dispatchEvent(new Event("notifications-updated"));
}

export function getPersistentNotifications(): PersistentNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getUnreadNotificationCount(): number {
  return getPersistentNotifications().filter((n) => !n.read).length;
}
