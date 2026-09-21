"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const images = [
    "/images/herosection/Herosection.png",
    "/images/herosection/carousel1.png",
    "/images/herosection/carousel2.png",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative w-full overflow-hidden bg-[#f7f7f7]">
      <div className="relative w-full overflow-hidden">
        {/* Carousel Track */}
        <div
          className="flex w-full transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={image}
              className="
                relative
                flex
                w-full
                min-w-full
                shrink-0
                items-center
                justify-center
                overflow-hidden

                h-[150px]
                min-[400px]:h-[165px]
                min-[480px]:h-[180px]
                sm:h-[200px]
                md:h-[180px]
                lg:h-[320px]
                xl:h-[280px]
                2xl:h-[300px]
              "
            >
              <img
                src={image}
                alt={`Porto Piri Piri ${index + 1}`}
                draggable={false}
                className="
                  block
                  h-full
                  w-full
                  object-cover
                  object-center
                "
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div
          className="
            absolute
            bottom-2
            left-1/2
            z-10
            flex
            -translate-x-1/2
            items-center
            gap-2

            min-[400px]:bottom-2
            sm:bottom-3
            md:bottom-4
          "
        >
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={
                index === currentSlide ? "true" : undefined
              }
              className={`
                h-2
                rounded-full
                transition-all
                duration-500
                focus:outline-none

                ${
                  index === currentSlide
                    ? "w-7 bg-white"
                    : "w-2 bg-white/55 hover:bg-white/80"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}