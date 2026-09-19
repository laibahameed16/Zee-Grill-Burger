"use client";

import { useState, useEffect } from "react";

import TopBar from "@/components/home/TopBar";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import MenuCategory from "@/components/home/MenuCategory";
import Menu from "@/components/home/Menu";
import OurStory from "@/components/home/OurStory";
import ContactSection from "@/components/home/ContactSection";
import Footer from "@/components/home/Footer";
import ScrollToTop from "@/components/home/ScrollToTop";
import OpeningPopup from "@/components/home/OpeningPopup";
import AuthModal from "@/components/home/AuthModal";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState("Porto Kebabs");

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  return (
    <main
      id="home"
      className="min-h-screen"
    >
      {/* OPENING POPUP */}
      <OpeningPopup />

      {/* LOGIN / REGISTER */}
      <AuthModal />

      {/* TOP BAR */}
      <TopBar />

      {/* NAVBAR */}
      <Navbar />

      {/* CART DRAWER */}
      <CartDrawer />

      {/* HERO */}
      <HeroSection />

      {/* =========================
          MENU
      ========================== */}
      <section
        id="menu"
        className="w-full scroll-mt-[76px]"
      >
        <MenuCategory
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <Menu />
      </section>

      {/* =========================
          OUR STORY
      ========================== */}
      <section
        id="our-story"
        className="w-full scroll-mt-[76px]"
      >
        <OurStory />
      </section>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER */}
      <section
        id="footer"
        className="w-full"
      >
        <Footer />
      </section>

      {/* SCROLL TO TOP */}
      <ScrollToTop />
    </main>
  );
}