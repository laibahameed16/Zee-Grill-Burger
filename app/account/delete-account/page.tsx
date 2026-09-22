"use client";

import Link from "next/link";
import { useState } from "react";
import { showNotification } from "@/lib/notifications";
import Navbar from "@/components/home/Navbar";
import { logoutUser } from "@/lib/auth";

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      showNotification("error", "Please type 'DELETE' to confirm.");
      return;
    }
    if (!password) {
      showNotification("error", "Please enter your password.");
      return;
    }
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 800));

    logoutUser();

    showNotification("success", "Your account has been deleted.");
    setDeleting(false);
    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
      <Navbar/>

      <div className="mx-auto w-full max-w-[650px] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 md:px-10 lg:px-0">
        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">ACCOUNT</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#ef4444] sm:text-[38px]">Delete Account</h1>
          <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">This action is permanent and cannot be undone.</p>
        </div>

        <section className="rounded-[18px] border border-red-200 bg-white p-5 shadow-[0_3px_15px_rgba(239,68,68,0.06)] sm:p-7">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-[#ef4444] sm:h-24 sm:w-24">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
            </div>
            <h2 className="mt-5 text-[18px] font-extrabold text-[#292929] sm:text-[20px]">Are you absolutely sure?</h2>
            <p className="mt-2 max-w-md text-[12px] leading-relaxed text-[#666] sm:text-[13px]">
              Once you delete your account, all your data including order history, saved addresses, favorites, and wallet balance will be permanently removed. This action cannot be reversed.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {step === 1 ? (
              <>
                <div className="rounded-[14px] bg-red-50 p-4">
                  <p className="text-[11px] font-semibold text-[#b91c1c] sm:text-[12px]">
                    Deleting your account will:
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-[#7f1d1d] sm:text-[12px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#ef4444]">✓</span>
                      <span>Permanently delete your profile information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#ef4444]">✓</span>
                      <span>Remove all your saved addresses and favorites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#ef4444]">✓</span>
                      <span>Erase order history and loyalty points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#ef4444]">✓</span>
                      <span>Forfeit any wallet balance and coupons</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full rounded-full bg-[#ef4444] py-[14px] text-[12px] font-bold text-white shadow-md transition-all hover:bg-[#dc2626] hover:shadow-lg sm:text-[13px]"
                >
                  Yes, I understand - Continue
                </button>
                <Link
                  href="/account"
                  className="block w-full rounded-full border border-[#ddd] py-[14px] text-center text-[12px] font-bold text-[#555] transition-all hover:bg-[#f5f5f5] sm:text-[13px]"
                >
                  Cancel - Go Back
                </Link>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">
                    Type <span className="font-bold text-[#ef4444]">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="w-full rounded-2xl border border-transparent bg-[#f5f5f5] px-5 py-[13px] text-[12px] font-bold uppercase tracking-widest text-[#292929] outline-none transition-all focus:border-[#ef4444] focus:bg-white sm:text-[13px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">
                    Enter your password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-transparent bg-[#f5f5f5] px-5 py-[13px] text-[12px] text-[#292929] outline-none transition-all focus:border-[#ef4444] focus:bg-white sm:text-[13px]"
                  />
                </div>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="mt-2 w-full rounded-full bg-[#ef4444] py-[14px] text-[12px] font-bold text-white shadow-md transition-all hover:bg-[#dc2626] hover:shadow-lg disabled:opacity-70 sm:text-[13px]"
                >
                  {deleting ? "Deleting Account..." : "Permanently Delete Account"}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full rounded-full border border-[#ddd] py-[14px] text-[12px] font-bold text-[#555] transition-all hover:bg-[#f5f5f5] sm:text-[13px]"
                >
                  Go Back
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
