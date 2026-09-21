export default function OurStory() {
  return (
    <section id="our-story" className="w-full bg-[#f7f7f7] px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-0 lg:py-16">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1150px]
          flex-col
          items-center
          gap-8
          sm:gap-10
          md:gap-12
          lg:flex-row
          lg:items-center
          lg:gap-12
          xl:gap-14
        "
      >
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2">
          {/* SMALL TITLE */}
          <p
            className="
              text-[9px]
              font-semibold
              tracking-[1px]
              text-[#ff542d]
              sm:text-[10px]
              md:text-[11px]
            "
          >
            OUR STORY
          </p>

          {/* MAIN HEADING */}
          <h2
            className="
              mt-4
              text-[28px]
              font-bold
              leading-[1.1]
              text-[#292929]
              sm:mt-5
              sm:text-[32px]
              md:text-[36px]
              lg:text-[34px]
              xl:text-[38px]
            "
          >
            About Porto Piri Piri
          </h2>

          {/* ORANGE LINE */}
          <div
            className="
              mt-5
              h-[3px]
              w-[38px]
              rounded-full
              bg-[#ff542d]
              sm:mt-6
            "
          />

          {/* PARAGRAPH 1 */}
          <p
            className="
              mt-5
              w-full
              max-w-[560px]
              text-[12px]
              leading-[1.75]
              text-[#6f625f]
              sm:mt-6
              sm:text-[13px]
              sm:leading-[1.8]
              md:text-[14px]
            "
          >
            Porto Piri Piri is a Glasgow-based restaurant with a passion for
            bold, flavour-packed food. Located at{" "}
            <span className="font-bold text-[#4b4140]">
              49 Kilmarnock Road, Shawlands, Glasgow,
            </span>{" "}
            we have been serving the local community with freshly prepared
            Piri Piri dishes, flame-grilled chicken, juicy burgers, wraps, and
            much more.
          </p>

          {/* PARAGRAPH 2 */}
          <p
            className="
              mt-5
              w-full
              max-w-[560px]
              text-[12px]
              leading-[1.75]
              text-[#6f625f]
              sm:mt-5
              sm:text-[13px]
              sm:leading-[1.8]
              md:text-[14px]
            "
          >
            Whether you choose to dine in with us or order a takeaway from the
            comfort of your home, every meal at Porto Piri Piri is prepared
            with care, quality ingredients, and a commitment to great taste.
            We believe great food should be accessible, satisfying, and made
            with love.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex w-full justify-center lg:w-1/2">
          <div
            className="
              relative
              w-full
              max-w-[525px]
              overflow-hidden
              rounded-[20px]
            "
          >
            <img
              src="/images/ourstory/ourstory.png"
              alt="Porto Piri Piri food"
              className="
                block
                h-auto
                w-full
                object-contain
                object-center
              "
            />

            {/* LOCATION BADGE */}
            <div
              className="
                absolute
                bottom-3
                left-3
                rounded-full
                bg-[#ff542d]
                px-4
                py-2
                text-[9px]
                font-semibold
                text-white
                shadow-sm

                sm:bottom-4
                sm:left-4
                sm:px-5
                sm:py-2.5
                sm:text-[10px]

                md:bottom-5
                md:left-5

                lg:bottom-4
                lg:left-6

                xl:bottom-5
                xl:left-5
              "
            >
              Shawlands, Glasgow
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}