import { SITE_CONFIG } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer id="footer" className="w-full bg-[#eae8e8] text-white">

      {/* MAIN FOOTER */}
      <div className="mx-auto w-full max-w-[1150px] px-5 py-12 sm:px-8 md:px-10 lg:px-0 lg:py-14">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr] lg:gap-12">

          {/* LOGO */}
          <div className="flex items-start">
            <img
              src="/images/navbarimages/logo.png"
              alt={SITE_CONFIG.name}
              className="h-[44px] w-auto object-contain sm:h-[50px]"
            />
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-[13px] font-medium tracking-[0.3px] text-[#ff542d] sm:text-[14px]">
              QUICK LINKS
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <a href="#" className="text-[12px] text-black transition-colors hover:text-[#ff542d] sm:text-[13px]">
                Home
              </a>

              <a href="#our-story" className="text-[12px] text-black transition-colors hover:text-[#ff542d] sm:text-[13px]">
                Our Story
              </a>

              <a href="#menu" className="text-[12px] text-black transition-colors hover:text-[#ff542d] sm:text-[13px]">
                Menu
              </a>

              <a href="#contact" className="text-[12px] text-black transition-colors hover:text-[#ff542d] sm:text-[13px]">
                Contact
              </a>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-[13px] font-medium tracking-[0.3px] text-[#ff542d] sm:text-[14px]">
              CONTACT
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <a href={`tel:${SITE_CONFIG.contact.phone}`} className="text-[12px] text-black transition-colors hover:text-[#ff542d] sm:text-[13px]">
                {SITE_CONFIG.contact.displayPhone}
              </a>

              <a href={`mailto:${SITE_CONFIG.contact.email}`} className="text-[12px] text-black transition-colors hover:text-[#ff542d] sm:text-[13px]">
                {SITE_CONFIG.contact.email}
              </a>

              <p className="max-w-[150px] text-[12px] leading-[1.7] text-black transition-colors sm:text-[13px]">
                {SITE_CONFIG.address.street},
                <br />
                {SITE_CONFIG.address.area}, {SITE_CONFIG.address.city}
                <br />
                {SITE_CONFIG.address.postcode}
              </p>
            </div>
          </div>

          {/* SOCIAL MEDIA */}
          <div>
            <h3 className="text-[13px] font-medium tracking-[0.3px] text-[#ff542d] sm:text-[14px]">
              FOLLOW US ON
            </h3>

            <div className="mt-5 flex items-center gap-2.5">

              {/* INSTAGRAM */}
              <a
                href={SITE_CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-[31px] w-[31px] items-center justify-center rounded-full border border-[#6e6e6e] text-[#6e6e6e] hover:border-[#ff542d] hover:text-[#ff542d] transition-all hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-[14px] w-[14px]"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* FACEBOOK */}
              <a
                href={SITE_CONFIG.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-[31px] w-[31px] items-center justify-center rounded-full border border-[#6e6e6e] text-[#6e6e6e] hover:border-[#ff542d] hover:text-[#ff542d] transition-all hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[14px] w-[14px]"
                >
                  <path d="M13.5 21v-8.5h2.85l.43-3.31H13.5V7.05c0-.96.27-1.62 1.65-1.62h1.76V2.46C16.6 2.4 15.55 2.3 14.32 2.3c-2.55 0-4.3 1.56-4.3 4.42v2.47H7.17v3.31h2.85V21h3.48z" />
                </svg>
              </a>

              {/* WHATSAPP */}
              <a
                href={SITE_CONFIG.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-[31px] w-[31px] items-center justify-center rounded-full border border-[#6e6e6e] text-[#6e6e6e] hover:border-[#ff542d] hover:text-[#ff542d] transition-all hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[14px] w-[14px]"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.35a9.9 9.9 0 0 0 4.64 1.15h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.65-1.03-5.13-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.03.1-1.66-.1-.38-.12-.87-.28-1.5-.55-2.64-1.14-4.37-3.8-4.5-3.98-.13-.18-1.08-1.44-1.08-2.75s.68-1.95.92-2.22c.24-.27.53-.33.7-.33h.5c.16 0 .38-.06.6.46.24.55.8 1.9.87 2.04.07.14.11.3.02.48-.09.18-.14.3-.28.46-.14.16-.29.35-.41.47-.14.13-.28.28-.12.55.16.27.72 1.19 1.54 1.93 1.06.95 1.95 1.24 2.22 1.38.27.14.43.12.6-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.12.07.68-.17 1.35z" />
                </svg>
              </a>

              {/* TIKTOK */}
              <a
                href={SITE_CONFIG.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-[31px] w-[31px] items-center justify-center rounded-full border border-[#6e6e6e] text-[#6e6e6e] hover:border-[#ff542d] hover:text-[#ff542d] transition-all hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[14px] w-[14px]"
                >
                  <path d="M16.6 5.82c-.88-.68-1.44-1.75-1.44-2.94h-3.1v13.02c0 1.41-1.15 2.56-2.56 2.56a2.56 2.56 0 0 1 0-5.12c.24 0 .48.03.7.09V10.4a5.8 5.8 0 0 0-.7-.04 5.66 5.66 0 1 0 5.66 5.66V9.44a7.46 7.46 0 0 0 4.36 1.4V7.77a4.85 4.85 0 0 1-2.92-1.95z" />
                </svg>
              </a>

            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM LINE */}
      <div className="border-t border-[#a5a3a3]">
        <div className="mx-auto w-full max-w-[1150px] px-5 py-5 sm:px-8 md:px-10 lg:px-0">
          <p className="text-[11px] text-[#626262] sm:text-[12px]">
            &copy; {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  );
}