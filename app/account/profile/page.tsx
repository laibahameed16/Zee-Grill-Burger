"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  getUserProfile,
  saveUserProfile,
  type UserProfile,
} from "@/lib/userProfile";
import { showNotification } from "@/lib/notifications";
import Navbar from "@/components/home/Navbar";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePic: "",
    name: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [previewPic, setPreviewPic] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loaded = getUserProfile();
    setProfile(loaded);
    setPreviewPic(loaded.profilePic || "");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("error", "Please select a valid image file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showNotification(
        "error",
        "Image size must be less than 4MB."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewPic(result);
      setProfile((p) => ({ ...p, profilePic: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.firstName.trim()) {
      showNotification("error", "First name is required.");
      return;
    }
    if (!profile.lastName.trim()) {
      showNotification("error", "Last name is required.");
      return;
    }
    if (!profile.email.trim() || !profile.email.includes("@")) {
      showNotification("error", "A valid email address is required.");
      return;
    }

    setIsSaving(true);

    await new Promise((r) => setTimeout(r, 400));

    const finalProfile: UserProfile = {
      ...profile,
    };

    if (newPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        showNotification(
          "error",
          "New password must be at least 6 characters."
        );
        setIsSaving(false);
        return;
      }
      try {
        const usersRaw = localStorage.getItem("zee-grill-registered-users");
        if (usersRaw) {
          const users = JSON.parse(usersRaw);
          const idx = users.findIndex(
            (u: any) =>
              u.email?.toLowerCase() === profile.email?.toLowerCase()
          );
          if (idx !== -1) {
            users[idx].password = newPassword;
            localStorage.setItem(
              "zee-grill-registered-users",
              JSON.stringify(users)
            );
          }
        }
      } catch {
        // ignore
      }
    }

    saveUserProfile(finalProfile);
    setPreviewPic(finalProfile.profilePic || "");

    showNotification("success", "Your profile has been updated successfully!");

    setNewPassword("");
    setIsSaving(false);
  };

  const initial =
    profile.firstName.trim().charAt(0).toUpperCase() ||
    profile.lastName.trim().charAt(0).toUpperCase() ||
    "I";

  return (
    <main className="min-h-screen bg-[#f7f6f5] text-[#292929]">
      <Navbar/>

      <div className="mx-auto w-full max-w-[850px] px-5 pb-12 pt-5 sm:px-8 sm:pt-6 md:px-10 lg:px-0">
        <div className="mb-5">
          <Link
            href="/account"
            aria-label="Back"
            className="
              inline-flex
              items-center
              gap-2
              text-[12px]
              font-semibold
              text-[#666]
              transition-colors
              hover:text-[#ff542d]
              sm:text-[13px]
            "
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Account</span>
          </Link>
        </div>

        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">
            ACCOUNT
          </p>

          <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-[#292929] sm:text-[38px] lg:text-[42px]">
            My Profile
          </h1>

          <p className="mt-2 text-[13px] text-[#777] sm:text-[15px]">
            Update your personal details
          </p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="
            rounded-[18px]
            border
            border-[#eeeeee]
            bg-white
            p-5
            shadow-[0_3px_15px_rgba(0,0,0,0.06)]
            sm:p-7
          "
        >
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#ff542d] sm:text-[11px]">
            PHOTO
          </p>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div
              className="
                flex
                h-[120px]
                w-[120px]
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-[#ff542d]
                text-[44px]
                font-bold
                text-white
                shadow-md
                ring-4
                ring-white
                sm:h-[140px]
                sm:w-[140px]
              "
            >
              {previewPic ? (
                <img
                  src={previewPic}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="
                  block
                  w-full
                  max-w-[280px]
                  text-[11px]
                  text-[#555]
                  file:mr-3
                  file:cursor-pointer
                  file:rounded-full
                  file:border-0
                  file:bg-[#ff542d]
                  file:px-5
                  file:py-2
                  file:text-[11px]
                  file:font-semibold
                  file:text-white
                  file:transition-colors
                  hover:file:bg-[#e94724]
                  sm:text-[12px]
                "
              />
              <p className="mt-2 text-[10px] text-[#999] sm:text-[11px]">
                JPG, PNG or GIF. Max size 4MB.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">
                First name
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, firstName: e.target.value }))
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-transparent
                  bg-[#f5f5f5]
                  px-5
                  py-[14px]
                  text-[13px]
                  text-[#292929]
                  outline-none
                  transition-all
                  focus:border-[#ff542d]
                  focus:bg-white
                  focus:shadow-sm
                  sm:px-6
                  sm:text-[14px]
                "
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">
                Last name
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, lastName: e.target.value }))
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-transparent
                  bg-[#f5f5f5]
                  px-5
                  py-[14px]
                  text-[13px]
                  text-[#292929]
                  outline-none
                  transition-all
                  focus:border-[#ff542d]
                  focus:bg-white
                  focus:shadow-sm
                  sm:px-6
                  sm:text-[14px]
                "
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile((p) => ({ ...p, email: e.target.value }))
              }
              className="
                w-full
                rounded-2xl
                border
                border-transparent
                bg-[#f5f5f5]
                px-5
                py-[14px]
                text-[13px]
                text-[#292929]
                outline-none
                transition-all
                focus:border-[#ff542d]
                focus:bg-white
                focus:shadow-sm
                sm:px-6
                sm:text-[14px]
              "
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">
              Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              className="
                w-full
                rounded-2xl
                border
                border-transparent
                bg-[#f5f5f5]
                px-5
                py-[14px]
                text-[13px]
                text-[#292929]
                outline-none
                transition-all
                focus:border-[#ff542d]
                focus:bg-white
                focus:shadow-sm
                sm:px-6
                sm:text-[14px]
              "
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium text-[#777] sm:text-[12px]">
              New password (optional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full
                rounded-2xl
                border
                border-transparent
                bg-[#f5f5f5]
                px-5
                py-[14px]
                text-[13px]
                text-[#292929]
                outline-none
                transition-all
                focus:border-[#ff542d]
                focus:bg-white
                focus:shadow-sm
                sm:px-6
                sm:text-[14px]
              "
            />
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className="
                w-full
                rounded-full
                bg-[#ff542d]
                py-[15px]
                text-[13px]
                font-bold
                text-white
                shadow-md
                transition-all
                duration-200
                hover:bg-[#e94724]
                hover:shadow-lg
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-70
                sm:text-[14px]
              "
            >
              {isSaving ? "Updating..." : "Update profile"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/account"
            className="
              inline-flex
              h-[38px]
              items-center
              justify-center
              rounded-full
              bg-[#ff542d]
              px-7
              text-[10px]
              font-bold
              text-white
              transition-all
              hover:bg-[#e94724]
              hover:shadow-md
            "
          >
            Back to Account
          </Link>
        </div>
      </div>
    </main>
  );
}
