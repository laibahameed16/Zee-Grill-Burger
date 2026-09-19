
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
              "
            >
              <img
                src={image}
                alt={`Porto Piri Piri ${index + 1}`}
                className="
                  block
                  w-full
                  h-auto
                  object-contain

                  sm:h-[300px]
                  sm:object-cover

                  md:h-[360px]
                  md:object-cover

                  lg:h-[350px]
                  lg:object-cover

                  xl:h-[480px]
                  xl:object-cover

                  2xl:h-[540px]
                  2xl:object-cover
                "
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div
          className="
            absolute
            bottom-3
            left-1/2
            z-10
            flex
            -translate-x-1/2
            items-center
            gap-2

            sm:bottom-4
          "
        >
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                h-2
                rounded-full
                transition-all
                duration-500

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
