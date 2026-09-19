export default function ContactSection() {
  return (
    <section id="contact" className="w-full bg-[#f7f7f7] px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-12 lg:py-16 scroll-mt-[76px]">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1150px]
          flex-col
          items-center
          gap-8
          lg:flex-row
          lg:gap-16
        "
      >
        {/* MAP */}
        <div
          className="
            w-full
            overflow-hidden
            rounded-[20px]
            shadow-[0_8px_25px_rgba(0,0,0,0.10)]
            sm:w-[90%]
            md:w-[75%]
            lg:w-[48%]
          "
        >
          <iframe
            title="Porto Piri Piri Location"
            src="https://www.google.com/maps?q=49%20Kilmarnock%20Road%2C%20Shawlands%2C%20Glasgow%20G41%203YN&output=embed"
            className="
              block
              h-[300px]
              w-full
              border-0
              sm:h-[340px]
              md:h-[360px]
              lg:h-[380px]
            "
            loading="lazy"
          />
        </div>

        {/* CONTACT DETAILS */}
        <div
          className="
            flex
            w-full
            flex-col
            justify-center
            gap-7
            sm:w-[90%]
            md:w-[75%]
            lg:w-[48%]
          "
        >
          {/* ADDRESS */}
          <div className="flex items-start gap-5">
            <span
              className="
                w-[58px]
                shrink-0
                pt-0.5
                text-[9px]
                font-semibold
                tracking-[0.5px]
                text-[#ff542d]
                sm:text-[10px]
              "
            >
              ADDRESS
            </span>

            <p
              className="
                text-[10px]
                leading-[1.6]
                text-[#292929]
                sm:text-[11px]
                md:text-[12px]
              "
            >
              49 Kilmarnock Road, Shawlands, Glasgow G41 3YN
            </p>
          </div>

          {/* PHONE */}
          <div className="flex items-start gap-5">
            <span
              className="
                w-[58px]
                shrink-0
                pt-0.5
                text-[9px]
                font-semibold
                tracking-[0.5px]
                text-[#ff542d]
                sm:text-[10px]
              "
            >
              PHONE
            </span>

            <p
              className="
                text-[10px]
                leading-[1.6]
                text-[#292929]
                sm:text-[11px]
                md:text-[12px]
              "
            >
              +441747413273
            </p>
          </div>

          {/* EMAIL */}
          <div className="flex items-start gap-5">
            <span
              className="
                w-[58px]
                shrink-0
                pt-0.5
                text-[9px]
                font-semibold
                tracking-[0.5px]
                text-[#ff542d]
                sm:text-[10px]
              "
            >
              EMAIL
            </span>

            <p
              className="
                break-all
                text-[10px]
                leading-[1.6]
                text-[#292929]
                sm:text-[11px]
                md:text-[12px]
              "
            >
              info@portopiripiri.co.uk
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}