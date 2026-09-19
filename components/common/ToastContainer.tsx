"use client";

import { useEffect, useState } from "react";
import type { NotificationData, NotificationType } from "@/lib/notifications";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<NotificationData[]>([]);

  useEffect(() => {
    const handleShow = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationData>;
      const data = customEvent.detail;

      setToasts(function (prev) {
        return prev.concat([data]);
      });

      const duration = typeof data.duration === "number" ? data.duration : 3500;
      setTimeout(function () {
        setToasts(function (prev) {
          return prev.filter(function (t) {
            return t.id !== data.id;
          });
        });
      }, duration);
    };

    window.addEventListener("show-notification", handleShow);
    return function () {
      window.removeEventListener("show-notification", handleShow);
    };
  }, []);

  function removeToast(id: string) {
    setToasts(function (prev) {
      return prev.filter(function (t) {
        return t.id !== id;
      });
    });
  }

  function iconFor(type: NotificationType) {
    if (type === "success") {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    if (type === "error") {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    }
    if (type === "warning") {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }

  function stylesFor(type: NotificationType) {
    if (type === "success") {
      return {
        bg: "bg-white",
        border: "border border-green-100",
        iconText: "text-white bg-gradient-to-br from-[#10b981] to-[#047857] shadow-[0_4px_12px_rgba(16,185,129,0.3)]",
        progress: "bg-gradient-to-r from-[#10b981] to-[#34d399]",
      };
    }
    if (type === "error") {
      return {
        bg: "bg-white",
        border: "border border-red-100",
        iconText: "text-white bg-gradient-to-br from-[#ef4444] to-[#b91c1c] shadow-[0_4px_12px_rgba(239,68,68,0.3)]",
        progress: "bg-gradient-to-r from-[#ef4444] to-[#f87171]",
      };
    }
    if (type === "warning") {
      return {
        bg: "bg-white",
        border: "border border-amber-100",
        iconText: "text-white bg-gradient-to-br from-[#f59e0b] to-[#b45309] shadow-[0_4px_12px_rgba(245,158,11,0.3)]",
        progress: "bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]",
      };
    }
    return {
      bg: "bg-white",
      border: "border border-blue-100",
      iconText: "text-white bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] shadow-[0_4px_12px_rgba(59,130,246,0.3)]",
      progress: "bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]",
    };
  }

  function makeToastContainerClass(s: ReturnType<typeof stylesFor>) {
    return (
      "pointer-events-auto relative overflow-hidden rounded-[22px] " +
      s.bg +
      " " +
      s.border +
      " px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] toast-anim-in transform transition-all duration-300 hover:scale-[1.02]"
    );
  }

  function makeIconWrapperClass(s: ReturnType<typeof stylesFor>) {
    return (
      "mt-0.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full " +
      s.iconText
    );
  }

  function makeProgressBarClass(s: ReturnType<typeof stylesFor>) {
    return (
      "absolute bottom-0 left-0 h-[5px] origin-left toast-progress-bar " +
      s.progress
    );
  }

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[9999] flex w-[calc(100%-24px)] max-w-[380px] flex-col gap-3 sm:right-6 sm:top-6 sm:w-auto">
      {toasts.map(function (t) {
        const s = stylesFor(t.type);
        const duration = typeof t.duration === "number" ? t.duration : 3500;
        const progressStyle: React.CSSProperties = {
          animationDuration: duration + "ms",
        };
        return (
          <div key={t.id} className={makeToastContainerClass(s)}>
            <div className="flex items-start gap-4">
              <div className={makeIconWrapperClass(s)}>{iconFor(t.type)}</div>
              <p className="flex-1 pt-1.5 text-[14px] font-bold leading-snug text-[#1f2937] sm:text-[15px]">
                {t.message}
              </p>
              <button
                type="button"
                onClick={function () {
                  return removeToast(t.id);
                }}
                className="mt-1.5 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#f3f4f6] text-[#9ca3af] transition-all duration-200 hover:bg-[#e5e7eb] hover:text-[#4b5563]"
                aria-label="Close notification"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div
              key={"bar-" + t.id}
              className={makeProgressBarClass(s)}
              style={progressStyle}
            />
          </div>
        );
      })}
    </div>
  );
}
