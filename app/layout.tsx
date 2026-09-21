
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/common/ToastContainer";
import Preloader from "@/components/Preloader";
import CartDrawer from "@/components/cart/CartDrawer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Porto Piri Piri",
  description: "Porto Piri Piri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Preloader />
        <ToastContainer />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}