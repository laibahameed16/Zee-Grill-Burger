"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderType, setOrderType] = useState<"delivery" | "collection">(
    "delivery"
  );
  const [notes, setNotes] = useState("");

  /* =========================
     LOAD CART
  ========================== */
  const loadCart = () => {
    const user = localStorage.getItem("loggedInUser");
    const loggedIn = !!user;

    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      setCartItems([]);
      return;
    }

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("zee-grill-cart") || "[]"
      );

      if (Array.isArray(savedCart)) {
        setCartItems(savedCart);
      } else {
        setCartItems([]);
      }
    } catch {
      setCartItems([]);
    }
  };

  /* =========================
     OPEN CART
  ========================== */
  useEffect(() => {
    const handleOpenCart = () => {
      loadCart();
      setIsOpen(true);
    };

    const handleCartUpdate = () => {
      loadCart();
    };

    const handleAuthChange = () => {
      loadCart();
    };

    window.addEventListener("open-cart", handleOpenCart);
    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("user-logged-in", handleAuthChange);
    window.addEventListener("user-logged-out", handleAuthChange);

    loadCart();

    return () => {
      window.removeEventListener("open-cart", handleOpenCart);
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("user-logged-in", handleAuthChange);
      window.removeEventListener("user-logged-out", handleAuthChange);
    };
  }, []);

  /* =========================
     ESCAPE + BODY SCROLL
  ========================== */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* =========================
     SAVE CART
  ========================== */
  const saveCart = (updatedCart: CartItem[]) => {
    const user = localStorage.getItem("loggedInUser");

    if (!user) {
      setIsLoggedIn(false);
      setCartItems([]);
      return;
    }

    setIsLoggedIn(true);
    setCartItems(updatedCart);

    localStorage.setItem(
      "zee-grill-cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cart-updated"));
  };

  /* =========================
     PRICE
  ========================== */
  const getPriceNumber = (price: string) => {
    return Number(price.replace("£", "").trim()) || 0;
  };

  /* =========================
     SIZE PRICE
  ========================== */
  const getSizePrice = (
    size?: "Small" | "Medium" | "Large"
  ) => {
    if (size === "Small") return 0;
    if (size === "Medium") return 1;
    if (size === "Large") return 2;

    return 0;
  };

  /* =========================
     EXTRA HOT CHILLI PRICE
  ========================== */
  const getExtraHotChilliPrice = (
    extraHotChilli?: boolean
  ) => {
    return extraHotChilli ? 0.5 : 0;
  };

  /* =========================
     ITEM TOTAL
  ========================== */
  const getItemUnitPrice = (item: CartItem) => {
    const basePrice = getPriceNumber(item.price);
    const sizePrice = getSizePrice(item.size);
    const chilliPrice = getExtraHotChilliPrice(
      item.extraHotChilli
    );

    return basePrice + sizePrice + chilliPrice;
  };

  const getItemTotal = (item: CartItem) => {
    return getItemUnitPrice(item) * item.quantity;
  };

  /* =========================
     SUBTOTAL
  ========================== */
  const subtotal = cartItems.reduce((total, item) => {
    return total + getItemTotal(item);
  }, 0);

  const deliveryFee = orderType === "delivery" ? 3.99 : 0;
  const serviceFee = orderType === "delivery" ? 1.99 : 0;
  const bagCharge = 0.29;
  const discount = 0;

  const total =
    subtotal +
    deliveryFee +
    serviceFee +
    bagCharge -
    discount;

  /* =========================
     QUANTITY
  ========================== */
  const increaseQuantity = (index: number) => {
    const updatedCart = [...cartItems];

    updatedCart[index].quantity += 1;

    saveCart(updatedCart);
  };

  const decreaseQuantity = (index: number) => {
    const updatedCart = [...cartItems];

    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
    } else {
      updatedCart.splice(index, 1);
    }

    saveCart(updatedCart);
  };

  /* =========================
     REMOVE
  ========================== */
  const removeItem = (index: number) => {
    const updatedCart = cartItems.filter(
      (_, itemIndex) => itemIndex !== index
    );

    saveCart(updatedCart);
  };

  const isEmpty = !isLoggedIn || cartItems.length === 0;

  return (
    <>
      {/* =====================================================
          BACKGROUND OVERLAY
      ====================================================== */}
      <div
        onClick={() => setIsOpen(false)}
        className={`
          fixed
          inset-0
          z-[9997]
          bg-black/30
          transition-opacity
          duration-300
          ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* =====================================================
          CART DRAWER
      ====================================================== */}
      <aside
        className={`
          fixed
          right-0
          top-0
          z-[9999]
          flex
          h-[100dvh]
          w-full
          flex-col
          overflow-y-auto
          overflow-x-hidden
          border-l
          border-[#ead0c4]
          bg-[#ffe1d4]
          shadow-[-8px_0_30px_rgba(0,0,0,0.18)]
          transition-transform
          duration-300
          ease-out
          rounded-l-[22px]

          sm:top-0
          sm:h-[100dvh]
          sm:w-[360px]

          md:w-[380px]

          lg:w-[390px]

          xl:w-[400px]

          ${
            isOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div
          className="
            shrink-0
            px-4
            pb-3
            pt-4

            sm:px-5
            sm:pt-5
          "
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-bold
                  tracking-[1px]
                  text-[#ff542d]

                  sm:text-[10px]
                "
              >
                YOUR ORDER
              </p>

              <h2
                className="
                  mt-[2px]
                  text-[24px]
                  font-bold
                  leading-none
                  text-[#292929]

                  sm:text-[27px]
                "
              >
                Cart
              </h2>
            </div>

            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close cart"
              className="
                flex
                h-[30px]
                w-[30px]
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#d8d8d8]
                bg-white
                text-[18px]
                leading-none
                text-[#444]
                transition
                hover:bg-[#f5f5f5]
              "
            >
              ×
            </button>
          </div>

          {/* =====================================================
              DELIVERY / COLLECTION
          ====================================================== */}
          <div
            className="
              mt-3
              grid
              grid-cols-2
              overflow-hidden
              rounded-[14px]
              border
              border-[#d8d8d8]
              bg-white

              sm:mt-4
              sm:rounded-[16px]
            "
          >
            {/* DELIVERY */}
            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              className={`
                flex
                min-h-[64px]
                flex-col
                items-center
                justify-center
                px-2
                transition-all

                sm:min-h-[70px]

                ${
                  orderType === "delivery"
                    ? "bg-[#ff542d] text-white"
                    : "bg-white text-[#555]"
                }
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="
                  h-[17px]
                  w-[17px]

                  sm:h-[18px]
                  sm:w-[18px]
                "
                aria-hidden="true"
              >
                <path d="M3 7h11v10H3z" />
                <path d="M14 10h4l3 3v4h-7z" />
                <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>

              <span
                className="
                  mt-1
                  text-[11px]
                  font-bold

                  sm:text-[12px]
                "
              >
                Delivery
              </span>

              <span
                className={`
                  mt-[2px]
                  text-[8px]

                  sm:text-[9px]

                  ${
                    orderType === "delivery"
                      ? "text-white/80"
                      : "text-[#888]"
                  }
                `}
              >
                Open 17:00
              </span>
            </button>

            {/* COLLECTION */}
            <button
              type="button"
              onClick={() => setOrderType("collection")}
              className={`
                flex
                min-h-[64px]
                flex-col
                items-center
                justify-center
                px-2
                transition-all

                sm:min-h-[70px]

                ${
                  orderType === "collection"
                    ? "bg-[#ff542d] text-white"
                    : "bg-white text-[#555]"
                }
              `}
            >
              <img
                src="/images/cartpage/collection.png"
                alt="Collection"
                className={`
                  h-[17px]
                  w-[17px]
                  object-contain

                  sm:h-[18px]
                  sm:w-[18px]

                  ${
                    orderType === "collection"
                      ? "brightness-0 invert"
                      : ""
                  }
                `}
              />

              <span
                className="
                  mt-1
                  text-[11px]
                  font-bold

                  sm:text-[12px]
                "
              >
                Collection
              </span>

              <span
                className={`
                  mt-[2px]
                  text-[8px]

                  sm:text-[9px]

                  ${
                    orderType === "collection"
                      ? "text-white/80"
                      : "text-[#888]"
                  }
                `}
              >
                Open 14:00
              </span>
            </button>
          </div>
        </div>

        {/* =====================================================
            CART ITEMS AREA
        ====================================================== */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            px-4

            sm:px-5

            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {isEmpty ? (
            /* =================================================
               EMPTY CART
            ================================================== */
            <div
              className="
                flex
                min-h-[240px]
                flex-col
                items-center
                justify-center
                px-4
                text-center

                sm:min-h-[280px]
              "
            >
              <div className="text-[35px] opacity-40 sm:text-[38px]">
                🛍
              </div>

              <h3
                className="
                  mt-3
                  text-[14px]
                  font-bold
                  text-[#292929]

                  sm:text-[15px]
                "
              >
                Cart is empty
              </h3>

              <p
                className="
                  mt-1.5
                  max-w-[230px]
                  text-[8px]
                  leading-4
                  text-[#777]

                  sm:text-[9px]
                "
              >
                Login to your account to see your selected items here.
              </p>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="
                  mt-4
                  rounded-full
                  bg-[#ff542d]
                  px-6
                  py-2.5
                  text-[8px]
                  font-bold
                  text-white

                  sm:text-[9px]
                "
              >
                Browse Menu
              </button>
            </div>
          ) : (
            /* =================================================
               ITEMS
            ================================================== */
            <div className="pb-3">
              {cartItems.map((item, index) => {
                const itemImage =
                  item.image ||
                  item.imageUrl ||
                  item.img ||
                  "/images/menupictures/product-placeholder.svg";

                const unitPrice = getItemUnitPrice(item);
                const itemTotal = getItemTotal(item);

                return (
                  <div
                    key={`${item.name}-${index}`}
                    className="
                      border-b
                      border-[#e8cfc4]
                      py-3
                    "
                  >
                    <div className="flex gap-2.5 sm:gap-3">
                      {/* PRODUCT IMAGE */}
                      <div
                        className="
                          flex
                          h-[62px]
                          w-[72px]
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-[12px]
                          bg-[#e8d0c5]

                          sm:h-[66px]
                          sm:w-[80px]
                        "
                      >
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                          onError={(event) => {
                            const target = event.currentTarget;

                            if (
                              target.src.includes(
                                "product-placeholder.svg"
                              )
                            ) {
                              return;
                            }

                            target.src =
                              "/images/menupictures/product-placeholder.svg";
                          }}
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3
                              className="
                                truncate
                                text-[11px]
                                font-bold
                                text-[#292929]

                                sm:text-[12px]
                              "
                            >
                              {item.name}
                            </h3>

                            {/* SIZE */}
                            {item.size && (
                              <p
                                className="
                                  mt-[3px]
                                  text-[8px]
                                  font-medium
                                  text-[#555]

                                  sm:text-[9px]
                                "
                              >
                                Size:{" "}
                                <span className="font-bold">
                                  {item.size}
                                </span>
                                {getSizePrice(item.size) > 0 && (
                                  <span className="ml-1 text-[#777]">
                                    +£
                                    {getSizePrice(item.size).toFixed(
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
                                  mt-[2px]
                                  text-[8px]
                                  font-medium
                                  text-[#555]

                                  sm:text-[9px]
                                "
                              >
                                Extra Hot Chilli
                                <span className="ml-1 text-[#777]">
                                  +£0.50
                                </span>
                              </p>
                            )}

                            {/* PRICE */}
                            <p
                              className="
                                mt-[4px]
                                text-[12px]
                                font-bold
                                text-[#ff542d]

                                sm:text-[13px]
                              "
                            >
                              £{itemTotal.toFixed(2)}
                            </p>

                            {/* UNIT PRICE */}
                            {(item.size ||
                              item.extraHotChilli) && (
                              <p
                                className="
                                  mt-[1px]
                                  text-[7px]
                                  text-[#888]

                                  sm:text-[8px]
                                "
                              >
                                £{unitPrice.toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>

                        {/* QUANTITY */}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div
                            className="
                              flex
                              h-[26px]
                              overflow-hidden
                              rounded-full
                              border
                              border-[#dcdcdc]
                              bg-white

                              sm:h-[28px]
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(index)
                              }
                              className="
                                flex
                                w-[25px]
                                items-center
                                justify-center
                                text-[13px]
                                font-bold
                                text-[#555]
                                hover:bg-[#f5f5f5]

                                sm:w-[27px]
                                sm:text-[14px]
                              "
                            >
                              −
                            </button>

                            <span
                              className="
                                flex
                                min-w-[25px]
                                items-center
                                justify-center
                                border-x
                                border-[#ededed]
                                text-[9px]
                                font-semibold
                                text-[#333]

                                sm:min-w-[27px]
                                sm:text-[10px]
                              "
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(index)
                              }
                              className="
                                flex
                                w-[25px]
                                items-center
                                justify-center
                                text-[13px]
                                font-bold
                                text-[#555]
                                hover:bg-[#f5f5f5]

                                sm:w-[27px]
                                sm:text-[14px]
                              "
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(index)
                            }
                            className="
                              text-[8px]
                              font-medium
                              text-[#666]
                              underline
                              underline-offset-2
                              hover:text-[#ff542d]

                              sm:text-[9px]
                            "
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =====================================================
            SUMMARY
        ====================================================== */}
        {!isEmpty && (
          <div
            className="
              shrink-0
              border-t
              border-[#e4c9bd]
              bg-[#ffe1d4]
              px-4
              pb-3
              pt-2.5

              sm:px-5
              sm:pb-4
              sm:pt-3
            "
          >
            {/* PRICES */}
            <div
              className="
                space-y-[5px]
                text-[10px]
                font-medium
                text-[#333]

                sm:space-y-[6px]
                sm:text-[11px]
              "
            >
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>

              {orderType === "delivery" && (
                <div className="flex justify-between">
                  <span>Standard delivery</span>
                  <span>
                    £{deliveryFee.toFixed(2)}
                  </span>
                </div>
              )}

              {orderType === "delivery" && (
                <div className="flex justify-between">
                  <span>Service fee ⓘ</span>
                  <span>
                    £{serviceFee.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Bag Charges</span>
                <span>£{bagCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[#e32613]">
                <span>Discount</span>
                <span>
                  - £{discount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* LINE */}
            <div className="my-2 border-t border-[#e5c9bd] sm:my-2.5" />

            {/* TOTAL */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <p
                  className="
                    text-[14px]
                    font-bold
                    text-[#292929]

                    sm:text-[15px]
                  "
                >
                  Total{" "}
                  <span
                    className="
                      text-[8px]
                      font-normal
                      text-[#777]

                      sm:text-[9px]
                    "
                  >
                    (incl. fees and tax)
                  </span>
                </p>

                <button
                  type="button"
                  className="
                    mt-[1px]
                    text-[8px]
                    text-[#555]
                    underline

                    sm:text-[9px]
                  "
                >
                  See summary
                </button>
              </div>

              <p
                className="
                  text-[17px]
                  font-bold
                  text-[#ff542d]

                  sm:text-[19px]
                "
              >
                £{Math.max(0, total).toFixed(2)}
              </p>
            </div>

            {/* NOTES */}
           

            {/* CHECKOUT */}
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="
                mt-3
                flex
                h-[42px]
                w-full
                items-center
                justify-center
                rounded-full
                bg-[#ff542d]
                text-[12px]
                font-bold
                text-white
                shadow-[0_4px_14px_rgba(255,84,45,0.3)]
                transition-all
                duration-200
                hover:bg-[#e94724]
                hover:shadow-lg
                active:scale-[0.99]

                sm:mt-3.5
                sm:h-[44px]
                sm:text-[13px]
              "
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}