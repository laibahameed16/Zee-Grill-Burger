"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { showNotification } from "@/lib/notifications";
import Navbar from "@/components/home/Navbar";

type PaymentMethod = "cash" | "card";

type CartItem = {
  name: string;
  description?: string;
  price: string;
  quantity: number;
  image?: string;
  imageUrl?: string;
  img?: string;
};

type CheckoutInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  floor: string;
  postcode: string;
  company: string;
  orderInstructions: string;
  deliveryNotes: string;
  orderType: "delivery" | "pickup";
  orderTime: "asap" | "schedule";
  time: string;
  tip?: number;
  walletAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
};

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [checkoutInfo, setCheckoutInfo] =
    useState<CheckoutInfo>({
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      floor: "",
      postcode: "",
      company: "",
      orderInstructions: "",
      deliveryNotes: "",
      orderType: "delivery",
      orderTime: "asap",
      time: "17:00",
    });

  /* =========================================================
     LOAD SAVED CHECKOUT + CART INFORMATION
  ========================================================= */

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("zee-grill-cart") || "[]"
      );

      setCartItems(
        Array.isArray(savedCart) ? savedCart : []
      );
    } catch {
      setCartItems([]);
    }

    try {
      const savedCheckoutInfo = JSON.parse(
        localStorage.getItem(
          "zee-grill-checkout-info"
        ) || "{}"
      );

      if (
        savedCheckoutInfo &&
        typeof savedCheckoutInfo === "object"
      ) {
        setCheckoutInfo((current) => ({
          ...current,
          ...savedCheckoutInfo,
        }));
      }
    } catch {
      setCheckoutInfo((current) => current);
    }

    const savedPayment = localStorage.getItem(
      "zee-grill-payment-method"
    );

    if (
      savedPayment === "cash" ||
      savedPayment === "card"
    ) {
      setPaymentMethod(savedPayment);
    }

    const savedCardPreference =
      localStorage.getItem(
        "zee-grill-save-card"
      );

    if (savedCardPreference === "true") {
      setSaveCard(true);
    }
  }, []);

  /* =========================================================
     CALCULATE SUBTOTAL
  ========================================================= */

  const subtotal = cartItems.reduce(
    (sum, item) => {
      const price = Number.parseFloat(
        String(item.price).replace(/[^0-9.]/g, "")
      );

      const quantity = Number.isFinite(
        item.quantity
      )
        ? item.quantity
        : 0;

      return (
        sum +
        (Number.isFinite(price) ? price : 0) *
          quantity
      );
    },
    0
  );

  /* =========================================================
     FEES
  ========================================================= */

  const deliveryFee =
    checkoutInfo.orderType === "delivery"
      ? 3.59
      : 0;

  const serviceFee = 1.39;
  const bagCharge = 0.29;

  const tipAmount = Number.isFinite(Number(checkoutInfo.tip))
    ? Math.max(0, Number(checkoutInfo.tip))
    : 0;

  const maxWalletUsable = Math.max(
    0,
    subtotal +
      deliveryFee +
      serviceFee +
      bagCharge +
      tipAmount
  );

  const walletAmount = Math.min(
    Math.max(0, Number(checkoutInfo.walletAmount) || 0),
    maxWalletUsable
  );

  const couponDiscount = Number.isFinite(Number(checkoutInfo.couponDiscount))
    ? Math.max(0, Number(checkoutInfo.couponDiscount))
    : 0;

  const couponCode = checkoutInfo.couponCode || "";

  const total = Math.max(
    0,
    subtotal +
      deliveryFee +
      serviceFee +
      bagCharge +
      tipAmount -
      walletAmount -
      couponDiscount
  );

  /* =========================================================
     PAYMENT METHOD CHANGE
  ========================================================= */

  const handlePaymentChange = (
    method: PaymentMethod
  ) => {
    setPaymentMethod(method);

    localStorage.setItem(
      "zee-grill-payment-method",
      method
    );
  };

  /* =========================================================
     CONFIRM PAYMENT
  ========================================================= */

  const handleConfirm = () => {
    if (paymentMethod === "card") {
      const cardFields = [
        cardNumber,
        nameOnCard,
        expiryDate,
        cvv,
      ];

      const allCardFieldsFilled =
        cardFields.every(
          (field) => field.trim().length > 0
        );

      if (!allCardFieldsFilled) {
        showNotification(
          "error",
          "Please fill in all required card details before confirming payment."
        );
        return;
      }
    }

    localStorage.setItem(
      "zee-grill-payment-method",
      paymentMethod
    );

    if (
      paymentMethod === "card" &&
      saveCard
    ) {
      localStorage.setItem(
        "zee-grill-save-card",
        "true"
      );
    } else {
      localStorage.removeItem(
        "zee-grill-save-card"
      );
    }

    window.location.href = "/confirmation";
  };

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
                  transition-colors
                  hover:text-[#ff542d]
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
              h-full
              items-center
              justify-center
              border-b-2
              border-[#ff542d]
              text-[11px]
              font-medium
              text-[#ff542d]
              sm:text-[12px]
            "
          >
            <span>Payment</span>
          </div>

          {/* CONFIRMATION */}

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-[11px]
              font-medium
              text-[#777]
              sm:text-[12px]
            "
          >
            <span>
              Confirmation
            </span>
          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          py-5
          sm:px-6
          sm:py-6
          lg:px-8
          lg:py-7
        "
      >

        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-[minmax(0,1fr)_350px]
            xl:grid-cols-[minmax(0,1fr)_370px]
          "
        >

          {/* =================================================
              PAYMENT METHOD
          ================================================== */}

          <section
            className="
              min-w-0
              rounded-[10px]
              bg-white
              p-5
              shadow-[0_2px_12px_rgba(0,0,0,0.07)]
              sm:p-6
              lg:p-7
            "
          >

            <h1
              className="
                text-[20px]
                font-bold
                text-[#292929]
                sm:text-[22px]
              "
            >
              Choose payment method
            </h1>

            {/* =================================================
                CUSTOMER / ORDER INFORMATION
            ================================================== */}

            <div
              className="
                mt-5
                rounded-[9px]
                bg-[#f7f7f7]
                p-5
              "
            >

              <p
                className="
                  text-[15px]
                  font-bold
                  text-[#292929]
                  sm:text-[16px]
                "
              >
                Your Information
              </p>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >

                {/* FIRST NAME */}

                <div>
                  <p
                    className="
                      text-[11px]
                      text-[#999]
                      sm:text-[12px]
                    "
                  >
                    First Name
                  </p>

                  <p
                    className="
                      mt-1
                      text-[14px]
                      font-medium
                      text-[#555]
                      sm:text-[15px]
                    "
                  >
                    {checkoutInfo.firstName || "—"}
                  </p>
                </div>

                {/* LAST NAME */}

                <div>
                  <p
                    className="
                      text-[11px]
                      text-[#999]
                      sm:text-[12px]
                    "
                  >
                    Last Name
                  </p>

                  <p
                    className="
                      mt-1
                      text-[14px]
                      font-medium
                      text-[#555]
                      sm:text-[15px]
                    "
                  >
                    {checkoutInfo.lastName || "—"}
                  </p>
                </div>

                {/* PHONE */}

                <div>
                  <p
                    className="
                      text-[11px]
                      text-[#999]
                      sm:text-[12px]
                    "
                  >
                    Phone Number
                  </p>

                  <p
                    className="
                      mt-1
                      text-[14px]
                      font-medium
                      text-[#555]
                      sm:text-[15px]
                    "
                  >
                    {checkoutInfo.phone || "—"}
                  </p>
                </div>

                {/* ORDER TYPE */}

                <div>
                  <p
                    className="
                      text-[11px]
                      text-[#999]
                      sm:text-[12px]
                    "
                  >
                    Order Type
                  </p>

                  <p
                    className="
                      mt-1
                      text-[14px]
                      font-medium
                      capitalize
                      text-[#555]
                      sm:text-[15px]
                    "
                  >
                    {checkoutInfo.orderType}
                  </p>
                </div>

                {/* COMPANY (IF PRESENT) */}
                {checkoutInfo.company && (
                  <div>
                    <p className="text-[11px] text-[#999] sm:text-[12px]">Company</p>
                    <p className="mt-1 text-[14px] font-medium text-[#555] sm:text-[15px]">
                      {checkoutInfo.company}
                    </p>
                  </div>
                )}

              </div>

              {/* DELIVERY ADDRESS */}

              {checkoutInfo.orderType ===
                "delivery" && (
                <div
                  className="
                    mt-5
                    border-t
                    border-[#e6e6e6]
                    pt-5
                  "
                >

                  <p
                    className="
                      text-[11px]
                      text-[#999]
                      sm:text-[12px]
                    "
                  >
                    Delivery Address
                  </p>

                  <p
                    className="
                      mt-1
                      text-[14px]
                      font-medium
                      text-[#555]
                      sm:text-[15px]
                    "
                  >
                    {checkoutInfo.street || "—"}

                    {checkoutInfo.floor
                      ? `, ${checkoutInfo.floor}`
                      : ""}

                    {checkoutInfo.postcode
                      ? `, ${checkoutInfo.postcode}`
                      : ""}
                  </p>

                </div>
              )}

              {/* PICKUP LOCATION */}

              {checkoutInfo.orderType ===
                "pickup" && (
                <div
                  className="
                    mt-5
                    border-t
                    border-[#e6e6e6]
                    pt-5
                  "
                >

                  <p
                    className="
                      text-[11px]
                      text-[#999]
                      sm:text-[12px]
                    "
                  >
                    Collection Location
                  </p>

                  <p
                    className="
                      mt-1
                      text-[14px]
                      font-medium
                      text-[#555]
                      sm:text-[15px]
                    "
                  >
                    49 Kilmarnock Road, Glasgow
                  </p>

                </div>
              )}

              {/* ORDER TIME */}

              <div
                className="
                  mt-5
                  border-t
                  border-[#e6e6e6]
                  pt-5
                "
              >

                <p
                  className="
                    text-[11px]
                    text-[#999]
                    sm:text-[12px]
                  "
                >
                  Order Time
                </p>

                <p
                  className="
                    mt-1
                    text-[14px]
                    font-medium
                    text-[#555]
                    sm:text-[15px]
                  "
                >
                  {checkoutInfo.orderTime ===
                  "asap"
                    ? `ASAP · ${checkoutInfo.time}`
                    : `Scheduled · ${checkoutInfo.time}`}
                </p>

              </div>

              {/* OPTIONAL INSTRUCTIONS */}
              {(checkoutInfo.orderInstructions || checkoutInfo.deliveryNotes) && (
                <div className="mt-5 border-t border-[#e6e6e6] pt-5">
                  {checkoutInfo.orderInstructions && (
                    <div className="mb-3">
                      <p className="text-[11px] text-[#999] sm:text-[12px]">Order Instructions</p>
                      <p className="mt-1 text-[14px] font-medium text-[#555] sm:text-[15px]">{checkoutInfo.orderInstructions}</p>
                    </div>
                  )}
                  {checkoutInfo.deliveryNotes && (
                    <div>
                      <p className="text-[11px] text-[#999] sm:text-[12px]">Delivery Notes</p>
                      <p className="mt-1 text-[14px] font-medium text-[#555] sm:text-[15px]">{checkoutInfo.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* =================================================
                CASH ON DELIVERY
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                handlePaymentChange("cash")
              }
              className={`
                mt-5
                w-full
                rounded-[9px]
                border
                p-5
                text-left
                transition-all
                sm:p-6
                ${
                  paymentMethod === "cash"
                    ? "border-[#ff542d] bg-[#fffdfc]"
                    : "border-[#dedede] bg-white"
                }
              `}
            >

              <div className="flex items-start gap-3">

                {/* RADIO */}

                <span
                  className={`
                    mt-[3px]
                    flex
                    h-[17px]
                    w-[17px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    ${
                      paymentMethod === "cash"
                        ? "border-[#ff542d]"
                        : "border-[#aaa]"
                    }
                  `}
                >
                  {paymentMethod === "cash" && (
                    <span
                      className="
                        h-[8px]
                        w-[8px]
                        rounded-full
                        bg-[#ff542d]
                      "
                    />
                  )}
                </span>

                <div>

                  <p
                    className="
                      text-[14px]
                      font-bold
                      text-[#333]
                      sm:text-[15px]
                    "
                  >
                    {checkoutInfo.orderType === "pickup" ? "Cash on Collection" : "Cash on Delivery"}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      text-[#888]
                      sm:text-[13px]
                    "
                  >
                    {checkoutInfo.orderType === "pickup" 
                      ? "Pay with cash when you collect your order." 
                      : "Pay with cash when your order arrives."}
                  </p>

                </div>

              </div>

            </button>

            {/* =================================================
                CARD PAYMENT
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                handlePaymentChange("card")
              }
              className={`
                mt-3
                w-full
                rounded-[9px]
                border
                p-5
                text-left
                transition-all
                sm:p-6
                ${
                  paymentMethod === "card"
                    ? "border-[#ff542d] bg-[#fffdfc]"
                    : "border-[#dedede] bg-white"
                }
              `}
            >

              <div className="flex items-start gap-3">

                {/* RADIO */}

                <span
                  className={`
                    mt-[3px]
                    flex
                    h-[17px]
                    w-[17px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    ${
                      paymentMethod === "card"
                        ? "border-[#ff542d]"
                        : "border-[#aaa]"
                    }
                  `}
                >
                  {paymentMethod === "card" && (
                    <span
                      className="
                        h-[8px]
                        w-[8px]
                        rounded-full
                        bg-[#ff542d]
                      "
                    />
                  )}
                </span>

                <div>

                  <p
                    className="
                      text-[14px]
                      font-bold
                      text-[#333]
                      sm:text-[15px]
                    "
                  >
                    Card Payment
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      text-[#888]
                      sm:text-[13px]
                    "
                  >
                    Pay securely using your card.
                  </p>

                </div>

              </div>

            </button>

            {/* =================================================
                CARD DETAILS
            ================================================== */}

            {paymentMethod === "card" && (
              <div
                className="
                  mt-5
                  border-t
                  border-[#eeeeee]
                  pt-5
                "
              >

                <div className="flex items-center gap-2">

                  <span
                    className="
                      text-[15px]
                      text-[#777]
                    "
                  >
                    🔒
                  </span>

                  <p
                    className="
                      text-[14px]
                      font-bold
                      text-[#555]
                      sm:text-[15px]
                    "
                  >
                    Secure card payment
                  </p>

                </div>

                <div className="mt-4 space-y-4">

                  {/* CARD NUMBER */}

                  <label className="block">

                    <span
                      className="
                        mb-1.5
                        block
                        text-[11px]
                        font-medium
                        text-[#777]
                        sm:text-[12px]
                      "
                    >
                      Card Number *
                    </span>

                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(event) =>
                        setCardNumber(
                          event.target.value
                        )
                      }
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19}
                      className="
                        h-[46px]
                        w-full
                        rounded-[8px]
                        bg-[#f3f3f3]
                        px-3
                        text-[12px]
                        text-[#444]
                        outline-none
                        placeholder:text-[#a9a9a9]
                        focus:ring-1
                        focus:ring-[#ff542d]
                        sm:text-[13px]
                      "
                    />

                  </label>

                  {/* NAME ON CARD */}

                  <label className="block">

                    <span
                      className="
                        mb-1.5
                        block
                        text-[11px]
                        font-medium
                        text-[#777]
                        sm:text-[12px]
                      "
                    >
                      Name on Card *
                    </span>

                    <input
                      type="text"
                      value={nameOnCard}
                      onChange={(event) =>
                        setNameOnCard(
                          event.target.value
                        )
                      }
                      placeholder="Full name as it appears on the card"
                      autoComplete="cc-name"
                      className="
                        h-[46px]
                        w-full
                        rounded-[8px]
                        bg-[#f3f3f3]
                        px-3
                        text-[12px]
                        text-[#444]
                        outline-none
                        placeholder:text-[#a9a9a9]
                        focus:ring-1
                        focus:ring-[#ff542d]
                        sm:text-[13px]
                      "
                    />

                  </label>

                  {/* EXPIRY + CVV */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >

                    <label className="block">

                      <span
                        className="
                          mb-1.5
                          block
                          text-[11px]
                          font-medium
                          text-[#777]
                          sm:text-[12px]
                        "
                      >
                        Expiry Date *
                      </span>

                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(event) =>
                          setExpiryDate(
                            event.target.value
                          )
                        }
                        placeholder="MM / YY"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        maxLength={7}
                        className="
                          h-[46px]
                          w-full
                          rounded-[8px]
                          bg-[#f3f3f3]
                          px-3
                          text-[12px]
                          text-[#444]
                          outline-none
                          placeholder:text-[#a9a9a9]
                          focus:ring-1
                          focus:ring-[#ff542d]
                          sm:text-[13px]
                        "
                      />

                    </label>

                    <label className="block">

                      <span
                        className="
                          mb-1.5
                          block
                          text-[11px]
                          font-medium
                          text-[#777]
                          sm:text-[12px]
                        "
                      >
                        CVV *
                      </span>

                      <input
                        type="password"
                        value={cvv}
                        onChange={(event) =>
                          setCvv(
                            event.target.value
                          )
                        }
                        placeholder="123"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={4}
                        className="
                          h-[46px]
                          w-full
                          rounded-[8px]
                          bg-[#f3f3f3]
                          px-3
                          text-[12px]
                          text-[#444]
                          outline-none
                          placeholder:text-[#a9a9a9]
                          focus:ring-1
                          focus:ring-[#ff542d]
                          sm:text-[13px]
                        "
                      />

                    </label>

                  </div>

                  {/* SAVE CARD */}

                  <label
                    className="
                      flex
                      items-center
                      gap-2
                      pt-1
                    "
                  >

                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(event) =>
                        setSaveCard(
                          event.target.checked
                        )
                      }
                      className="
                        h-4
                        w-4
                        accent-[#ff542d]
                      "
                    />

                    <span
                      className="
                        text-[11px]
                        text-[#555]
                        sm:text-[12px]
                      "
                    >
                      Save card for future
                      payments
                    </span>

                  </label>

                </div>
              </div>
            )}

            {/* =================================================
                CONTINUE / CONFIRM
            ================================================== */}

            <button
              type="button"
              onClick={handleConfirm}
              className="
                mt-6
                h-[46px]
                w-full
                rounded-full
                bg-[#ff542d]
                text-[12px]
                font-bold
                text-white
                transition-all
                duration-200
                hover:bg-[#e94724]
                hover:shadow-md
                sm:h-[48px]
                sm:text-[13px]
              "
            >
              {paymentMethod === "card"
                ? "Confirm and Pay"
                : "Continue"}
            </button>

            <p
              className="
                mt-4
                text-center
                text-[10px]
                text-[#aaa]
                sm:text-[11px]
              "
            >
              By placing this order you agree
              to our{" "}

              <span className="underline">
                terms and conditions
              </span>
              .
            </p>

          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================== */}

          <aside
            className="
              h-fit
              rounded-[10px]
              bg-white
              p-5
              shadow-[0_2px_12px_rgba(0,0,0,0.07)]
              sm:p-6
              lg:sticky
              lg:top-4
            "
          >

            <h2
              className="
                text-[18px]
                font-semibold
                text-[#292929]
                sm:text-[19px]
              "
            >
              Order Summary
            </h2>

            {/* PRODUCTS */}

            <div className="mt-5 space-y-4">

              {cartItems.length > 0 ? (
                cartItems.map(
                  (item, index) => {

                    const itemPrice =
                      Number.parseFloat(
                        String(item.price).replace(
                          /[^0-9.]/g,
                          ""
                        )
                      );

                    const quantity =
                      Number.isFinite(
                        item.quantity
                      )
                        ? item.quantity
                        : 0;

                    const image =
                      item.image ||
                      item.imageUrl ||
                      item.img;

                    const lineTotal =
                      (Number.isFinite(
                        itemPrice
                      )
                        ? itemPrice
                        : 0) * quantity;

                    return (
                      <div
                        key={`${item.name}-${index}`}
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        {/* IMAGE */}

                        <div
                          className="
                            h-[58px]
                            w-[58px]
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

                        {/* NAME */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <p
                            className="
                              truncate
                              text-[13px]
                              font-semibold
                              text-[#292929]
                              sm:text-[14px]
                            "
                          >
                            {item.name}
                          </p>

                          <p
                            className="
                              mt-1
                              text-[11px]
                              text-[#888]
                              sm:text-[12px]
                            "
                          >
                            × {quantity}
                          </p>

                        </div>

                        {/* PRICE */}

                        <p
                          className="
                            shrink-0
                            text-[13px]
                            font-semibold
                            text-[#292929]
                            sm:text-[14px]
                          "
                        >
                          £{lineTotal.toFixed(2)}
                        </p>

                      </div>
                    );
                  }
                )
              ) : (
                <p
                  className="
                    py-2
                    text-[12px]
                    text-[#888]
                    sm:text-[13px]
                  "
                >
                  Your cart is empty.
                </p>
              )}

            </div>

            {/* DIVIDER */}

            <div className="my-5 h-px bg-[#eeeeee]" />

            {/* PRICE DETAILS */}

            <div className="space-y-3.5">

              {/* SUBTOTAL */}

              <div
                className="
                  flex
                  justify-between
                  text-[12px]
                  text-[#777]
                  sm:text-[13px]
                "
              >
                <span>
                  Subtotal
                </span>

                <span>
                  £{subtotal.toFixed(2)}
                </span>
              </div>

              {/* DELIVERY */}

              <div
                className="
                  flex
                  justify-between
                  text-[12px]
                  text-[#777]
                  sm:text-[13px]
                "
              >

                <span>
                  {checkoutInfo.orderType ===
                  "delivery"
                    ? "Standard delivery"
                    : "Pick-up"}
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
                  text-[12px]
                  text-[#777]
                  sm:text-[13px]
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
                  text-[12px]
                  text-[#777]
                  sm:text-[13px]
                "
              >

                <span>
                  Bag charges
                </span>

                <span>
                  £{bagCharge.toFixed(2)}
                </span>

              </div>

              {/* TIP */}

              {tipAmount > 0 && (
                <div
                  className="
                    flex
                    justify-between
                    text-[12px]
                    text-[#777]
                    sm:text-[13px]
                  "
                >
                  <span>
                    Tip
                  </span>

                  <span>
                    £{tipAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* WALLET */}

              {walletAmount > 0 && (
                <div
                  className="
                    flex
                    justify-between
                    text-[12px]
                    text-[#777]
                    sm:text-[13px]
                  "
                >
                  <span>
                    Wallet
                  </span>

                  <span className="text-[#ff542d]">
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
                    text-[12px]
                    font-semibold
                    text-[#10b981]
                    sm:text-[13px]
                  "
                >
                  <span>
                    Coupon ({couponCode || "Applied"})
                  </span>

                  <span>
                    -£{couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

            </div>

            {/* DIVIDER */}

            <div className="my-5 h-px bg-[#eeeeee]" />

            {/* TOTAL */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[14px]
                    font-semibold
                    sm:text-[15px]
                  "
                >
                  Total
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-[#aaa]
                    sm:text-[11px]
                  "
                >
                  Incl. fees and tax
                </p>

              </div>

              <p
                className="
                  text-[20px]
                  font-semibold
                  text-[#ff542d]
                  sm:text-[21px]
                "
              >
                £{total.toFixed(2)}
              </p>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}