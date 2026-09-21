export default function TopBar() {
  return (
    <div className="relative w-full bg-[#f4f4f4] text-[#333]">
      <div
        className="
          mx-auto flex w-full max-w-[1150px]
          flex-col
          px-5
          py-2
          gap-2

          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-8
          sm:py-1
          sm:gap-0

          md:px-10

          lg:px-0
        "
      >
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <div
          className="
            flex
            w-full
            min-w-0
            items-center
            justify-between
            gap-2

            sm:w-auto
            sm:justify-start
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
              gap-1.5

              sm:gap-1.5
            "
          >
            <img
              src="/images/topbaricons/cell icon.png"
              alt="Phone"
              className="
                h-[12px]
                w-[12px]
                shrink-0
                object-contain

                sm:h-[13px]
                sm:w-[13px]

                md:h-[14px]
                md:w-[14px]

                lg:h-[15px]
                lg:w-[15px]
              "
            />

            <span
              className="
                min-w-0
                truncate
                text-[10px]

                xs:text-[11px]

                sm:text-[12px]

                md:text-[13px]

                lg:text-[12px]
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
              gap-1.5

              sm:gap-1.5
            "
          >
            <img
              src="/images/topbaricons/mail icon.png"
              alt="Email"
              className="
                h-[12px]
                w-[12px]
                shrink-0
                object-contain

                sm:h-[13px]
                sm:w-[13px]

                md:h-[14px]
                md:w-[14px]

                lg:h-[15px]
                lg:w-[15px]
              "
            />

            <span
              className="
                min-w-0
                truncate
                text-[10px]

                xs:text-[11px]

                sm:text-[12px]

                md:text-[13px]

                lg:text-[12px]
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
            flex
            w-full
            items-center
            justify-center
            gap-1
            rounded-full
            bg-[#ff5b2e]
            px-3
            py-1
            text-[10px]
            font-bold
            leading-none
            text-white
            order-first

            sm:order-none
            sm:w-auto
            sm:absolute
            sm:left-1/2
            sm:right-auto
            sm:max-w-none
            sm:-translate-x-1/2
            sm:gap-1
            sm:px-3
            sm:py-[3px]
            sm:text-[12px]

            md:gap-1.5
            md:px-4
            md:py-[3px]
            md:text-[13px]

            lg:px-6
            lg:py-[4px]
            lg:text-[12px]

            xl:px-7

            2xl:px-8
          "
        >
          <img
            src="/images/topbaricons/van icon.png"
            alt="Delivery"
            className="
              h-[10px]
              w-[10px]
              shrink-0
              object-contain

              sm:h-[12px]
              sm:w-[12px]

              md:h-[14px]
              md:w-[14px]

              lg:h-[15px]
              lg:w-[15px]
            "
          />

          <span className="whitespace-nowrap">
            FREE DELIVERY ON ORDER ABOVE £20.00
          </span>
        </div>
      </div>
    </div>
  );
}