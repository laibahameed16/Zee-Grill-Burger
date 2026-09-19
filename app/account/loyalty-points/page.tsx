"use client";

import Navbar from "@/components/home/Navbar";
import { useEffect, useState } from "react";
import { addPersistentNotification, showNotification } from "@/lib/notifications";

const POINTS_PER_POUND = 10;
const DUMMY_SEED_POINTS = 500;

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
      // Seed 500 dummy points if nothing stored yet
      const raw = localStorage.getItem("zee-grill-loyalty-points");
      if (raw === null) {
        localStorage.setItem("zee-grill-loyalty-points", String(DUMMY_SEED_POINTS));
        setPoints(DUMMY_SEED_POINTS);
      } else {
        const existing = Number(raw || "0");
        setPoints(Number.isFinite(existing) && existing >= 0 ? existing : 0);
      }

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

    window.addEventListener("loyalty-points-updated", load);
    window.addEventListener("wallet-updated", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("loyalty-points-updated", load);
      window.removeEventListener("wallet-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const pointsToNextPound = points % POINTS_PER_POUND;

  const pointsAvailableForWallet =
    Math.floor(points / POINTS_PER_POUND) * POINTS_PER_POUND;

  const walletReadyAmount = Math.floor(points / POINTS_PER_POUND);

  // =========================================================
  // MANUAL CONVERT
  // =========================================================
  const [manualPointsToConvert, setManualPointsToConvert] = useState<number | "">("");

  const handleConvert = () => {
    if (isConverting) return;

    const savedPoints = Number(
      localStorage.getItem("zee-grill-loyalty-points") || "0"
    );
    const currentPoints =
      Number.isFinite(savedPoints) && savedPoints >= 0 ? savedPoints : 0;

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
      pointsToConvert = Math.floor(currentPoints / POINTS_PER_POUND) * POINTS_PER_POUND;
      if (pointsToConvert <= 0) {
        showNotification("error", "You need at least 10 Loyalty Points to convert automatically.");
        return;
      }
    }

    setIsConverting(true);

    const walletCredit = pointsToConvert / POINTS_PER_POUND;

    const savedWallet = Number(
      localStorage.getItem("zee-grill-wallet-balance") || "0"
    );

    const currentWallet =
      Number.isFinite(savedWallet) && savedWallet >= 0 ? savedWallet : 0;

    const updatedWallet = currentWallet + walletCredit;
    const remainingPoints = currentPoints - pointsToConvert;

    // UPDATE LOYALTY POINTS
    localStorage.setItem("zee-grill-loyalty-points", String(remainingPoints));

    // UPDATE WALLET
    localStorage.setItem("zee-grill-wallet-balance", updatedWallet.toFixed(2));

    // UPDATE CONVERSION HISTORY
    let existingHistory: ConversionRecord[] = [];
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem("zee-grill-lp-history") || "[]"
      );
      if (Array.isArray(savedHistory)) existingHistory = savedHistory;
    } catch {
      existingHistory = [];
    }

    const newRecord: ConversionRecord = {
      id: `lp-${Date.now()}`,
      points: pointsToConvert,
      amount: walletCredit,
      date: new Date().toLocaleString("en-GB"),
    };

    const updatedHistory = [newRecord, ...existingHistory];
    localStorage.setItem("zee-grill-lp-history", JSON.stringify(updatedHistory));

    // UPDATE UI
    setPoints(remainingPoints);
    setHistory(updatedHistory);
    setManualPointsToConvert("");

    window.dispatchEvent(new Event("loyalty-points-updated"));
    window.dispatchEvent(new Event("wallet-updated"));

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

      <div className="mx-auto w-full max-w-[750px] px-4 pb-12 pt-7 sm:px-5 sm:pt-9">
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