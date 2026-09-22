"use client";

import Navbar from "@/components/home/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getFavourites } from "@/lib/favourites";
import { addToCart } from "@/lib/cart";
import { isLoggedIn } from "@/lib/auth";
import { EVENTS } from "@/lib/constants";
import { dispatchCustomEvent } from "@/lib/utils";

type MenuItem = {
  name: string;
  description: string;
  price: string;
  badge: "POPULAR" | "RECOMMENDED";
  image: string;
};

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<MenuItem[]>([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const loadFavourites = () => {
      setFavourites(getFavourites());
    };

    loadFavourites();

    const handleFavouritesUpdate = () => {
      loadFavourites();
    };

    window.addEventListener(EVENTS.FAVOURITES_UPDATED, handleFavouritesUpdate);

    return () => {
      window.removeEventListener(EVENTS.FAVOURITES_UPDATED, handleFavouritesUpdate);
    };
  }, []);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message;

      if (!message) return;

      setNotification(message);

      window.setTimeout(() => {
        setNotification("");
      }, 2200);
    };

    window.addEventListener(EVENTS.SITE_NOTIFICATION, handleNotification);

    return () => {
      window.removeEventListener(EVENTS.SITE_NOTIFICATION, handleNotification);
    };
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    if (!isLoggedIn()) {
      dispatchCustomEvent(EVENTS.OPEN_LOGIN);
      return;
    }

    addToCart(item);

    dispatchCustomEvent(EVENTS.SITE_NOTIFICATION, {
      message: "Item added to cart",
    });
  };

  return (
    <main className="relative min-h-screen bg-[#f7f6f5] text-[#292929]">
      {notification && (
        <div className="pointer-events-none fixed left-1/2 top-5 z-[10000] -translate-x-1/2 rounded-full bg-[#292929] px-5 py-3 text-[11px] font-semibold text-white shadow-lg sm:text-[12px]">
          {notification}
        </div>
      )}

      <Navbar/>

      <div className="mx-auto w-full max-w-[850px] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 md:px-10 lg:px-0">
        {/* BACK BUTTON */}
        <Link
          href="/account"
          className="
            mb-6
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
          <span>Back to Account</span>
        </Link>

        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">
            ACCOUNT
          </p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#292929] sm:text-[38px] lg:text-[42px]">
            Favourites
          </h1>
          <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">
            Your saved favorite items
          </p>
        </div>

        <section className="overflow-hidden rounded-[18px] border border-[#eeeeee] bg-white shadow-[0_3px_15px_rgba(0,0,0,0.05)]">
          {favourites.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff5f1] text-[#ff542d] sm:h-24 sm:w-24">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className="mt-5 text-[15px] font-bold text-[#292929] sm:text-[17px]">
                No favorites yet
              </p>
              <p className="mt-2 text-[12px] text-[#999] sm:text-[13px]">
                Tap the heart icon on any menu item to save it here
              </p>
              <Link
                href="/#menu"
                className="mt-6 inline-flex h-[40px] items-center justify-center rounded-full bg-[#ff542d] px-8 text-[11px] font-bold text-white transition-all hover:bg-[#e94724] hover:shadow-md sm:text-[12px]"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {favourites.map((item) => (
                <div
                  key={item.name}
                  className="overflow-hidden rounded-[14px] border border-[#eeeeee] bg-white shadow-[0_3px_12px_rgba(0,0,0,0.04)]"
                >
                  <div className="relative h-[180px] w-full overflow-hidden bg-[#e3e3e3]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute right-3 top-3 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white text-[18px] text-[#ff542d] shadow-md">
                      ♥
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 truncate text-[14px] font-bold text-[#292929] sm:text-[15px]">
                        {item.name}
                      </h3>
                      <span className="shrink-0 text-[11px] font-bold text-[#ff542d] sm:text-[12px]">
                        {item.price}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-2 text-[9px] leading-[13px] text-[#777] sm:text-[10px] sm:leading-[14px]">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="mt-4 h-[40px] w-full rounded-full bg-[#ff542d] text-[10px] font-semibold text-white transition-all duration-200 hover:bg-[#e94724] hover:shadow-md sm:text-[11px]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
