"use client";

import { useEffect, useState } from "react";
import { isLoggedIn } from "@/lib/auth";
import { EVENTS } from "@/lib/constants";

export default function OpeningPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = isLoggedIn();

    // If user is already logged in, do not show popup
    if (loggedInUser) {
      setIsOpen(false);
      return;
    }

    // Check if popup was already dismissed in this session
    const dismissed = sessionStorage.getItem("opening-popup-dismissed");
    if (dismissed) {
      setIsOpen(false);
      return;
    }

    // Otherwise show popup
    setIsOpen(true);

    const handleAuthChange = () => {
      const currentUser = isLoggedIn();
      if (currentUser) {
        setIsOpen(false);
      }
    };

    window.addEventListener(EVENTS.AUTH_CHANGED, handleAuthChange);
    window.addEventListener(EVENTS.USER_LOGGED_IN, handleAuthChange);

    return () => {
      window.removeEventListener(EVENTS.AUTH_CHANGED, handleAuthChange);
      window.removeEventListener(EVENTS.USER_LOGGED_IN, handleAuthChange);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("opening-popup-dismissed", "true");
  };

  const handlePreOrder = () => {
    handleClose();
    const menu = document.getElementById("menu");
    if (menu) {
      menu.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/55
        px-5
      "
    >
      {/* POPUP */}
      <div
        className="
          relative
          w-full
          max-w-[330px]
          rounded-[16px]
          bg-white
          px-6
          py-7
          shadow-[0_15px_50px_rgba(0,0,0,0.25)]
          sm:max-w-[350px]
          sm:px-7
          sm:py-8
        "
      >
        {/* CROSS BUTTON */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="
            absolute
            right-3
            top-3
            flex
            h-[26px]
            w-[26px]
            items-center
            justify-center
            rounded-full
            bg-[#f4f4f4]
            transition-transform
            duration-200
            hover:scale-105
            cursor-pointer
          "
        >
          <img
            src="/images/popup/cross.png"
            alt="Close"
            className="h-[9px] w-[9px] object-contain"
          />
        </button>

        {/* TITLE */}
        <h2
          className="
            text-center
            text-[19px]
            font-bold
            leading-tight
            text-[#292929]
            sm:text-[20px]
          "
        >
          Porto Piri Piri
        </h2>

        {/* OPENING STATUS */}
        <div className="mt-3 flex justify-center">
          <div
            className="
              flex
              items-center
              gap-1.5
              rounded-full
              bg-[#fff0eb]
              px-3
              py-1.5
              text-[9px]
              font-medium
              text-[#ff542d]
            "
          >
            <span className="h-[6px] w-[6px] rounded-full bg-[#ff542d]" />
            <span>Opens at 17:00</span>
          </div>
        </div>

        {/* MESSAGE */}
        <div className="mt-4 text-center">
          <p
            className="
              text-[10px]
              leading-[1.6]
              text-[#7b8492]
              sm:text-[11px]
            "
          >
            Feel free to browse the menu.
          </p>

          <p
            className="
              text-[10px]
              leading-[1.6]
              text-[#7b8492]
              sm:text-[11px]
            "
          >
            Ordering will be available when the takeaway opens.
          </p>
        </div>

        {/* PRE ORDER BUTTON */}
        <button
          type="button"
          onClick={handlePreOrder}
          className="
            mt-5
            w-full
            rounded-full
            bg-[#ff542d]
            px-5
            py-3
            text-[10px]
            font-semibold
            text-white
            transition-all
            duration-200
            hover:bg-[#e94724]
            hover:scale-[1.01]
            sm:py-3.5
            sm:text-[11px]
            cursor-pointer
          "
        >
          Pre Order
        </button>
      </div>
    </div>
  );
}