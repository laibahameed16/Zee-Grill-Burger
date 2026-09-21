
"use client";

import Navbar from "@/components/home/Navbar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addPersistentNotification, showNotification } from "@/lib/notifications";

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

/* =========================================================
   PRICE HELPERS (same as checkout page)
========================================================= */

const getBasePrice = (price: string | number) => {
  const parsedPrice = Number.parseFloat(
    String(price).replace(/[^0-9.]/g, "")
  );
  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
};

const getSizePrice = (size?: "Small" | "Medium" | "Large") => {
  switch (size) {
    case "Medium": return 1;
    case "Large": return 2;
    case "Small":
    default: return 0;
  }
};

const getExtraHotChilliPrice = (extraHotChilli?: boolean) =>
  extraHotChilli ? 0.5 : 0;

const getUnitPrice = (item: CartItem) =>
  getBasePrice(item.price) +
  getSizePrice(item.size) +
  getExtraHotChilliPrice(item.extraHotChilli);

const getLineTotal = (item: CartItem) =>
  getUnitPrice(item) * item.quantity;


type CheckoutInfo = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  floor?: string;
  postcode?: string;
  orderType?: "delivery" | "pickup";
  cutlery?: string;
  tip?: number;
  walletAmount?: number;
  walletBalance?: number;
  couponCode?: string;
  couponDiscount?: number;
  total?: number;
};


