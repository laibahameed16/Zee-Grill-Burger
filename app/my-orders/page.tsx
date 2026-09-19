
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/home/Navbar";

type CartItem = {
  name: string;
  price: string;
  quantity: number;
  image?: string;
  imageUrl?: string;
  img?: string;
  size?: "Small" | "Medium" | "Large";
  extraHotChilli?: boolean;
};

type OrderCard = {
  id: string;
  date: string;
  time: string;
  items: CartItem[];
  total: number;
  status: "Preparing" | "Delivered" | "Cancelled" | "Picked up";
  orderType?: "delivery" | "pickup";
  cutlery?: string;
  subtotal?: number;
  deliveryFee?: number;
  serviceFee?: number;
  bagCharges?: number;
  tip?: number;
  walletAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
};

/* =========================================================
   PRICE HELPERS
========================================================= */
const getBasePrice = (price: string | number) => {
  const p = Number.parseFloat(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(p) ? p : 0;
};
const getSizePrice = (size?: "Small" | "Medium" | "Large") => {
  if (size === "Medium") return 1;
  if (size === "Large") return 2;
  return 0;
};
const getExtraHotChilliPrice = (e?: boolean) => (e ? 0.5 : 0);
const getUnitPrice = (item: CartItem) =>
  getBasePrice(item.price) + getSizePrice(item.size) + getExtraHotChilliPrice(item.extraHotChilli);
const getLineTotal = (item: CartItem) => getUnitPrice(item) * item.quantity;



const fallbackOrders: OrderCard[] = [
  {
    id: "PPP-1028",
    date: "Aug 25, 2026",
    time: "6:10 PM",
    items: [
      {
        name: "Piri Piri Wrap Meal",
        price: "£7.95",
        quantity: 2,
        image: "/images/menupictures/product-placeholder.svg",
      },
      {
        name: "Neffis Milkshake",
        price: "£5.25",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 27.38,
    status: "Preparing",
    orderType: "delivery",
    cutlery: "Yes",
  },
  {
    id: "PPP-1026",
    date: "Aug 24, 2026",
    time: "4:30 PM",
    items: [
      {
        name: "Beef Burger Menu",
        price: "£12.95",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 12.95,
    status: "Picked up",
    orderType: "pickup",
    cutlery: "No",
  },
  {
    id: "PPP-1024",
    date: "Aug 24, 2026",
    time: "7:45 PM",
    items: [
      {
        name: "Piri Piri Wing Platter",
        price: "£29.83",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 29.83,
    status: "Delivered",
    orderType: "delivery",
    cutlery: "No",
  },
  {
    id: "PPP-1022",
    date: "Aug 22, 2026",
    time: "1:15 PM",
    items: [
      {
        name: "Piri Piri Wrap Meal",
        price: "£14.84",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 14.84,
    status: "Delivered",
    orderType: "delivery",
    cutlery: "Yes",
  },
  {
    id: "PPP-1019",
    date: "Aug 20, 2026",
    time: "8:00 PM",
    items: [
      {
        name: "Piri Piri Wing Platter",
        price: "£21.93",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 21.93,
    status: "Cancelled",
    orderType: "delivery",
    cutlery: "No",
  },
];

const getPrice = (price: string) =>
  Number.parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;

export default function MyOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Active" | "Pickup" | "Delivered" | "Cancelled"
  >("All");

  const [orders, setOrders] = useState<OrderCard[]>(fallbackOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem("zee-grill-orders");

      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);

        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge parsed orders with fallback orders to show diverse data across all tabs
          setOrders([...parsed, ...fallbackOrders]);
          return;
        }
      }

      const lastOrder = localStorage.getItem("zee-grill-last-order");

      if (lastOrder) {
        const parsed = JSON.parse(lastOrder);
        setOrders([parsed, ...fallbackOrders]);
        return;
      }

      const cart = JSON.parse(
        localStorage.getItem("zee-grill-cart") || "[]"
      );

      if (Array.isArray(cart) && cart.length > 0) {
        const items = cart as CartItem[];

        const total = items.reduce(
          (sum, item) => sum + getLineTotal(item),
          0
        );

        const savedCompleted = localStorage.getItem(
          "zee-grill-order-completed"
        );

        if (savedCompleted === "true") {
          const liveOrder: OrderCard = {
            id: "PPP-24848",
            date: "Today",
            time: "Just now",
            items: items.map((it) => ({
              ...it,
              image:
                it.image ||
                it.imageUrl ||
                it.img ||
                "/images/menupictures/product-placeholder.svg",
            })),
            total,
            status: "Preparing",
            cutlery: "No",
          };

          setOrders([liveOrder, ...fallbackOrders]);
        }
      }
    } catch {
      setOrders(fallbackOrders);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") return orders;

    if (activeFilter === "Active") {
      return orders.filter((order) => order.status === "Preparing");
    }

    if (activeFilter === "Pickup") {
      return orders.filter((order) => order.status === "Picked up" || order.orderType === "pickup");
    }

    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter, orders]);

  return (
    <main className="min-h-screen bg-[#f8f6f5] text-[#292929]">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <Navbar/>

      {/* =========================================================
          PAGE CONTENT
      ========================================================= */}
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* =======================================================
            BACK TO MY ACCOUNT
        ======================================================= */}
        <Link
  href="/account"
  className="
    mb-5 flex w-fit items-center gap-2
    text-[12px] font-medium text-[#555]
    transition hover:text-[#ff542d]
    sm:mb-6 sm:text-[13px]
  "
>
  <span
    className="
      flex h-[16px] w-[16px]
      items-center justify-center
      text-[18px] leading-none
      font-light
    "
  >
    ‹
  </span>

  <span>Back</span>
</Link>

        {/* =======================================================
            PAGE HEADING
        ======================================================= */}
        <div className="mb-6">

          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#ff542d] sm:text-[12px]">
            ACCOUNT
          </p>

          <h1 className="mt-1.5 text-[28px] font-bold leading-tight text-[#252a35] sm:text-[34px]">
            My Orders
          </h1>

          <p className="mt-1.5 text-[12px] text-[#8a8f9a] sm:text-[13px]">
            Track and manage all your previous orders
          </p>

        </div>

        {/* =======================================================
            FILTERS
        ======================================================= */}
        <div className="mx-auto mb-5 flex w-full max-w-[980px] flex-wrap items-center gap-2.5">

          {(
            ["All", "Active", "Pickup", "Delivered", "Cancelled"] as const
          ).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`
                rounded-full px-4 py-2 text-[12px]
                font-medium transition-colors
                sm:px-5 sm:py-2.5 sm:text-[13px]
                ${
                  activeFilter === filter
                    ? "bg-[#ff542d] text-white"
                    : "bg-white text-[#596170] hover:text-[#ff542d]"
                }
              `}
            >
              {filter}
            </button>
          ))}

        </div>

        {/* =======================================================
            ORDERS
        ======================================================= */}
        <div className="space-y-4">

          {filteredOrders.map((order, index) => {
            const primaryItem = order.items[0];
            const secondaryItems = order.items.slice(1);

            const itemCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <article
                key={order.id}
                className={`
                  mx-auto w-full max-w-[980px]
                  overflow-hidden rounded-[11px]
                  border bg-white
                  shadow-[0_1px_7px_rgba(0,0,0,0.05)]
                  ${
                    index === 0 &&
                    order.status === "Preparing"
                      ? "border-[#f7d9cb]"
                      : "border-[#ece8e6]"
                  }
                `}
              >

                {/* =================================================
                    STATUS HEADER
                ================================================= */}
                <div
                  className={`
                    flex items-center justify-between
                    border-b px-4 py-2.5
                    sm:px-5
                    ${
                      index === 0 &&
                      order.status === "Preparing"
                        ? "border-[#f7e3da] bg-[#fff7f1]"
                        : "border-[#eeeeee] bg-white"
                    }
                  `}
                >

                  <p className="text-[12px] font-semibold text-[#ff542d] sm:text-[13px]">
                    {order.status === "Preparing"
                      ? "Your order is being prepared"
                      : order.status === "Delivered"
                        ? "Delivered"
                        : order.status === "Picked up"
                          ? "Picked up"
                          : "Order cancelled"}
                  </p>

                  <span className="text-[11px] text-[#7d8591] sm:text-[12px]">
                    {order.status === "Preparing"
                      ? "25–35 min"
                      : order.status}
                  </span>

                </div>

                {/* =================================================
                    ORDER BODY
                ================================================= */}
                <div className="px-4 py-3.5 sm:px-5 sm:py-4">

                  {/* ORDER ID + TOTAL */}
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[14px] font-bold text-[#2e3440] sm:text-[15px]">
                        Order #{order.id}
                      </p>

                      <p className="mt-1 text-[11px] text-[#9aa1ac] sm:text-[12px]">
                        {order.date} · {order.time}
                      </p>
                    </div>

                    <span className="text-[15px] font-bold text-[#2e3440] sm:text-[17px]">
                      £{order.total.toFixed(2)}
                    </span>

                  </div>

                  {/* =================================================
                      ORDER ITEMS
                  ================================================= */}
                  <div className="mt-3 flex items-center gap-2.5">

                    {/* PRODUCT IMAGES */}
                    <div className="flex -space-x-1.5">

                      {order.items
                        .slice(0, 3)
                        .map((item, imageIndex) => {

                          const image =
                            item.image ||
                            item.imageUrl ||
                            item.img;

                          return (
                            <div
                              key={`${item.name}-${imageIndex}`}
                              className="
                                h-[40px] w-[40px]
                                overflow-hidden rounded-[5px]
                                border border-white
                                bg-[#eee]
                                sm:h-[42px] sm:w-[42px]
                              "
                            >
                              <img
                                src={
                                  image ||
                                  "/images/menupictures/product-placeholder.svg"
                                }
                                alt={item.name}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/images/menupictures/product-placeholder.svg";
                                }}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          );
                        })}

                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="min-w-0 flex-1">

                      <p className="truncate text-[13px] font-medium text-[#3f4550] sm:text-[14px]">
                        {primaryItem?.name || "Order items"} ×{" "}
                        {primaryItem?.quantity || 1}
                      </p>

                      {secondaryItems.map((item) => (
                        <p
                          key={item.name}
                          className="mt-0.5 truncate text-[11px] text-[#8b929e] sm:text-[12px]"
                        >
                          {item.name} × {item.quantity}
                        </p>
                      ))}

                      {itemCount > 1 && (
                        <p className="mt-0.5 text-[11px] text-[#9aa1ac] sm:text-[12px]">
                          {itemCount} items total
                        </p>
                      )}

                      {order.cutlery && (
                        <p className="mt-1 text-[11px] font-medium text-[#777] sm:text-[12px]">
                          Cutlery:{" "}
                          <span
                            className={`font-semibold ${
                              order.cutlery === "Yes"
                                ? "text-[#ff542d]"
                                : "text-[#555]"
                            }`}
                          >
                            {order.cutlery}
                          </span>
                        </p>
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      ORDER TRACKING
                  ================================================= */}
                  {index === 0 &&
                    order.status === "Preparing" && (
                      <div className="mt-4 flex items-center">

                        {[
                          "Confirmed",
                          "Preparing",
                          "Out for Delivery",
                          "Delivered",
                        ].map((step, stepIndex) => (

                          <div
                            key={step}
                            className="flex min-w-0 flex-1 items-center"
                          >

                            <div className="flex flex-col items-center">

                              <span
                                className={`
                                  flex h-[20px] w-[20px]
                                  items-center justify-center
                                  rounded-full text-[9px]
                                  font-bold
                                  ${
                                    stepIndex <= 1
                                      ? "bg-[#ff542d] text-white"
                                      : "bg-[#f1f1f1] text-[#9da3ad]"
                                  }
                                `}
                              >
                                {stepIndex < 1
                                  ? "✓"
                                  : stepIndex + 1}
                              </span>

                              <span
                                className={`
                                  mt-1 whitespace-nowrap
                                  text-[9px] sm:text-[10px]
                                  ${
                                    stepIndex <= 1
                                      ? "text-[#4f5661]"
                                      : "text-[#9aa1ac]"
                                  }
                                `}
                              >
                                {step}
                              </span>

                            </div>

                            {stepIndex < 3 && (
                              <div
                                className={`
                                  mx-1.5 h-[1px]
                                  min-w-[8px] flex-1
                                  ${
                                    stepIndex < 1
                                      ? "bg-[#ff542d]"
                                      : "bg-[#e8eaed]"
                                  }
                                `}
                              />
                            )}

                          </div>

                        ))}

                      </div>
                    )}

                  {/* =================================================
                      ACTION BUTTONS
                  ================================================= */}
                  <div className="mt-3.5 flex items-center justify-center gap-2.5 border-t border-[#eeeeee] pt-3.5">

                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      className="
                        h-[34px] w-full max-w-[165px]
                        rounded-full border border-[#eeeeee]
                        text-[12px] font-medium
                        text-[#4e5662]
                        transition
                        hover:border-[#ff542d]
                        hover:text-[#ff542d]
                        sm:h-[36px]
                        sm:text-[13px]
                      "
                    >
                      {expandedOrderId === order.id ? "Hide Details" : "View Details"}
                    </button>

                    {order.status !== "Cancelled" && (
                      <button
                        type="button"
                        className="
                          h-[34px] w-full max-w-[165px]
                          rounded-full bg-[#ff542d]
                          text-[12px] font-medium
                          text-white transition
                          hover:bg-[#e94d28]
                          sm:h-[36px]
                          sm:text-[13px]
                        "
                      >
                        {order.status === "Preparing"
                          ? "Track Order"
                          : "Reorder"}
                      </button>
                    )}

                  </div>

                  {/* =================================================
                      EXPANDED DETAILS SECTION
                  ================================================= */}
                  {expandedOrderId === order.id && (() => {
                    // Calculate correct subtotal from items using price helpers
                    const calcSubtotal = order.subtotal ??
                      order.items.reduce((s, it) => s + getLineTotal(it), 0);

                    const dFee = order.deliveryFee ?? (order.orderType === "pickup" ? 0 : 3.99);
                    const sFee = order.serviceFee ?? 1.99;
                    const bCharge = order.bagCharges ?? 0.29;
                    const tipAmt = order.tip ?? 0;
                    const walletAmt = order.walletAmount ?? 0;
                    const couponDisc = order.couponDiscount ?? 0;
                    const couponCd = order.couponCode ?? "";

                    return (
                      <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-300 border-t border-[#eeeeee] pt-4">

                        {/* ORDER ITEMS */}
                        <h4 className="mb-3 text-[13px] font-bold text-[#2e3440] sm:text-[14px]">
                          Order Items
                        </h4>

                        <div className="space-y-3">
                          {order.items.map((item, idx) => {
                            const itemImage = item.image || item.imageUrl || item.img || "/images/menupictures/product-placeholder.svg";
                            const basePrice = getBasePrice(item.price);
                            const sizePrice = getSizePrice(item.size);
                            const unitPrice = getUnitPrice(item);
                            const lineTotal = getLineTotal(item);

                            return (
                              <div key={idx} className="flex items-start gap-3">

                                {/* IMAGE */}
                                <div className="h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[7px] border border-[#eee] bg-[#f9f9f9] sm:h-[48px] sm:w-[48px]">
                                  <img
                                    src={itemImage}
                                    alt={item.name}
                                    onError={(e) => {
                                      e.currentTarget.src = "/images/menupictures/product-placeholder.svg";
                                    }}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                {/* INFO */}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[12px] font-semibold text-[#3f4550] sm:text-[13px]">{item.name}</p>
                                  <p className="mt-0.5 text-[10px] text-[#888]">Base: £{basePrice.toFixed(2)}</p>
                                  {item.size && (
                                    <p className="mt-0.5 text-[10px] font-medium text-[#666]">
                                      Size: <span className="font-semibold">{item.size}</span>
                                      {sizePrice > 0 && <span className="ml-1 text-[#888]">+£{sizePrice.toFixed(2)}</span>}
                                    </p>
                                  )}
                                  {item.extraHotChilli && (
                                    <p className="mt-0.5 text-[10px] font-medium text-[#666]">
                                      Extra Hot Chilli <span className="text-[#888]">+£0.50</span>
                                    </p>
                                  )}
                                  <p className="mt-0.5 text-[10px] font-semibold text-[#ff542d]">
                                    Unit: £{unitPrice.toFixed(2)} × {item.quantity}
                                  </p>
                                </div>

                                {/* LINE TOTAL */}
                                <span className="shrink-0 text-[12px] font-bold text-[#2e3440] sm:text-[13px]">
                                  £{lineTotal.toFixed(2)}
                                </span>

                              </div>
                            );
                          })}
                        </div>

                        {/* ORDER SUMMARY BREAKDOWN */}
                        <div className="mt-4 rounded-[8px] bg-[#fdfdfd] p-3 border border-[#f0f0f0] space-y-2">

                          <div className="flex items-center justify-between text-[11px] text-[#7d8591] sm:text-[12px]">
                            <span>Subtotal</span>
                            <span>£{calcSubtotal.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#7d8591] sm:text-[12px]">
                            <span>{order.orderType === "pickup" ? "Pick-up" : "Standard delivery"}</span>
                            <span>£{dFee.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#7d8591] sm:text-[12px]">
                            <span>Service fee</span>
                            <span>£{sFee.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#7d8591] sm:text-[12px]">
                            <span>Bag charges</span>
                            <span>£{bCharge.toFixed(2)}</span>
                          </div>

                          {tipAmt > 0 && (
                            <div className="flex items-center justify-between text-[11px] text-[#7d8591] sm:text-[12px]">
                              <span>Tip</span>
                              <span>£{tipAmt.toFixed(2)}</span>
                            </div>
                          )}

                          {walletAmt > 0 && (
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#292929] sm:text-[12px]">
                              <span>Wallet</span>
                              <span>-£{walletAmt.toFixed(2)}</span>
                            </div>
                          )}

                          {couponDisc > 0 && (
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#10b981] sm:text-[12px]">
                              <span>Coupon {couponCd ? `(${couponCd})` : ""}</span>
                              <span>-£{couponDisc.toFixed(2)}</span>
                            </div>
                          )}

                          {order.cutlery && (
                            <div className="flex items-center justify-between text-[11px] text-[#7d8591] sm:text-[12px]">
                              <span>Cutlery</span>
                              <span className={`font-semibold ${order.cutlery === "Yes" ? "text-[#ff542d]" : "text-[#555]"}`}>
                                {order.cutlery}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-dashed border-[#eee] pt-2 text-[13px] font-bold text-[#2e3440] sm:text-[14px]">
                            <span>Total Paid</span>
                            <span className="text-[#ff542d]">£{order.total.toFixed(2)}</span>
                          </div>

                        </div>
                      </div>
                    );
                  })()}

                </div>
              </article>
            );
          })}

        </div>

        {/* =========================================================
            NO ORDERS
        ========================================================= */}
        {filteredOrders.length === 0 && (
          <div
            className="
              mx-auto max-w-[980px]
              rounded-[11px] bg-white
              p-8 text-center
              shadow-[0_1px_7px_rgba(0,0,0,0.05)]
            "
          >
            <p className="text-[14px] font-semibold text-[#333] sm:text-[15px]">
              No orders found
            </p>

            <p className="mt-1.5 text-[11px] text-[#999] sm:text-[12px]">
              Your orders will appear here.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
