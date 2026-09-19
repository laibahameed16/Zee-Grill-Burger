"use client";

import { useState } from "react";
import MenuSection from "./MenuSection";

const categories = [
  "Porto Kebabs",
  "Quesadilla",
  "Sides",
  "Drinks",
  "Burrito",
  "Platters",
  "Dips",
  "Kids Meal",
  "Rice",
  "Burgers",
  "Tandoori Dishes",
  "Biryani Dishes",
  "Hoogies",
  "Bread",
  "Chips With Starters",
  "Thrill Of Grill",
  "Korma Dishes",
  "Street Bites",
  "European Dishes",
  "Wraps",
  "Special Wings",
];

const PLACEHOLDER_IMAGE = "/images/menupictures/product-placeholder.svg";

/* =====================================================
   CREATE ITEMS
===================================================== */

const createItems = (
  category: string,
  _categoryIndex?: number
) => {
  return [
    {
      name: `${category} Item 1`,
      description:
        "Delicious freshly prepared food made with quality ingredients.",
      price: "£3.95",
      badge: "POPULAR" as const,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 2`,
      description:
        "Freshly prepared with delicious flavours and quality ingredients.",
      price: "£4.50",
      badge: "RECOMMENDED" as const,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 3`,
      description:
        "A delicious choice prepared fresh and served with great flavour.",
      price: "£5.25",
      badge: "RECOMMENDED" as const,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 4`,
      description:
        "Crispy, tasty and freshly prepared for you.",
      price: "£3.50",
      badge: "POPULAR" as const,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 5`,
      description:
        "Flame-grilled and freshly prepared with delicious seasoning.",
      price: "£3.95",
      badge: "RECOMMENDED" as const,
      image: PLACEHOLDER_IMAGE,
    },
    {
      name: `${category} Item 6`,
      description:
        "A customer favourite made fresh and full of flavour.",
      price: "£4.50",
      badge: "POPULAR" as const,
      image: PLACEHOLDER_IMAGE,
    },
  ];
};

/* =====================================================
   SECTION ID
===================================================== */

const getId = (category: string) =>
  `menu-${category
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

/* =====================================================
   MENU
===================================================== */

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full">

      {/* =====================================================
          SEARCH BAR
      ====================================================== */}
      <div className="w-full bg-[#f7f7f7] px-4 pt-5 pb-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <div className="mx-auto w-full max-w-[1150px]">
          <div className="relative w-[200px] sm:w-[240px] md:w-[260px]">
            {/* SVG SEARCH ICON */}
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="h-[38px] w-full rounded-full border border-[#dcdcdc] bg-white pl-9 pr-8 text-[12px] text-[#292929] outline-none transition-all duration-200 placeholder:text-[#bbb] focus:border-[#ff542d] focus:ring-2 focus:ring-[#ff542d]/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[17px] leading-none text-[#bbb] transition-colors hover:text-[#ff542d]"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MENU SECTIONS
      ====================================================== */}
      {categories.map((category, categoryIndex) => {
        const items = createItems(category, categoryIndex);

        // When searching, hide sections that have no matching items
        if (searchQuery) {
          const search = searchQuery.toLowerCase().trim();
          const hasMatch = items.some(
            (item) =>
              item.name.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search)
          );
          if (!hasMatch) return null;
        }

        return (
          <MenuSection
            key={category}
            id={getId(category)}
            title={category}
            items={items}
            searchQuery={searchQuery}
          />
        );
      })}

      {/* NO RESULTS MESSAGE */}
      {searchQuery && (() => {
        const search = searchQuery.toLowerCase().trim();
        const anyMatch = categories.some((category, idx) => {
          const items = createItems(category, idx);
          return items.some(
            (item) =>
              item.name.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search)
          );
        });
        return !anyMatch ? (
          <div className="w-full bg-[#f7f7f7] px-4 py-16 text-center sm:px-6 md:px-10 lg:px-14 xl:px-16">
            <p className="text-[28px]">🍔</p>
            <p className="mt-2 text-[15px] font-semibold text-[#292929]">
              No items found
            </p>
            <p className="mt-1 text-[13px] text-[#888]">
              Try a different search term
            </p>
          </div>
        ) : null;
      })()}

    </div>
  );
}