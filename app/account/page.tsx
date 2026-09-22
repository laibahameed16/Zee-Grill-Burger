"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { showNotification } from "@/lib/notifications";
import Navbar from "@/components/home/Navbar";
import { getAuthUser, getLoggedInUser, logoutUser } from "@/lib/auth";
import { EVENTS } from "@/lib/constants";
import { dispatchCustomEvent } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/siteConfig";

export default function AccountPage() {
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const updateUser = () => {
      const savedUser = getLoggedInUser();
      if (savedUser) {
        setUserName(savedUser);
      } else {
        setUserName("");
      }

      const authUser = getAuthUser();
      setProfilePic(authUser.profilePic || "");
    };

    updateUser();

    window.addEventListener(EVENTS.AUTH_CHANGED, updateUser);
    window.addEventListener(EVENTS.USER_LOGGED_IN, updateUser);
    window.addEventListener(EVENTS.USER_LOGGED_OUT, updateUser);
    window.addEventListener(EVENTS.PROFILE_UPDATED, updateUser);

    return () => {
      window.removeEventListener(EVENTS.AUTH_CHANGED, updateUser);
      window.removeEventListener(EVENTS.USER_LOGGED_IN, updateUser);
      window.removeEventListener(EVENTS.USER_LOGGED_OUT, updateUser);
      window.removeEventListener(EVENTS.PROFILE_UPDATED, updateUser);
    };
  }, []);

  const userInitial =
    userName.trim().charAt(0).toUpperCase() || "A";

  const handleLogout = () => {
    logoutUser();

    showNotification("success", "Logged out successfully.");

    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">

      <Navbar/>

      <div className="mx-auto w-full max-w-[850px] px-5 pb-12 pt-5 sm:px-8 sm:pt-6 md:px-10 lg:px-0">

        {/* BACK BUTTON */}
        <div className="mb-5">
        <Link
          href="/"
          className="
            inline-flex
            items-center
            gap-2
            text-[12px]
            font-semibold
            text-[#666]
            transition-colors
            hover:text-[#ff542d]
            sm:text-[13px]
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Home</span>
        </Link>
        </div>

        <div className="mb-7">

          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">
            ACCOUNT
          </p>

          <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#292929] sm:text-[38px] lg:text-[42px]">
            My Account
          </h1>

          <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">
            Manage your profile, orders, and addresses
          </p>
        </div>

        <section
          className="
            rounded-[18px]
            border
            border-[#eeeeee]
            bg-white
            p-5
            shadow-[0_3px_15px_rgba(0,0,0,0.06)]
            sm:p-7
          "
        >
          <div className="flex items-center gap-4 sm:gap-5">

            <div
              className="
                flex
                h-[62px]
                w-[62px]
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-[#ff542d]
                text-[23px]
                font-bold
                text-white
                sm:h-[72px]
                sm:w-[72px]
                sm:text-[27px]
              "
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial
              )}
            </div>

            <div className="min-w-0">

              <h2 className="truncate text-[18px] font-bold text-[#292929] sm:text-[21px]">
                {userName || "Guest User"}
              </h2>

              <p className="mt-1 text-[11px] text-[#888] sm:text-[13px]">
                {userName
                  ? `Welcome back to ${SITE_CONFIG.name}`
                  : "Please sign in to manage your account"}
              </p>
            </div>
          </div>
        </section>

        <section
          className="
            mt-6
            overflow-hidden
            rounded-[18px]
            border
            border-[#eeeeee]
            bg-white
            shadow-[0_3px_15px_rgba(0,0,0,0.05)]
          "
        >

          <Link
            href="/account/profile"
            className="
              flex
              min-h-[64px]
              items-center
              justify-between
              border-b
              border-[#eeeeee]
              px-5
              transition-colors
              hover:bg-[#fff8f5]
              sm:px-6
            "
          >
            <div>
              <p className="text-[13px] font-semibold text-[#292929] sm:text-[14px]">
                My Profile
              </p>

              <p className="mt-1 text-[9px] text-[#999] sm:text-[10px]">
                View and update your personal information
              </p>
            </div>

            <span className="text-[17px] font-light text-[#ff542d]">
              ›
            </span>
          </Link>

          <Link
            href="/my-orders"
            className="
              flex
              min-h-[64px]
              items-center
              justify-between
              border-b
              border-[#eeeeee]
              px-5
              transition-colors
              hover:bg-[#fff8f5]
              sm:px-6
            "
          >
            <div>
              <p className="text-[13px] font-semibold text-[#292929] sm:text-[14px]">
                My Orders
              </p>

              <p className="mt-1 text-[9px] text-[#999] sm:text-[10px]">
                View your previous and current orders
              </p>
            </div>

            <span className="text-[17px] font-light text-[#ff542d]">
              ›
            </span>
          </Link>

          <Link
            href="/saved-addresses"
            className="
              flex
              min-h-[64px]
              items-center
              justify-between
              border-b
              border-[#eeeeee]
              px-5
              transition-colors
              hover:bg-[#fff8f5]
              sm:px-6
            "
          >
            <div>
              <p className="text-[13px] font-semibold text-[#292929] sm:text-[14px]">
                Saved Addresses
              </p>

              <p className="mt-1 text-[9px] text-[#999] sm:text-[10px]">
                Manage your saved delivery addresses
              </p>
            </div>

            <span className="text-[17px] font-light text-[#ff542d]">
              ›
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              min-h-[64px]
              w-full
              items-center
              justify-between
              px-5
              text-left
              transition-colors
              hover:bg-[#fff8f5]
              sm:px-6
            "
          >
            <div>
              <p className="text-[13px] font-semibold text-[#ff542d] sm:text-[14px]">
                Logout
              </p>

              <p className="mt-1 text-[9px] text-[#aaa] sm:text-[10px]">
                Sign out of your account
              </p>
            </div>

            <span className="text-[17px] font-light text-[#ff542d]">
              ›
            </span>
          </button>
        </section>

        <section
          className="
            mt-6
            overflow-hidden
            rounded-[18px]
            border
            border-[#eeeeee]
            bg-white
            shadow-[0_3px_15px_rgba(0,0,0,0.05)]
          "
        >

          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className="
              flex
              min-h-[64px]
              w-full
              items-center
              justify-between
              px-5
              text-left
              sm:px-6
            "
          >
            <span className="text-[13px] font-semibold text-[#292929] sm:text-[14px]">
              More
            </span>

            <span
              className={`
                text-[13px]
                text-[#292929]
                transition-transform
                duration-200
                ${moreOpen ? "rotate-180" : ""}
              `}
            >
              ▲
            </span>
          </button>

          {moreOpen && (
            <div className="border-t border-[#eeeeee]">

              <Link
                href="/account/wallet"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  border-b
                  border-[#eeeeee]
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#292929]
                  transition-colors
                  hover:bg-[#fff8f5]
                  hover:text-[#ff542d]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Wallet</span>
                <span className="text-[#ff542d]">›</span>
              </Link>

              <Link
                href="/account/loyalty-points"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  border-b
                  border-[#eeeeee]
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#292929]
                  transition-colors
                  hover:bg-[#fff8f5]
                  hover:text-[#ff542d]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Loyalty Points</span>
                <span className="text-[#ff542d]">›</span>
              </Link>

              <Link
                href="/account/coupons"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  border-b
                  border-[#eeeeee]
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#292929]
                  transition-colors
                  hover:bg-[#fff8f5]
                  hover:text-[#ff542d]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Coupons</span>
                <span className="text-[#ff542d]">›</span>
              </Link>

              <Link
                href="/account/refer-earn"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  border-b
                  border-[#eeeeee]
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#292929]
                  transition-colors
                  hover:bg-[#fff8f5]
                  hover:text-[#ff542d]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Refer &amp; Earn</span>
                <span className="text-[#ff542d]">›</span>
              </Link>

              <Link
                href="/account/favourites"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  border-b
                  border-[#eeeeee]
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#292929]
                  transition-colors
                  hover:bg-[#fff8f5]
                  hover:text-[#ff542d]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Favourites</span>
                <span className="text-[#ff542d]">›</span>
              </Link>

              <Link
                href="/account/notifications"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  border-b
                  border-[#eeeeee]
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#292929]
                  transition-colors
                  hover:bg-[#fff8f5]
                  hover:text-[#ff542d]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Notifications</span>
                <span className="text-[#ff542d]">›</span>
              </Link>

              <Link
                href="/account/help-support"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  border-b
                  border-[#eeeeee]
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#292929]
                  transition-colors
                  hover:bg-[#fff8f5]
                  hover:text-[#ff542d]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Help &amp; Support</span>
                <span className="text-[#ff542d]">›</span>
              </Link>

              <Link
                href="/account/delete-account"
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-between
                  px-5
                  text-[12px]
                  font-semibold
                  text-[#ff542d]
                  transition-colors
                  hover:bg-[#fff8f5]
                  sm:px-6
                  sm:text-[13px]
                "
              >
                <span>Delete account</span>
                <span className="text-[#b8934a]">›</span>
              </Link>

            </div>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="
              inline-flex
              h-[38px]
              items-center
              justify-center
              rounded-full
              bg-[#ff542d]
              px-7
              text-[10px]
              font-bold
              text-white
              transition-all
              hover:bg-[#e94724]
              hover:shadow-md
            "
          >
            Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}