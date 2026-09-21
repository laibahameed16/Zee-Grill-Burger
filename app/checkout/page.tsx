"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import {
  showNotification,
  addPersistentNotification,
} from "@/lib/notifications";
import Navbar from "@/components/home/Navbar";

type OrderType = "delivery" | "pickup";
type OrderTime = "asap" | "schedule";

type CartItem = {
  name: string;
  description: string;
  price: string;
  badge: "POPULAR" | "RECOMMENDED";
  quantity: number;
  image?: string;
  imageUrl?: string;
  img?: string;
  size?: "Small" | "Medium" | "Large";
  extraHotChilli?: boolean;
};

/* =====================================================
   PRICE HELPERS
===================================================== */

const getBasePrice = (price: string | number) => {
  const parsedPrice = Number.parseFloat(
    String(price).replace(/[^0-9.]/g, "")
  );

  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
};

const getSizePrice = (
  size?: "Small" | "Medium" | "Large"
) => {
  switch (size) {
    case "Medium":
      return 1;
    case "Large":
      return 2;
    case "Small":
    default:
      return 0;
  }
};

const getExtraHotChilliPrice = (
  extraHotChilli?: boolean
) => {
  return extraHotChilli ? 0.5 : 0;
};

const getUnitPrice = (item: CartItem) => {
  const basePrice = getBasePrice(item.price);
  const sizePrice = getSizePrice(item.size);
  const extraHotChilliPrice =
    getExtraHotChilliPrice(item.extraHotChilli);

  return (
    basePrice +
    sizePrice +
    extraHotChilliPrice
  );
};

const getLineTotal = (item: CartItem) => {
  return getUnitPrice(item) * item.quantity;
};