export default function ConfirmationPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo>({});
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [agreed, setAgreed] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("zee-grill-cart") || "[]"
      );

      setCartItems(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setCartItems([]);
    }

    try {
      const savedInfo = JSON.parse(
        localStorage.getItem("zee-grill-checkout-info") || "{}"
      );

      if (savedInfo && typeof savedInfo === "object") {
        setCheckoutInfo(savedInfo);
      }
    } catch {
      setCheckoutInfo({});
    }

    const savedPayment = localStorage.getItem(
      "zee-grill-payment-method"
    );

    if (savedPayment === "card" || savedPayment === "cash") {
      setPaymentMethod(savedPayment);
    }

    const savedOrderCompleted = localStorage.getItem(
      "zee-grill-order-completed"
    );

    if (savedOrderCompleted === "true") {
      setOrderCompleted(true);
    }
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + getLineTotal(item), 0);
  }, [cartItems]);


  const serviceFee = 1.99;
  const bagCharges = 0.29;

  const isPickup =
    checkoutInfo.orderType === "pickup";

  const deliveryFee = isPickup ? 0 : 3.99;

  const tip =
    typeof checkoutInfo.tip === "number" &&
    Number.isFinite(checkoutInfo.tip)
      ? checkoutInfo.tip
      : 0;

  const walletAmount =
    typeof checkoutInfo.walletAmount === "number" &&
    Number.isFinite(checkoutInfo.walletAmount)
      ? checkoutInfo.walletAmount
      : 0;

  const couponDiscount =
    typeof checkoutInfo.couponDiscount === "number" &&
    Number.isFinite(checkoutInfo.couponDiscount)
      ? checkoutInfo.couponDiscount
      : 0;

  const couponCode = checkoutInfo.couponCode || "";

  /*
   * Use the exact total calculated on Checkout.
   * This keeps Confirmation in sync with tip + wallet + coupon
   * and any other amount already calculated previously.
   */
  const total =
    typeof checkoutInfo.total === "number" &&
    Number.isFinite(checkoutInfo.total)
      ? checkoutInfo.total
      : Math.max(0, subtotal +
        deliveryFee +
        serviceFee +
        bagCharges +
        tip -
        walletAmount -
        couponDiscount);

  const address = isPickup
    ? "49 Kilmarnock Road, Glasgow"
    : [
        checkoutInfo.street,
        checkoutInfo.floor,
        checkoutInfo.postcode,
      ]
        .filter(Boolean)
        .join(", ") || "Delivery address";

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">

      {/* =====================================================
          HEADER / NAVBAR
      ====================================================== */}

      <Navbar />

      {/* =====================================================
          CHECKOUT STEPS
      ====================================================== */}

      <div
        className="
          h-[50px]
          border-b
          border-[#e7e7e7]
          bg-white
        "
      >
        <div
          className="
            mx-auto
            grid
            h-full
            w-full
            max-w-[1450px]
            grid-cols-3
          "
        >

          {/* CHECKOUT */}

          <div
            className="
              flex
              items-center
              justify-center
              border-b
              border-[#ff542d]
            "
          >
            <div className="flex items-center gap-2">

              <span
                className="
                  flex
                  h-[15px]
                  w-[15px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#ff542d]
                  text-[9px]
                  font-bold
                  text-white
                "
              >
                ✓
              </span>

              <Link
                href="/checkout"
                className="
                  text-[11px]
                  font-medium
                  text-[#333]
                  sm:text-[12px]
                "
              >
                Checkout
              </Link>

            </div>
          </div>

          {/* PAYMENT */}

          <div
            className="
              flex
              items-center
              justify-center
              border-b
              border-[#ff542d]
            "
          >
            <div className="flex items-center gap-2">

              <span
                className="
                  flex
                  h-[15px]
                  w-[15px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#ff542d]
                  text-[9px]
                  font-bold
                  text-white
                "
              >
                ✓
              </span>

              <Link
                href="/payment"
                className="
                  text-[11px]
                  font-medium
                  text-[#333]
                  sm:text-[12px]
                "
              >
                Payment
              </Link>

            </div>
          </div>

          {/* CONFIRMATION */}

          <div
            className="
              flex
              items-center
              justify-center
              border-b-2
              border-[#ff542d]
            "
          >
            {orderCompleted ? (
              <div className="flex items-center gap-2">
                <span
                  className="
                    flex
                    h-[15px]
                    w-[15px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#ff542d]
                    text-[9px]
                    font-bold
                    text-white
                  "
                >
                  ✓
                </span>

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-[#ff542d]
                    sm:text-[12px]
                  "
                >
                  Confirmation
                </span>
              </div>
            ) : (
              <span
                className="
                  text-[11px]
                  font-medium
                  text-[#ff542d]
                  sm:text-[12px]
                "
              >
                Confirmation
              </span>
            )}
          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          mx-auto
          flex
          min-h-[calc(100vh-108px)]
          w-full
          max-w-[1150px]
          items-start
          justify-center
          px-5
          py-8
          sm:px-8
          sm:py-10
          md:px-10
          lg:px-0
          lg:py-12
        "
      >

        {/* =================================================
            CONFIRMATION CARD
        ================================================== */}

        <section
          className="
            w-full
            max-w-[560px]
            rounded-[12px]
            bg-white
            p-5
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            sm:p-6
            lg:p-7
          "
        >

          {/* TITLE */}

          <h1
            className="
              text-[17px]
              font-bold
              text-[#292929]
              sm:text-[18px]
            "
          >
            Confirm your order
          </h1>

          {/* =================================================
              PAYMENT METHOD
          ================================================== */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              border-b
              border-[#eeeeee]
              pb-3
            "
          >
            <span
              className="
                text-[10px]
                font-medium
                tracking-wide
                text-[#667085]
                sm:text-[11px]
              "
            >
              PAYMENT METHOD
            </span>

            <span
              className="
                text-[12px]
                font-bold
                text-[#333]
                sm:text-[13px]
              "
            >
              {paymentMethod === "card"
                ? "Card Payment"
                : isPickup
                  ? "Cash on Collection"
                  : "Cash on Delivery"}
            </span>
          </div>

          {/* =================================================
              COLLECTION / DELIVERY
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-[#eeeeee]
              py-4
            "
          >
            <span
              className="
                shrink-0
                text-[10px]
                font-medium
                tracking-wide
                text-[#667085]
                sm:text-[11px]
              "
            >
              {isPickup ? "COLLECTION" : "DELIVERY"}
            </span>

            <span
              className="
                min-w-0
                text-right
                text-[12px]
                font-bold
                text-[#333]
                sm:text-[13px]
              "
            >
              {address}
            </span>
          </div>

          {/* =================================================
              ORDER ITEMS
          ================================================== */}

          <div className="space-y-4 py-5">

            {cartItems.length > 0 ? (
              cartItems.map((item, index) => {

                const basePrice = getBasePrice(item.price);
                const sizePrice = getSizePrice(item.size);
                const unitPrice = getUnitPrice(item);
                const lineTotal = getLineTotal(item);

                const image =
                  item.image ||
                  item.imageUrl ||
                  item.img;

                return (
                  <div
                    key={`${item.name}-${index}`}
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    {/* IMAGE */}

                    <div
                      className="
                        h-[54px]
                        w-[54px]
                        shrink-0
                        overflow-hidden
                        rounded-[7px]
                        bg-[#f5f5f5]
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
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    </div>

                    {/* NAME / QUANTITY */}

                    <div className="min-w-0 flex-1">

                      <p
                        className="
                          truncate
                          text-[12px]
                          font-semibold
                          text-[#292929]
                          sm:text-[13px]
                        "
                      >
                        {item.name}
                      </p>

                      <p className="mt-1 text-[10px] text-[#888]">
                        Base: £{basePrice.toFixed(2)}
                      </p>

                      {item.size && (
                        <p className="mt-0.5 text-[10px] font-medium text-[#666]">
                          Size: <span className="font-semibold">{item.size}</span>
                          {sizePrice > 0 && (
                            <span className="ml-1 text-[#888]">+£{sizePrice.toFixed(2)}</span>
                          )}
                        </p>
                      )}

                      {item.extraHotChilli && (
                        <p className="mt-0.5 text-[10px] font-medium text-[#666]">
                          Extra Hot Chilli <span className="text-[#888]">+£0.50</span>
                        </p>
                      )}

                      <p className="mt-0.5 text-[10px] font-semibold text-[#555]">
                        Unit: £{unitPrice.toFixed(2)}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-[#888]
                          sm:text-[11px]
                        "
                      >
                        × {item.quantity}
                      </p>

                    </div>

                    {/* PRICE */}

                    <span
                      className="
                        shrink-0
                        text-[12px]
                        font-semibold
                        text-[#292929]
                        sm:text-[13px]
                      "
                    >
                      £{lineTotal.toFixed(2)}
                    </span>

                  </div>
                );
              })
            ) : (
              <p
                className="
                  py-2
                  text-[11px]
                  text-[#888]
                  sm:text-[12px]
                "
              >
                Your cart is empty.
              </p>
            )}

          </div>


          {/* =================================================
              PRICE SUMMARY
          ================================================== */}

          <div
            className="
              border-t
              border-[#eeeeee]
              pt-5
            "
          >

            <div className="space-y-3">

              {/* SUBTOTAL */}

              <div
                className="
                  flex
                  justify-between
                  text-[11px]
                  text-[#777]
                  sm:text-[12px]
                "
              >
                <span>
                  Subtotal
                </span>

                <span>
                  £{subtotal.toFixed(2)}
                </span>
              </div>

              {/* DELIVERY FEE */}

              <div
                className="
                  flex
                  justify-between
                  text-[11px]
                  text-[#777]
                  sm:text-[12px]
                "
              >
                <span>
                  {isPickup ? "Pick-up" : "Standard delivery"}
                </span>

                <span>
                  £{deliveryFee.toFixed(2)}
                </span>
              </div>

              {/* SERVICE FEE */}

              <div
                className="
                  flex
                  justify-between
                  text-[11px]
                  text-[#777]
                  sm:text-[12px]
                "
              >
                <span>
                  Service fee
                </span>

                <span>
                  £{serviceFee.toFixed(2)}
                </span>
              </div>

              {/* BAG CHARGES */}

              <div
                className="
                  flex
                  justify-between
                  text-[11px]
                  text-[#777]
                  sm:text-[12px]
                "
              >
                <span>
                  Bag charges
                </span>

                <span>
                  £{bagCharges.toFixed(2)}
                </span>
              </div>

              {/* TIP */}

              {tip > 0 && (
                <div
                  className="
                    flex
                    justify-between
                    text-[11px]
                    text-[#777]
                    sm:text-[12px]
                  "
                >
                  <span>
                    Tip
                  </span>

                  <span>
                    £{tip.toFixed(2)}
                  </span>
                </div>
              )}

              {/* WALLET */}

              {walletAmount > 0 && (
                <div
                  className="
                    flex
                    justify-between
                    text-[11px]
                    text-[#777]
                    sm:text-[12px]
                  "
                >
                  <span>
                    Wallet
                  </span>

                  <span className="font-semibold text-[#292929]">
                    -£{walletAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* COUPON */}

              {couponDiscount > 0 && (
                <div
                  className="
                    flex
                    justify-between
                    text-[11px]
                    font-semibold
                    text-[#10b981]
                    sm:text-[12px]
                  "
                >
                  <span>
                    Coupon {couponCode ? `(${couponCode})` : ""}
                  </span>

                  <span>
                    -£{couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* CUTLERY */}

              <div
                className="
                  flex
                  justify-between
                  text-[11px]
                  text-[#777]
                  sm:text-[12px]
                "
              >
                <span>
                  Cutlery
                </span>

                <span className="font-semibold text-[#292929]">
                  {checkoutInfo.cutlery === "Yes" ? "Yes" : "No"}
                </span>
              </div>

            </div>

            {/* DIVIDER */}

            <div
              className="
                my-4
                border-t
                border-[#eeeeee]
              "
            />

            {/* TOTAL */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-[13px]
                  font-bold
                  text-[#292929]
                  sm:text-[14px]
                "
              >
                Total
              </span>

              <span
                className="
                  text-[19px]
                  font-bold
                  text-[#ff542d]
                  sm:text-[21px]
                "
              >
                £{total.toFixed(2)}
              </span>

            </div>

          </div>

          {/* =================================================
              TERMS CHECKBOX
          ================================================== */}

          <label
            className="
              mt-5
              flex
              min-h-[48px]
              cursor-pointer
              items-center
              gap-2.5
              rounded-[8px]
              border
              border-[#dedede]
              px-3
            "
          >

            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) =>
                setAgreed(event.target.checked)
              }
              className="
                h-4
                w-4
                shrink-0
                accent-[#ff542d]
              "
            />

            <span
              className="
                text-[10px]
                leading-[1.5]
                text-[#555]
                sm:text-[11px]
              "
            >
              I confirm that my order is correct and I agree
              to the{" "}
              <span className="font-semibold underline">
                terms and conditions
              </span>
              .
            </span>

          </label>

          {/* =================================================
              COMPLETE ORDER
          ================================================== */}

          <Link
            href="/order-success"
            aria-disabled={!agreed}
            onClick={(event) => {
              if (!agreed) {
                event.preventDefault();
                return;
              }

              try {
                const currentOrders = JSON.parse(
                  localStorage.getItem("zee-grill-orders") || "[]"
                );

                // -----------------------------------------------
                // LOYALTY POINTS
                // -----------------------------------------------
                const savedPointsRaw = Number.parseInt(
                  localStorage.getItem("zee-grill-loyalty-points") || "0",
                  10
                );

                const currentPoints =
                  Number.isFinite(savedPointsRaw) && savedPointsRaw >= 0
                    ? savedPointsRaw
                    : 0;

                // 10 points per £50 spent
                const earnedPoints =
                  Math.floor(Math.max(0, subtotal) / 50) * 10;

                const updatedPoints = currentPoints + earnedPoints;

                localStorage.setItem(
                  "zee-grill-loyalty-points",
                  String(updatedPoints)
                );

                // -----------------------------------------------
                // WALLET DEDUCTION
                // -----------------------------------------------
                const savedWalletRaw = Number.parseFloat(
                  localStorage.getItem("zee-grill-wallet-balance") || "0"
                );

                const currentWallet =
                  Number.isFinite(savedWalletRaw) && savedWalletRaw >= 0
                    ? savedWalletRaw
                    : 0;

                const newWalletBalance = Math.max(
                  0,
                  currentWallet - walletAmount
                );

                if (walletAmount > 0) {
                  localStorage.setItem(
                    "zee-grill-wallet-balance",
                    newWalletBalance.toFixed(2)
                  );
                  window.dispatchEvent(new Event("wallet-updated"));
                }

                // -----------------------------------------------
                // DISPATCH EVENTS
                // -----------------------------------------------
                window.dispatchEvent(new Event("loyalty-points-updated"));

                // -----------------------------------------------
                // ORDER OBJECT
                // -----------------------------------------------
                const newOrder = {
                  id: `PPP-${Math.floor(10000 + Math.random() * 90000)}`,

                  date: new Date().toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),

                  time: new Date().toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),

                  items: cartItems.map((item) => ({
                    ...item,
                    image:
                      item.image ||
                      item.imageUrl ||
                      item.img ||
                      "/images/menupictures/product-placeholder.svg",
                  })),

                  subtotal,
                  deliveryFee,
                  serviceFee,
                  bagCharges,
                  tip,
                  walletAmount,
                  couponCode,
                  couponDiscount,
                  total,

                  status: "Preparing",

                  cutlery: checkoutInfo.cutlery || "No",

                  orderType: checkoutInfo.orderType || "delivery",

                  address,

                  loyaltyPointsEarned: earnedPoints,
                  loyaltyPointsRemaining: updatedPoints,

                  walletCreditEarned: 0,
                  walletBalanceAfterOrder: newWalletBalance,
                };

                localStorage.setItem(
                  "zee-grill-orders",
                  JSON.stringify([
                    newOrder,
                    ...(Array.isArray(currentOrders) ? currentOrders : []),
                  ])
                );

                localStorage.setItem(
                  "zee-grill-last-order",
                  JSON.stringify(newOrder)
                );

                // -----------------------------------------------
                // PERSISTENT NOTIFICATIONS
                // -----------------------------------------------

                // Order confirmed
                addPersistentNotification(
                  "Order Confirmed! 🎉",
                  `Your order #${newOrder.id} has been placed successfully and is now being prepared. Total: £${total.toFixed(2)}.`,
                  "order"
                );

                // Loyalty points earned
                if (earnedPoints > 0) {
                  addPersistentNotification(
                    `You earned ${earnedPoints} Loyalty Points! 🌟`,
                    `Amazing! You just earned ${earnedPoints} loyalty points on your £${subtotal.toFixed(2)} order. Convert 10 points for £1 wallet credit anytime.`,
                    "loyalty"
                  );

                  // toast for loyalty
                  showNotification(
                    "success",
                    `🌟 You earned ${earnedPoints} Loyalty Points on this order!`,
                    4500
                  );
                }

                // Wallet deducted
                if (walletAmount > 0) {
                  addPersistentNotification(
                    "Wallet Payment Processed 💳",
                    `£${walletAmount.toFixed(2)} was deducted from your wallet for order #${newOrder.id}. Remaining wallet balance: £${newWalletBalance.toFixed(2)}.`,
                    "wallet"
                  );
                }

                // Order confirmed toast
                showNotification(
                  "success",
                  `Order #${newOrder.id} confirmed! 🎉`,
                  4000
                );

                // Pickup Notification
                if (isPickup) {
                  addPersistentNotification(
                    "Order Ready Soon! 🛍️",
                    `Your order #${newOrder.id} will be ready in 20-30 minutes. Please come to pick it up.`,
                    "order"
                  );
                  showNotification(
                    "success",
                    "Your order will be ready in 20-30 minutes for pickup! 🛍️",
                    5000
                  );
                }

              } catch {
                // local storage fallback
              }

              localStorage.setItem("zee-grill-order-completed", "true");
              localStorage.removeItem("zee-grill-cart");

              window.dispatchEvent(new Event("cart-updated"));
              setOrderCompleted(true);
            }}
            className={`
              mt-4
              flex
              h-[44px]
              w-full
              items-center
              justify-center
              rounded-full
              text-[11px]
              font-bold
              transition-all
              sm:h-[46px]
              sm:text-[12px]

              ${
                agreed
                  ? "bg-[#ff542d] text-white hover:bg-[#e94724] hover:shadow-md"
                  : "pointer-events-none cursor-not-allowed bg-[#ffb9a5] text-white"
              }
            `}
          >
            Complete Order
          </Link>

          {/* =================================================
              TERMS TEXT
          ================================================== */}

          <p
            className="
              mt-3
              text-center
              text-[9px]
              text-[#aaa]
              sm:text-[10px]
            "
          >
            By placing this order you agree to our{" "}
            <span className="underline">
              terms and conditions
            </span>
            .
          </p>

        </section>
      </div>
    </main>
  );
}
