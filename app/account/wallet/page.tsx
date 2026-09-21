"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/home/Navbar";

type ConversionRecord = {
  id: string;
  points: number;
  amount: number;
  date: string;
};

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [history, setHistory] = useState<ConversionRecord[]>([]);

  useEffect(() => {
    const load = () => {
      const bal = Number(
        localStorage.getItem("zee-grill-wallet-balance") || "0"
      );

      setWalletBalance(
        Number.isFinite(bal) ? Math.max(0, bal) : 0
      );

      try {
        const h = JSON.parse(
          localStorage.getItem("zee-grill-lp-history") || "[]"
        ) as ConversionRecord[];

        setHistory(Array.isArray(h) ? h : []);
      } catch {
        setHistory([]);
      }
    };

    load();

    window.addEventListener("wallet-updated", load);
    window.addEventListener("loyalty-points-updated", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("wallet-updated", load);
      window.removeEventListener("loyalty-points-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
      <Navbar />

      <div className="mx-auto w-full max-w-[750px] px-5 pb-12 pt-7 sm:px-8 sm:pt-9 md:px-10 lg:px-0">
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

        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d]">
            ACCOUNT
          </p>

          <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight text-[#292929] sm:text-[32px]">
            Wallet
          </h1>

          <p className="mt-1 text-[12px] text-[#777]">
            Your wallet balance earned through loyalty points
          </p>
        </div>

        {/* =====================================================
            WALLET BALANCE
        ====================================================== */}

        <section className="rounded-[14px] border border-[#eeeeee] bg-gradient-to-br from-[#292929] to-[#444] p-4 text-white shadow-[0_3px_12px_rgba(0,0,0,0.08)] sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[1.5px] text-[#ccc]">
            Available Balance
          </p>

          <p className="mt-1 text-[36px] font-extrabold sm:text-[42px]">
            £{walletBalance.toFixed(2)}
          </p>

          <div className="mt-3 rounded-[10px] bg-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] text-[#ccc]">
                Wallet Balance
              </p>

              <p className="text-[12px] font-bold text-white">
                £{walletBalance.toFixed(2)}
              </p>
            </div>

            <p className="mt-2 text-[9px] text-[#aaa]">
              10 loyalty points = £1 wallet credit
            </p>
          </div>
        </section>

        {/* =====================================================
            WALLET HISTORY
        ====================================================== */}

        <section className="mt-4 overflow-hidden rounded-[14px] border border-[#eeeeee] bg-white shadow-[0_3px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#eeeeee] px-4 py-3 sm:px-5">
            <p className="text-[12px] font-semibold text-[#292929]">
              Wallet History
            </p>

            {history.length > 0 && (
              <p className="text-[10px] text-[#999]">
                {history.length} transaction
                {history.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {history.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff5f1] text-[#d9361e]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="1"
                    y="4"
                    width="22"
                    height="16"
                    rx="2"
                    ry="2"
                  />
                  <line
                    x1="1"
                    y1="10"
                    x2="23"
                    y2="10"
                  />
                </svg>
              </div>

              <p className="mt-3 text-[12px] font-semibold text-[#292929]">
                No transactions yet
              </p>

              <p className="mt-1 text-[10px] text-[#999]">
                Convert your loyalty points to add money to your wallet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eeeeee]">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff5f1] text-[#d9361e]">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v20" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-[#292929]">
                        Loyalty Reward
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#aaa]">
                        {h.date}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-bold text-[#2f9e44]">
                      +£{h.amount.toFixed(2)}
                    </p>

                    <p className="mt-0.5 text-[9px] font-semibold text-[#777]">
                      {h.points} Points
                    </p>
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