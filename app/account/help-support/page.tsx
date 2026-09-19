"use client";

import Link from "next/link";
import { useState } from "react";
import { showNotification } from "@/lib/notifications";
import Navbar from "@/components/home/Navbar";

export default function HelpSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showNotification("error", "Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    showNotification("success", "Your message has been sent. We'll get back to you soon!");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSubmitting(false);
  };

  const faqs = [
    { q: "How do I track my order?", a: "Once your order is placed, you can track it from the My Orders page. You will also receive SMS/email updates." },
    { q: "What are your delivery hours?", a: "We deliver from 11:00 AM to 11:00 PM, 7 days a week." },
    { q: "Can I cancel my order?", a: "Orders can be cancelled within 5 minutes of placing them from the My Orders section." },
    { q: "How do I use a coupon code?", a: "Enter your coupon code in the checkout page before confirming payment." },
  ];

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
     <Navbar/>

      <div className="mx-auto w-full max-w-[850px] px-5 pb-12 pt-8 sm:px-6 sm:pt-10">
        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">ACCOUNT</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#292929] sm:text-[38px] lg:text-[42px]">Help &amp; Support</h1>
          <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">We're here to help. Reach out to us anytime.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="tel:+923001234567" className="rounded-[18px] border border-[#eeeeee] bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff5f1] text-[#ff542d]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </div>
            <p className="mt-4 text-[13px] font-bold text-[#292929] sm:text-[14px]">Call Us</p>
            <p className="mt-1 text-[11px] text-[#888] sm:text-[12px]">+92 300 1234567</p>
          </Link>

          <Link href="mailto:support@portopiripiri.com" className="rounded-[18px] border border-[#eeeeee] bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff5f1] text-[#ff542d]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <p className="mt-4 text-[13px] font-bold text-[#292929] sm:text-[14px]">Email Us</p>
            <p className="mt-1 text-[11px] text-[#888] sm:text-[12px]">support@portopiripiri.com</p>
          </Link>

          <div className="rounded-[18px] border border-[#eeeeee] bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.05)] sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff5f1] text-[#ff542d]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <p className="mt-4 text-[13px] font-bold text-[#292929] sm:text-[14px]">Working Hours</p>
            <p className="mt-1 text-[11px] text-[#888] sm:text-[12px]">11:00 AM - 11:00 PM Daily</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 rounded-[18px] border border-[#eeeeee] bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.05)] sm:p-7">
          <p className="text-[14px] font-bold text-[#292929] sm:text-[16px]">Send us a message</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[#f5f5f5] px-5 py-[13px] text-[12px] text-[#292929] outline-none transition-all focus:border-[#ff542d] focus:bg-white sm:text-[13px]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[#f5f5f5] px-5 py-[13px] text-[12px] text-[#292929] outline-none transition-all focus:border-[#ff542d] focus:bg-white sm:text-[13px]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-2xl border border-transparent bg-[#f5f5f5] px-5 py-[13px] text-[12px] text-[#292929] outline-none transition-all focus:border-[#ff542d] focus:bg-white sm:text-[13px]"
            />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-2xl border border-transparent bg-[#f5f5f5] px-5 py-[13px] text-[12px] text-[#292929] outline-none transition-all focus:border-[#ff542d] focus:bg-white sm:text-[13px]"
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#ff542d] py-[14px] text-[12px] font-bold text-white shadow-md transition-all hover:bg-[#e94724] hover:shadow-lg disabled:opacity-70 sm:text-[13px]"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>

        <section className="mt-6 overflow-hidden rounded-[18px] border border-[#eeeeee] bg-white shadow-[0_3px_15px_rgba(0,0,0,0.05)]">
          <div className="border-b border-[#eeeeee] px-5 py-4 sm:px-6">
            <p className="text-[13px] font-semibold text-[#292929] sm:text-[14px]">Frequently Asked Questions</p>
          </div>
          <div className="divide-y divide-[#eeeeee]">
            {faqs.map((f) => (
              <details key={f.q} className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[12px] font-semibold text-[#292929] list-none sm:text-[13px]">
                  <span>{f.q}</span>
                  <span className="text-[#ff542d] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[11px] leading-relaxed text-[#777] sm:text-[12px]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
