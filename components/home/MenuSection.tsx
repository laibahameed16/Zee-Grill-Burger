"use client";

import { useEffect, useState } from "react";
import type { MenuItem, CartItem, SizeType } from "@/lib/types";
import { getFavourites, toggleFavourite as libToggleFavourite } from "@/lib/favourites";
import { addToCart as libAddToCart } from "@/lib/cart";
import { isLoggedIn as checkLoggedIn } from "@/lib/auth";
import { SIZE_PRICES, EXTRA_HOT_CHILLI_PRICE, EVENTS } from "@/lib/constants";
import { getPriceNumber, dispatchCustomEvent } from "@/lib/utils";

type MenuSectionProps = {
  id: string;
  title: string;
  items: MenuItem[];
  isFirstSection?: boolean;
  searchQuery?: string;
};

export default function MenuSection({
  id,
  title,
  items,
  isFirstSection = false,
  searchQuery = "",
}: MenuSectionProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteNames, setFavouriteNames] = useState<string[]>([]);
  const [extraHotChilli, setExtraHotChilli] = useState(false);
  const [selectedSize, setSelectedSize] = useState<SizeType>("Medium");

  /* =========================
     CHECK LOGIN / FAVOURITES
  ========================== */
  useEffect(() => {
    const loadFavourites = () => {
      if (!checkLoggedIn()) {
        setFavouriteNames([]);
        return;
      }

      const saved = getFavourites();
      setFavouriteNames(saved.map((item) => item.name));
    };

    loadFavourites();

    const handleLoginChange = () => {
      loadFavourites();
    };

    const handleFavouritesUpdate = () => {
      loadFavourites();
    };

    window.addEventListener(EVENTS.USER_LOGGED_IN, handleLoginChange);
    window.addEventListener(EVENTS.USER_LOGGED_OUT, handleLoginChange);
    window.addEventListener(EVENTS.FAVOURITES_UPDATED, handleFavouritesUpdate);

    return () => {
      window.removeEventListener(EVENTS.USER_LOGGED_IN, handleLoginChange);
      window.removeEventListener(EVENTS.USER_LOGGED_OUT, handleLoginChange);
      window.removeEventListener(
        EVENTS.FAVOURITES_UPDATED,
        handleFavouritesUpdate
      );
    };
  }, []);

  /* =========================
     FILTER ITEMS
  ========================== */
  const filteredItems = items.filter((item) => {
    const search = searchQuery.toLowerCase().trim();

    if (!search) return true;

    return (
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    );
  });

  /* =========================
     FAVOURITE
  ========================== */
  const toggleFavourite = (item: MenuItem) => {
    if (!checkLoggedIn()) {
      dispatchCustomEvent(EVENTS.OPEN_LOGIN);
      return;
    }

    const existingNames = favouriteNames;
    const alreadyFav = existingNames.includes(item.name);
    const { added } = libToggleFavourite(item);

    const favouritesNow = getFavourites();
    setFavouriteNames(favouritesNow.map((f) => f.name));

    if (selectedItem?.name === item.name) {
      setIsFavourite(added);
    }

    dispatchCustomEvent(EVENTS.SITE_NOTIFICATION, {
      message: added
        ? "Item added to favourites"
        : "Item removed from favourites",
    });
  };

  /* =========================
     CHOOSE ITEM
  ========================== */
  const handleChoose = (item: MenuItem) => {
    if (!checkLoggedIn()) {
      dispatchCustomEvent(EVENTS.OPEN_LOGIN);
      return;
    }

    setSelectedItem(item);
    setQuantity(1);
    setIsFavourite(favouriteNames.includes(item.name));
    setExtraHotChilli(false);
    setSelectedSize("Medium");
  };

  /* =========================
     CLOSE CUSTOMISE
  ========================== */
  const closeCustomise = () => {
    setSelectedItem(null);
    setQuantity(1);
    setIsFavourite(false);
    setExtraHotChilli(false);
    setSelectedSize("Medium");
  };

  /* =========================
     PRICE
  ========================== */
  const itemPrice = selectedItem
    ? getPriceNumber(selectedItem.price)
    : 0;

  /* =========================
     SIZE PRICES
  ========================== */

  const sizePrice = SIZE_PRICES[selectedSize];

  /* =========================
     EXTRA HOT CHILLI PRICE
  ========================== */
  const extraHotChilliPrice = extraHotChilli ? EXTRA_HOT_CHILLI_PRICE : 0;

  /* =========================
     TOTAL PRICE
  ========================== */
  const singleItemTotal =
    itemPrice + sizePrice + extraHotChilliPrice;

  const totalPrice = singleItemTotal * quantity;

  /* =========================
     ADD TO CART
  ========================== */
  const handleAddToCart = () => {
    if (!selectedItem) return;

    if (!checkLoggedIn()) {
      closeCustomise();
      dispatchCustomEvent(EVENTS.OPEN_LOGIN);
      return;
    }

    libAddToCart(selectedItem, {
      quantity,
      size: selectedSize,
      extraHotChilli,
    });

    closeCustomise();
  };

  return (
    <>
      {/* =====================================================
          MENU SECTION
      ====================================================== */}
      <section
        id={id}
        className="
          w-full
          scroll-mt-[130px]
          bg-[#f7f7f7]
          px-5
          py-7
          sm:px-8
          md:px-10
          lg:px-0
        "
      >
        <div className="mx-auto w-full max-w-[1150px]">

          {/* SECTION HEADING */}
          <div className="mb-4 border-b border-[#dedede] pb-2">
            <h2
              className="
                text-[24px]
                font-bold
                uppercase
                leading-none
                text-[#292929]
                sm:text-[26px]
                md:text-[27px]
              "
            >
              {title}
            </h2>
          </div>

          {/* MENU CARDS */}
          {filteredItems.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {filteredItems.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="
                    flex
                    h-[112px]
                    w-full
                    overflow-hidden
                    rounded-[12px]
                    border
                    border-[#dedede]
                    bg-white
                    sm:h-[118px]
                    md:h-[122px]
                  "
                >
                  {/* IMAGE */}
                  <div
                    className="
                      relative
                      h-full
                      w-[105px]
                      shrink-0
                      overflow-hidden
                      bg-[#e3e3e3]
                      sm:w-[110px]
                      md:w-[115px]
                    "
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="
                        h-full
                        w-full
                        object-cover
                        object-center
                      "
                    />

                    {/* BADGE */}
                    <span
                      className={`
                        absolute
                        left-[6px]
                        top-[6px]
                        z-10
                        rounded-[4px]
                        px-1.5
                        py-[3px]
                        text-[7px]
                        font-bold
                        leading-none
                        text-white
                        sm:left-[7px]
                        sm:top-[7px]
                        sm:text-[8px]
                        ${
                          item.badge === "POPULAR"
                            ? "bg-[#c21919]"
                            : "bg-[#ff9326]"
                        }
                      `}
                    >
                      {item.badge === "POPULAR"
                        ? "🌶 POPULAR"
                        : "★ RECOMMENDED"}
                    </span>
                  </div>

                  {/* CARD CONTENT */}
                  <div
                    className="
                      relative
                      flex
                      min-w-0
                      flex-1
                      flex-col
                      px-2.5
                      py-2
                    "
                  >
                    {/* HEART */}
                    <button
                      type="button"
                      onClick={() => toggleFavourite(item)}
                      aria-label={`Favourite ${item.name}`}
                      className={`
                        absolute
                        right-2
                        top-2
                        text-[18px]
                        leading-none
                        transition-colors
                        ${
                          favouriteNames.includes(item.name)
                            ? "text-[#ff542d]"
                            : "text-[#777]"
                        }
                        hover:text-[#b82d1a]
                      `}
                    >
                      {favouriteNames.includes(item.name)
                        ? "♥"
                        : "♡"}
                    </button>

                    {/* PRODUCT NAME */}
                    <h3
                      className="
                        mt-[2px]
                        truncate
                        pr-6
                        text-[13px]
                        font-bold
                        text-[#292929]
                        sm:text-[14px]
                      "
                    >
                      {item.name}
                    </h3>

                    {/* DESCRIPTION */}
                    <p
                      className="
                        mt-1
                        line-clamp-2
                        text-[11px]
                        leading-[15px]
                        text-[#777]
                        sm:text-[12px]
                        sm:leading-[16px]
                      "
                    >
                      {item.description}
                    </p>

                    {/* PRICE + CHOOSE */}
                    <div
                      className="
                        mt-auto
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >
                      <span
                        className="
                          whitespace-nowrap
                          text-[13px]
                          font-semibold
                          text-[#333]
                          sm:text-[14px]
                        "
                      >
                        from {item.price}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleChoose(item)}
                        className="
                          shrink-0
                          rounded-full
                          bg-[#ff542d]
                          px-5
                          py-[7px]
                          text-[12px]
                          font-semibold
                          text-white
                          transition-all
                          duration-200
                          hover:scale-105
                          hover:bg-[#e94724]
                          sm:px-6
                          sm:py-[8px]
                          sm:text-[13px]
                          md:px-7
                          md:text-[14px]
                        "
                      >
                        Choose
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* NO RESULT */
            <div
              className="
                flex
                min-h-[150px]
                items-center
                justify-center
                rounded-[12px]
                border
                border-[#dedede]
                bg-white
                text-center
              "
            >
              <div>
                <p className="text-[15px] font-semibold text-[#444]">
                  No item found
                </p>

                <p className="mt-1 text-[12px] text-[#999]">
                  Try searching with another item name.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CUSTOMISE POPUP
      ====================================================== */}
{selectedItem && (   
        <div   
          className="   
            fixed   
            inset-0   
            z-[9998]   
            flex   
            items-center   
            justify-center   
            bg-black/50   
            px-2   
            py-4   
          "   
        >   
          <div   
            className="   
              relative   
              w-full   
              max-w-[375px]   
              max-h-[94vh]   
              overflow-hidden   
              rounded-[20px]   
              bg-white   
              shadow-[0_20px_60px_rgba(0,0,0,0.3)]   
            "   
          >   
            {/* INNER SCROLL AREA */}   
            <div
              className="
                max-h-[94vh]
                overflow-y-auto
                pr-[2px]
                [&::-webkit-scrollbar]:w-[4px]
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-[#ff542d]
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb:hover]:bg-[#e94724]
                scrollbar-width: thin
                scrollbar-color: #ff542d transparent
              "
            >
              {/* IMAGE AREA */}   
              <div   
                className="   
                  relative   
                  h-[165px]   
                  w-full   
                  overflow-hidden   
                  bg-[#e3e3e3]   
                "   
              >   
                <img   
                  src={selectedItem.image}   
                  alt={selectedItem.name}   
                  className="   
                    h-full   
                    w-full   
                    object-cover   
                    object-center   
                  "   
                />   
   
                {/* FAVOURITE */}   
                <button   
                  type="button"   
                  onClick={() => toggleFavourite(selectedItem)}   
                  aria-label="Favourite"   
                  className="   
                    absolute   
                    left-3   
                    top-3   
                    flex   
                    h-[30px]   
                    w-[30px]   
                    items-center   
                    justify-center   
                    rounded-full   
                    bg-white   
                    shadow-md   
                    transition-transform   
                    duration-200   
                    hover:scale-105   
                  "   
                >   
                  <img   
                    src="/images/cart/fvrticon.png"   
                    alt="Favourite"   
                    className="   
                      h-[15px]   
                      w-[15px]   
                      object-contain   
                    "   
                  />   
                </button>   
   
                {/* CROSS */}   
                <button   
                  type="button"   
                  onClick={closeCustomise}   
                  aria-label="Close"   
                  className="   
                    absolute   
                    right-3   
                    top-3   
                    flex   
                    h-[30px]   
                    w-[30px]   
                    items-center   
                    justify-center   
                    rounded-full   
                    bg-white   
                    shadow-md   
                    transition-transform   
                    duration-200   
                    hover:scale-105   
                  "   
                >   
                  <img   
                    src="/images/cart/cross.png"   
                    alt="Close"   
                    className="   
                      h-[11px]   
                      w-[11px]   
                      object-contain   
                    "   
                  />   
                </button>   
              </div>   
   
              {/* POPUP CONTENT */}   
              <div className="px-4 pb-4 pt-3">   
                <p className="text-[11px] font-bold tracking-[1px] text-[#ff542d]">   
                  CUSTOMISE   
                </p>   
   
                <h2 className="mt-1 text-[22px] font-bold leading-tight text-[#292929]">   
                  {selectedItem.name}   
                </h2>   
   
                <p className="mt-1 text-[15px] font-bold text-[#ff542d]">   
                  from {selectedItem.price}   
                </p>   
   
                <p className="mt-1 text-[12px] text-[#777]">   
                  {selectedItem.description}   
                </p>   
   
                {/* CUSTOMISATION */}   
                <div   
                  className="   
                    mt-3   
                    overflow-hidden   
                    rounded-[7px]   
                    border   
                    border-[#e5e5e5]   
                  "   
                >   
                  {/* EXTRA HOT CHILLI */}   
                  <button   
                    type="button"   
                    onClick={() =>   
                      setExtraHotChilli((current) => !current)   
                    }   
                    className="   
                      flex   
                      w-full   
                      items-center   
                      justify-between   
                      px-3   
                      py-2   
                      text-left   
                      transition-colors   
                      hover:bg-[#fafafa]   
                    "   
                  >   
                    <span className="text-[12px] text-[#555]">   
                      Extra Hot Chilli   
                    </span>   
   
                    <div className="flex items-center gap-2">   
                      <span className="text-[12px] text-[#777]">   
                        +£0.50   
                      </span>   
   
                      <span   
                        className={`   
                          flex   
                          h-[16px]   
                          w-[16px]   
                          items-center   
                          justify-center   
                          rounded-full   
                          border   
                          transition-all   
                          ${   
                            extraHotChilli   
                              ? "border-[#ff542d] bg-[#ff542d]"   
                              : "border-[#d5d5d5] bg-white"   
                          }   
                        `}   
                      >   
                        {extraHotChilli && (   
                          <span className="text-[12px] font-bold text-white">   
                            ✓   
                          </span>   
                        )}   
                      </span>   
                    </div>   
                  </button>   
                </div>   
   
                {/* SIZE */}   
                <div className="mt-4">   
                  <div className="mb-2 flex items-center justify-between">   
                    <div>   
                      <h3 className="text-[13px] font-semibold text-[#333]">   
                        Size   
                      </h3>   
   
                      <p className="mt-1 text-[10px] text-[#999]">   
                        Choose your size   
                      </p>   
                    </div>   
   
                    <span   
                      className="   
                        rounded-full   
                        bg-[#f1f1f1]   
                        px-2   
                        py-1   
                        text-[10px]   
                        font-semibold   
                        text-[#777]   
                      "   
                    >   
                      REQUIRED   
                    </span>   
                  </div>   
   
                  <div className="grid grid-cols-3 gap-2">   
                    {(["Small", "Medium", "Large"] as const).map(   
                      (size) => {   
                        const price = SIZE_PRICES[size];   
   
                        return (   
                          <button   
                            key={size}   
                            type="button"   
                            onClick={() => setSelectedSize(size)}   
                            className={`   
                              rounded-[7px]   
                              border   
                              px-2   
                              py-2   
                              text-[12px]   
                              font-medium   
                              transition-all   
                              ${   
                                selectedSize === size   
                                  ? "border-[#ff542d] bg-[#ff542d] text-white"   
                                  : "border-[#e1e1e1] bg-white text-[#555] hover:border-[#ff542d]"   
                              }   
                            `}   
                          >   
                            <span className="block">{size}</span>   
   
                            <span   
                              className={`   
                                mt-1   
                                block   
                                text-[11px]   
                                ${   
                                  selectedSize === size   
                                    ? "text-white"   
                                    : "text-[#999]"   
                                }   
                              `}   
                            >   
                              {price === 0   
                                ? "Included"   
                                : `+£${price.toFixed(2)}`}   
                            </span>   
                          </button>   
                        );   
                      }   
                    )}   
                  </div>   
                </div>   
   
                {/* ADD-ONS */}   
                <div   
                  className="   
                    mt-5   
                    border-t   
                    border-[#eeeeee]   
                    pt-3   
                  "   
                >   
                  <div className="flex items-center justify-between">   
                    <div>   
                      <h3 className="text-[13px] font-semibold text-[#333]">   
                        Add-ons   
                      </h3>   
   
                      <p className="mt-1 text-[10px] text-[#999]">   
                        Optional   
                      </p>   
                    </div>   
   
                    <span   
                      className="   
                        rounded-full   
                        bg-[#f1f1f1]   
                        px-2   
                        py-1   
                        text-[10px]   
                        font-semibold   
                        text-[#777]   
                      "   
                    >   
                      OPTIONAL   
                    </span>   
                  </div>   
                </div>   
   
                {/* QUANTITY + TOTAL */}   
                <div className="mt-3 flex items-center justify-between">   
                  <div   
                    className="   
                      flex   
                      h-[34px]   
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
                        setQuantity((current) =>   
                          Math.max(1, current - 1)   
                        )   
                      }   
                      className="   
                        flex   
                        h-full   
                        w-[34px]   
                        items-center   
                        justify-center   
                        text-[17px]   
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
                        text-[13px]   
                        text-[#333]   
                      "   
                    >   
                      {quantity}   
                    </span>   
   
                    <button   
                      type="button"   
                      onClick={() =>   
                        setQuantity((current) => current + 1)   
                      }   
                      className="   
                        flex   
                        h-full   
                        w-[34px]   
                        items-center   
                        justify-center   
                        text-[17px]   
                        text-[#333]   
                      "   
                    >   
                      +   
                    </button>   
                  </div>   
   
                  <p className="text-[13px] text-[#666]">   
                    Total:{" "}   
                    <span className="font-bold text-[#292929]">   
                      £{totalPrice.toFixed(2)}   
                    </span>   
                  </p>   
                </div>   
   
                {/* BUTTONS */}   
                <div   
                  className="   
                    mt-3   
                    grid   
                    grid-cols-[112px_1fr]   
                    gap-2   
                  "   
                >   
                  <button   
                    type="button"   
                    onClick={closeCustomise}   
                    className="   
                      h-[40px]   
                      rounded-full   
                      border   
                      border-[#dedede]   
                      bg-white   
                      text-[12px]   
                      font-medium   
                      text-[#444]   
                      hover:bg-[#f7f7f7]   
                    "   
                  >   
                    Cancel   
                  </button>   
   
                  <button   
                    type="button"   
                    onClick={handleAddToCart}   
                    className="   
                      h-[40px]   
                      rounded-full   
                      bg-[#ff542d]   
                      text-[12px]   
                      font-semibold   
                      text-white   
                      transition-all   
                      duration-200   
                      hover:scale-[1.01]   
                      hover:bg-[#e94724]   
                    "   
                  >   
                    Add to Cart — £{totalPrice.toFixed(2)}   
                  </button>   
                </div>   
              </div>   
            </div>   
          </div>   
        </div>   
      )}


    </>
  );
}