"use client";

import { useEffect, useRef, useState } from "react";

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

type MenuCategoryProps = {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

const getId = (category: string) =>
  `menu-${category.toLowerCase().replace(/\s+/g, "-")}`;

const getButtonId = (category: string) =>
  `category-${category.toLowerCase().replace(/\s+/g, "-")}`;

export default function MenuCategory({
  selectedCategory,
  setSelectedCategory,
}: MenuCategoryProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const selectedCategoryRef = useRef(selectedCategory);
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Sync selectedCategory ref
  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  // Track mobile screen size for step size (4 on mobile, 7 on desktop)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute 7 visible categories (first 4 visible on mobile, all 7 on sm+)
  const visibleCategories = Array.from({ length: 7 }, (_, i) => {
    return categories[(startIndex + i) % categories.length];
  });

  // =========================
  // ARROW NAVIGATION
  // =========================
  const handlePrevious = () => {
    const step = isMobile ? 4 : 7;
    setStartIndex((current) => {
      return (current - step + categories.length) % categories.length;
    });
  };

  const handleNext = () => {
    const step = isMobile ? 4 : 7;
    setStartIndex((current) => {
      return (current + step) % categories.length;
    });
  };

  // =========================
  // TOUCH SWIPE NAVIGATION
  // =========================
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    touchStartXRef.current = null;
  };

  // =========================
  // CATEGORY CLICK (SMOOTH SCROLL)
  // =========================
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    selectedCategoryRef.current = category;
    isClickScrollingRef.current = true;

    const catIdx = categories.indexOf(category);
    if (catIdx !== -1) {
      setStartIndex((prev) => {
        const count = window.innerWidth < 640 ? 4 : 7;
        const currentVisible = Array.from(
          { length: count },
          (_, i) => (prev + i) % categories.length
        );

        if (!currentVisible.includes(catIdx)) {
          return catIdx;
        }
        return prev;
      });
    }

    const section = document.getElementById(getId(category));
    if (section) {
      const categoryBar = barRef.current;
      const barHeight = categoryBar?.offsetHeight ?? 68;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const targetScroll = Math.max(0, sectionTop - barHeight + 2);

      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 800);
  };

  // =========================
  // ACTIVE CATEGORY ON SCROLL (SCROLLSPY) & PINNED DETECTION
  // =========================
  useEffect(() => {
    const menu = document.getElementById("menu");
    if (!menu) return;

    const sections = categories
      .map((category) => ({
        category,
        element: document.getElementById(getId(category)),
      }))
      .filter(
        (
          item
        ): item is {
          category: string;
          element: HTMLElement;
        } => Boolean(item.element)
      );

    if (!sections.length) return;

    let ticking = false;

    const updateActiveCategory = () => {
      if (!barRef.current) {
        ticking = false;
        return;
      }

      const barRect = barRef.current.getBoundingClientRect();
      setIsPinned(barRect.top <= 2);

      // Don't update during click programmatic smooth scroll
      if (isClickScrollingRef.current) {
        ticking = false;
        return;
      }

      const barHeight = barRef.current.offsetHeight || 68;
      const menuTop = menu.getBoundingClientRect().top;

      // Menu section not reached yet
      if (menuTop > barHeight + 10) {
        if (selectedCategoryRef.current !== categories[0]) {
          selectedCategoryRef.current = categories[0];
          setSelectedCategory(categories[0]);
        }
        ticking = false;
        return;
      }

      const triggerPoint = barHeight + 40;
      let currentCategory = categories[0];

      for (const item of sections) {
        const top = item.element.getBoundingClientRect().top;
        if (top <= triggerPoint) {
          currentCategory = item.category;
        } else {
          break;
        }
      }

      // If at bottom of page, highlight last category
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        currentCategory = sections[sections.length - 1].category;
      }

      if (currentCategory !== selectedCategoryRef.current) {
        selectedCategoryRef.current = currentCategory;
        setSelectedCategory(currentCategory);

        // Check if current active category is visible in current window
        const catIdx = categories.indexOf(currentCategory);
        if (catIdx !== -1) {
          setStartIndex((prev) => {
            const count = window.innerWidth < 640 ? 4 : 7;
            const currentVisible = Array.from(
              { length: count },
              (_, i) => (prev + i) % categories.length
            );

            if (!currentVisible.includes(catIdx)) {
              // Bring active category into view
              return catIdx;
            }
            return prev;
          });
        }
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveCategory);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    updateActiveCategory();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [setSelectedCategory]);

  return (
    <div
      ref={barRef}
      className={`
        sticky
        top-0
        z-40
        w-full
        border-b
        border-[#dedede]
        bg-white/98
        backdrop-blur-sm
        transition-shadow
        duration-200
        ${isPinned ? "shadow-[0_4px_16px_rgba(0,0,0,0.08)]" : "shadow-xs"}

        px-2
        py-2.5
        xs:px-3
        xs:py-3
        sm:px-5
        sm:py-3.5
        md:px-8
        md:py-4
        lg:px-12
        xl:px-16
      `}
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1150px]
          items-center

          gap-1.5
          xs:gap-2
          sm:gap-3
          md:gap-4
        "
      >
        {/* =========================
            LEFT ARROW
        ========================== */}
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous categories"
          className="
            flex
            h-[32px]
            w-[32px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#dedede]
            bg-white
            shadow-[0_1px_3px_rgba(0,0,0,0.06)]
            transition-all
            duration-200
            cursor-pointer

            hover:border-[#ff542d]
            hover:bg-[#fff7f5]
            hover:scale-105
            active:scale-95

            xs:h-[34px]
            xs:w-[34px]
            sm:h-[38px]
            sm:w-[38px]
          "
        >
          <img
            src="/images/menucategory/arrowleft.png"
            alt="Previous"
            className="
              h-[12px]
              w-[12px]
              object-contain
              xs:h-[13px]
              xs:w-[13px]
              sm:h-[15px]
              sm:w-[15px]
            "
          />
        </button>

        {/* =========================
            CATEGORIES GRID: 4 on mobile, 7 on desktop
        ========================== */}
        <div
          className="
            grid
            min-w-0
            flex-1
            grid-cols-4
            sm:grid-cols-7

            gap-1.5
            xs:gap-2
            sm:gap-2.5
            md:gap-3
          "
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {visibleCategories.map((category, index) => {
            const isActive = selectedCategory === category;
            const isExtraForMobile = index >= 4;

            return (
              <button
                key={`${category}-${index}`}
                id={getButtonId(category)}
                type="button"
                onClick={() => handleCategoryClick(category)}
                title={category}
                className={`
                  ${isExtraForMobile ? "hidden sm:flex" : "flex"}
                  min-w-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  text-center
                  font-semibold
                  leading-tight
                  transition-all
                  duration-200
                  cursor-pointer
                  select-none

                  h-[40px]
                  px-2
                  text-[12px]
                  xs:h-[42px]
                  xs:px-3
                  xs:text-[13px]
                  sm:h-[42px]
                  sm:px-3.5
                  sm:text-[14px]
                  md:h-[44px]
                  md:px-4
                  md:text-[15px]
                  lg:text-[16px]

                  ${
                    isActive
                      ? "border-[#ff542d] bg-[#ff542d] text-white shadow-[0_2px_8px_rgba(255,84,45,0.35)] scale-[1.02]"
                      : "border-[#e0e0e0] bg-white text-[#2d2d2d] shadow-xs hover:border-[#ff542d] hover:text-[#ff542d] hover:bg-[#fff7f5]"
                  }
                `}
              >
                <span className="block max-w-full truncate whitespace-nowrap">
                  {category}
                </span>
              </button>
            );
          })}
        </div>

        {/* =========================
            RIGHT ARROW
        ========================== */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next categories"
          className="
            flex
            h-[32px]
            w-[32px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#dedede]
            bg-white
            shadow-[0_1px_3px_rgba(0,0,0,0.06)]
            transition-all
            duration-200
            cursor-pointer

            hover:border-[#ff542d]
            hover:bg-[#fff7f5]
            hover:scale-105
            active:scale-95

            xs:h-[34px]
            xs:w-[34px]
            sm:h-[38px]
            sm:w-[38px]
          "
        >
          <img
            src="/images/menucategory/arrowright.png"
            alt="Next"
            className="
              h-[12px]
              w-[12px]
              object-contain
              xs:h-[13px]
              xs:w-[13px]
              sm:h-[15px]
              sm:w-[15px]
            "
          />
        </button>


      </div>
    </div>
  );
}