"use client";

import Navbar from "@/components/home/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { safeLocalStorage } from "@/lib/storage";
import { getOrders, getLastOrder } from "@/lib/orders";
import { getPriceNumber } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/siteConfig";

type OrderInfo = {
  orderType?: "delivery" | "pickup";
  time?: string;
};

export default function OrderSuccessPage() {
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({});
  const [orderNumber, setOrderNumber] = useState<string>("PPP-24848");

  useEffect(() => {
    const savedInfo = safeLocalStorage.get<OrderInfo>(
      "zee-grill-checkout-info",
      {}
    );

    if (savedInfo && typeof savedInfo === "object") {
      setOrderInfo(savedInfo);
    }

    const lastOrder = getLastOrder<{ id?: string }>();
    if (lastOrder && lastOrder.id) {
      setOrderNumber(lastOrder.id);
    }
  }, []);

  const isPickup = orderInfo.orderType === "pickup";
  const estimatedTime = SITE_CONFIG.delivery.estimatedTime;

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
      {/* HEADER / NAVBAR */}
      <Navbar/>

      {/* CHECKOUT STEPS */}
      <div className="h-[50px] border-b border-[#e7e7e7] bg-white">
        <div className="mx-auto grid h-full w-full max-w-[1450px] grid-cols-3">
          <div className="flex items-center justify-center border-b border-[#ff542d]">
            <div className="flex items-center gap-2">
              <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#ff542d] text-[9px] font-bold text-white">
                ✓
              </span>
              <Link href="/checkout" className="text-[11px] font-medium text-[#333] sm:text-[12px]">
                Checkout
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center border-b border-[#ff542d]">
            <div className="flex items-center gap-2">
              <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#ff542d] text-[9px] font-bold text-white">
                ✓
              </span>
              <Link href="/payment" className="text-[11px] font-medium text-[#333] sm:text-[12px]">
                Payment
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center border-b-2 border-[#ff542d]">
            <div className="flex items-center gap-2">
              <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#ff542d] text-[9px] font-bold text-white">
                ✓
              </span>
              <span className="text-[11px] font-medium text-[#ff542d] sm:text-[12px]">
                Confirmation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONTENT */}
      <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1150px] items-start justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:px-0">
        <section
          className="
            w-full max-w-[440px] rounded-[12px] bg-white
            p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            sm:max-w-[480px] sm:p-6 lg:p-7
          "
        >
          {/* SUCCESS ICON */}
          <div className="flex justify-center">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#fff0ec] sm:h-[64px] sm:w-[64px]">
              <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full border-2 border-[#ff542d] text-[16px] font-bold leading-none text-[#ff542d]">
                ✓
              </span>
            </div>
          </div>

          <h1 className="mt-5 text-center text-[22px] font-bold text-[#182033] sm:text-[24px]">
            Thank you!
          </h1>

          <p className="mt-2 text-center text-[12px] text-[#667085] sm:text-[13px]">
            Your order has been placed successfully.
          </p>

          {/* ORDER INFO */}
          <div className="mt-5 rounded-[10px] bg-[#f6f5f5] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-[#667085] sm:text-[13px]">
                Order number
              </span>
              <span className="text-[12px] font-bold text-[#182033] sm:text-[13px]">
                {orderNumber}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[12px] text-[#667085] sm:text-[13px]">
                Estimated {isPickup ? "collection" : "delivery"}
              </span>
              <span className="text-[12px] font-bold text-[#182033] sm:text-[13px]">
                {estimatedTime}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[12px] text-[#667085] sm:text-[13px]">
                Order status
              </span>
              <span className="text-[12px] font-bold text-[#ff542d] sm:text-[13px]">
                Confirmed
              </span>
            </div>
          </div>

          {/* ACTION */}
          <div className="mt-5">
            <Link
              href="/"
              className="
                flex h-[44px] w-full items-center justify-center rounded-full
                bg-[#ff542d] text-[12px] font-bold text-white
                transition-all hover:bg-[#e94724] hover:shadow-md
                sm:h-[46px] sm:text-[13px]
              "
            >
              Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
