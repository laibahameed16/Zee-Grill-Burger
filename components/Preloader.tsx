"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#292929]">
      <div className="flex flex-col items-center">
        {/* LOGO */}
        <img
          src="/images/navbarimages/logo.png"
          alt="Porto Piri Piri"
          className="w-[80px] object-contain sm:w-[90px]"
        />

        {/* CIRCULAR DOT LOADER */}
        <div className="relative mt-6 h-[45px] w-[45px] animate-spin">
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = index * 45;

            return (
              <span
                key={index}
                className="absolute left-1/2 top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                style={{
                  transform: `rotate(${angle}deg) translateY(-18px)`,
                  transformOrigin: "center",
                  opacity: 1 - index * 0.09,
                }}
              />
            );
          })}
        </div>

        {/* LOADING TEXT */}
        <p className="mt-4 text-[9px] font-semibold uppercase tracking-[3px] text-[#777]">
          Loading
        </p>
      </div>
    </div>
  );
}