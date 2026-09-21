"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getUnreadNotificationCount } from "@/lib/notifications";

type ActiveSection =
  | "home"
  | "our-story"
  | "menu"
  | "contact"
  | "footer";

type Location = "Glasgow" | "City Centre" | "Scotland";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [activeSection, setActiveSection] =
    useState<ActiveSection>("home");

  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState("");
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Selected location
  const [selectedLocation, setSelectedLocation] =
    useState<Location>("Glasgow");

  // ---------------------------------------------------------
  // USER
  // ---------------------------------------------------------

  useEffect(() => {
    const updateUser = () => {
      const savedUser = localStorage.getItem("loggedInUser");

      if (savedUser) {
        setUserName(savedUser);
      } else {
        setUserName("");
      }

      try {
        const raw = localStorage.getItem("zee-grill-user");

        if (raw) {
          const parsed = JSON.parse(raw);
          setProfilePic(parsed.profilePic || "");
        } else {
          setProfilePic("");
        }
      } catch {
        setProfilePic("");
      }
    };

    updateUser();

    window.addEventListener("auth-changed", updateUser);
    window.addEventListener("user-logged-in", updateUser);
    window.addEventListener("user-logged-out", updateUser);
    window.addEventListener("profile-updated", updateUser);

    return () => {
      window.removeEventListener("auth-changed", updateUser);
      window.removeEventListener("user-logged-in", updateUser);
      window.removeEventListener("user-logged-out", updateUser);
      window.removeEventListener("profile-updated", updateUser);
    };
  }, []);

  // ---------------------------------------------------------
  // CART
  // ---------------------------------------------------------

  useEffect(() => {
    const updateCartCount = () => {
      const savedUser = localStorage.getItem("loggedInUser");

      if (!savedUser) {
        setCartCount(0);
        return;
      }

      try {
        const savedCart = JSON.parse(
          localStorage.getItem("zee-grill-cart") || "[]"
        ) as Array<{ quantity?: number }>;

        const total = savedCart.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        );

        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    const handleNotification = (event: Event) => {
      const customEvent =
        event as CustomEvent<{ message?: string }>;

      const message = customEvent.detail?.message;

      if (!message) return;

      setNotification(message);

      window.setTimeout(() => {
        setNotification("");
      }, 2200);
    };

    const updateUnreadCount = () => {
      setUnreadNotifCount(getUnreadNotificationCount());
    };

    updateCartCount();
    updateUnreadCount();

    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("auth-changed", updateCartCount);
    window.addEventListener("user-logged-in", updateCartCount);
    window.addEventListener("user-logged-out", updateCartCount);
    window.addEventListener(
      "site-notification",
      handleNotification
    );
    window.addEventListener(
      "notifications-updated",
      updateUnreadCount
    );
    window.addEventListener("storage", updateUnreadCount);

    return () => {
      window.removeEventListener(
        "cart-updated",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );

      window.removeEventListener(
        "auth-changed",
        updateCartCount
      );

      window.removeEventListener(
        "user-logged-in",
        updateCartCount
      );

      window.removeEventListener(
        "user-logged-out",
        updateCartCount
      );

      window.removeEventListener(
        "site-notification",
        handleNotification
      );

      window.removeEventListener(
        "notifications-updated",
        updateUnreadCount
      );
    };
  }, []);

  // ---------------------------------------------------------
  // SCROLL / ACTIVE SECTION
  // ---------------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const screenPosition = scrollY + 180;

      const home = document.getElementById("home");
      const menu = document.getElementById("menu");
      const ourStory = document.getElementById("our-story");
      const contact = document.getElementById("contact");
      const footer = document.getElementById("footer");

      if (!home || !menu || !ourStory || !footer) return;

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80
      ) {
        setActiveSection("footer");
        return;
      }

      if (screenPosition >= footer.offsetTop) {
        setActiveSection("footer");
        return;
      }

      if (contact && screenPosition >= contact.offsetTop) {
        setActiveSection("contact");
        return;
      }

      if (screenPosition >= ourStory.offsetTop) {
        setActiveSection("our-story");
        return;
      }

      if (screenPosition >= menu.offsetTop) {
        setActiveSection("menu");
        return;
      }

      setActiveSection("home");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ---------------------------------------------------------
  // FUNCTIONS
  // ---------------------------------------------------------

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.location.href = `/#${id}`;
    }

    closeMenu();
  };

  const openLogin = () => {
    window.dispatchEvent(new Event("open-login"));
    closeMenu();
  };

  const openCart = () => {
    window.dispatchEvent(new Event("open-cart"));
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("zee-grill-user");

    setUserName("");

    window.dispatchEvent(new Event("auth-changed"));
    window.dispatchEvent(new Event("user-logged-out"));

    closeMenu();
  };

  // ---------------------------------------------------------
  // LOCATION SELECT
  // ---------------------------------------------------------

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);

    localStorage.setItem("selectedLocation", location);

    closeMenu();

    window.dispatchEvent(
      new CustomEvent("site-notification", {
        detail: {
          message: `${location} selected`,
        },
      })
    );
  };

  // Load saved location
  useEffect(() => {
    const savedLocation =
      localStorage.getItem("selectedLocation");

    if (
      savedLocation === "Glasgow" ||
      savedLocation === "City Centre" ||
      savedLocation === "Scotland"
    ) {
      setSelectedLocation(savedLocation);
    }
  }, []);

  // ---------------------------------------------------------
  // NAV LINK CLASS
  // ---------------------------------------------------------

  const navLinkClass = (section: ActiveSection) => `
    group
    relative
    whitespace-nowrap
    text-[12px]
    font-normal
    transition-colors
    duration-200
    xl:text-[13px]
    ${
      activeSection === section
        ? "text-black"
        : "text-black hover:text-[#ff542d]"
    }
  `;

  const userInitial =
    userName.trim().charAt(0).toUpperCase() || "A";

  // ---------------------------------------------------------
  // LOCATION OPTIONS
  // ---------------------------------------------------------

  const locations: Location[] = [
    "Glasgow",
    "City Centre",
    "Scotland",
  ];

  // ---------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------

  return (
    <>
      {/* NOTIFICATION */}

      {notification && (
        <div
          className="
            pointer-events-none
            fixed
            left-1/2
            top-5
            z-[10000]
            -translate-x-1/2
            rounded-full
            bg-[#292929]
            px-5
            py-3
            text-[11px]
            font-semibold
            text-white
            shadow-lg
            sm:text-[12px]
          "
        >
          {notification}
        </div>
      )}

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className="
          relative
          z-50
          h-[72px]
          w-full
          overflow-visible
          bg-[#eae8e8]
          text-black
          shadow-md
        "
      >
        <div
          className="
            mx-auto
            relative
            flex
            h-full
            w-full
            max-w-[1150px]
            items-center
            px-5
            sm:px-8
            md:px-10
            lg:px-0
          "
        >
          {/* =================================================
              LOGO
          ================================================== */}

          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className="
              absolute
              left-5
              top-1/2
              flex
              h-[38px]
              w-auto
              -translate-y-1/2
              items-center
              sm:left-8
              sm:h-[42px]
              md:left-10
              lg:left-0
              lg:h-[46px]
            "
          >
            <img
              src="/images/navbarimages/logo.png"
              alt="Porto Piri Piri"
              className="
                h-full
                w-auto
                object-contain
              "
            />
          </button>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              hidden
              -translate-x-1/2
              -translate-y-1/2
              items-center
              gap-7
              lg:flex
            "
          >
            {/* HOME */}

            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className={navLinkClass("home")}
            >
              Home

              <span
                className={`
                  absolute
                  -bottom-[6px]
                  left-0
                  h-[3px]
                  bg-[#ff542d]
                  transition-all
                  duration-300
                  ease-out
                  ${
                    activeSection === "home"
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  }
                `}
              />
            </button>

            {/* MENU */}

            <button
              type="button"
              onClick={() => scrollToSection("menu")}
              className={navLinkClass("menu")}
            >
              Menu

              <span
                className={`
                  absolute
                  -bottom-[6px]
                  left-0
                  h-[3px]
                  bg-[#ff542d]
                  transition-all
                  duration-300
                  ease-out
                  ${
                    activeSection === "menu"
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  }
                `}
              />
            </button>

            {/* OUR STORY */}

            <button
              type="button"
              onClick={() =>
                scrollToSection("our-story")
              }
              className={navLinkClass("our-story")}
            >
              Our story

              <span
                className={`
                  absolute
                  -bottom-[6px]
                  left-0
                  h-[3px]
                  bg-[#ff542d]
                  transition-all
                  duration-300
                  ease-out
                  ${
                    activeSection === "our-story"
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  }
                `}
              />
            </button>

            {/* CONTACT */}

            <button
              type="button"
              onClick={() =>
                scrollToSection("contact")
              }
              className={navLinkClass("contact")}
            >
              Contact

              <span
                className={`
                  absolute
                  -bottom-[6px]
                  left-0
                  h-[3px]
                  bg-[#ff542d]
                  transition-all
                  duration-300
                  ease-out
                  ${
                    activeSection === "contact"
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  }
                `}
              />
            </button>
          </div>

          {/* =================================================
              DESKTOP RIGHT SIDE
          ================================================== */}

          <div
            className="
              ml-auto
              hidden
              items-center
              gap-2
              lg:flex
            "
          >
            {/* =================================================
                LOCATION DROPDOWN
            ================================================== */}

            <div className="group relative">
              <button
                type="button"
                className="
                  flex
                  h-[34px]
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#555]
                  px-4
                  text-[12px]
                  text-black
                  transition-all
                  duration-200
                  hover:border-[#ff542d]
                  hover:text-[#ff542d]
                  xl:text-[11px]
                "
              >
                <span>{selectedLocation}</span>

                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  className="
                    text-black
                    transition-all
                    duration-200
                    group-hover:text-[#ff542d]
                    group-hover:rotate-180
                  "
                />
              </button>

              {/* LOCATION DROPDOWN */}

              <div
                className="
                  invisible
                  absolute
                  right-0
                  top-full
                  z-[100]
                  w-[170px]
                  translate-y-[-5px]
                  pt-3
                  opacity-0
                  transition-all
                  duration-200
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <div
                  className="
                    overflow-hidden
                    rounded-[14px]
                    border
                    border-[#eeeeee]
                    bg-white
                    shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                  "
                >
                  {locations.map((location, index) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() =>
                        handleLocationSelect(location)
                      }
                      className={`
                        block
                        w-full
                        px-4
                        py-3
                        text-left
                        text-[12px]
                        font-medium
                        transition-colors
                        duration-150
                        hover:bg-[#fff5f1]
                        hover:text-[#ff542d]
                        ${
                          index !== 0
                            ? "border-t border-[#eeeeee]"
                            : ""
                        }
                        ${
                          selectedLocation === location
                            ? "bg-[#fff5f1] text-[#ff542d]"
                            : "text-black"
                        }
                      `}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* =================================================
                USER
            ================================================== */}

            {userName ? (
              <div className="group relative">
                <button
                  type="button"
                  className="
                    flex
                    h-[34px]
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#555]
                    pr-3
                    pl-1.5
                    text-[10px]
                    font-medium
                    text-black
                    transition-all
                    duration-200
                    hover:border-[#ff542d]
                    hover:bg-[#ff542d]
                    hover:text-white
                    xl:text-[11px]
                  "
                >
                  <span
                    className="
                      flex
                      h-[26px]
                      w-[26px]
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      bg-[#ff542d]
                      text-[10px]
                      font-bold
                      text-white
                    "
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt={userName}
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      userInitial
                    )}
                  </span>

                  <span
                    className="
                      text-[8px]
                      text-[#555]
                      transition-transform
                      duration-200
                      group-hover:rotate-180
                    "
                  >
                    ▼
                  </span>
                </button>

                {/* USER DROPDOWN */}

                <div
                  className="
                    invisible
                    absolute
                    right-0
                    top-full
                    z-[100]
                    w-[195px]
                    translate-y-[-5px]
                    pt-3
                    opacity-0
                    transition-all
                    duration-200
                    group-hover:visible
                    group-hover:translate-y-0
                    group-hover:opacity-100
                  "
                >
                  <div
                    className="
                      overflow-hidden
                      rounded-[14px]
                      border
                      border-[#eeeeee]
                      bg-white
                      shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                    "
                  >
                    {/* USER HEADER */}

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        pb-3
                        pt-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-[34px]
                          w-[34px]
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-full
                          bg-[#ff542d]
                          text-[12px]
                          font-bold
                          text-white
                        "
                      >
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={userName}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          userInitial
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px]
                            font-medium
                            uppercase
                            tracking-[1px]
                            text-[#999]
                          "
                        >
                          ACCOUNT
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-[12px]
                            font-bold
                            text-[#292929]
                          "
                        >
                          {userName}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#eeeeee]" />

                    {/* PROFILE */}

                    <Link
                      href="/account/profile"
                      className="
                        block
                        w-full
                        px-4
                        py-[11px]
                        text-[12px]
                        font-medium
                        text-[#444]
                        transition-colors
                        duration-150
                        hover:bg-[#fff5f1]
                        hover:text-[#ff542d]
                      "
                    >
                      My Profile
                    </Link>

                    {/* ORDERS */}

                    <Link
                      href="/my-orders"
                      className="
                        block
                        w-full
                        border-t
                        border-[#eeeeee]
                        px-4
                        py-[11px]
                        text-[12px]
                        font-medium
                        text-[#444]
                        transition-colors
                        duration-150
                        hover:bg-[#fff5f1]
                        hover:text-[#ff542d]
                      "
                    >
                      My Orders
                    </Link>

                    {/* NOTIFICATIONS */}

                    <Link
                      href="/account/notifications"
                      className="
                        relative
                        flex
                        items-center
                        justify-between
                        w-full
                        border-t
                        border-[#eeeeee]
                        px-4
                        py-[11px]
                        text-[12px]
                        font-medium
                        text-[#444]
                        transition-colors
                        duration-150
                        hover:bg-[#fff5f1]
                        hover:text-[#ff542d]
                      "
                    >
                      <span>Notifications</span>

                      {unreadNotifCount > 0 && (
                        <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#ff542d] px-1 text-[8px] font-extrabold text-white">
                          {unreadNotifCount > 99
                            ? "99+"
                            : unreadNotifCount}
                        </span>
                      )}
                    </Link>

                    {/* ACCOUNT SETTINGS */}

                    <Link
                      href="/account"
                      className="
                        block
                        w-full
                        border-t
                        border-[#eeeeee]
                        px-4
                        py-[11px]
                        text-[12px]
                        font-medium
                        text-[#444]
                        transition-colors
                        duration-150
                        hover:bg-[#fff5f1]
                        hover:text-[#ff542d]
                      "
                    >
                      Account Setting
                    </Link>

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        block
                        w-full
                        border-t
                        border-[#eeeeee]
                        px-4
                        py-[11px]
                        text-left
                        text-[12px]
                        font-semibold
                        text-[#ff542d]
                        transition-colors
                        duration-150
                        hover:bg-[#fff4f0]
                      "
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="
                  h-[34px]
                  rounded-full
                  border
                  border-[#555]
                  px-4
                  text-[10px]
                  text-black
                  transition-all
                  duration-200
                  hover:border-[#ff542d]
                  hover:bg-[#ff542d]
                  hover:text-white
                  xl:text-[11px]
                "
              >
                Sign In
              </button>
            )}

            {/* CART */}

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={openCart}
              className="
                relative
                flex
                h-[31px]
                w-[31px]
                items-center
                justify-center
                rounded-full
                bg-[#ff542d]
                transition-transform
                duration-200
                hover:scale-105
                active:scale-95
              "
            >
              <img
                src="/images/navbarimages/bag.png"
                alt=""
                aria-hidden="true"
                className="
                  h-[17px]
                  w-[17px]
                  object-contain
                "
              />

              {userName && cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    min-h-[16px]
                    min-w-[16px]
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    px-1
                    text-[8px]
                    font-extrabold
                    leading-none
                    text-[#ff542d]
                    shadow-sm
                  "
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>

          {/* =================================================
              MOBILE CART ICON + HAMBURGER (in navbar header)
          ================================================== */}

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            {/* MOBILE CART */}

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={openCart}
              className="
                relative
                flex
                h-[35px]
                w-[35px]
                items-center
                justify-center
                rounded-full
                bg-[#ff542d]
                transition-transform
                duration-200
                hover:scale-105
                active:scale-95
              "
            >
              <img
                src="/images/navbarimages/bag.png"
                alt=""
                aria-hidden="true"
                className="
                  h-[17px]
                  w-[17px]
                  object-contain
                "
              />

              {userName && cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    min-h-[16px]
                    min-w-[16px]
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    px-1
                    text-[8px]
                    font-extrabold
                    leading-none
                    text-[#ff542d]
                    shadow-sm
                  "
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* HAMBURGER */}

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="
                flex
                h-[35px]
                w-[38px]
                flex-col
                items-center
                justify-center
                gap-[5px]
                rounded-md
                border
                border-[#555]
              "
            >
              <span className="h-[2px] w-[19px] bg-black" />
              <span className="h-[2px] w-[19px] bg-black" />
              <span className="h-[2px] w-[19px] bg-black" />
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        {menuOpen && (
          <div
            className="
              absolute
              left-0
              top-[72px]
              z-[100]
              w-full
              border-t
              border-[#ddd]
              bg-[#eae8e8]
              px-5
              py-3
              shadow-xl
              lg:hidden
            "
          >
            <div className="flex flex-col">

              {/* HOME */}

              <button
                type="button"
                onClick={() =>
                  scrollToSection("home")
                }
                className={`
                  border-b
                  border-[#d5d5d5]
                  py-4
                  text-left
                  text-[14px]
                  transition-colors
                  duration-200
                  hover:text-[#ff542d]
                  ${
                    activeSection === "home"
                      ? "font-semibold text-black"
                      : "text-black"
                  }
                `}
              >
                Home
              </button>

              {/* MENU */}

              <button
                type="button"
                onClick={() =>
                  scrollToSection("menu")
                }
                className={`
                  border-b
                  border-[#d5d5d5]
                  py-4
                  text-left
                  text-[14px]
                  transition-colors
                  duration-200
                  hover:text-[#ff542d]
                  ${
                    activeSection === "menu"
                      ? "font-semibold text-black"
                      : "text-black"
                  }
                `}
              >
                MENU
              </button>

              {/* OUR STORY */}

              <button
                type="button"
                onClick={() =>
                  scrollToSection("our-story")
                }
                className={`
                  border-b
                  border-[#d5d5d5]
                  py-4
                  text-left
                  text-[14px]
                  transition-colors
                  duration-200
                  hover:text-[#ff542d]
                  ${
                    activeSection === "our-story"
                      ? "font-semibold text-black"
                      : "text-black"
                  }
                `}
              >
                Our story
              </button>

              {/* CONTACT */}

              <button
                type="button"
                onClick={() =>
                  scrollToSection("contact")
                }
                className={`
                  border-b
                  border-[#d5d5d5]
                  py-4
                  text-left
                  text-[14px]
                  transition-colors
                  duration-200
                  hover:text-[#ff542d]
                  ${
                    activeSection === "contact"
                      ? "font-semibold text-black"
                      : "text-black"
                  }
                `}
              >
                Contact
              </button>

              {/* =================================================
                  MOBILE LOCATION
              ================================================== */}

              <div className="mt-4">
                <p
                  className="
                    mb-2
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[1px]
                    text-[#777]
                  "
                >
                  Location
                </p>

                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() =>
                        handleLocationSelect(location)
                      }
                      className={`
                        flex
                        h-[33px]
                        items-center
                        gap-1
                        rounded-full
                        border
                        px-3
                        text-[9px]
                        transition-colors
                        duration-200
                        ${
                          selectedLocation === location
                            ? "border-[#ff542d] bg-[#fff5f1] text-[#ff542d]"
                            : "border-[#555] text-black hover:border-[#ff542d] hover:text-[#ff542d]"
                        }
                      `}
                    >
                      {location}

                      {selectedLocation === location && (
                        <span className="text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* =================================================
                  MOBILE ACCOUNT
              ================================================== */}

              {userName ? (
                <div
                  className="
                    mt-4
                    rounded-[12px]
                    border
                    border-[#d5d5d5]
                    bg-white
                  "
                >
                  {/* ACCOUNT HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-[34px]
                        w-[34px]
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        bg-[#ff542d]
                        text-[12px]
                        font-bold
                        text-white
                      "
                    >
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={userName}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        userInitial
                      )}
                    </div>

                    <div>
                      <p
                        className="
                          text-[8px]
                          uppercase
                          tracking-[1px]
                          text-[#999]
                        "
                      >
                        ACCOUNT
                      </p>

                      <p
                        className="
                          text-[11px]
                          font-semibold
                          text-black
                        "
                      >
                        {userName}
                      </p>
                    </div>
                  </div>

                  {/* MY PROFILE */}

                  <Link
                    href="/account/profile"
                    onClick={closeMenu}
                    className="
                      block
                      border-t
                      border-[#eeeeee]
                      px-4
                      py-3
                      text-[10px]
                      text-[#444]
                      transition-colors
                      duration-150
                      hover:bg-[#fff5f1]
                      hover:text-[#ff542d]
                    "
                  >
                    My Profile
                  </Link>

                  {/* MY ORDERS */}

                  <Link
                    href="/my-orders"
                    onClick={closeMenu}
                    className="
                      block
                      border-t
                      border-[#eeeeee]
                      px-4
                      py-3
                      text-[10px]
                      text-[#444]
                      transition-colors
                      duration-150
                      hover:bg-[#fff5f1]
                      hover:text-[#ff542d]
                    "
                  >
                    My Orders
                  </Link>

                  {/* NOTIFICATIONS */}

                  <Link
                    href="/account/notifications"
                    onClick={closeMenu}
                    className="
                      flex
                      items-center
                      justify-between
                      border-t
                      border-[#eeeeee]
                      px-4
                      py-3
                      text-[10px]
                      text-[#444]
                      transition-colors
                      duration-150
                      hover:bg-[#fff5f1]
                      hover:text-[#ff542d]
                    "
                  >
                    <span>Notifications</span>

                    {unreadNotifCount > 0 && (
                      <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#ff542d] px-1 text-[8px] font-extrabold text-white">
                        {unreadNotifCount > 99
                          ? "99+"
                          : unreadNotifCount}
                      </span>
                    )}
                  </Link>

                  {/* ACCOUNT SETTINGS */}

                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className="
                      block
                      border-t
                      border-[#eeeeee]
                      px-4
                      py-3
                      text-[10px]
                      text-[#444]
                      transition-colors
                      duration-150
                      hover:bg-[#fff5f1]
                      hover:text-[#ff542d]
                    "
                  >
                    Account Setting
                  </Link>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      block
                      w-full
                      border-t
                      border-[#eeeeee]
                      px-4
                      py-3
                      text-left
                      text-[10px]
                      font-semibold
                      text-[#ff542d]
                      hover:bg-[#fff4f0]
                    "
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="
                    mt-4
                    h-[38px]
                    rounded-full
                    border
                    border-[#555]
                    text-[10px]
                    text-black
                    transition-colors
                    duration-200
                    hover:border-[#ff542d]
                    hover:bg-[#ff542d]
                    hover:text-white
                  "
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}