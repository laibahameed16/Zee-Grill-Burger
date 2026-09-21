"use client";

import Link from "next/link";
import { useState } from "react";
import { showNotification } from "@/lib/notifications";
import Navbar from "@/components/home/Navbar";

export default function ReferEarnPage() {
  const [copied, setCopied] = useState(false);
  const code = "PORTOLAIB";

  const shareText = `Hey! Order from Zee Grill Burger and use my referral code ${code} to get a discount on your first order! 🍔🔥`;
  const shareUrl = "https://zeegrillburger.com";

  const copyCode = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      showNotification("success", "Referral code copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showNotification("error", "Failed to copy code.");
    }
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    showNotification("success", "Opening WhatsApp to share... 💬");
  };

  const shareSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    window.open(url);
    showNotification("success", "Opening SMS to share... 📱");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("You're invited to Zee Grill Burger!");
    const body = encodeURIComponent(
      `Hi!\n\n${shareText}\n\nVisit: ${shareUrl}\n\nEnjoy! 🍔`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    showNotification("success", "Opening Email to share... 📧");
  };

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
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
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">ACCOUNT</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#292929] sm:text-[38px] lg:text-[42px]">Refer &amp; Earn</h1>
          <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">Invite friends and earn amazing rewards</p>
        </div>

        <section className="rounded-[18px] border border-[#eeeeee] bg-gradient-to-br from-[#292929] via-[#3a3a3a] to-[#ff542d] p-6 text-white shadow-[0_3px_15px_rgba(0,0,0,0.08)] sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 sm:h-20 sm:w-20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h2 className="mt-4 text-[20px] font-extrabold sm:text-[24px]">Refer a Friend, Get Rewarded!</h2>
            <p className="mt-2 max-w-md text-[12px] text-white/80 sm:text-[13px]">Share your unique code with friends. They get a discount on their first order, and you earn rewards too!</p>
          </div>

          <div className="mt-6 rounded-[14px] bg-white p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#888]">Your Referral Code</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="flex-1 font-mono text-[20px] font-extrabold tracking-widest text-[#292929] sm:text-[24px]">{code}</p>
              <button
                onClick={copyCode}
                className={`
                  shrink-0 rounded-full px-5 py-2.5 text-[11px] font-bold text-white transition-all sm:px-6 sm:text-[12px]
                  ${copied ? "bg-[#10b981]" : "bg-[#ff542d] hover:bg-[#e94724]"}
                `}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>

          {/* SHARE BUTTONS */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* WhatsApp */}
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 text-[11px] font-bold text-white transition-all hover:bg-white/25 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share via WhatsApp
            </button>

            {/* SMS */}
            <button
              type="button"
              onClick={shareSMS}
              className="flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 text-[11px] font-bold text-white transition-all hover:bg-white/25 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Share via SMS
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={shareEmail}
              className="flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 text-[11px] font-bold text-white transition-all hover:bg-white/25 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Share via Email
            </button>

          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[18px] border border-[#eeeeee] bg-white shadow-[0_3px_15px_rgba(0,0,0,0.05)]">
          <div className="border-b border-[#eeeeee] px-5 py-4 sm:px-6">
            <p className="text-[13px] font-semibold text-[#292929] sm:text-[14px]">How It Works</p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-[#eeeeee] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { step: "1", title: "Share Code", desc: "Send your referral code to friends" },
              { step: "2", title: "They Order", desc: "Friend places first order with code" },
              { step: "3", title: "You Earn", desc: "Get rewards credited to your wallet" },
            ].map((s) => (
              <div key={s.step} className="p-5 text-center sm:p-6">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff5f1] text-[14px] font-extrabold text-[#ff542d]">
                  {s.step}
                </div>
                <p className="mt-3 text-[12px] font-bold text-[#292929] sm:text-[13px]">{s.title}</p>
                <p className="mt-1 text-[10px] text-[#999] sm:text-[11px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[18px] border border-[#eeeeee] bg-white shadow-[0_3px_15px_rgba(0,0,0,0.05)]">
          <div className="border-b border-[#eeeeee] px-5 py-4 sm:px-6">
            <p className="text-[13px] font-semibold text-[#292929] sm:text-[14px]">Your Referrals (0)</p>
          </div>
          <div className="px-5 py-10 text-center sm:px-6">
            <p className="text-[12px] text-[#999] sm:text-[13px]">No referrals yet. Start sharing!</p>
          </div>
        </section>
      </div>
    </main>
  );
}