export default function CheckoutPage() {
  const [orderType, setOrderType] =
    useState<OrderType>("delivery");

  const [orderTime, setOrderTime] =
    useState<OrderTime>("asap");

  const [time, setTime] = useState("17:00");
  const [scheduledDate, setScheduledDate] =
    useState(() => new Date().toISOString().slice(0, 10));

  // Custom clock picker state
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [clockHour, setClockHour] = useState(5);
  const [clockMinute, setClockMinute] = useState(0);
  const [clockAmPm, setClockAmPm] = useState<"AM" | "PM">("PM");
  const [coupon, setCoupon] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] =
    useState("");
  const [couponDiscount, setCouponDiscount] =
    useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [street, setStreet] = useState("");
  const [floor, setFloor] = useState("");
  const [postcode, setPostcode] = useState("");
  const [company, setCompany] = useState("");
  const [orderInstructions, setOrderInstructions] =
    useState("");
  const [deliveryNotes, setDeliveryNotes] =
    useState("");

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [savedAddresses, setSavedAddresses] =
    useState<any[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const [isManualAddress, setIsManualAddress] =
    useState(false);

  const [cutlery, setCutlery] =
    useState<boolean>(false);

  /* =====================================================
      TIP
  ====================================================== */

  const [tip, setTip] = useState<number>(0);

  const [isOtherTip, setIsOtherTip] =
    useState<boolean>(false);

  const [otherTip, setOtherTip] =
    useState<string>("");

  /* =====================================================
      WALLET
  ====================================================== */

  const [walletBalance, setWalletBalance] =
    useState<number>(0);

  const [walletAmount, setWalletAmount] =
    useState<number>(0);

  const [isOtherWallet, setIsOtherWallet] =
    useState<boolean>(false);

  const [otherWalletAmount, setOtherWalletAmount] =
    useState<string>("");

  /* =====================================================
      LOAD USER + CART + SAVED ADDRESSES + WALLET
  ====================================================== */

  useEffect(() => {
    try {
      const storedAddrs = localStorage.getItem(
        "zee-grill-saved-addresses"
      );

      if (storedAddrs) {
        const parsed = JSON.parse(storedAddrs);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          setSavedAddresses(parsed);
        }
      } else {
        const single =
          localStorage.getItem("savedAddress");

        if (single) {
          const parsed = JSON.parse(single);

          if (
            parsed &&
            typeof parsed === "object" &&
            parsed.address
          ) {
            setSavedAddresses([
              {
                id: "addr-legacy",
                contactName:
                  parsed.contactName || "",
                contactPhone:
                  parsed.contactPhone || "",
                address:
                  parsed.address || "",
                type:
                  parsed.type || "Home",
                house:
                  parsed.house || "",
                floor:
                  parsed.floor || "",
                road:
                  parsed.road || "",
              },
            ]);
          }
        }
      }
    } catch {
      setSavedAddresses([]);
    }

    /* =================================================
        LOAD CART
    ================================================= */

    try {
      const savedCart = JSON.parse(
        localStorage.getItem(
          "zee-grill-cart"
        ) || "[]"
      );

      setCartItems(
        Array.isArray(savedCart)
          ? savedCart
          : []
      );
    } catch {
      setCartItems([]);
    }

    /* =================================================
        LOAD USER
    ================================================= */

    try {
      const savedUser =
        localStorage.getItem(
          "zee-grill-user"
        );

      if (!savedUser) return;

      const user = JSON.parse(savedUser);

      if (
        user &&
        typeof user === "object"
      ) {
        if (user.firstName) {
          setFirstName(
            String(user.firstName)
          );
        }

        if (user.lastName) {
          setLastName(
            String(user.lastName)
          );
        }

        if (user.phone) {
          setPhone(
            String(user.phone)
          );
        }

        if (
          !user.firstName &&
          user.name
        ) {
          const nameParts =
            String(user.name)
              .trim()
              .split(/\s+/);

          setFirstName(
            nameParts[0] || ""
          );

          setLastName(
            nameParts
              .slice(1)
              .join(" ")
          );
        }
      }
    } catch {
      // Keep fields empty
    }

    /* =================================================
        LOAD WALLET BALANCE
    ================================================= */

    try {
      const possibleWalletKeys = [
        "zee-grill-wallet-balance",
        "walletBalance",
        "wallet-balance",
      ];

      let foundBalance = 0;

      for (const key of possibleWalletKeys) {
        const storedWallet =
          localStorage.getItem(key);

        if (storedWallet !== null) {
          const parsedWallet =
            JSON.parse(storedWallet);

          if (
            typeof parsedWallet === "number"
          ) {
            foundBalance = parsedWallet;
            break;
          }

          if (
            typeof parsedWallet === "string"
          ) {
            const numericValue =
              Number.parseFloat(
                parsedWallet.replace(
                  /[^0-9.]/g,
                  ""
                )
              );

            if (
              Number.isFinite(
                numericValue
              )
            ) {
              foundBalance =
                numericValue;
              break;
            }
          }

          if (
            parsedWallet &&
            typeof parsedWallet === "object"
          ) {
            const possibleBalance =
              parsedWallet.balance ??
              parsedWallet.amount ??
              parsedWallet.walletBalance;

            const numericValue =
              Number.parseFloat(
                String(
                  possibleBalance ?? 0
                ).replace(
                  /[^0-9.]/g,
                  ""
                )
              );

            if (
              Number.isFinite(
                numericValue
              )
            ) {
              foundBalance =
                numericValue;
              break;
            }
          }
        }
      }

      setWalletBalance(
        Math.max(
          0,
          foundBalance
        )
      );
    } catch {
      setWalletBalance(0);
    }
  }, []);

  /* =====================================================
      PRICE
  ====================================================== */

  /*
    IMPORTANT:
    Subtotal ab EXACTLY wahi calculation use karta hai
    jo products ke saamne line price ke liye use hoti hai.
  */

  const subtotal = cartItems.reduce(
    (sum, item) => {
      return (
        sum +
        getLineTotal(item)
      );
    },
    0
  );

  const deliveryFee =
    orderType === "delivery"
      ? 3.99
      : 0;

  const serviceFee = 1.99;
  const bagCharge = 0.29;

  /* =====================================================
      OTHER TIP AMOUNT
  ====================================================== */

  const parsedOtherTip =
    Number.parseFloat(
      otherTip
    );

  const selectedTip =
    isOtherTip
      ? Number.isFinite(
          parsedOtherTip
        ) &&
        parsedOtherTip >= 0
        ? parsedOtherTip
        : 0
      : tip;

  /* =====================================================
      WALLET MAXIMUM
  ====================================================== */

  const maxWalletUsable =
    Math.min(
      walletBalance,
      subtotal +
        deliveryFee +
        serviceFee +
        bagCharge +
        selectedTip
    );

  /* =====================================================
      OTHER WALLET AMOUNT
  ====================================================== */

  const parsedOtherWallet =
    Number.parseFloat(
      otherWalletAmount
    );

  const selectedWalletAmount =
    isOtherWallet
      ? Number.isFinite(
          parsedOtherWallet
        ) &&
        parsedOtherWallet >= 0
        ? Math.min(
            parsedOtherWallet,
            maxWalletUsable
          )
        : 0
      : Math.min(
          walletAmount,
          maxWalletUsable
        );

  const totalBillBeforeCouponAndWallet =
    subtotal +
    deliveryFee +
    serviceFee +
    bagCharge +
    selectedTip;

  const isFullWalletPayment =
    totalBillBeforeCouponAndWallet >
      0 &&
    selectedWalletAmount >=
      totalBillBeforeCouponAndWallet -
        0.01;

  const total =
    subtotal +
    deliveryFee +
    serviceFee +
    bagCharge +
    selectedTip -
    selectedWalletAmount -
    couponDiscount;

  /* =====================================================
      COUPON
  ====================================================== */

  const VALID_COUPONS: Record<
    string,
    {
      discount: number;
      label: string;
    }
  > = {
    SAVE10: {
      discount: 0.1,
      label: "10%",
    },
    ZEEGRILL10: {
      discount: 0.1,
      label: "10%",
    },
    WELCOME10: {
      discount: 0.1,
      label: "10%",
    },
    SAVE15: {
      discount: 0.15,
      label: "15%",
    },
    ZEEGRILL15: {
      discount: 0.15,
      label: "15%",
    },
    WELCOME15: {
      discount: 0.15,
      label: "15%",
    },
    SAVE20: {
      discount: 0.2,
      label: "20%",
    },
  };

  const handleApplyCoupon = () => {
    const code =
      coupon.trim().toUpperCase();

    if (!code) {
      showNotification(
        "error",
        "Please enter a coupon code."
      );
      return;
    }

    if (
      isFullWalletPayment ||
      selectedWalletAmount >=
        totalBillBeforeCouponAndWallet
    ) {
      showNotification(
        "error",
        "Coupon cannot be applied when paying full bill with wallet."
      );
      return;
    }

    if (appliedCouponCode) {
      showNotification(
        "error",
        `Coupon "${appliedCouponCode}" is already applied.`
      );
      return;
    }

    if (subtotal < 1) {
      showNotification(
        "error",
        "Coupon requires items in your cart."
      );
      return;
    }

    let couponData =
      VALID_COUPONS[code];

    if (!couponData) {
      const match =
        code.match(
          /(10|15|20|25|30|50)/
        );

      if (match) {
        const pct =
          parseInt(
            match[1],
            10
          );

        couponData = {
          discount: pct / 100,
          label: `${pct}%`,
        };
      }
    }

    if (!couponData) {
      showNotification(
        "error",
        `Coupon code "${code}" is not valid.`
      );
      return;
    }

    const discountAmount =
      parseFloat(
        (
          totalBillBeforeCouponAndWallet *
          couponData.discount
        ).toFixed(2)
      );

    setAppliedCouponCode(code);
    setCouponDiscount(
      discountAmount
    );
    setCoupon("");

    showNotification(
      "success",
      `${couponData.label} discount apply on your total bill`
    );

    addPersistentNotification(
      `Coupon Applied! 🎟️`,
      `${couponData.label} discount apply on your total bill. You saved £${discountAmount.toFixed(
        2
      )}.`,
      "coupon"
    );
  };

  /* =====================================================
      SAVED ADDRESS SELECTION
  ====================================================== */

  const handleSelectSavedAddress = (
    addr: any
  ) => {
    setSelectedAddressId(
      addr.id
    );

    setIsManualAddress(false);

    const streetLine = [
      addr.house,
      addr.road,
    ]
      .filter(Boolean)
      .join(", ");

    setStreet(
      streetLine ||
        addr.address ||
        ""
    );

    let floorVal =
      addr.floor || "";

    if (
      addr.address &&
      !streetLine.includes(
        addr.address
      )
    ) {
      floorVal = floorVal
        ? `${floorVal}, ${addr.address}`
        : addr.address;
    }

    setFloor(floorVal);

    if (
      addr.contactPhone &&
      !phone
    ) {
      setPhone(
        addr.contactPhone
      );
    }

    if (addr.contactName) {
      const parts =
        String(
          addr.contactName
        )
          .trim()
          .split(/\s+/);

      setFirstName(
        parts[0] || ""
      );

      setLastName(
        parts
          .slice(1)
          .join(" ") || ""
      );
    }

    if (addr.postcode) {
      setPostcode(
        addr.postcode
      );
    }

    if (addr.company) {
      setCompany(
        addr.company
      );
    }
  };

  const handleClearAddressForManual =
    () => {
      setSelectedAddressId(null);
      setIsManualAddress(true);
      setStreet("");
      setFloor("");
      setPostcode("");
      setDeliveryNotes("");
    };

  /* =====================================================
      PROCEED TO PAYMENT
  ====================================================== */

  const handleProceedToPayment = (
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    /* =================================================
        EMPTY CART CHECK
    ================================================= */

    if (cartItems.length === 0) {
      event.preventDefault();

      showNotification(
        "error",
        "Your cart is empty. Please add items before placing an order."
      );

      return;
    }

    const normalizedPhone =
      phone
        .replace(
          /[\s()-]/g,
          ""
        )
        .trim();

    const isValidUKPhone =
      /^\+447\d{9}$/.test(
        normalizedPhone
      );

    const requiredFields = [
      firstName,
      lastName,
      phone,
      ...(orderType ===
      "delivery"
        ? [
            street,
            postcode,
          ]
        : []),
    ];

    const allRequiredFieldsFilled =
      requiredFields.every(
        (field) =>
          field.trim().length >
          0
      );

    if (
      !allRequiredFieldsFilled
    ) {
      event.preventDefault();

      showNotification(
        "error",
        "Please fill in all required fields before proceeding to payment."
      );

      return;
    }

    if (!isValidUKPhone) {
      event.preventDefault();

      showNotification(
        "error",
        "Please enter valid details (Valid UK phone number required)."
      );

      return;
    }

    if (
      orderType ===
      "delivery"
    ) {
      const isValidUKPostcode =
        /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(
          postcode.trim()
        );

      if (
        !isValidUKPostcode
      ) {
        event.preventDefault();

        showNotification(
          "error",
          "Please enter valid details (Valid UK postcode required)."
        );

        return;
      }

      const fullCheckoutAddr =
        `${street} ${company} ${deliveryNotes} ${floor}`.toLowerCase();

      const isStrictUKAddress =
        /(uk|united kingdom|england|scotland|wales|northern ireland|britain|gb|great britain|london|manchester|birmingham|liverpool|glasgow|edinburgh|leeds|sheffield|bristol)/i.test(
          fullCheckoutAddr
        );

      if (
        !isStrictUKAddress
      ) {
        event.preventDefault();

        showNotification(
          "error",
          "Please enter valid details (Address must be in the UK)."
        );

        return;
      }
    }

    /* =================================================
        SAVE CHECKOUT INFORMATION
    ================================================= */

    localStorage.setItem(
      "zee-grill-checkout-info",
      JSON.stringify({
        firstName,
        lastName,
        phone,
        street,
        floor,
        postcode,
        company,
        orderInstructions,
        deliveryNotes,
        orderType,
        orderTime,
        time,
        cutlery:
          cutlery
            ? "Yes"
            : "No",
        tip: selectedTip,
        walletAmount:
          selectedWalletAmount,
        walletBalance,
        couponCode:
          appliedCouponCode,
        couponDiscount,
        subtotal,
        deliveryFee,
        serviceFee,
        bagCharge,
        total,
      })
    );

    /* =================================================
        MARK CHECKOUT AS COMPLETED
    ================================================= */

    localStorage.setItem(
      "zee-grill-checkout-completed",
      "true"
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      {/* =====================================================
          STEPS
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
              relative
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
            <span>
              Checkout
            </span>
          </div>

          {/* PAYMENT */}

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
              Payment
            </span>
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
          PAGE HEADER
      ====================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1150px]
          px-5
          pt-7
          sm:px-8
          md:px-10
          lg:px-0
        "
      >
        <p
          className="
            text-[12px]
            font-bold
            uppercase
            tracking-[2px]
            text-[#ff542d]
            sm:text-[13px]
          "
        >
          CHECKOUT
        </p>

        <h1
          className="
            mt-2
            text-[34px]
            font-extrabold
            leading-tight
            text-[#292929]
            sm:text-[40px]
            lg:text-[44px]
          "
        >
          Complete Your Order
        </h1>

        <p
          className="
            mt-2
            text-[14px]
            text-[#777]
            sm:text-[15px]
          "
        >
          Enter your details and choose how you would
          like to receive your order.
        </p>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1150px]
          flex-col
          gap-4
          px-5
          pb-10
          pt-6
          sm:px-8
          md:px-10
          lg:px-0
          lg:flex-row
          lg:items-start
          lg:gap-4
          xl:gap-5
        "
      >

        {/* ===================================================
            LEFT SIDE
        ==================================================== */}

        <div
          className="
            min-w-0
            flex-1
            space-y-4
          "
        >

          {/* =================================================
              YOUR INFORMATION
          ================================================== */}

          <section
            className="
              w-full
              rounded-[14px]
              bg-white
              p-4
              shadow-[0_2px_12px_rgba(0,0,0,0.07)]
              sm:p-5
            "
          >

            <div
              className="
                mb-4
                flex
                items-center
                gap-4
              "
            >

              <h2
                className="
                  text-[20px]
                  font-bold
                  text-[#292929]
                  sm:text-[21px]
                "
              >
                Your Information
              </h2>

              

            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >

              {/* FIRST NAME */}

              <label
                className="
                  rounded-[9px]
                  bg-[#f3f3f3]
                  px-4
                  py-3
                "
              >
                <span
                  className="
                    block
                    text-[11px]
                    text-[#888]
                  "
                >
                  First Name
                </span>

                <input
                  type="text"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(
                      e.target.value
                    )
                  }
                  className="
                    mt-1
                    w-full
                    bg-transparent
                    text-[15px]
                    text-[#444]
                    outline-none
                  "
                />
              </label>

              {/* LAST NAME */}

              <label
                className="
                  rounded-[9px]
                  bg-[#f3f3f3]
                  px-4
                  py-3
                "
              >
                <span
                  className="
                    block
                    text-[11px]
                    text-[#888]
                  "
                >
                  Last Name
                </span>

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(
                      e.target.value
                    )
                  }
                  className="
                    mt-1
                    w-full
                    bg-transparent
                    text-[15px]
                    text-[#444]
                    outline-none
                  "
                />
              </label>

              {/* PHONE */}

              <label
                className="
                  rounded-[9px]
                  bg-[#f3f3f3]
                  px-4
                  py-3
                  sm:col-span-2
                "
              >
                <span
                  className="
                    block
                    text-[11px]
                    text-[#888]
                  "
                >
                  Phone Number
                </span>

                <input
                  type="tel"
                  value={phone}
                  placeholder="+447XXXXXXXXX"
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9+]/g, "");
                    if (val && !val.startsWith("+")) val = "+" + val;
                    if (val.startsWith("+") && !val.startsWith("+447") && val.length > 1) {
                      val = "+447" + val.replace(/^\+/, "").replace(/^447/, "");
                    }
                    if (!val.startsWith("+447") && val !== "" && val !== "+" && val !== "+4" && val !== "+44") {
                      val = "+447" + val.replace(/^\+4{0,2}7?/, "");
                    }
                    setPhone(val);
                  }}
                  className="
                    mt-1
                    w-full
                    bg-transparent
                    text-[15px]
                    text-[#444]
                    outline-none
                    placeholder:text-[#bbb]
                  "
                />
              </label>

            </div>
          </section>

          {/* =================================================
              DELIVERY / PICKUP
          ================================================== */}

          <section
            className="
              w-full
              rounded-[14px]
              bg-white
              p-4
              shadow-[0_2px_12px_rgba(0,0,0,0.07)]
              sm:p-5
            "
          >

            <h2
              className="
                mb-4
                text-[20px]
                font-bold
                text-[#292929]
                sm:text-[21px]
              "
            >
              Delivery / Pick-up
            </h2>

            {/* TABS */}

            <div
              className="
                grid
                grid-cols-2
                gap-1
                rounded-[9px]
                bg-[#f3f3f3]
                p-1
              "
            >

              {/* DELIVERY */}

              <button
                type="button"
                onClick={() =>
                  setOrderType(
                    "delivery"
                  )
                }
                className={`
                  flex
                  h-[44px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[7px]
                  text-[14px]
                  font-medium
                  transition-all
                  duration-200
                  ${
                    orderType ===
                    "delivery"
                      ? "bg-[#ff542d] text-white shadow-sm"
                      : "text-[#666] hover:text-[#ff542d]"
                  }
                `}
              >

                <img
                  src="/images/cartpage/delivery.png"
                  alt="Delivery"
                  className="
                    h-[19px]
                    w-[19px]
                    object-contain
                  "
                  style={{
                    filter:
                      orderType ===
                      "delivery"
                        ? "brightness(0) invert(1)"
                        : "sepia(1) saturate(4) hue-rotate(345deg) brightness(0.55)",
                  }}
                />

                Delivery
              </button>

              {/* PICKUP */}

              <button
                type="button"
                onClick={() =>
                  setOrderType(
                    "pickup"
                  )
                }
                className={`
                  flex
                  h-[44px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[7px]
                  text-[14px]
                  font-medium
                  transition-all
                  duration-200
                  ${
                    orderType ===
                    "pickup"
                      ? "bg-[#ff542d] text-white shadow-sm"
                      : "text-[#666] hover:text-[#ff542d]"
                  }
                `}
              >

                <img
                  src="/images/cartpage/collection.png"
                  alt="Pick-up"
                  className={`
                    h-[18px]
                    w-[18px]
                    object-contain
                    ${
                      orderType ===
                      "pickup"
                        ? "brightness-0 invert"
                        : ""
                    }
                  `}
                />

                Pick-up
              </button>

            </div>

            {/* DELIVERY CONTENT */}

            {orderType ===
              "delivery" && (
              <div className="mt-4 space-y-3">

                {/* LOCATION */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-[8px]
                    bg-[#e9faf4]
                    px-4
                    py-3
                    text-[12px]
                    font-medium
                    text-[#14976c]
                  "
                >
                  <span className="text-[15px]">
                    📍
                  </span>

                  We deliver to this location
                </div>

                {/* SAVED ADDRESSES */}

                {savedAddresses.length >
                  0 && (
                  <div className="rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] p-4">

                    <div className="flex items-center justify-between">

                      <p className="text-[12px] font-bold text-[#292929]">
                        Choose from saved addresses (
                        {
                          savedAddresses.length
                        }
                        )
                      </p>

                      <Link
                        href="/saved-addresses"
                        className="text-[11px] font-medium text-[#ff542d] hover:underline"
                      >
                        + Add / Manage
                      </Link>

                    </div>

                    <div className="mt-3 space-y-2">

                      {savedAddresses.map(
                        (addr) => {
                          const isSelected =
                            selectedAddressId ===
                            addr.id;

                          return (
                            <div
                              key={addr.id}
                              onClick={() =>
                                handleSelectSavedAddress(
                                  addr
                                )
                              }
                              className={`
                                flex
                                cursor-pointer
                                items-start
                                gap-3
                                rounded-[10px]
                                border
                                p-3
                                transition-all
                                ${
                                  isSelected
                                    ? "border-[#ff542d] bg-[#fff6f3] shadow-xs"
                                    : "border-[#dedede] bg-white hover:border-[#bbb]"
                                }
                              `}
                            >

                              <div className="mt-0.5">
                                <span
                                  className={`
                                    flex
                                    h-4
                                    w-4
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    text-[9px]
                                    ${
                                      isSelected
                                        ? "border-[#ff542d] bg-[#ff542d] text-white font-bold"
                                        : "border-[#aaa] bg-white text-transparent"
                                    }
                                  `}
                                >
                                  ✓
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2">

                                  <span className="text-[12px] font-bold text-[#292929]">
                                    {addr.house
                                      ? `${addr.house}, `
                                      : ""}
                                    {
                                      addr.road
                                    }
                                  </span>

                                  <span
                                    className={`
                                      rounded-full
                                      px-2
                                      py-0.5
                                      text-[9px]
                                      font-semibold
                                      uppercase
                                      ${
                                        addr.type ===
                                        "Home"
                                          ? "bg-[#e8f8f0] text-[#14976c]"
                                          : addr.type ===
                                            "Work"
                                          ? "bg-[#edf5ff] text-[#2563eb]"
                                          : "bg-[#f5eefa] text-[#8b5cf6]"
                                      }
                                    `}
                                  >
                                    {addr.type ||
                                      "Address"}
                                  </span>

                                </div>

                                {addr.floor && (
                                  <p className="mt-0.5 text-[11px] text-[#666]">
                                    Floor:{" "}
                                    {
                                      addr.floor
                                    }
                                  </p>
                                )}

                                {addr.address && (
                                  <p className="mt-0.5 truncate text-[11px] text-[#777]">
                                    {
                                      addr.address
                                    }
                                  </p>
                                )}

                                <p className="mt-1 text-[10px] text-[#888]">
                                  {
                                    addr.contactName
                                  }{" "}
                                  ·{" "}
                                  {
                                    addr.contactPhone
                                  }
                                </p>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                    {/* MANUAL OPTION */}

                    <div className="mt-3 border-t border-[#eaeaea] pt-2.5">

                      <button
                        type="button"
                        onClick={
                          handleClearAddressForManual
                        }
                        className={`
                          flex
                          items-center
                          gap-1.5
                          text-[11px]
                          font-semibold
                          transition-colors
                          cursor-pointer
                          ${
                            isManualAddress
                              ? "text-[#ff542d]"
                              : "text-[#666] hover:text-[#ff542d]"
                          }
                        `}
                      >

                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[9px]">
                          {isManualAddress
                            ? "●"
                            : "+"}
                        </span>

                        Type address manually instead
                      </button>

                    </div>

                  </div>
                )}

                {/* STREET */}

                <label
                  className="
                    block
                    rounded-[9px]
                    bg-[#f3f3f3]
                    px-4
                    py-3
                  "
                >
                  <span
                    className="
                      block
                      text-[11px]
                      text-[#777]
                    "
                  >
                    Street name and number *
                  </span>

                  <input
                    type="text"
                    value={street}
                    onChange={(e) =>
                      setStreet(
                        e.target.value
                      )
                    }
                    placeholder="Enter street name and number"
                    className="
                      mt-1
                      w-full
                      bg-transparent
                      text-[15px]
                      text-[#444]
                      outline-none
                      placeholder:text-[#aaa]
                    "
                  />
                </label>

                {/* FLOOR + POSTCODE */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-3
                    sm:grid-cols-2
                  "
                >

                  <label
                    className="
                      rounded-[9px]
                      bg-[#f3f3f3]
                      px-4
                      py-3
                    "
                  >
                    <span
                      className="
                        block
                        text-[11px]
                        text-[#777]
                      "
                    >
                      Floor / apartment number
                    </span>

                    <input
                      type="text"
                      value={floor}
                      onChange={(e) =>
                        setFloor(
                          e.target.value
                        )
                      }
                      placeholder="Floor / apartment"
                      className="
                        mt-1
                        w-full
                        bg-transparent
                        text-[15px]
                        text-[#444]
                        outline-none
                        placeholder:text-[#aaa]
                      "
                    />
                  </label>

                  <label
                    className="
                      rounded-[9px]
                      bg-[#f3f3f3]
                      px-4
                      py-3
                    "
                  >
                    <span
                      className="
                        block
                        text-[11px]
                        text-[#777]
                      "
                    >
                      Postcode *
                    </span>

                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) =>
                        setPostcode(
                          e.target.value
                        )
                      }
                      placeholder="Enter postcode"
                      className="
                        mt-1
                        w-full
                        bg-transparent
                        text-[15px]
                        text-[#444]
                        outline-none
                        placeholder:text-[#aaa]
                      "
                    />
                  </label>

                </div>

                {/* COMPANY */}

                <label
                  className="
                    block
                    rounded-[9px]
                    bg-[#f3f3f3]
                    px-4
                    py-3
                  "
                >
                  <span
                    className="
                      block
                      text-[11px]
                      text-[#777]
                    "
                  >
                    Company name
                  </span>

                  <input
                    type="text"
                    value={company}
                    onChange={(e) =>
                      setCompany(
                        e.target.value
                      )
                    }
                    placeholder="Company Ltd"
                    className="
                      mt-1
                      w-full
                      bg-transparent
                      text-[15px]
                      text-[#444]
                      outline-none
                      placeholder:text-[#aaa]
                    "
                  />
                </label>

                {/* ORDER INSTRUCTIONS */}

                <label
                  className="
                    block
                    rounded-[9px]
                    bg-[#f3f3f3]
                    px-4
                    py-3
                  "
                >
                  <span
                    className="
                      block
                      text-[11px]
                      text-[#777]
                    "
                  >
                    Order instructions
                  </span>

                  <textarea
                    value={
                      orderInstructions
                    }
                    onChange={(e) =>
                      setOrderInstructions(
                        e.target.value.slice(
                          0,
                          500
                        )
                      )
                    }
                    placeholder="eg. Entrance through large dark gate..."
                    className="
                      mt-2
                      h-[70px]
                      w-full
                      resize-none
                      bg-transparent
                      text-[14px]
                      text-[#444]
                      outline-none
                      placeholder:text-[#aaa]
                    "
                  />

                  <p
                    className="
                      text-right
                      text-[10px]
                      text-[#aaa]
                    "
                  >
                    {
                      orderInstructions.length
                    }{" "}
                    / 500
                  </p>

                </label>

                {/* DELIVERY NOTES */}

                <label
                  className="
                    block
                    rounded-[9px]
                    bg-[#f3f3f3]
                    px-4
                    py-3
                  "
                >
                  <span
                    className="
                      block
                      text-[11px]
                      text-[#777]
                    "
                  >
                    Delivery notes
                  </span>

                  <textarea
                    value={
                      deliveryNotes
                    }
                    onChange={(e) =>
                      setDeliveryNotes(
                        e.target.value.slice(
                          0,
                          500
                        )
                      )
                    }
                    placeholder="Any additional notes for the delivery driver..."
                    className="
                      mt-2
                      h-[70px]
                      w-full
                      resize-none
                      bg-transparent
                      text-[14px]
                      text-[#444]
                      outline-none
                      placeholder:text-[#aaa]
                    "
                  />

                  <p
                    className="
                      text-right
                      text-[10px]
                      text-[#aaa]
                    "
                  >
                    {
                      deliveryNotes.length
                    }{" "}
                    / 500
                  </p>

                </label>

              </div>
            )}

            {/* PICKUP */}

            {orderType ===
              "pickup" && (
              <div
                className="
                  mt-4
                  rounded-[9px]
                  bg-[#f3f3f3]
                  p-4
                "
              >

                <p
                  className="
                    text-[13px]
                    font-bold
                    text-[#333]
                  "
                >
                  Collection address
                </p>

                <p
                  className="
                    mt-2
                    text-[15px]
                    leading-6
                    text-[#555]
                  "
                >
                  49 Kilmarnock Road, Shawlands,
                  Glasgow G41 3YN
                </p>

                <p
                  className="
                    mt-3
                    text-[11px]
                    text-[#888]
                  "
                >
                  Please bring your order confirmation
                  when collecting.
                </p>

              </div>
            )}

          </section>

          {/* =================================================
              WHEN
          ================================================== */}

          <section
            className="
              w-full
              rounded-[14px]
              bg-white
              p-4
              shadow-[0_2px_12px_rgba(0,0,0,0.07)]
              sm:p-5
            "
          >
            <h2
              className="
                mb-4
                text-[20px]
                font-bold
                text-[#292929]
                sm:text-[21px]
              "
            >
              When
            </h2>

            <div
              className="
                grid
                grid-cols-2
                gap-1
                rounded-[9px]
                bg-[#f3f3f3]
                p-1
              "
            >
              <button
                type="button"
                onClick={() => setOrderTime("asap")}
                className={`
                  h-[44px]
                  rounded-[7px]
                  text-[13px]
                  font-medium
                  transition-all
                  ${
                    orderTime === "asap"
                      ? "bg-[#ff542d] text-white"
                      : "text-[#666]"
                  }
                `}
              >
                ASAP
              </button>

              <button
                type="button"
                onClick={() => setOrderTime("schedule")}
                className={`
                  h-[44px]
                  rounded-[7px]
                  text-[13px]
                  font-medium
                  transition-all
                  ${
                    orderTime === "schedule"
                      ? "bg-[#ff542d] text-white"
                      : "text-[#666]"
                  }
                `}
              >
                Schedule for later
              </button>
            </div>

            <p
              className="
                mt-3
                text-[11px]
                text-[#888]
              "
            >
              Opens at 17:00. You can still schedule a future order.
            </p>

            {orderTime === "asap" ? null : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  className="
                    group
                    rounded-[18px]
                    border
                    border-[#f7c9b7]
                    bg-gradient-to-br
                    from-[#fffaf7]
                    to-[#fff0eb]
                    p-3
                    shadow-[0_10px_22px_rgba(255,84,45,0.08)]
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-[#ff9d7d]
                    hover:shadow-[0_12px_26px_rgba(255,84,45,0.12)]
                    focus-within:border-[#ff542d]
                    focus-within:ring-4
                    focus-within:ring-[#ff542d]/10
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-[#ffefe9] text-[20px] shadow-inner shadow-[#ffb9a7]/40">
                      📅
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#ff542d]">
                        Select date
                      </p>

                      <input
                        type="date"
                        value={scheduledDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="
                          mt-1
                          w-full
                          cursor-pointer
                          border-0
                          bg-transparent
                          p-0
                          text-[14px]
                          font-bold
                          text-[#2d2d2d]
                          outline-none
                          [color-scheme:light]
                          focus:ring-0
                        "
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="
                    relative
                    group
                    rounded-[18px]
                    border
                    border-[#f7c9b7]
                    bg-gradient-to-br
                    from-[#fffaf7]
                    to-[#fff0eb]
                    p-3
                    shadow-[0_10px_22px_rgba(255,84,45,0.08)]
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-[#ff9d7d]
                    hover:shadow-[0_12px_26px_rgba(255,84,45,0.12)]
                  "
                >
                  <div
                    onClick={() => setShowClockPicker(!showClockPicker)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowClockPicker(!showClockPicker);
                      }}
                      className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-[#ffefe9] text-[20px] shadow-inner shadow-[#ffb9a7]/40 transition-transform hover:scale-110 active:scale-95"
                    >
                      🕒
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#ff542d]">
                        Select time
                      </p>
                      <p className="mt-1 text-[14px] font-bold text-[#2d2d2d]">
                        {String(clockHour).padStart(2, "0")}:{String(clockMinute).padStart(2, "0")} {clockAmPm}
                      </p>
                    </div>
                  </div>

                  {/* Clock Picker Popup */}
                  {showClockPicker && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowClockPicker(false)}
                      />

                      {/* Clock Picker Card */}
                      <div className="absolute left-1/2 bottom-full z-50 mb-2 -translate-x-1/2 rounded-[20px] border border-[#ffd8cc] bg-white px-5 py-4 shadow-[0_16px_40px_rgba(255,84,45,0.18)] w-[240px]">

                        {/* Opening hours label */}
                        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[1.5px] text-[#ff542d]">
                          Opening Hours · 5:00 PM – 10:30 PM
                        </p>

                        {/* Hour / Minute selectors */}
                        <div className="flex items-center justify-center gap-3">

                          {/* Hour column */}
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setClockHour(h => h === 12 ? 1 : h + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#ff542d] transition hover:bg-[#ffefe9] active:scale-90 text-[18px] font-bold"
                            >
                              ∧
                            </button>
                            <span className="text-[28px] font-bold text-[#2d2d2d] w-[44px] text-center leading-none">
                              {String(clockHour).padStart(2, "0")}
                            </span>
                            <button
                              type="button"
                              onClick={() => setClockHour(h => h === 1 ? 12 : h - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#ff542d] transition hover:bg-[#ffefe9] active:scale-90 text-[18px] font-bold"
                            >
                              ∨
                            </button>
                          </div>

                          <span className="text-[28px] font-bold text-[#ff542d] leading-none pb-1">:</span>

                          {/* Minute column */}
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setClockMinute(m => m === 55 ? 0 : m + 5)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#ff542d] transition hover:bg-[#ffefe9] active:scale-90 text-[18px] font-bold"
                            >
                              ∧
                            </button>
                            <span className="text-[28px] font-bold text-[#2d2d2d] w-[44px] text-center leading-none">
                              {String(clockMinute).padStart(2, "0")}
                            </span>
                            <button
                              type="button"
                              onClick={() => setClockMinute(m => m === 0 ? 55 : m - 5)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#ff542d] transition hover:bg-[#ffefe9] active:scale-90 text-[18px] font-bold"
                            >
                              ∨
                            </button>
                          </div>

                          {/* AM / PM */}
                          <div className="flex flex-col gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => setClockAmPm("AM")}
                              className={`h-7 w-[38px] rounded-full text-[11px] font-bold transition ${
                                clockAmPm === "AM"
                                  ? "bg-[#ff542d] text-white shadow"
                                  : "bg-[#f3f3f3] text-[#888]"
                              }`}
                            >
                              AM
                            </button>
                            <button
                              type="button"
                              onClick={() => setClockAmPm("PM")}
                              className={`h-7 w-[38px] rounded-full text-[11px] font-bold transition ${
                                clockAmPm === "PM"
                                  ? "bg-[#ff542d] text-white shadow"
                                  : "bg-[#f3f3f3] text-[#888]"
                              }`}
                            >
                              PM
                            </button>
                          </div>
                        </div>

                        {/* Set Time button */}
                        <button
                          type="button"
                          onClick={() => {
                            let h24 = clockHour;
                            if (clockAmPm === "AM" && clockHour === 12) h24 = 0;
                            if (clockAmPm === "PM" && clockHour !== 12) h24 = clockHour + 12;
                            setTime(`${String(h24).padStart(2, "0")}:${String(clockMinute).padStart(2, "0")}`);
                            setShowClockPicker(false);
                          }}
                          className="mt-4 w-full rounded-[12px] bg-gradient-to-r from-[#ff542d] to-[#ff8c5a] py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(255,84,45,0.35)] transition hover:shadow-[0_6px_18px_rgba(255,84,45,0.45)] active:scale-[0.98]"
                        >
                          Set time · {String(clockHour).padStart(2, "0")}:{String(clockMinute).padStart(2, "0")} {clockAmPm}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>

        {/* ===================================================
            ORDER SUMMARY
        ==================================================== */}

        <aside
          className="
            w-full
            shrink-0
            lg:w-[330px]
            xl:w-[350px]
          "
        >

          <div
            className="
              rounded-[14px]
              bg-white
              p-4
              shadow-[0_2px_12px_rgba(0,0,0,0.07)]
              sm:p-5
              lg:sticky
              lg:top-4
            "
          >

            <div className="flex items-center justify-between">

              <h2
                className="
                  text-[20px]
                  font-bold
                  text-[#292929]
                "
              >
                Order Summary
              </h2>

              <Link
                href="/#menu"
                className="
                  rounded-full
                  border
                  border-[#ff542d]
                  px-3
                  py-1
                  text-[12px]
                  font-semibold
                  text-[#ff542d]
                  transition-colors
                  hover:bg-[#ff542d]
                  hover:text-white
                "
              >
                + Add Menu
              </Link>

            </div>

            {/* PRODUCTS */}

            <div className="mt-4 space-y-4">

              {cartItems.length > 0 ? (

                cartItems.map(
                  (item, index) => {

                    /*
                      IMPORTANT:
                      Same getUnitPrice() function is used
                      for product price and subtotal.
                    */

                    const basePrice =
                      getBasePrice(
                        item.price
                      );

                    const sizePrice =
                      getSizePrice(
                        item.size
                      );

                    const extraHotChilliPrice =
                      getExtraHotChilliPrice(
                        item.extraHotChilli
                      );

                    const unitPrice =
                      getUnitPrice(
                        item
                      );

                    const lineTotal =
                      getLineTotal(
                        item
                      );

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
                            h-[58px]
                            w-[58px]
                            shrink-0
                            overflow-hidden
                            rounded-[8px]
                            bg-[#f3f3f3]
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

                        {/* INFO */}

                        <div className="min-w-0 flex-1">

                          <p
                            className="
                              truncate
                              text-[14px]
                              font-semibold
                              text-[#292929]
                            "
                          >
                            {item.name}
                          </p>

                          {/* BASE PRICE */}

                          <p
                            className="
                              mt-1
                              text-[12px]
                              text-[#666]
                            "
                          >
                            Base price: £
                            {basePrice.toFixed(
                              2
                            )}
                          </p>

                          {/* SIZE */}

                          {item.size && (
                            <p
                              className="
                                mt-0.5
                                text-[12px]
                                font-medium
                                text-[#666]
                              "
                            >
                              Size:{" "}
                              <span className="font-semibold text-[#444]">
                                {item.size}
                              </span>

                              {sizePrice > 0 && (
                                <span className="ml-1 text-[#777]">
                                  +£
                                  {sizePrice.toFixed(
                                    2
                                  )}
                                </span>
                              )}
                            </p>
                          )}

                          {/* EXTRA HOT CHILLI */}

                          {item.extraHotChilli && (
                            <p
                              className="
                                mt-0.5
                                text-[12px]
                                font-medium
                                text-[#666]
                              "
                            >
                              Extra Hot Chilli{" "}
                              <span className="text-[#777]">
                                +£0.50
                              </span>
                            </p>
                          )}

                          {/* UNIT PRICE */}

                          <p
                            className="
                              mt-1
                              text-[12px]
                              font-semibold
                              text-[#555]
                            "
                          >
                            Unit price: £
                            {unitPrice.toFixed(
                              2
                            )}
                          </p>

                          {/* QUANTITY */}

                          <p
                            className="
                              mt-0.5
                              text-[13px]
                              text-[#777]
                            "
                          >
                            ×{" "}
                            {item.quantity}
                          </p>

                        </div>

                        {/* FINAL LINE PRICE */}

                        <p
                          className="
                            shrink-0
                            text-[14px]
                            font-bold
                            text-[#292929]
                          "
                        >
                          £
                          {lineTotal.toFixed(
                            2
                          )}
                        </p>

                      </div>
                    );
                  }
                )

              ) : (

                <p
                  className="
                    py-3
                    text-[14px]
                    text-[#888]
                  "
                >
                  Your cart is empty.
                </p>

              )}

            </div>

            {/* ORDER TYPE */}

            <div
              className="
                mt-5
                rounded-[8px]
                bg-[#fff0eb]
                px-4
                py-3
                text-[14px]
                font-medium
                text-[#ff542d]
              "
            >

              <span className="mr-2">
                {orderType ===
                "delivery"
                  ? "🚚"
                  : "🛍"}
              </span>

              {orderType ===
              "delivery"
                ? "Delivery"
                : "Pick-up"}

            </div>

            {/* TIME */}

            <div
              className="
                mt-3
                rounded-[8px]
                bg-[#fff0eb]
                px-4
                py-3
                text-[14px]
                font-medium
                text-[#ff542d]
              "
            >

              <span className="mr-2">
                ◷
              </span>

              {orderTime ===
              "asap"
                ? `ASAP`
                : `Scheduled · ${scheduledDate} · ${String(clockHour).padStart(2,"0")}:${String(clockMinute).padStart(2,"0")} ${clockAmPm}`}

            </div>

            {/* COUPON */}

            <div className="mt-5">

              <p
                className="
                  mb-2
                  text-[13px]
                  font-semibold
                  text-[#333]
                "
              >
                Have a coupon code?
              </p>

              {appliedCouponCode ? (

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-[8px]
                    border
                    border-[#10b981]
                    bg-[#f0fdf4]
                    px-3
                    py-2.5
                  "
                >

                  <div className="flex items-center gap-2">

                    <span
                      className="
                        text-[12px]
                        font-bold
                        text-[#10b981]
                      "
                    >
                      🎟️{" "}
                      {
                        appliedCouponCode
                      }
                    </span>

                    <span
                      className="
                        text-[12px]
                        text-[#555]
                      "
                    >
                      —£
                      {couponDiscount.toFixed(
                        2
                      )}
                      {" "}
                      saved
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCouponCode(
                        ""
                      );
                      setCouponDiscount(
                        0
                      );
                    }}
                    className="
                      text-[12px]
                      font-semibold
                      text-[#e44]
                      hover:underline
                    "
                  >
                    Remove
                  </button>

                </div>

              ) : isFullWalletPayment ? (

                <div
                  className="
                    rounded-[8px]
                    border
                    border-[#fca5a5]
                    bg-[#fff1f2]
                    px-3
                    py-2.5
                    text-[12px]
                    font-medium
                    text-[#e11d48]
                  "
                >
                  ⚠️ Coupon cannot be applied when paying full bill with wallet.
                </div>

              ) : (

                <div className="flex gap-2">

                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) =>
                      setCoupon(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Enter coupon code"
                    className="
                      min-w-0
                      flex-1
                      rounded-[8px]
                      bg-[#f3f3f3]
                      px-3
                      py-2.5
                      text-[13px]
                      outline-none
                      placeholder:text-[#aaa]
                    "
                  />

                  <button
                    type="button"
                    onClick={
                      handleApplyCoupon
                    }
                    className="
                      rounded-[8px]
                      bg-[#ff542d]
                      px-4
                      text-[12px]
                      font-semibold
                      text-white
                      transition
                      hover:bg-[#e94724]
                    "
                  >
                    Apply
                  </button>

                </div>

              )}

            </div>

            <div className="my-5 h-px bg-[#eeeeee]" />

            {/* PRICE DETAILS */}

            <div className="space-y-3">

              <div
                className="
                  flex
                  justify-between
                  text-[15px]
                  text-[#666]
                "
              >
                <span>
                  Subtotal
                </span>

                <span>
                  £
                  {subtotal.toFixed(
                    2
                  )}
                </span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  text-[15px]
                  text-[#666]
                "
              >
                <span>
                  {orderType ===
                  "delivery"
                    ? "Standard delivery"
                    : "Pick-up"}
                </span>

                <span>
                  £
                  {deliveryFee.toFixed(
                    2
                  )}
                </span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  text-[15px]
                  text-[#666]
                "
              >
                <span>
                  Service fee
                </span>

                <span>
                  £
                  {serviceFee.toFixed(
                    2
                  )}
                </span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  text-[15px]
                  text-[#666]
                "
              >
                <span>
                  Bag charges
                </span>

                <span>
                  £
                  {bagCharge.toFixed(
                    2
                  )}
                </span>
              </div>

              {/* COUPON DISCOUNT */}

              {couponDiscount >
                0 && (

                <div
                  className="
                    flex
                    justify-between
                    text-[15px]
                    font-semibold
                    text-[#10b981]
                  "
                >

                  <span>
                    Coupon (
                    {
                      appliedCouponCode
                    }
                    )
                  </span>

                  <span>
                    -£
                    {couponDiscount.toFixed(
                      2
                    )}
                  </span>

                </div>

              )}

            </div>

            {/* =================================================
                TIP
            ================================================== */}

            <div className="mt-5">

              <div className="flex items-center justify-between">

                <div>

                  <p
                    className="
                      text-[13px]
                      font-semibold
                      text-[#333]
                    "
                  >
                    Tip
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      text-[#888]
                    "
                  >
                    Add a tip for your driver
                  </p>

                </div>

                {(selectedTip >
                  0 ||
                  isOtherTip) && (

                  <button
                    type="button"
                    onClick={() => {
                      setTip(0);
                      setIsOtherTip(
                        false
                      );
                      setOtherTip(
                        ""
                      );
                    }}
                    className="
                      text-[12px]
                      font-medium
                      text-[#ff542d]
                      hover:underline
                    "
                  >
                    Remove
                  </button>

                )}

              </div>

              <div
                className="
                  mt-3
                  grid
                  grid-cols-5
                  gap-2
                "
              >

                {[1, 2, 3].map(
                  (amount) => (

                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setTip(
                          amount
                        );
                        setIsOtherTip(
                          false
                        );
                        setOtherTip(
                          ""
                        );
                      }}
                      className={`
                        rounded-[8px]
                        border
                        py-2
                        text-[12px]
                        font-semibold
                        transition-all

                        ${
                          !isOtherTip &&
                          tip === amount
                            ? "border-[#ff542d] bg-[#ff542d] text-white"
                            : "border-[#dedede] bg-white text-[#555] hover:border-[#ff542d] hover:text-[#ff542d]"
                        }
                      `}
                    >
                      £
                      {amount}
                    </button>

                  )
                )}

                {/* NO TIP */}

                <button
                  type="button"
                  onClick={() => {
                    setTip(0);
                    setIsOtherTip(
                      false
                    );
                    setOtherTip(
                      ""
                    );
                  }}
                  className={`
                    rounded-[8px]
                    border
                    py-2
                    text-[12px]
                    font-semibold
                    transition-all

                    ${
                      !isOtherTip &&
                      tip === 0
                        ? "border-[#ff542d] bg-[#ff542d] text-white"
                        : "border-[#dedede] bg-white text-[#555] hover:border-[#ff542d] hover:text-[#ff542d]"
                    }
                  `}
                >
                  No tip
                </button>

                {/* OTHER */}

                <button
                  type="button"
                  onClick={() => {
                    setIsOtherTip(
                      true
                    );
                    setTip(0);
                  }}
                  className={`
                    rounded-[8px]
                    border
                    py-2
                    text-[12px]
                    font-semibold
                    transition-all

                    ${
                      isOtherTip
                        ? "border-[#ff542d] bg-[#ff542d] text-white"
                        : "border-[#dedede] bg-white text-[#555] hover:border-[#ff542d] hover:text-[#ff542d]"
                    }
                  `}
                >
                  Other
                </button>

              </div>

              {/* OTHER TIP INPUT */}

              {isOtherTip && (

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    rounded-[8px]
                    bg-[#f3f3f3]
                    px-3
                  "
                >

                  <span className="text-[14px] text-[#777]">
                    £
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={otherTip}
                    onChange={(e) =>
                      setOtherTip(
                        e.target.value
                      )
                    }
                    placeholder="Enter tip amount"
                    className="
                      w-full
                      bg-transparent
                      px-2
                      py-2.5
                      text-[13px]
                      text-[#333]
                      outline-none
                      placeholder:text-[#aaa]
                    "
                  />

                </div>

              )}

            </div>

            {/* =================================================
                WALLET
            ================================================== */}

            <div
              className="
                mt-5
                rounded-[10px]
                border
                border-[#e7e7e7]
                bg-[#fafafa]
                p-3.5
              "
            >

              <div className="flex items-center justify-between gap-3">

                <div>

                  <p
                    className="
                      text-[13px]
                      font-semibold
                      text-[#333]
                    "
                  >
                    Wallet
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      text-[#666]
                    "
                  >
                    Available balance: £
                    {walletBalance.toFixed(
                      2
                    )}
                  </p>

                </div>

                {walletBalance >
                  0 && (

                  <button
                    type="button"
                    onClick={() => {

                      if (
                        selectedWalletAmount >
                          0 ||
                        isOtherWallet
                      ) {

                        setWalletAmount(
                          0
                        );

                        setIsOtherWallet(
                          false
                        );

                        setOtherWalletAmount(
                          ""
                        );

                      } else {

                        const maxAmt =
                          Number(
                            maxWalletUsable.toFixed(
                              2
                            )
                          );

                        setWalletAmount(
                          maxAmt
                        );

                        setIsOtherWallet(
                          false
                        );

                        if (
                          appliedCouponCode &&
                          maxAmt >=
                            totalBillBeforeCouponAndWallet -
                              0.01
                        ) {

                          setAppliedCouponCode(
                            ""
                          );

                          setCouponDiscount(
                            0
                          );

                          showNotification(
                            "error",
                            "Coupon removed because full bill is paid via wallet."
                          );
                        }

                      }

                    }}
                    className={`
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-[12px]
                      font-semibold
                      transition-all

                      ${
                        selectedWalletAmount >
                          0 ||
                        isOtherWallet
                          ? "border-[#ff542d] bg-[#ff542d] text-white"
                          : "border-[#ff542d] bg-white text-[#ff542d]"
                      }
                    `}
                  >
                    {selectedWalletAmount >
                      0 ||
                    isOtherWallet
                      ? "Remove"
                      : "Use Wallet"}
                  </button>

                )}

              </div>

              {walletBalance >
                0 && (

                <div className="mt-3">

                  <p
                    className="
                      mb-2
                      text-[12px]
                      font-medium
                      text-[#666]
                    "
                  >
                    Amount to use
                  </p>

                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-2
                    "
                  >

                    {/* £1 */}

                    <button
                      type="button"
                      onClick={() => {

                        const amt =
                          Math.min(
                            1,
                            maxWalletUsable
                          );

                        setWalletAmount(
                          amt
                        );

                        setIsOtherWallet(
                          false
                        );

                        setOtherWalletAmount(
                          ""
                        );

                        if (
                          appliedCouponCode &&
                          amt >=
                            totalBillBeforeCouponAndWallet -
                              0.01
                        ) {

                          setAppliedCouponCode(
                            ""
                          );

                          setCouponDiscount(
                            0
                          );

                          showNotification(
                            "error",
                            "Coupon removed because full bill is paid via wallet."
                          );
                        }

                      }}
                      className={`
                        rounded-[8px]
                        border
                        py-2
                        text-[12px]
                        font-semibold

                        ${
                          !isOtherWallet &&
                          walletAmount ===
                            Math.min(
                              1,
                              maxWalletUsable
                            )
                            ? "border-[#ff542d] bg-[#ff542d] text-white"
                            : "border-[#dedede] bg-white text-[#555]"
                        }
                      `}
                    >
                      £1
                    </button>

                    {/* £2 */}

                    <button
                      type="button"
                      onClick={() => {

                        const amt =
                          Math.min(
                            2,
                            maxWalletUsable
                          );

                        setWalletAmount(
                          amt
                        );

                        setIsOtherWallet(
                          false
                        );

                        setOtherWalletAmount(
                          ""
                        );

                        if (
                          appliedCouponCode &&
                          amt >=
                            totalBillBeforeCouponAndWallet -
                              0.01
                        ) {

                          setAppliedCouponCode(
                            ""
                          );

                          setCouponDiscount(
                            0
                          );

                          showNotification(
                            "error",
                            "Coupon removed because full bill is paid via wallet."
                          );
                        }

                      }}
                      className={`
                        rounded-[8px]
                        border
                        py-2
                        text-[12px]
                        font-semibold

                        ${
                          !isOtherWallet &&
                          walletAmount ===
                            Math.min(
                              2,
                              maxWalletUsable
                            )
                            ? "border-[#ff542d] bg-[#ff542d] text-white"
                            : "border-[#dedede] bg-white text-[#555]"
                        }
                      `}
                    >
                      £2
                    </button>

                    {/* OTHER */}

                    <button
                      type="button"
                      onClick={() => {
                        setIsOtherWallet(
                          true
                        );
                        setWalletAmount(
                          0
                        );
                      }}
                      className={`
                        rounded-[8px]
                        border
                        py-2
                        text-[12px]
                        font-semibold

                        ${
                          isOtherWallet
                            ? "border-[#ff542d] bg-[#ff542d] text-white"
                            : "border-[#dedede] bg-white text-[#555]"
                        }
                      `}
                    >
                      Other
                    </button>

                  </div>

                  {/* OTHER WALLET INPUT */}

                  {isOtherWallet && (

                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        rounded-[8px]
                        border
                        border-[#dedede]
                        bg-white
                        px-3
                      "
                    >

                      <span className="text-[14px] text-[#777]">
                        £
                      </span>

                      <input
                        type="number"
                        min="0"
                        max={
                          maxWalletUsable
                        }
                        step="0.01"
                        value={
                          otherWalletAmount
                        }
                        onChange={(e) => {

                          const val =
                            e.target.value;

                          setOtherWalletAmount(
                            val
                          );

                          const parsedVal =
                            Number.parseFloat(
                              val
                            ) || 0;

                          if (
                            appliedCouponCode &&
                            parsedVal >=
                              totalBillBeforeCouponAndWallet -
                                0.01
                          ) {

                            setAppliedCouponCode(
                              ""
                            );

                            setCouponDiscount(
                              0
                            );

                            showNotification(
                              "error",
                              "Coupon removed because full bill is paid via wallet."
                            );
                          }

                        }}
                        placeholder={`Enter amount (max £${maxWalletUsable.toFixed(
                          2
                        )})`}
                        className="
                          w-full
                          bg-transparent
                          px-2
                          py-2.5
                          text-[13px]
                          text-[#333]
                          outline-none
                          placeholder:text-[#aaa]
                        "
                      />

                    </div>

                  )}

                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      justify-between
                      text-[11px]
                      text-[#888]
                    "
                  >

                    <span>
                      Maximum usable: £
                      {maxWalletUsable.toFixed(
                        2
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => {

                        const maxAmt =
                          Number(
                            maxWalletUsable.toFixed(
                              2
                            )
                          );

                        setWalletAmount(
                          maxAmt
                        );

                        setIsOtherWallet(
                          false
                        );

                        setOtherWalletAmount(
                          ""
                        );

                        if (
                          appliedCouponCode &&
                          maxAmt >=
                            totalBillBeforeCouponAndWallet -
                              0.01
                        ) {

                          setAppliedCouponCode(
                            ""
                          );

                          setCouponDiscount(
                            0
                          );

                          showNotification(
                            "error",
                            "Coupon removed because full bill is paid via wallet."
                          );
                        }

                      }}
                      className="
                        font-semibold
                        text-[#ff542d]
                        hover:underline
                      "
                    >
                      Use maximum
                    </button>

                  </div>

                </div>

              )}

              {walletBalance <=
                0 && (

                <p
                  className="
                    mt-2
                    text-[12px]
                    text-[#888]
                  "
                >
                  No wallet balance available.
                </p>

              )}

            </div>

            <div className="my-5 h-px bg-[#eeeeee]" />

            {/* CUTLERY */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-[13px]
                    font-semibold
                  "
                >
                  Cutlery
                </p>

                <p
                  className="
                    mt-1
                    text-[12px]
                    text-[#888]
                  "
                >
                  Would you like cutlery with your order?
                </p>

              </div>

              <div
                className="
                  flex
                  shrink-0
                  overflow-hidden
                  rounded-full
                  border
                  border-[#dedede]
                  bg-[#f3f3f3]
                  p-0.5
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setCutlery(false)
                  }
                  className={`
                    rounded-full
                    px-3.5
                    py-1.5
                    text-[12px]
                    font-semibold
                    transition-all
                    duration-200
                    cursor-pointer

                    ${
                      !cutlery
                        ? "bg-[#ff542d] text-white shadow-xs"
                        : "text-[#666] hover:text-[#292929]"
                    }
                  `}
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCutlery(true)
                  }
                  className={`
                    rounded-full
                    px-3.5
                    py-1.5
                    text-[12px]
                    font-semibold
                    transition-all
                    duration-200
                    cursor-pointer

                    ${
                      cutlery
                        ? "bg-[#ff542d] text-white shadow-xs"
                        : "text-[#666] hover:text-[#292929]"
                    }
                  `}
                >
                  Yes
                </button>

              </div>

            </div>

            <div className="my-5 h-px bg-[#eeeeee]" />

            {/* TOTAL */}

            <div
              className="
                flex
                items-end
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[14px]
                    font-bold
                  "
                >
                  Total
                </p>

                <p
                  className="
                    mt-1
                    text-[12px]
                    text-[#888]
                  "
                >
                  Incl. fees and tax
                </p>

              </div>

              <p
                className="
                  text-[22px]
                  font-bold
                  text-[#ff542d]
                "
              >
                £
                {Math.max(
                  0,
                  total
                ).toFixed(2)}
              </p>

            </div>

            {/* =================================================
                PROCEED TO PAYMENT
            ================================================== */}

            <Link
              href={
                Math.max(
                  0,
                  total
                ) <= 0
                  ? "/confirmation"
                  : "/payment"
              }
              onClick={
                handleProceedToPayment
              }
              className="
                mt-5
                flex
                h-[46px]
                w-full
                items-center
                justify-between
                rounded-full
                bg-[#292929]
                px-5
                text-[13px]
                font-semibold
                text-white
                transition-all
                duration-200
                hover:bg-[#ff542d]
              "
            >

              <span>
                {Math.max(
                  0,
                  total
                ) <= 0
                  ? "Confirm Order (Wallet)"
                  : "Proceed to payment"}
              </span>

              <span>
                £
                {Math.max(
                  0,
                  total
                ).toFixed(2)}
              </span>

            </Link>

          </div>

        </aside>

      </div>

    </main>
  );
}