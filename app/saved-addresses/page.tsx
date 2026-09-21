"use client";

import Navbar from "@/components/home/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface SavedAddress {
  id: string;
  contactName: string;
  contactPhone: string;
  address: string;
  type: "Home" | "Work" | "Other" | string;
  house: string;
  floor: string;
  road: string;
  postcode?: string;
  company?: string;
  createdAt?: number;
}

export default function SavedAddressesPage() {
  const [userName, setUserName] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Form states
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("Home");
  const [house, setHouse] = useState("");
  const [floor, setFloor] = useState("");
  const [road, setRoad] = useState("");
  const [postcode, setPostcode] = useState("");
  const [company, setCompany] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load saved addresses and user info
  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUserName(savedUser);
      setContactName(savedUser);
    }

    try {
      const stored = localStorage.getItem("zee-grill-saved-addresses");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedAddresses(parsed);
          return;
        }
      }

      // Check legacy single address if no list exists yet
      const legacy = localStorage.getItem("savedAddress");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed && typeof parsed === "object" && parsed.address) {
          const item: SavedAddress = {
            id: `addr-${Date.now()}`,
            contactName: parsed.contactName || savedUser || "User",
            contactPhone: parsed.contactPhone || "",
            address: parsed.address || "",
            type: parsed.type || "Home",
            house: parsed.house || "",
            floor: parsed.floor || "",
            road: parsed.road || "",
            createdAt: Date.now(),
          };
          setSavedAddresses([item]);
          localStorage.setItem(
            "zee-grill-saved-addresses",
            JSON.stringify([item])
          );
        }
      }
    } catch {
      setSavedAddresses([]);
    }
  }, []);

  // Save new address
  const handleSaveAddress = () => {
    setFeedback(null);

    if (
      !contactName.trim() ||
      !contactPhone.trim() ||
      !address.trim() ||
      !house.trim() ||
      !road.trim() ||
      !postcode.trim()
    ) {
      setFeedback({
        type: "error",
        message: "Please fill in all required fields (Name, Phone, Address, House, Road, Postcode).",
      });
      return;
    }

    const normalizedPhone = contactPhone.replace(/[\s()-]/g, "").trim();
    const isValidUKPhone = /^(?:\+44|0)(?:7\d{9}|1\d{8,9}|2\d{8,9})$/.test(normalizedPhone);
    if (!isValidUKPhone) {
      setFeedback({
        type: "error",
        message: "Please enter valid details (Valid UK phone number required).",
      });
      return;
    }

    const isValidUKPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(postcode.trim());
    if (!isValidUKPostcode) {
      setFeedback({
        type: "error",
        message: "Please enter valid details (Valid UK postcode required).",
      });
      return;
    }

    const fullAddrString = `${house} ${road} ${address} ${company}`.toLowerCase();
    const isStrictUKAddress = /(uk|united kingdom|england|scotland|wales|northern ireland|britain|gb|great britain|london|manchester|birmingham|liverpool|glasgow|edinburgh|leeds|sheffield|bristol)/i.test(fullAddrString);
    
    if (!isStrictUKAddress) {
      setFeedback({
        type: "error",
        message: "Please enter valid details (Address must be in the UK).",
      });
      return;
    }

    const newAddress: SavedAddress = {
      id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      address: address.trim(),
      type: type || "Home",
      house: house.trim(),
      floor: floor.trim(),
      road: road.trim(),
      postcode: postcode.trim(),
      company: company.trim(),
      createdAt: Date.now(),
    };

    const updated = [newAddress, ...savedAddresses];
    setSavedAddresses(updated);

    localStorage.setItem(
      "zee-grill-saved-addresses",
      JSON.stringify(updated)
    );

    // Keep legacy savedAddress in sync with the latest address
    localStorage.setItem("savedAddress", JSON.stringify(newAddress));

    // Reset input fields
    setAddress("");
    setHouse("");
    setFloor("");
    setRoad("");
    setPostcode("");
    setCompany("");
    setType("Home");

    setFeedback({
      type: "success",
      message: "Address saved successfully! It is now available at checkout.",
    });

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Delete saved address
  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter((item) => item.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem(
      "zee-grill-saved-addresses",
      JSON.stringify(updated)
    );

    if (updated.length > 0) {
      localStorage.setItem("savedAddress", JSON.stringify(updated[0]));
    } else {
      localStorage.removeItem("savedAddress");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <Navbar/>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
      <div
        className="
          mx-auto
          w-full
          max-w-[1150px]
          px-5
          pb-14
          pt-8
          sm:px-8
          sm:pt-10
          md:px-10
          lg:px-0
        "
      >
        {/* BACK */}
        <Link
          href="/"
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-[11px]
            font-medium
            text-[#777]
            transition-colors
            hover:text-[#ff542d]
          "
        >
          <span className="text-[17px]">‹</span>
          Back to Home
        </Link>

        {/* PAGE HEADING */}
        <div className="mb-8">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[2px]
              text-[#ff542d]
              sm:text-[11px]
            "
          >
            ACCOUNT
          </p>

          <h1
            className="
              mt-2
              text-[30px]
              font-extrabold
              leading-tight
              text-[#292929]
              sm:text-[38px]
              lg:text-[42px]
            "
          >
            Saved Addresses
          </h1>

          <p
            className="
              mt-2
              text-[13px]
              text-[#777]
              sm:text-[15px]
            "
          >
            Manage delivery and collection addresses
          </p>
        </div>

        {/* =====================================================
            SAVED ADDRESSES LIST
        ====================================================== */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#292929] sm:text-[20px]">
              Your Saved Addresses ({savedAddresses.length})
            </h2>
          </div>

          {savedAddresses.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#dcdcdc] bg-white p-8 text-center">
              <p className="text-[28px]">📍</p>
              <p className="mt-2 text-[14px] font-semibold text-[#555]">
                No saved addresses yet.
              </p>
              <p className="mt-1 text-[12px] text-[#888]">
                Add your delivery addresses below to quickly auto-fill them during checkout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {savedAddresses.map((item) => (
                <div
                  key={item.id}
                  className="
                    relative
                    flex
                    flex-col
                    justify-between
                    rounded-[16px]
                    border
                    border-[#e8e8e8]
                    bg-white
                    p-5
                    shadow-xs
                    transition-all
                    hover:border-[#ff542d]/40
                    hover:shadow-sm
                  "
                >
                  <div>
                    {/* TOP: TYPE BADGE + DELETE */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-3
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          ${
                            item.type === "Home"
                              ? "bg-[#e8f8f0] text-[#14976c]"
                              : item.type === "Work"
                              ? "bg-[#edf5ff] text-[#2563eb]"
                              : "bg-[#f5eefa] text-[#8b5cf6]"
                          }
                        `}
                      >
                        <span>
                          {item.type === "Home"
                            ? "🏠"
                            : item.type === "Work"
                            ? "💼"
                            : "📍"}
                        </span>
                        {item.type || "Address"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(item.id)}
                        title="Delete address"
                        className="
                          flex
                          h-[28px]
                          w-[28px]
                          items-center
                          justify-center
                          rounded-full
                          text-[#999]
                          transition-colors
                          hover:bg-[#fee2e2]
                          hover:text-[#dc2626]
                          cursor-pointer
                        "
                      >
                        ✕
                      </button>
                    </div>

                    {/* ADDRESS DETAILS */}
                    <div className="mt-3">
                      <p className="text-[14px] font-bold text-[#292929]">
                        {item.house ? `${item.house}, ` : ""}
                        {item.road}
                      </p>

                      {item.floor && (
                        <p className="mt-0.5 text-[12px] text-[#666]">
                          Floor / Apartment: {item.floor}
                        </p>
                      )}

                      {item.address && (
                        <p className="mt-1 text-[12px] text-[#777] line-clamp-2">
                          {item.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CONTACT INFO */}
                  <div className="mt-4 border-t border-[#f0f0f0] pt-3 text-[11px] text-[#888]">
                    <p className="font-medium text-[#444]">
                      {item.contactName} · {item.contactPhone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            ADD ADDRESS CARD
        ====================================================== */}
        <section
          className="
            rounded-[18px]
            border
            border-[#eeeeee]
            bg-white
            p-5
            shadow-[0_3px_15px_rgba(0,0,0,0.06)]
            sm:p-7
            lg:p-8
          "
        >
          {/* TITLE */}
          <div className="mb-6">
            <h2
              className="
                text-[20px]
                font-bold
                text-[#292929]
                sm:text-[23px]
              "
            >
              Add new address
            </h2>
            <p className="mt-1 text-[12px] text-[#777]">
              Save as many addresses as you need. They will automatically be available at checkout.
            </p>
          </div>

          {/* FEEDBACK MESSAGE */}
          {feedback && (
            <div
              className={`
                mb-5
                rounded-[12px]
                px-4
                py-3
                text-[13px]
                font-medium
                ${
                  feedback.type === "success"
                    ? "bg-[#e8f8f0] text-[#14976c] border border-[#a7f3d0]"
                    : "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]"
                }
              `}
            >
              {feedback.message}
            </div>
          )}

          {/* CONTACT NAME */}
          <div
            className="
              mb-4
              rounded-[16px]
              bg-[#f2f2f2]
              px-5
              py-4
            "
          >
            <label
              className="
                block
                text-[11px]
                font-medium
                text-[#888]
                sm:text-[12px]
              "
            >
              Contact name *
            </label>

            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter contact name"
              className="
                mt-1
                w-full
                bg-transparent
                text-[14px]
                text-[#292929]
                outline-none
                placeholder:text-[#aaa]
                sm:text-[15px]
              "
            />
          </div>

          {/* CONTACT PHONE */}
          <div
            className="
              mb-4
              rounded-[16px]
              bg-[#f2f2f2]
              px-5
              py-4
            "
          >
            <label
              className="
                block
                text-[11px]
                font-medium
                text-[#888]
                sm:text-[12px]
              "
            >
              Contact phone *
            </label>

            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Enter contact phone"
              className="
                mt-1
                w-full
                bg-transparent
                text-[14px]
                text-[#292929]
                outline-none
                placeholder:text-[#aaa]
                sm:text-[15px]
              "
            />
          </div>

          {/* ADDRESS */}
          <div
            className="
              mb-4
              rounded-[16px]
              bg-[#f2f2f2]
              px-5
              py-4
            "
          >
            <label
              className="
                block
                text-[11px]
                font-medium
                text-[#888]
                sm:text-[12px]
              "
            >
              Address details / Delivery instructions *
            </label>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full street address or delivery notes"
              rows={3}
              className="
                mt-1
                min-h-[80px]
                w-full
                resize-none
                bg-transparent
                text-[14px]
                text-[#292929]
                outline-none
                placeholder:text-[#aaa]
                sm:text-[15px]
              "
            />
          </div>

          {/* TYPE */}
          <div
            className="
              relative
              mb-4
              rounded-[16px]
              bg-[#f2f2f2]
              px-5
              py-4
            "
          >
            <label
              className="
                block
                text-[11px]
                font-medium
                text-[#888]
                sm:text-[12px]
              "
            >
              Address Type
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="
                mt-1
                w-full
                appearance-none
                bg-transparent
                pr-7
                text-[14px]
                text-[#292929]
                outline-none
                sm:text-[15px]
                cursor-pointer
              "
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>

            <span
              className="
                pointer-events-none
                absolute
                right-5
                bottom-[17px]
                text-[15px]
                text-[#292929]
              "
            >
              ⌄
            </span>
          </div>

          {/* HOUSE + FLOOR */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* HOUSE */}
            <div
              className="
                rounded-[16px]
                bg-[#f2f2f2]
                px-5
                py-4
              "
            >
              <label
                className="
                  block
                  text-[11px]
                  font-medium
                  text-[#888]
                  sm:text-[12px]
                "
              >
                House / Flat number *
              </label>

              <input
                type="text"
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                placeholder="e.g. Flat 4B or No. 12"
                className="
                  mt-1
                  w-full
                  bg-transparent
                  text-[14px]
                  text-[#292929]
                  outline-none
                  placeholder:text-[#aaa]
                  sm:text-[15px]
                "
              />
            </div>

            {/* FLOOR */}
            <div
              className="
                rounded-[16px]
                bg-[#f2f2f2]
                px-5
                py-4
              "
            >
              <label
                className="
                  block
                  text-[11px]
                  font-medium
                  text-[#888]
                  sm:text-[12px]
                "
              >
                Floor (optional)
              </label>

              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 2nd floor"
                className="
                  mt-1
                  w-full
                  bg-transparent
                  text-[14px]
                  text-[#292929]
                  outline-none
                  placeholder:text-[#aaa]
                  sm:text-[15px]
                "
              />
            </div>
          </div>

          {/* POSTCODE + COMPANY */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* POSTCODE */}
            <div
              className="
                rounded-[16px]
                bg-[#f2f2f2]
                px-5
                py-4
              "
            >
              <label
                className="
                  block
                  text-[11px]
                  font-medium
                  text-[#888]
                  sm:text-[12px]
                "
              >
                Postcode *
              </label>

              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="e.g. SW1A 1AA"
                className="
                  mt-1
                  w-full
                  bg-transparent
                  text-[14px]
                  text-[#292929]
                  outline-none
                  placeholder:text-[#aaa]
                  sm:text-[15px]
                "
              />
            </div>

            {/* COMPANY */}
            <div
              className="
                rounded-[16px]
                bg-[#f2f2f2]
                px-5
                py-4
              "
            >
              <label
                className="
                  block
                  text-[11px]
                  font-medium
                  text-[#888]
                  sm:text-[12px]
                "
              >
                Company (optional)
              </label>

              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Zee Grill Burger Ltd"
                className="
                  mt-1
                  w-full
                  bg-transparent
                  text-[14px]
                  text-[#292929]
                  outline-none
                  placeholder:text-[#aaa]
                  sm:text-[15px]
                "
              />
            </div>
          </div>

          {/* ROAD */}
          <div
            className="
              mb-6
              rounded-[16px]
              bg-[#f2f2f2]
              px-5
              py-4
            "
          >
            <label
              className="
                block
                text-[11px]
                font-medium
                text-[#888]
                sm:text-[12px]
              "
            >
              Road / Street *
            </label>

            <input
              type="text"
              value={road}
              onChange={(e) => setRoad(e.target.value)}
              placeholder="e.g. High Street"
              className="
                mt-1
                w-full
                bg-transparent
                text-[14px]
                text-[#292929]
                outline-none
                placeholder:text-[#aaa]
                sm:text-[15px]
              "
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            type="button"
            onClick={handleSaveAddress}
            className="
              flex
              min-h-[54px]
              w-full
              items-center
              justify-center
              rounded-full
              bg-[#ff542d]
              px-6
              text-[14px]
              font-bold
              text-white
              transition-all
              duration-200
              hover:bg-[#e94724]
              hover:shadow-md
              active:scale-[0.99]
              cursor-pointer
              sm:min-h-[58px]
              sm:text-[15px]
            "
          >
            Save address
          </button>
        </section>

        {/* BOTTOM NAVIGATION */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center">
          <Link
            href="/checkout"
            className="
              inline-flex
              h-[38px]
              items-center
              justify-center
              rounded-full
              bg-[#ff542d]
              px-6
              text-[11px]
              font-bold
              text-white
              transition-all
              hover:bg-[#e94724]
              hover:shadow-sm
            "
          >
            Go to Checkout →
          </Link>

          <Link
            href="/"
            className="
              inline-flex
              h-[38px]
              items-center
              justify-center
              rounded-full
              border
              border-[#ff542d]
              px-6
              text-[11px]
              font-bold
              text-[#ff542d]
              transition-all
              hover:bg-[#ff542d]
              hover:text-white
            "
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}