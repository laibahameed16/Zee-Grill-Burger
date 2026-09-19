"use client";

import Navbar from "@/components/home/Navbar";
import Link from "next/link";
import { useState } from "react";
import { addPersistentNotification, showNotification } from "@/lib/notifications";

type Coupon = {
  title: string;
  code: string;
  desc: string;
  exp: string;
};

// Available coupons — always shown, cannot be removed
const availableCoupons: Coupon[] = [
  {
    title: "10% Off",
    code: "SAVE10",
    desc: "10% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
  },
  {
    title: "10% Off",
    code: "ZEEGRILL10",
    desc: "10% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
  },
  {
    title: "10% Off",
    code: "WELCOME10",
    desc: "10% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
  },
];

export default function CouponsPage() {
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const handleAddCoupon = () => {
    const enteredCode = couponCode.trim().toUpperCase();

    if (!enteredCode) {
      setError("Please enter a coupon code");
      return;
    }

    const matchedCoupon = availableCoupons.find(
      (coupon) => coupon.code === enteredCode
    );

    if (!matchedCoupon) {
      setError("Invalid coupon code. Try: SAVE10, ZEEGRILL10, or WELCOME10");
      return;
    }

    setCouponCode("");
    setError("");

    // Toast notification
    showNotification(
      "success",
      `Coupon "${matchedCoupon.code}" saved! Use it at checkout. 🎟️`
    );

    // Persistent notification (shows on notifications page)
    addPersistentNotification(
      `Coupon Noted! 🎟️`,
      `Coupon "${matchedCoupon.code}" — ${matchedCoupon.desc} — noted. Enter the code at checkout to apply it. ${matchedCoupon.exp}.`,
      "coupon"
    );
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showNotification("success", `Coupon code "${code}" copied! 📋`);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      showNotification("error", "Failed to copy code.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
      <Navbar/>

      <div className="mx-auto w-full max-w-[850px] px-5 pb-12 pt-8 sm:px-6 sm:pt-10">
        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">
            ACCOUNT
          </p>

          <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#292929] sm:text-[38px] lg:text-[42px]">
            Coupons
          </h1>

          <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">
            Your available offers &amp; promo codes
          </p>
        </div>

        {/* ADD COUPON */}
        <section className="mb-8 overflow-hidden rounded-[20px] border border-[#eeeeee] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.06)]">
          <div className="bg-gradient-to-r from-[#ff542d] to-[#ff714f] px-5 py-5 text-white sm:px-7 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.59 9.59a2 2 0 0 0 2.83 0l3.34-3.34a2 2 0 0 0 0-2.84Z" />
                  <circle cx="7.5" cy="6.5" r="1" />
                </svg>
              </div>

              <div>
                <p className="text-[15px] font-extrabold sm:text-[17px]">
                  Have a Coupon Code?
                </p>
                <p className="mt-0.5 text-[10px] text-white/80 sm:text-[11px]">
                  Enter your promo code below to verify it
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCoupon();
                  }
                }}
                placeholder="Enter coupon code (e.g. SAVE10)"
                className="h-[46px] min-w-0 flex-1 rounded-full border border-[#dddddd] bg-[#fafafa] px-5 text-[12px] font-semibold uppercase tracking-[1px] text-[#292929] outline-none transition-all placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-[#aaa] focus:border-[#ff542d] focus:bg-white focus:ring-2 focus:ring-[#ff542d]/10"
              />

              <button
                type="button"
                onClick={handleAddCoupon}
                className="h-[46px] rounded-full bg-[#ff542d] px-7 text-[11px] font-bold text-white transition-all duration-200 hover:bg-[#e94724] hover:shadow-md"
              >
                Verify Code
              </button>
            </div>

            {error && (
              <p className="mt-3 text-[10px] font-semibold text-[#d64545] sm:text-[11px]">
                {error}
              </p>
            )}

            <p className="mt-3 text-[9px] text-[#aaa] sm:text-[10px]">
              Use at checkout to apply discount automatically.
            </p>
          </div>
        </section>

        {/* AVAILABLE COUPONS — always shown, cannot be removed */}
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#ff542d]">
              AVAILABLE OFFERS
            </p>
            <p className="mt-1 text-[12px] font-semibold text-[#555]">
              Use these codes at checkout
            </p>
          </div>

          <span className="rounded-full bg-[#fff5f1] px-3 py-1 text-[9px] font-bold text-[#ff542d]">
            {availableCoupons.length} OFFERS
          </span>
        </div>

        <div className="space-y-4">
          {availableCoupons.map((coupon) => (
            <div
              key={coupon.code}
              className="relative overflow-hidden rounded-[20px] border border-[#ffd8ce] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.06)]"
            >
              <div className="flex min-h-[120px] flex-col sm:flex-row">
                {/* LEFT — colored panel */}
                <div className="relative flex w-full shrink-0 flex-col justify-center overflow-hidden border-b border-dashed border-white/25 bg-gradient-to-br from-[#ff542d] to-[#ff714f] px-4 py-3 text-white sm:w-[160px] sm:border-b-0 sm:border-r sm:px-5">
                  {/* decorative */}
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-9 -left-7 h-20 w-20 rounded-full border-[8px] border-white/10" />
                  <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white sm:-right-3" />
                  <div className="absolute -left-3 top-0 h-5 w-5 rounded-full bg-white sm:hidden" />
                  <div className="absolute -left-3 bottom-0 h-5 w-5 rounded-full bg-white sm:hidden" />

                  <div className="relative mb-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    <p className="text-[9px] font-bold uppercase tracking-[1.8px] text-white/80">
                      SPECIAL OFFER
                    </p>
                  </div>

                  <p className="relative mt-1 text-[28px] font-black leading-none sm:text-[32px]">
                    10%
                  </p>

                  <p className="relative mt-1 text-[10px] font-bold uppercase tracking-[2px] text-white/85">
                    OFF
                  </p>

                  <div className="relative mt-2 w-[58px] border-t border-dashed border-white/40" />
                </div>

                {/* RIGHT — details */}
                <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-[16px] font-extrabold text-[#292929] sm:text-[18px]">
                        {coupon.title}
                      </h2>

                      <p className="mt-1 text-[10px] leading-[15px] text-[#777] sm:text-[11px] sm:leading-[16px]">
                        {coupon.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    {/* Code with copy button */}
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-[#ffb6a5] bg-[#fff9f7] px-3 py-2 transition-all hover:border-[#ff542d] hover:bg-[#fff5f1]"
                    >
                      <div>
                        <p className="text-left text-[8px] font-bold uppercase tracking-[1px] text-[#aaa]">
                          Coupon Code
                        </p>
                        <p className="mt-0.5 font-mono text-[12px] font-extrabold tracking-[1px] text-[#ff542d]">
                          {coupon.code}
                        </p>
                      </div>
                      <span className="ml-1 text-[9px] font-bold text-[#ff542d]">
                        {copiedCode === coupon.code ? "✓ Copied!" : "Copy"}
                      </span>
                    </button>

                    <div className="rounded-full bg-[#f7f7f7] px-3 py-2 text-[9px] font-semibold text-[#888]">
                      {coupon.exp}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[9px] font-semibold text-[#ff542d]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#fff5f1]">
                      🎟️
                    </span>
                    Apply at checkout for 10% off
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
