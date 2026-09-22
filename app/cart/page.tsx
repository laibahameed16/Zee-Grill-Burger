"use client";

import { useEffect, useState } from "react";
import type { CartItem as LibCartItem } from "@/lib/types";
import {
  getCart as getCartLib,
  saveCart as saveCartLib,
} from "@/lib/cart";
import { isLoggedIn as checkLoggedIn } from "@/lib/auth";
import { getWalletBalance } from "@/lib/wallet";
import { TIP_OPTIONS as TIP_OPTS, EVENTS } from "@/lib/constants";
import { getPriceNumber, dispatchCustomEvent } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/siteConfig";

type CartItem = LibCartItem;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ===== TIP ===== */
  const TIP_OPTIONS = TIP_OPTS;
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [tipMode, setTipMode] = useState<"preset" | "custom" | null>(null);

  /* ===== WALLET ===== */
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  /* =========================
     LOAD CART + USER
  ========================== */
  useEffect(() => {
    const load = () => {
      setIsLoggedIn(checkLoggedIn());
      setCart(getCartLib());
      setWalletBalance(getWalletBalance());
    };

    load();

    const handleWallet = () => {
      setWalletBalance(getWalletBalance());
    };

    const handleCart = () => {
      setCart(getCartLib());
    };

    const handleAuth = () => {
      load();
    };

    window.addEventListener(EVENTS.WALLET_UPDATED, handleWallet);
    window.addEventListener(EVENTS.CART_UPDATED, handleCart);
    window.addEventListener(EVENTS.AUTH_CHANGED, handleAuth);
    return () => {
      window.removeEventListener(EVENTS.WALLET_UPDATED, handleWallet);
      window.removeEventListener(EVENTS.CART_UPDATED, handleCart);
      window.removeEventListener(EVENTS.AUTH_CHANGED, handleAuth);
    };
  }, []);

  /* =========================
     PRICE
  ========================== */
  const total = cart.reduce(
    (sum, item) =>
      sum +
      getPriceNumber(item.price) *
        item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  /* TIP */
  const tipAmount =
    tipMode === "preset" && selectedTip !== null
      ? selectedTip
      : tipMode === "custom" && customTip
      ? Math.max(0, Number(customTip) || 0)
      : 0;

  /* WALLET */
  const walletDeduction = useWallet
    ? Math.min(walletBalance, total + tipAmount)
    : 0;

  const grandTotal = Math.max(0, total + tipAmount - walletDeduction);

  /* =========================
     UPDATE CART
  ========================== */
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    saveCartLib(newCart);
  };

  /* =========================
     INCREASE
  ========================== */
  const increaseQuantity = (
    index: number
  ) => {
    const newCart = [...cart];

    newCart[index].quantity += 1;

    saveCart(newCart);
  };

  /* =========================
     DECREASE
  ========================== */
  const decreaseQuantity = (
    index: number
  ) => {
    const newCart = [...cart];

    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
    } else {
      newCart.splice(index, 1);
    }

    saveCart(newCart);
  };

  /* =========================
     REMOVE
  ========================== */
  const removeItem = (index: number) => {
    const newCart = [...cart];

    newCart.splice(index, 1);

    saveCart(newCart);
  };

  /* =========================
     GO LOGIN
  ========================== */
  const goToLogin = () => {
    window.location.href = "/";
  };

  return (
    <main
      className="
        min-h-screen
        bg-[#f7f7f7]
      "
    >
      {/* =========================
          HEADER
      ========================== */}
      <header className="h-[72px] w-full bg-[#292929]">
        <div className="mx-auto flex h-full w-full max-w-[1150px] items-center justify-between px-5 sm:px-8 md:px-10 lg:px-0">
          {/* LOGO */}
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="flex h-[38px] w-auto items-center sm:h-[44px]"
          >
            <img
              src="/images/navbarimages/logo.png"
              alt={SITE_CONFIG.name}
              className="h-full w-auto object-contain"
            />
          </button>

          {/* BACK */}
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="rounded-full border border-[#555] px-4 py-2 text-[9px] text-white transition-colors hover:border-[#ff542d] hover:text-[#ff542d]"
          >
            Back to Menu
          </button>
        </div>
      </header>

      {/* =========================
          CONTENT
      ========================== */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1150px]
          px-5
          py-8
          sm:px-8
          md:px-10
          lg:px-0
          md:py-10
        "
      >
        {/* TITLE */}
        <div className="mb-6">
          <p
            className="
              text-[9px]
              font-semibold
              tracking-[1px]
              text-[#ff542d]
            "
          >
            YOUR ORDER
          </p>

          <h1
            className="
              mt-2
              text-[28px]
              font-bold
              text-[#292929]
              sm:text-[32px]
            "
          >
            Your Cart
          </h1>

          <div
            className="
              mt-3
              h-[3px]
              w-[38px]
              rounded-full
              bg-[#ff542d]
            "
          />
        </div>

        {/* =========================
            NOT LOGGED IN
        ========================== */}
        {!isLoggedIn ? (
          <div
            className="
              rounded-[16px]
              border
              border-[#dedede]
              bg-white
              p-8
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-[60px]
                w-[60px]
                items-center
                justify-center
                rounded-full
                bg-[#fff0ec]
              "
            >
              <img
                src="/images/navbarimages/bag.png"
                alt="Cart"
                className="
                  h-[25px]
                  w-[25px]
                  object-contain
                "
              />
            </div>

            <h2
              className="
                mt-4
                text-[18px]
                font-bold
                text-[#292929]
              "
            >
              Please login first
            </h2>

            <p
              className="
                mt-2
                text-[11px]
                text-[#777]
              "
            >
              You need to login before you
              can add items to your cart.
            </p>

            <button
              type="button"
              onClick={goToLogin}
              className="
                mt-5
                rounded-full
                bg-[#ff542d]
                px-8
                py-3
                text-[10px]
                font-semibold
                text-white
                hover:bg-[#e94724]
              "
            >
              Go to Login
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* =========================
              EMPTY CART
          ========================== */
          <div
            className="
              rounded-[16px]
              border
              border-[#dedede]
              bg-white
              p-8
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-[60px]
                w-[60px]
                items-center
                justify-center
                rounded-full
                bg-[#fff0ec]
              "
            >
              <img
                src="/images/navbarimages/bag.png"
                alt="Empty cart"
                className="
                  h-[25px]
                  w-[25px]
                  object-contain
                "
              />
            </div>

            <h2
              className="
                mt-4
                text-[18px]
                font-bold
                text-[#292929]
              "
            >
              Your cart is empty
            </h2>

            <p
              className="
                mt-2
                text-[11px]
                text-[#777]
              "
            >
              Choose something delicious from
              the menu.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/#menu";
              }}
              className="
                mt-5
                rounded-full
                bg-[#ff542d]
                px-8
                py-3
                text-[10px]
                font-semibold
                text-white
                hover:bg-[#e94724]
              "
            >
              Browse Menu
            </button>
          </div>
        ) : (
          /* =========================
              CART
          ========================== */
          <div
            className="
              grid
              gap-5
              lg:grid-cols-[1fr_320px]
            "
          >
            {/* CART ITEMS */}
            <div className="space-y-3">
              {cart.map((item, index) => {
                const itemPrice =
                  getPriceNumber(item.price);

                const itemTotal =
                  itemPrice * item.quantity;

                return (
                  <div
                    key={`${item.name}-${index}`}
                    className="
                      flex
                      gap-3
                      rounded-[18px]
                      border
                      border-[#dedede]
                      bg-white
                      p-3.5
                      sm:p-4.5
                    "
                  >
                    {/* IMAGE */}
                    <div
                      className="
                        h-[90px]
                        w-[90px]
                        shrink-0
                        rounded-[12px]
                        bg-[#e3e3e3]
                        sm:h-[105px]
                        sm:w-[105px]
                      "
                    />

                    {/* DETAILS */}
                    <div
                      className="
                        flex
                        min-w-0
                        flex-1
                        flex-col
                      "
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="
                              truncate
                              text-[13px]
                              font-bold
                              text-[#292929]
                              sm:text-[15px]
                            "
                          >
                            {item.name}
                          </h3>

                          <p
                            className="
                              mt-1
                              line-clamp-2
                              text-[9px]
                              leading-[14px]
                              text-[#777]
                              sm:text-[10px]
                            "
                          >
                            {item.description}
                          </p>
                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          className="
                            shrink-0
                            text-[10px]
                            font-medium
                            text-[#999]
                            hover:text-[#ff542d]
                          "
                        >
                          Remove
                        </button>
                      </div>

                      {/* BOTTOM */}
                      <div
                        className="
                          mt-auto
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        {/* QUANTITY */}
                        <div
                          className="
                            flex
                            h-[32px]
                            items-center
                            overflow-hidden
                            rounded-full
                            border
                            border-[#e1e1e1]
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                index
                              )
                            }
                            className="
                              flex
                              h-full
                              w-[32px]
                              items-center
                              justify-center
                              text-[15px]
                              font-bold
                              text-[#333]
                            "
                          >
                            −
                          </button>

                          <span
                            className="
                              flex
                              h-full
                              min-w-[30px]
                              items-center
                              justify-center
                              border-x
                              border-[#eeeeee]
                              text-[10px]
                              font-semibold
                              text-[#333]
                            "
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                index
                              )
                            }
                            className="
                              flex
                              h-full
                              w-[32px]
                              items-center
                              justify-center
                              text-[15px]
                              font-bold
                              text-[#333]
                            "
                          >
                            +
                          </button>
                        </div>

                        {/* ITEM TOTAL */}
                        <span
                          className="
                            text-[13px]
                            font-bold
                            text-[#292929]
                          "
                        >
                          £
                          {itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =========================
                SUMMARY
            ========================== */}
            <div
              className="
                h-fit
                rounded-[18px]
                border
                border-[#dedede]
                bg-white
                p-5
                lg:sticky
                lg:top-5
              "
            >
              <h2
                className="
                  text-[16px]
                  font-bold
                  text-[#292929]
                "
              >
                Order Summary
              </h2>

              <div
                className="
                  mt-5
                  space-y-3
                  border-b
                  border-[#eeeeee]
                  pb-4
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    text-[10px]
                    text-[#777]
                  "
                >
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    text-[10px]
                    text-[#777]
                  "
                >
                  <span>Subtotal</span>

                  <span>
                    £{total.toFixed(2)}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    text-[10px]
                    text-[#777]
                  "
                >
                  <span>Delivery</span>
                  <span>£0.00</span>
                </div>

                {/* ===== TIP ROW ===== */}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-[10px] text-[#777]">
                    <span>Tip</span>
                    <span>£{tipAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* ===== WALLET ROW ===== */}
                {useWallet && walletDeduction > 0 && (
                  <div className="flex justify-between text-[10px] text-[#2f9e44]">
                    <span>Wallet</span>
                    <span>- £{walletDeduction.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* ===== TIP SECTION ===== */}
              <div className="mt-4 rounded-[10px] border border-[#eeeeee] p-3">
                <p className="text-[10px] font-bold text-[#292929]">
                  Add a Tip 💛
                </p>

                <div className="mt-2 flex gap-1.5">
                  {TIP_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTipMode("preset");
                        setSelectedTip(t);
                        setCustomTip("");
                      }}
                      className={`
                        flex-1
                        rounded-[7px]
                        border
                        py-1.5
                        text-[9px]
                        font-bold
                        transition-all
                        ${
                          tipMode === "preset" && selectedTip === t
                            ? "border-[#ff542d] bg-[#ff542d] text-white"
                            : "border-[#ddd] bg-white text-[#444] hover:border-[#ff542d]"
                        }
                      `}
                    >
                      £{t}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setTipMode("custom");
                      setSelectedTip(null);
                    }}
                    className={`
                      flex-1
                      rounded-[7px]
                      border
                      py-1.5
                      text-[9px]
                      font-bold
                      transition-all
                      ${
                        tipMode === "custom"
                          ? "border-[#ff542d] bg-[#ff542d] text-white"
                          : "border-[#ddd] bg-white text-[#444] hover:border-[#ff542d]"
                      }
                    `}
                  >
                    Other
                  </button>
                </div>

                {tipMode === "custom" && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] text-[#555]">£</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="Enter amount"
                      className="h-[30px] flex-1 rounded-[7px] border border-[#ddd] px-2 text-[10px] text-[#292929] outline-none focus:border-[#ff542d]"
                    />
                  </div>
                )}

                {tipMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setTipMode(null);
                      setSelectedTip(null);
                      setCustomTip("");
                    }}
                    className="mt-1.5 text-[8px] text-[#888] underline hover:text-[#ff542d]"
                  >
                    Remove tip
                  </button>
                )}
              </div>

              {/* ===== WALLET SECTION ===== */}
              {walletBalance > 0 && (
                <div className="mt-3 rounded-[10px] border border-[#eeeeee] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-[#292929]">
                        💳 Use Wallet Balance
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#777]">
                        Available: £{walletBalance.toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUseWallet((prev) => !prev)}
                      className={`
                        relative
                        h-[22px]
                        w-[40px]
                        shrink-0
                        rounded-full
                        transition-colors
                        duration-200
                        ${useWallet ? "bg-[#ff542d]" : "bg-[#ccc]"}
                      `}
                    >
                      <span
                        className={`
                          absolute
                          top-[3px]
                          h-[16px]
                          w-[16px]
                          rounded-full
                          bg-white
                          shadow
                          transition-transform
                          duration-200
                          ${useWallet ? "translate-x-[21px]" : "translate-x-[3px]"}
                        `}
                      />
                    </button>
                  </div>

                  {useWallet && walletDeduction > 0 && (
                    <p className="mt-1.5 text-[9px] font-semibold text-[#2f9e44]">
                      -£{walletDeduction.toFixed(2)} will be deducted
                    </p>
                  )}
                </div>
              )}

              {/* TOTAL */}
              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-[12px]
                    font-semibold
                    text-[#292929]
                  "
                >
                  Total
                </span>

                <span
                  className="
                    text-[16px]
                    font-bold
                    text-[#ff542d]
                  "
                >
                  £{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* CHECKOUT */}
              <button
                type="button"
                className="
                  mt-5
                  w-full
                  rounded-full
                  bg-[#ff542d]
                  py-3
                  text-[10px]
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-[#e94724]
                "
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}