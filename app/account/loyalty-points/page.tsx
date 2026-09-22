"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import { useEffect, useState } from "react";
import {
  getLoyaltyPoints,
  setLoyaltyPoints,
  getConversionHistory,
  saveConversionHistory,
  getWalletReadyAmount,
  getPointsAvailableForWallet,
  getPointsToNextPound,
} from "@/lib/loyalty";
import { POINTS_PER_POUND, DUMMY_SEED_POINTS, EVENTS } from "@/lib/constants";
import { isLoggedIn } from "@/lib/auth";
import { addToWallet, getWalletBalance } from "@/lib/wallet";
import { addPersistentNotification, showNotification } from "@/lib/notifications";

type ConversionRecord = {
  id: string;
  points: number;
  amount: number;
  date: string;
};

export default function LoyaltyPointsPage() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const load = () => {
      setPoints(getLoyaltyPoints());
      setHistory(getConversionHistory());
    };

    load();

    window.addEventListener(EVENTS.LOYALTY_POINTS_UPDATED, load);
    window.addEventListener(EVENTS.WALLET_UPDATED, load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener(EVENTS.LOYALTY_POINTS_UPDATED, load);
      window.removeEventListener(EVENTS.WALLET_UPDATED, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const pointsToNextPound = getPointsToNextPound();

  const pointsAvailableForWallet = getPointsAvailableForWallet();

  const walletReadyAmount = getWalletReadyAmount();

  // =========================================================
  // MANUAL CONVERT
  // =========================================================
  const [manualPointsToConvert, setManualPointsToConvert] = useState<number | "">("");

  const handleConvert = () => {
    if (isConverting) return;

    const currentPoints = getLoyaltyPoints();

    let pointsToConvert = 0;
    
    if (manualPointsToConvert !== "") {
      pointsToConvert = Number(manualPointsToConvert);
      if (pointsToConvert <= 0) {
        showNotification("error", "Please enter a valid amount of points greater than 0.");
        return;
      }
      if (pointsToConvert > currentPoints) {
        showNotification("error", "You do not have enough Loyalty Points.");
        return;
      }
    } else {
      pointsToConvert = getPointsAvailableForWallet();
      if (pointsToConvert <= 0) {
        showNotification("error", "You need at least 10 Loyalty Points to convert automatically.");
        return;
      }
    }

    setIsConverting(true);

    const walletCredit = pointsToConvert / POINTS_PER_POUND;
    const remainingPoints = currentPoints - pointsToConvert;

    // UPDATE LOYALTY POINTS
    setLoyaltyPoints(remainingPoints);

    // UPDATE WALLET
    addToWallet(walletCredit);
    const updatedWallet = getWalletBalance();

    // UPDATE CONVERSION HISTORY
    const existingHistory = getConversionHistory();

    const newRecord: ConversionRecord = {
      id: `lp-${Date.now()}`,
      points: pointsToConvert,
      amount: walletCredit,
      date: new Date().toLocaleString("en-GB"),
    };

    const updatedHistory = [newRecord, ...existingHistory];
    saveConversionHistory(updatedHistory);

    // UPDATE UI
    setPoints(remainingPoints);
    setHistory(updatedHistory);
    setManualPointsToConvert("");

    // TOAST NOTIFICATION
    showNotification(
      "success",
      `${pointsToConvert} Loyalty Points converted to £${walletCredit.toFixed(2)} wallet credit! 💰`
    );

    // PERSISTENT NOTIFICATION (shows in Notifications page)
    addPersistentNotification(
      "Wallet Credit Added 💰",
      `You converted ${pointsToConvert} Loyalty Points into £${walletCredit.toFixed(2)} wallet credit. Your new wallet balance is £${updatedWallet.toFixed(2)}.`,
      "wallet"
    );

    setTimeout(() => {
      setIsConverting(false);
    }, 400);
  };

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
            Loyalty Points
          </h1>

          <p className="mt-1 text-[12px] text-[#777]">
            Earn 10 points on every eligible £50+ order
          </p>
        </div>

        {/* =====================================================
            POINTS CARD
        ====================================================== */}

        <section className="rounded-[14px] border border-[#eeeeee] bg-gradient-to-br from-[#ff542d] to-[#ff7a55] p-4 text-white shadow-[0_3px_12px_rgba(0,0,0,0.08)] sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[1.5px] text-white/80">
            Your Points
          </p>

          <p className="mt-1 text-[36px] font-extrabold sm:text-[42px]">
            {points}
          </p>

          <p className="mt-1 text-[10px] text-white/80">
            10 points = £1 wallet credit
          </p>

          <div className="mt-4 rounded-[10px] bg-white/15 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold">
                Wallet Credit Available
              </p>

              <p className="text-[12px] font-bold">
                £{walletReadyAmount.toFixed(2)}
              </p>
            </div>

            <p className="mt-1.5 text-[9px] text-white/80">
              {pointsAvailableForWallet} points are ready to convert.
            </p>

            {pointsToNextPound > 0 && (
              <p className="mt-1 text-[9px] text-white/80">
                {POINTS_PER_POUND - pointsToNextPound} more points needed
                for the next £1.
              </p>
            )}

            {/* =================================================
                CONVERTER
            ================================================== */}
            <div className="mt-3">
              <input
                type="number"
                value={manualPointsToConvert}
                onChange={(e) => setManualPointsToConvert(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Enter points manually (e.g. 50)"
                className="w-full rounded-[9px] bg-white/20 px-3 py-2 text-[12px] font-medium text-white placeholder:text-white/70 outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <button
              type="button"
              onClick={handleConvert}
              disabled={(pointsAvailableForWallet === 0 && manualPointsToConvert === "") || isConverting}
              className="
                mt-2
                w-full
                rounded-[9px]
                bg-white
                px-4
                py-2.5
                text-[10px]
                font-extrabold
                text-[#ff542d]
                transition-all
                duration-200
                hover:bg-[#fff5f1]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isConverting
                ? "Converting..."
                : manualPointsToConvert !== "" && Number(manualPointsToConvert) > 0
                  ? `Convert ${manualPointsToConvert} Points → £${(Number(manualPointsToConvert) / POINTS_PER_POUND).toFixed(2)}`
                  : pointsAvailableForWallet > 0
                    ? `Convert All ${pointsAvailableForWallet} Points → £${walletReadyAmount.toFixed(2)}`
                    : "Convert Points"}
            </button>
          </div>
        </section>

        {/* =====================================================
            HOW LOYALTY WORKS
        ====================================================== */}

        <section className="mt-4 rounded-[14px] border border-[#eeeeee] bg-white p-4 shadow-[0_3px_10px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="text-[13px] font-bold text-[#292929]">
            How Loyalty Works
          </p>

          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#777]">
                Eligible order
              </span>

              <span className="text-[11px] font-bold text-[#292929]">
                £50+
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#777]">
                Points earned
              </span>

              <span className="text-[11px] font-bold text-[#ff542d]">
                +10 points
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#777]">
                Manual conversion
              </span>

              <span className="text-[11px] font-bold text-[#2f9e44]">
                10 points = £1
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONVERSION HISTORY
        ====================================================== */}

        <section className="mt-4 overflow-hidden rounded-[14px] border border-[#eeeeee] bg-white shadow-[0_3px_10px_rgba(0,0,0,0.04)]">
          <div className="border-b border-[#eeeeee] px-4 py-3 sm:px-5">
            <p className="text-[12px] font-semibold text-[#292929]">
              Conversion History
            </p>
          </div>

          {history.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[11px] text-[#aaa]">
                No loyalty conversions yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eeeeee]">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-4 py-3 sm:px-5"
                >
                  <div>
                    <p className="text-[11px] font-semibold text-[#292929]">
                      {h.points} points converted
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#aaa]">
                      {h.date}
                    </p>
                  </div>

                  <p className="text-[12px] font-bold text-[#2f9e44]">
                    +£{h.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}