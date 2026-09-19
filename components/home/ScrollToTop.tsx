"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="
        fixed
        bottom-5
        right-5
        z-[100]
        flex
        h-[42px]
        w-[42px]
        items-center
        justify-center
        rounded-full
        bg-[#ff542d]
        shadow-lg
        transition-transform
        duration-200
        hover:scale-105
        sm:bottom-6
        sm:right-6
        sm:h-[44px]
        sm:w-[44px]
      "
    >
      <img
        src="/images/scrolltotop/scrolltotop.png"
        alt="Scroll to top"
        className="h-[18px] w-[18px] object-contain"
      />
    </button>
  );
}