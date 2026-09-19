
export default function TopBar() {
  return (
    <div
      className="
        relative
        flex
        min-h-[26px]
        w-full
        items-center
        bg-[#f4f4f4]
        px-2
        text-[#333]

        xs:px-2.5
        sm:px-3
        md:px-5
        lg:px-6
        xl:px-8
        2xl:px-10
      "
    >
      {/* =====================================================
          LEFT SIDE
      ====================================================== */}
      <div
        className="
          flex
          min-w-0
          w-[48%]
          items-center

          gap-1
          sm:w-auto
          sm:gap-3
          md:gap-4
          lg:gap-5
          xl:gap-6
        "
      >

        {/* ================= PHONE ================= */}
        <div
          className="
            flex
            min-w-0
            shrink
            items-center
            gap-1

            sm:gap-1.5
          "
        >
          <img
            src="/images/topbaricons/cell icon.png"
            alt="Phone"
            className="
              h-[8px]
              w-[8px]
              shrink-0
              object-contain

              sm:h-[9px]
              sm:w-[9px]

              md:h-[10px]
              md:w-[10px]

              lg:h-[11px]
              lg:w-[11px]
            "
          />

          <span
            className="
              min-w-0
              truncate
              whitespace-nowrap
              text-[5px]

              xs:text-[5.5px]
              sm:text-[7px]
              md:text-[8px]
              lg:text-[9px]
            "
          >
            +01747413273
          </span>
        </div>

        {/* ================= EMAIL ================= */}
        <div
          className="
            flex
            min-w-0
            shrink
            items-center
            gap-1

            sm:gap-1.5
          "
        >
          <img
            src="/images/topbaricons/mail icon.png"
            alt="Email"
            className="
              h-[8px]
              w-[8px]
              shrink-0
              object-contain

              sm:h-[9px]
              sm:w-[9px]

              md:h-[10px]
              md:w-[10px]

              lg:h-[11px]
              lg:w-[11px]
            "
          />

          <span
            className="
              min-w-0
              truncate
              whitespace-nowrap
              text-[5px]

              xs:text-[5.5px]
              sm:text-[7px]
              md:text-[8px]
              lg:text-[9px]
            "
          >
            info@portopiripiri.co.uk
          </span>
        </div>
      </div>

      {/* =====================================================
          CENTER DELIVERY
      ====================================================== */}
      <div
        className="
          absolute
          right-2
          flex
          max-w-[45%]
          items-center
          justify-center
          gap-1
          overflow-hidden
          whitespace-nowrap
          rounded-full
          bg-[#ff5b2e]
          px-1.5
          py-[2px]
          text-[4px]
          font-bold
          leading-none
          text-white

          xs:right-2.5
          xs:px-2
          xs:text-[4.5px]

          sm:left-1/2
          sm:right-auto
          sm:max-w-none
          sm:-translate-x-1/2
          sm:gap-1
          sm:px-3
          sm:py-[3px]
          sm:text-[6px]

          md:gap-1.5
          md:px-4
          md:py-[3px]
          md:text-[7px]

          lg:px-6
          lg:py-[4px]
          lg:text-[8px]

          xl:px-7
          2xl:px-8
        "
      >
        <img
          src="/images/topbaricons/van icon.png"
          alt="Delivery"
          className="
            h-[7px]
            w-[7px]
            shrink-0
            object-contain

            sm:h-[9px]
            sm:w-[9px]

            md:h-[10px]
            md:w-[10px]

            lg:h-[11px]
            lg:w-[11px]
          "
        />

        <span className="truncate">
          FREE DELIVERY ON ORDER ABOVE £20.00
        </span>
      </div>
    </div>
  );
}
