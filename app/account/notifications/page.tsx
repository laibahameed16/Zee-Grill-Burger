"use client";

import Navbar from "@/components/home/Navbar";
import { useEffect, useState } from "react";
import type { PersistentNotification } from "@/lib/notifications";

const STORAGE_KEY = "zee-grill-notifications";

function loadNotifications(): PersistentNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(list: PersistentNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("notifications-updated"));
}

function iconFor(type: PersistentNotification["type"]) {
  switch (type) {
    case "order":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "loyalty":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "wallet":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
        </svg>
      );
    case "coupon":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.59 9.59a2 2 0 0 0 2.83 0l3.34-3.34a2 2 0 0 0 0-2.84Z" />
          <circle cx="7.5" cy="6.5" r="1" />
        </svg>
      );
    case "promo":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.59 9.59a2 2 0 0 0 2.83 0l3.34-3.34a2 2 0 0 0 0-2.84Z" />
          <circle cx="7.5" cy="6.5" r="1" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
  }
}

function colorFor(type: PersistentNotification["type"]) {
  switch (type) {
    case "order":   return "bg-[#ff542d]";
    case "loyalty": return "bg-[#f59e0b]";
    case "wallet":  return "bg-[#2f9e44]";
    case "coupon":  return "bg-[#8b5cf6]";
    case "promo":   return "bg-[#b8934a]";
    default:        return "bg-[#3b82f6]";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PersistentNotification[]>([]);

  const reload = () => setNotifications(loadNotifications());

  useEffect(() => {
    reload();
    window.addEventListener("notifications-updated", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("notifications-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // =========================================================
  // ACTIONS
  // =========================================================

  const handleReadAll = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
    setNotifications([]);
  };

  const handleMarkRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
    setNotifications(updated);
  };

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
      <Navbar />

      <div className="mx-auto w-full max-w-[850px] px-5 pb-12 pt-8 sm:px-6 sm:pt-10">

        {/* HEADER */}
        <div className="mb-7 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">
              ACCOUNT
            </p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#292929] sm:text-[38px] lg:text-[42px]">
              Notifications
            </h1>
            <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">
              Stay updated with your orders and offers
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[#ff542d] px-2 py-0.5 text-[9px] font-bold text-white">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          {notifications.length > 0 && (
            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleReadAll}
                  className="rounded-full border border-[#ff542d] px-4 py-2 text-[10px] font-semibold text-[#ff542d] transition-all hover:bg-[#ff542d] hover:text-white sm:text-[11px]"
                >
                  Read All
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-full border border-[#dedede] px-4 py-2 text-[10px] font-semibold text-[#888] transition-all hover:border-[#e44] hover:text-[#e44] sm:text-[11px]"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS LIST */}
        <section className="overflow-hidden rounded-[18px] border border-[#eeeeee] bg-white shadow-[0_3px_15px_rgba(0,0,0,0.05)]">
          {notifications.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f5f5] text-[#aaa] sm:h-24 sm:w-24">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className="mt-5 text-[15px] font-bold text-[#292929] sm:text-[17px]">
                No notifications
              </p>
              <p className="mt-2 text-[12px] text-[#999] sm:text-[13px]">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eeeeee]">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  className={`
                    flex w-full gap-4 px-5 py-5 text-left transition-colors hover:bg-[#fafafa]
                    sm:px-6 sm:py-6
                    ${!n.read ? "bg-[#fff8f5]" : ""}
                  `}
                >
                  {/* ICON */}
                  <div
                    className={`
                      flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white
                      sm:h-11 sm:w-11
                      ${colorFor(n.type)}
                    `}
                  >
                    {iconFor(n.type)}
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-[#292929] sm:text-[14px]">
                        {n.title}
                        {!n.read && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#ff542d] align-middle" />
                        )}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#666] sm:text-[12px]">
                      {n.message}
                    </p>
                    <p className="mt-2 text-[10px] text-[#aaa] sm:text-[11px]">
                      {n.time}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
