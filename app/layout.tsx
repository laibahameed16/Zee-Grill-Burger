
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/common/ToastContainer";
import Preloader from "@/components/Preloader";
import CartDrawer from "@/components/cart/CartDrawer";
import { SITE_CONFIG } from "@/lib/siteConfig";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
  description: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${poppins.variable} antialiased`}>
        <Preloader />
        <ToastContainer />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}