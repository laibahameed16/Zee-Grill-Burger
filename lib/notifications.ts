import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent } from "./utils";

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

export function savePersistentNotifications(list: PersistentNotification[]): void {
  safeLocalStorage.set(STORAGE_KEYS.NOTIFICATIONS, list);
  dispatchCustomEvent(EVENTS.NOTIFICATIONS_UPDATED);
}

export function addPersistentNotification(
  title: string,
  message: string,
  type: PersistentNotification["type"] = "info"
) {
  if (typeof window === "undefined") return;

  const existing = safeLocalStorage.get<PersistentNotification[]>(
    STORAGE_KEYS.NOTIFICATIONS,
    []
  );

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

  savePersistentNotifications([newNotif, ...existing]);
}

export function getPersistentNotifications(): PersistentNotification[] {
  return safeLocalStorage.get<PersistentNotification[]>(
    STORAGE_KEYS.NOTIFICATIONS,
    []
  );
}

export function getUnreadNotificationCount(): number {
  return getPersistentNotifications().filter((n) => !n.read).length;
}
