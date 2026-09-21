"use client";

import { useEffect, useState } from "react";
import { showNotification } from "@/lib/notifications";

type AuthMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "google-modal"
  | "apple-modal";

interface StoredUser {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password?: string;
  name?: string;
  referenceCode?: string;
}

function GoogleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
      />
      <path
        fill="#34A853"
        d="M12 21.78c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.55 0-4.71-1.72-5.49-4.03H3.26v2.53A9.75 9.75 0 0 0 12 21.78Z"
      />
      <path
        fill="#FBBC05"
        d="M6.51 13.87a5.86 5.86 0 0 1 0-3.74V7.6H3.26a9.78 9.78 0 0 0 0 8.8l3.25-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.19 14.63 2.22 12 2.22a9.75 9.75 0 0 0-8.74 5.38l3.25 2.53C7.29 7.82 9.45 6.1 12 6.1Z"
      />
    </svg>
  );
}

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regReferenceCode, setRegReferenceCode] = useState("");
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regError, setRegError] = useState("");

  // Forgot Password / OTP States
  const [otpEmail, setOtpEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Reset Password Form States
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Google Custom Sign-in State
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

  // Apple Custom Sign-in State
  const [customAppleEmail, setCustomAppleEmail] = useState("");
  const [customAppleName, setCustomAppleName] = useState("");

  const handleAppleClick = () => {
    setMode("apple-modal");
  };

  const handleCustomAppleSignIn = (
    selectedEmail: string,
    selectedName: string
  ) => {
    if (!selectedEmail || !selectedEmail.includes("@")) return;

    performLogin({
      name: selectedName || selectedEmail.split("@")[0],
      email: selectedEmail,
      firstName:
        selectedName.split(" ")[0] || selectedEmail.split("@")[0],
    });
  };

  /* =========================
     LOAD GOOGLE IDENTITY SDK
  ========================== */
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  /* =========================
     RESEND COUNTDOWN TIMER
  ========================== */
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /* =========================
     OPEN LOGIN EVENT
  ========================== */
  useEffect(() => {
    const handleOpenLogin = () => {
      setMode("login");
      setLoginError("");
      setRegError("");
      setOtpError("");
      setResetError("");
      setIsOpen(true);
    };

    window.addEventListener("open-login", handleOpenLogin);

    return () => {
      window.removeEventListener("open-login", handleOpenLogin);
    };
  }, []);

  /* =========================
     LOCK BODY SCROLL
  ========================== */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* =========================
     CLOSE MODAL
  ========================== */
  const closeModal = () => {
    setIsOpen(false);
    setLoginError("");
    setRegError("");
    setOtpError("");
    setResetError("");
    setEmail("");
    setPassword("");
    setRegReferenceCode("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  /* =========================
     HELPER: SAVE USER & LOGIN
  ========================== */
  const performLogin = (
    userData: {
      name: string;
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      profilePic?: string;
    },
    toastMsg: string = "Successfully logged in"
  ) => {
    const displayName = userData.name || userData.firstName || "User";

    let profilePic = userData.profilePic || "";

    if (!profilePic && userData.email) {
      try {
        const savedUsers = JSON.parse(
          localStorage.getItem("zee-grill-registered-users") || "[]"
        );

        const found = savedUsers.find(
          (u: any) =>
            u.email?.toLowerCase() === userData.email.toLowerCase()
        );

        if (found && found.profilePic) {
          profilePic = found.profilePic;
        }
      } catch {
        // ignore
      }
    }

    localStorage.setItem("loggedInUser", displayName);

    localStorage.setItem(
      "zee-grill-user",
      JSON.stringify({
        name: displayName,
        firstName: userData.firstName || displayName,
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        email: userData.email,
        profilePic,
      })
    );

    window.dispatchEvent(new Event("auth-changed"));
    window.dispatchEvent(new Event("user-logged-in"));

    showNotification("success", toastMsg);

    closeModal();
  };

  /* =========================
     LOGIN
  ========================== */
  const handleLogin = () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }

    const customAdminPass =
      localStorage.getItem("zee-grill-admin-password") || "udaisa123";

    const isDefaultUser =
      trimmedEmail === "udaisnaeem@gmail.com" &&
      password === customAdminPass;

    if (isDefaultUser) {
      performLogin({
        name: "udaisa",
        email: "udaisnaeem@gmail.com",
      });

      return;
    }

    try {
      const savedUsers: StoredUser[] = JSON.parse(
        localStorage.getItem("zee-grill-registered-users") || "[]"
      );

      const foundUser = savedUsers.find(
        (u) =>
          u.email.toLowerCase() === trimmedEmail &&
          u.password === password
      );

      if (foundUser) {
        performLogin({
          name:
            `${foundUser.firstName} ${foundUser.lastName}`.trim() ||
            foundUser.firstName,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          phone: foundUser.phone,
          email: foundUser.email,
        });

        return;
      }
    } catch {
      // ignore parse error
    }

    setLoginError("Invalid email or password.");
  };

  /* =========================
     REGISTER
  ========================== */
  const handleRegister = () => {
    if (!regFirstName.trim()) {
      setRegError("First name is required.");
      return;
    }

    if (!regLastName.trim()) {
      setRegError("Last name is required.");
      return;
    }

    if (!regPhone.trim()) {
      setRegError("Phone number is required.");
      return;
    }

    if (!regEmail.trim() || !regEmail.includes("@")) {
      setRegError("A valid email address is required.");
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    try {
      const savedUsers: StoredUser[] = JSON.parse(
        localStorage.getItem("zee-grill-registered-users") || "[]"
      );

      const emailExists = savedUsers.some(
        (u) =>
          u.email.toLowerCase() === regEmail.trim().toLowerCase()
      );

      if (emailExists) {
        setRegError(
          "An account with this email already exists. Please login."
        );
        return;
      }

      const newUser: StoredUser = {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        referenceCode: regReferenceCode.trim(),
        name: `${regFirstName.trim()} ${regLastName.trim()}`,
      };

      savedUsers.push(newUser);

      localStorage.setItem(
        "zee-grill-registered-users",
        JSON.stringify(savedUsers)
      );

      performLogin(
        {
          name: newUser.name || newUser.firstName,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          email: newUser.email,
        },
        "Successfully registered your account"
      );
    } catch {
      setRegError("Failed to register. Please try again.");
    }
  };

  /* =========================
     FORGOT PASSWORD: SEND CODE
  ========================== */
  const handleSendOtp = async (targetEmail?: string) => {
    const emailToSend = (
      targetEmail ||
      otpEmail ||
      email
    )
      .trim()
      .toLowerCase();

    if (!emailToSend || !emailToSend.includes("@")) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    setOtpEmail(emailToSend);
    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setOtpError(
          data.error || "Failed to send code. Please try again."
        );

        setOtpLoading(false);
        return;
      }

      setResendCountdown(60);
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
      setResetError("");
      setMode("reset-password");
    } catch {
      setOtpError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* =========================
     SAVE NEW PASSWORD & AUTO LOGIN
  ========================== */
  const handleSaveNewPassword = async () => {
    if (!resetCode.trim()) {
      setResetError(
        "Please enter the password code received on your email."
      );
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setResetError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    setResetError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpEmail,
          code: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResetError(data.error || "Invalid or expired code.");
        setResetLoading(false);
        return;
      }

      let userDisplayName = "";
      let foundUser: StoredUser | undefined;

      try {
        const savedUsers: StoredUser[] = JSON.parse(
          localStorage.getItem("zee-grill-registered-users") || "[]"
        );

        const userIndex = savedUsers.findIndex(
          (u) =>
            u.email.toLowerCase() === otpEmail.toLowerCase()
        );

        if (userIndex !== -1) {
          savedUsers[userIndex].password = newPassword;
          foundUser = savedUsers[userIndex];

          userDisplayName =
            `${foundUser.firstName} ${foundUser.lastName}`.trim() ||
            foundUser.firstName;

          localStorage.setItem(
            "zee-grill-registered-users",
            JSON.stringify(savedUsers)
          );
        }
      } catch {
        // ignore
      }

      if (otpEmail.toLowerCase() === "udaisnaeem@gmail.com") {
        localStorage.setItem(
          "zee-grill-admin-password",
          newPassword
        );

        userDisplayName = userDisplayName || "udaisa";
      }

      if (!userDisplayName) {
        const prefix = otpEmail.split("@")[0];

        userDisplayName =
          prefix.charAt(0).toUpperCase() + prefix.slice(1);

        try {
          const savedUsers: StoredUser[] = JSON.parse(
            localStorage.getItem("zee-grill-registered-users") || "[]"
          );

          savedUsers.push({
            firstName: userDisplayName,
            lastName: "",
            phone: "",
            email: otpEmail,
            password: newPassword,
            name: userDisplayName,
          });

          localStorage.setItem(
            "zee-grill-registered-users",
            JSON.stringify(savedUsers)
          );
        } catch {
          // ignore
        }
      }

      performLogin({
        name: userDisplayName,
        email: otpEmail,
        firstName: foundUser?.firstName || userDisplayName,
        lastName: foundUser?.lastName || "",
        phone: foundUser?.phone || "",
      });
    } catch {
      setResetError("Failed to reset password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  /* =========================
     GOOGLE SIGN-IN HANDLER
  ========================== */
  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const windowWithGoogle = window as unknown as {
      google?: {
        accounts: {
          oauth2: {
            initTokenClient: (config: {
              client_id: string;
              scope: string;
              callback: (tokenResponse: {
                access_token?: string;
              }) => void;
            }) => {
              requestAccessToken: () => void;
            };
          };
        };
      };
    };

    if (
      clientId &&
      windowWithGoogle.google?.accounts?.oauth2
    ) {
      try {
        const tokenClient =
          windowWithGoogle.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "email profile openid",
            callback: async (tokenResponse) => {
              if (
                tokenResponse &&
                tokenResponse.access_token
              ) {
                try {
                  const res = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                      headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                      },
                    }
                  );

                  const googleProfile = await res.json();

                  if (
                    googleProfile &&
                    googleProfile.email
                  ) {
                    performLogin({
                      name:
                        googleProfile.name ||
                        googleProfile.given_name ||
                        "Google User",
                      email: googleProfile.email,
                      firstName:
                        googleProfile.given_name || "",
                      lastName:
                        googleProfile.family_name || "",
                    });

                    return;
                  }
                } catch (e) {
                  console.error(
                    "Google userinfo fetch error:",
                    e
                  );
                }
              }
            },
          });

        tokenClient.requestAccessToken();
        return;
      } catch (err) {
        console.error(
          "Google GIS init error:",
          err
        );
      }
    }

    setMode("google-modal");
  };

  const handleCustomGoogleSignIn = (
    selectedEmail: string,
    selectedName: string
  ) => {
    if (
      !selectedEmail ||
      !selectedEmail.includes("@")
    )
      return;

    performLogin({
      name:
        selectedName ||
        selectedEmail.split("@")[0],
      email: selectedEmail,
      firstName:
        selectedName.split(" ")[0] ||
        selectedEmail.split("@")[0],
    });
  };

  /* =========================
     MODE NAVIGATION
  ========================== */
  const openRegister = () => {
    setMode("register");
    setLoginError("");
    setRegError("");
  };

  const openLogin = () => {
    setMode("login");
    setLoginError("");
    setRegError("");
    setOtpError("");
    setResetError("");
  };

  const openForgotPassword = () => {
    setOtpEmail(email);
    setOtpError("");
    setMode("forgot-password");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        justify-center
        overflow-y-auto
        bg-black/50
        px-4
        py-6
        [scrollbar-width:none]
        [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {/* =====================================================
          1. LOGIN SCREEN
      ====================================================== */}
      {mode === "login" && (
        <div
          className="
            relative
            my-auto
            w-full
            max-w-[420px]
            rounded-[22px]
            bg-white
            px-6
            py-7
            shadow-[0_20px_60px_rgba(0,0,0,0.3)]
            sm:px-7
          "
        >
          {/* CROSS */}
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close login"
            className="
              absolute
              right-4
              top-4
              flex
              h-[30px]
              w-[30px]
              items-center
              justify-center
              rounded-full
              bg-[#f3f4f6]
              transition-all
              duration-200
              hover:scale-105
              cursor-pointer
            "
          >
            <img
              src="/images/login/cross.png"
              alt="Close"
              className="h-[11px] w-[11px] object-contain"
            />
          </button>

          {/* TITLE */}
          <h2 className="text-[22px] font-bold text-[#202938] sm:text-[24px]">
            Login
          </h2>

          {/* EMAIL */}
          <div className="mt-5 rounded-[14px] bg-[#f4f4f5] px-3.5 py-2.5 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
              E-mail *
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setLoginError("");
              }}
              placeholder="johndoe@example.com"
              className="
                mt-1
                w-full
                bg-transparent
                text-[13px]
                font-medium
                text-[#293241]
                outline-none
                placeholder:text-[#a1a9b5]
              "
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-3 rounded-[14px] bg-[#f4f4f5] px-3.5 py-2.5 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
              Password *
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setLoginError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              placeholder="Your password"
              className="
                mt-1
                w-full
                bg-transparent
                text-[13px]
                font-medium
                text-[#293241]
                outline-none
                placeholder:text-[#a1a9b5]
              "
            />
          </div>

          {/* REMEMBER + FORGOT PASSWORD */}
          <div className="mt-3 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-[#596273]">
              <input
                type="checkbox"
                className="h-[14px] w-[14px] accent-[#ff542d]"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={openForgotPassword}
              className="text-[11px] font-semibold text-[#596273] transition-colors hover:text-[#ff542d]"
            >
              Forgot password?
            </button>
          </div>

          {/* ERROR */}
          {loginError && (
            <p className="mt-2.5 text-center text-[11px] font-semibold text-red-500">
              {loginError}
            </p>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="button"
            onClick={handleLogin}
            className="
              mt-4
              w-full
              rounded-full
              bg-[#ff542d]
              py-3.5
              text-[13px]
              font-bold
              text-white
              shadow-[0_4px_16px_rgba(255,84,45,0.3)]
              transition-all
              duration-200
              hover:bg-[#e94724]
              hover:shadow-[0_6px_20px_rgba(255,84,45,0.4)]
              cursor-pointer
            "
          >
            Login
          </button>

          {/* CREATE ACCOUNT */}
          <p className="mt-4 text-center text-[11px] text-[#7c8490]">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={openRegister}
              className="font-bold text-[#ff542d] hover:underline"
            >
              Create account
            </button>
          </p>

          {/* OR */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e5e7eb]" />
            <span className="text-[10px] font-semibold text-[#a1a7b0]">
              OR
            </span>
            <div className="h-px flex-1 bg-[#e5e7eb]" />
          </div>

          {/* SOCIAL */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* APPLE */}
            <button
              type="button"
              onClick={handleAppleClick}
              className="
                flex
                h-[40px]
                items-center
                justify-center
                gap-2
                rounded-full
                bg-black
                px-3
                text-[11px]
                font-semibold
                text-white
                transition-opacity
                hover:opacity-90
                cursor-pointer
              "
            >
              <img
                src="/images/login/apple.png"
                alt="Apple"
                className="h-[15px] w-[15px] object-contain"
              />
              <span>Apple</span>
            </button>

            {/* GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="
                flex
                h-[40px]
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-[#dfe2e7]
                bg-white
                px-3
                text-[11px]
                font-semibold
                text-[#202938]
                transition-colors
                hover:bg-[#f8f8f8]
                cursor-pointer
              "
            >
              <GoogleLogo className="h-[15px] w-[15px]" />
              <span>Google</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          2. REGISTER SCREEN
      ====================================================== */}
      {mode === "register" && (
        <div
          className="
            relative
            my-auto
            w-full
            max-w-[430px]
            rounded-[22px]
            bg-white
            px-6
            py-7
            shadow-[0_20px_60px_rgba(0,0,0,0.3)]
            sm:px-7
          "
        >
          {/* CROSS */}
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close register"
            className="
              absolute
              right-4
              top-4
              flex
              h-[30px]
              w-[30px]
              items-center
              justify-center
              rounded-full
              bg-[#f3f4f6]
              transition-all
              duration-200
              hover:scale-105
              cursor-pointer
            "
          >
            <img
              src="/images/login/cross.png"
              alt="Close"
              className="h-[11px] w-[11px] object-contain"
            />
          </button>

          <h2 className="text-[22px] font-bold text-[#202938] sm:text-[24px]">
            Register
          </h2>

          <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
            {/* FIRST NAME */}
            <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
                Firstname *
              </label>

              <input
                type="text"
                value={regFirstName}
                onChange={(e) => {
                  setRegFirstName(e.target.value);
                  setRegError("");
                }}
                placeholder="John"
                className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
              />
            </div>

            {/* LAST NAME */}
            <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
                Lastname *
              </label>

              <input
                type="text"
                value={regLastName}
                onChange={(e) => {
                  setRegLastName(e.target.value);
                  setRegError("");
                }}
                placeholder="Doe"
                className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
              />
            </div>

            {/* PHONE */}
            <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
                Phone *
              </label>

              <input
                type="tel"
                value={regPhone}
                onChange={(e) => {
                  setRegPhone(e.target.value);
                  setRegError("");
                }}
                placeholder="447911123456"
                className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
              />
            </div>

            {/* EMAIL */}
            <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
                E-mail *
              </label>

              <input
                type="email"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  setRegError("");
                }}
                placeholder="johndoe@example.com"
                className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
              />
            </div>

            {/* PASSWORD */}
            <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
                Password *
              </label>

              <input
                type="password"
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  setRegError("");
                }}
                placeholder="New password"
                className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
              />
            </div>

            {/* REFERENCE CODE */}
            <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
                Reference Code (Optional)
              </label>

              <input
                type="text"
                value={regReferenceCode}
                onChange={(e) =>
                  setRegReferenceCode(e.target.value)
                }
                placeholder="Enter reference code if you have"
                className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
              />
            </div>
          </div>

          {/* TERMS */}
          <p className="mt-3 text-[10px] leading-[1.5] text-[#707886]">
            You agree to our{" "}
            <span className="font-semibold text-[#303744]">
              Terms of Use
            </span>{" "}
            and confirm that you have read our{" "}
            <span className="font-semibold text-[#303744]">
              Privacy Promise
            </span>.
          </p>

          {/* CHECKBOX */}
          <label className="mt-2 flex cursor-pointer items-start gap-2 text-[10px] leading-[1.5] text-[#707886]">
            <input
              type="checkbox"
              checked={regAgreeTerms}
              onChange={(e) =>
                setRegAgreeTerms(e.target.checked)
              }
              className="mt-[2px] h-[13px] w-[13px] shrink-0 accent-[#ff542d]"
            />

            <span>
              I would like to receive news and promotional offers via email, SMS and push messages.
            </span>
          </label>

          {/* ERROR */}
          {regError && (
            <p className="mt-2 text-center text-[11px] font-semibold text-red-500">
              {regError}
            </p>
          )}

          {/* CREATE ACCOUNT BUTTON */}
          <button
            type="button"
            onClick={handleRegister}
            className="
              mt-3.5
              w-full
              rounded-full
              bg-[#ff542d]
              py-3.5
              text-[13px]
              font-bold
              text-white
              shadow-[0_4px_16px_rgba(255,84,45,0.3)]
              transition-all
              duration-200
              hover:bg-[#e94724]
              hover:shadow-[0_6px_20px_rgba(255,84,45,0.4)]
              cursor-pointer
            "
          >
            Create account
          </button>

          {/* OR */}
          <div className="my-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-[#e5e7eb]" />
            <span className="text-[10px] font-semibold text-[#a1a7b0]">
              OR
            </span>
            <div className="h-px flex-1 bg-[#e5e7eb]" />
          </div>

          {/* GOOGLE REGISTER */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="
              flex
              h-[40px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#dfe2e7]
              bg-white
              px-3
              text-[11px]
              font-semibold
              text-[#202938]
              transition-colors
              hover:bg-[#f8f8f8]
              cursor-pointer
            "
          >
            <GoogleLogo className="h-[15px] w-[15px]" />
            <span>Register with Google</span>
          </button>

          {/* APPLE REGISTER */}
          <button
            type="button"
            onClick={handleAppleClick}
            className="
              mt-2.5
              flex
              h-[40px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#dfe2e7]
              bg-white
              px-3
              text-[11px]
              font-semibold
              text-[#202938]
              transition-colors
              hover:bg-[#f8f8f8]
              cursor-pointer
            "
          >
            <svg
              className="h-[15px] w-[15px]"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M17.05 13.97c-.01-2.91 2.37-4.3 2.48-4.36-1.35-1.98-3.44-2.25-4.18-2.3-1.78-.18-3.48 1.05-4.4 1.05-.91 0-2.31-1.02-3.8-1-1.95.03-3.76 1.14-4.75 2.87-2.03 3.51-.51 8.7 1.47 11.56.97 1.4 2.1 2.96 3.63 2.9 1.47-.05 2.03-.95 3.8-.95 1.76 0 2.27.95 3.82.92 1.57-.02 2.56-1.42 3.52-2.83 1.11-1.63 1.57-3.2 1.59-3.28-.03-.01-2.97-1.14-2.98-4.33zM14.93 6.94c.81-1 1.35-2.38 1.2-3.77-1.19.05-2.65.8-3.49 1.8-.75.87-1.39 2.29-1.21 3.65 1.33.1 2.68-.68 3.5-1.68z" />
            </svg>
            <span>Continue with Apple</span>
          </button>

          {/* LOGIN */}
          <p className="mt-3 text-center text-[11px] text-[#7c8490]">
            Have an account?{" "}
            <button
              type="button"
              onClick={openLogin}
              className="font-bold text-[#ff542d] hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      )}

      {/* =====================================================
          3. FORGOT PASSWORD SCREEN
      ====================================================== */}
      {mode === "forgot-password" && (
        <div
          className="
            relative
            my-auto
            w-full
            max-w-[362px]
            rounded-[11px]
            bg-white
            px-5
            py-6
            shadow-[0_15px_50px_rgba(0,0,0,0.25)]
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="
              absolute
              right-3
              top-3
              flex
              h-[24px]
              w-[24px]
              items-center
              justify-center
              rounded-full
              bg-[#f3f4f6]
              transition-all
              duration-200
              hover:scale-105
            "
          >
            <img
              src="/images/login/cross.png"
              alt="Close"
              className="h-[9px] w-[9px] object-contain"
            />
          </button>

          <h2 className="text-[15px] font-semibold text-[#202938] sm:text-[16px]">
            Forgot Password
          </h2>

          <p className="mt-1 text-[8px] leading-[1.5] text-[#596273]">
            Apna email address darj karein. Hum aapko password reset karne ke liye ek verification code bhejenge.
          </p>

          <div className="mt-4 rounded-[9px] bg-[#f4f4f5] px-3 py-2">
            <label className="block text-[7px] font-medium text-[#596273]">
              E-mail *
            </label>

            <input
              type="email"
              value={otpEmail}
              onChange={(e) => {
                setOtpEmail(e.target.value);
                setOtpError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendOtp();
              }}
              placeholder="johndoe@example.com"
              className="
                mt-1
                w-full
                bg-transparent
                text-[9px]
                text-[#293241]
                outline-none
                placeholder:text-[#a1a9b5]
              "
            />
          </div>

          {otpError && (
            <p className="mt-2 text-center text-[8px] font-medium text-red-500">
              {otpError}
            </p>
          )}

          <button
            type="button"
            onClick={() => handleSendOtp()}
            disabled={otpLoading}
            className="
              mt-4
              w-full
              rounded-full
              bg-[#ff542d]
              py-3
              text-[9px]
              font-semibold
              text-white
              transition-all
              duration-200
              hover:bg-[#e94724]
              disabled:opacity-60
            "
          >
            {otpLoading
              ? "Sending Code..."
              : "Send Verification Code"}
          </button>

          <p className="mt-4 text-center text-[8px] text-[#7c8490]">
            Remember your password?{" "}
            <button
              type="button"
              onClick={openLogin}
              className="font-semibold text-[#202938] hover:text-[#ff542d]"
            >
              Back to Login
            </button>
          </p>
        </div>
      )}

      {/* =====================================================
          4. RESET PASSWORD SCREEN
      ====================================================== */}
      {mode === "reset-password" && (
        <div
          className="
            relative
            my-auto
            w-full
            max-w-[430px]
            rounded-[16px]
            bg-white
            px-6
            py-7
            shadow-[0_15px_50px_rgba(0,0,0,0.25)]
            sm:px-7
          "
        >
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="
              absolute
              right-4
              top-4
              flex
              h-[26px]
              w-[26px]
              items-center
              justify-center
              rounded-full
              bg-[#f3f4f6]
              transition-all
              duration-200
              hover:scale-105
            "
          >
            <img
              src="/images/login/cross.png"
              alt="Close"
              className="h-[10px] w-[10px] object-contain"
            />
          </button>

          <h2 className="text-[17px] font-bold text-[#1f2937]">
            Reset password
          </h2>

          <h3 className="mt-3 text-[12px] font-semibold text-[#1f2937]">
            Enter code and new password
          </h3>

          <p className="mt-1 text-[9px] leading-[1.5] text-[#6b7280]">
            We have sent you a code to your Email address. You have to enter the code to change the password.
          </p>

          <div className="mt-4 rounded-[10px] bg-[#f4f4f5] px-3.5 py-2.5">
            <label className="block text-[8px] font-medium text-[#6b7280]">
              Password code
            </label>

            <input
              type="text"
              value={resetCode}
              onChange={(e) => {
                setResetCode(e.target.value);
                setResetError("");
              }}
              placeholder="From email"
              className="
                mt-1
                w-full
                bg-transparent
                text-[10px]
                font-medium
                text-[#1f2937]
                outline-none
                placeholder:text-[#9ca3af]
              "
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {/* NEW PASSWORD */}
            <div className="rounded-[10px] bg-[#f4f4f5] px-3.5 py-2.5">
              <label className="block text-[8px] font-medium text-[#6b7280]">
                New password
              </label>

              <div className="mt-1 flex items-center justify-between">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setResetError("");
                  }}
                  placeholder="***"
                  className="
                    w-full
                    bg-transparent
                    text-[10px]
                    font-medium
                    text-[#1f2937]
                    outline-none
                    placeholder:text-[#9ca3af]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                  aria-label="Toggle new password visibility"
                  className="ml-1 text-[#9ca3af] transition-colors hover:text-[#4b5563]"
                >
                  {showNewPassword ? (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="rounded-[10px] bg-[#f4f4f5] px-3.5 py-2.5">
              <label className="block text-[8px] font-medium text-[#6b7280]">
                Confirm password
              </label>

              <div className="mt-1 flex items-center justify-between">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setResetError("");
                  }}
                  placeholder="***"
                  className="
                    w-full
                    bg-transparent
                    text-[10px]
                    font-medium
                    text-[#1f2937]
                    outline-none
                    placeholder:text-[#9ca3af]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label="Toggle confirm password visibility"
                  className="ml-1 text-[#9ca3af] transition-colors hover:text-[#4b5563]"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {resetError && (
            <p className="mt-2.5 text-center text-[8px] font-medium text-red-500">
              {resetError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSaveNewPassword}
            disabled={resetLoading}
            className="
              mt-4
              w-full
              rounded-full
              bg-[#ff542d]
              py-3
              text-[11px]
              font-semibold
              text-white
              transition-all
              duration-200
              hover:bg-[#e94724]
              disabled:opacity-60
            "
          >
            {resetLoading
              ? "Saving..."
              : "Save new password"}
          </button>

          <div className="mt-3 flex items-center justify-between text-[8px]">
            <button
              type="button"
              onClick={() => setMode("forgot-password")}
              className="text-[#7c8490] hover:text-[#202938]"
            >
              Change email
            </button>

            {resendCountdown > 0 ? (
              <span className="text-[#a1a7b0]">
                Resend code in {resendCountdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleSendOtp(otpEmail)
                }
                className="font-semibold text-[#ff542d] hover:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          5. GOOGLE QUICK ACCOUNT SELECTOR MODAL
      ====================================================== */}
      {mode === "google-modal" && (
        <div
          className="
            relative
            my-auto
            w-full
            max-w-[420px]
            rounded-[22px]
            bg-white
            px-6
            py-7
            shadow-[0_20px_60px_rgba(0,0,0,0.3)]
            sm:px-7
          "
        >
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="
              absolute
              right-4
              top-4
              flex
              h-[30px]
              w-[30px]
              items-center
              justify-center
              rounded-full
              bg-[#f3f4f6]
              transition-all
              duration-200
              hover:scale-105
              cursor-pointer
            "
          >
            <img
              src="/images/login/cross.png"
              alt="Close"
              className="h-[11px] w-[11px] object-contain"
            />
          </button>

          {/* GOOGLE HEADER */}
          <div className="flex items-center gap-2.5">
            <GoogleLogo className="h-[22px] w-[22px]" />

            <h2 className="text-[20px] font-bold text-[#202938] sm:text-[22px]">
              Sign in with Google
            </h2>
          </div>

          <p className="mt-1 text-[11px] font-medium text-[#596273]">
            Choose or enter your Google account to log in to Zee Grill Burger.
          </p>

          {/* 1-CLICK INSTANT GOOGLE ACCOUNT */}
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                handleCustomGoogleSignIn(
                  "google.user@gmail.com",
                  "Google User"
                )
              }
              className="
                flex
                items-center
                gap-3
                rounded-[14px]
                border
                border-[#e5e7eb]
                p-3
                text-left
                transition-all
                hover:border-[#ff542d]
                hover:bg-[#fff9f7]
                cursor-pointer
              "
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff542d] text-[13px] font-bold text-white shrink-0">
                G
              </div>

              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[13px] font-bold text-[#202938]">
                  Google User
                </p>

                <p className="truncate text-[11px] font-medium text-[#707886]">
                  google.user@gmail.com
                </p>
              </div>
            </button>
          </div>

          <div className="my-4 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-[#e5e7eb]" />

            <span className="text-[10px] font-semibold text-[#a1a7b0]">
              or enter your Google email
            </span>

            <div className="h-px flex-1 bg-[#e5e7eb]" />
          </div>

          {/* CUSTOM GOOGLE NAME INPUT */}
          <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2.5 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
              Your Name
            </label>

            <input
              type="text"
              value={customGoogleName}
              onChange={(e) =>
                setCustomGoogleName(e.target.value)
              }
              placeholder="e.g. John Doe"
              className="mt-1 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
            />
          </div>

          {/* CUSTOM GOOGLE EMAIL INPUT */}
          <div className="mt-3 rounded-[14px] bg-[#f4f4f5] px-3.5 py-2.5 border border-transparent focus-within:border-[#ff542d] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff542d]/10 transition-all duration-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
              Google Email *
            </label>

            <input
              type="email"
              value={customGoogleEmail}
              onChange={(e) =>
                setCustomGoogleEmail(e.target.value)
              }
              placeholder="you@gmail.com"
              className="mt-1 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (
                customGoogleEmail &&
                customGoogleEmail.includes("@")
              ) {
                handleCustomGoogleSignIn(
                  customGoogleEmail.trim(),
                  customGoogleName.trim() ||
                    customGoogleEmail.split("@")[0]
                );
              }
            }}
            disabled={
              !customGoogleEmail ||
              !customGoogleEmail.includes("@")
            }
            className="
              mt-4
              w-full
              rounded-full
              bg-[#ff542d]
              py-3.5
              text-[13px]
              font-bold
              text-white
              shadow-[0_4px_16px_rgba(255,84,45,0.3)]
              transition-all
              duration-200
              hover:bg-[#e94724]
              disabled:opacity-50
              cursor-pointer
            "
          >
            Continue with Google Account
          </button>

          <p className="mt-4 text-center text-[11px] text-[#7c8490]">
            <button
              type="button"
              onClick={openLogin}
              className="font-semibold text-[#596273] hover:text-[#ff542d]"
            >
              &larr; Back to standard login
            </button>
          </p>
        </div>
      )}

      {/* =====================================================
          6. APPLE QUICK ACCOUNT SELECTOR MODAL
      ====================================================== */}
      {mode === "apple-modal" && (
        <div
          className="
            relative
            my-auto
            w-full
            max-w-[420px]
            rounded-[22px]
            bg-white
            px-6
            py-7
            shadow-[0_20px_60px_rgba(0,0,0,0.3)]
            sm:px-7
          "
        >
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="
              absolute
              right-4
              top-4
              flex
              h-[30px]
              w-[30px]
              items-center
              justify-center
              rounded-full
              bg-[#f3f4f6]
              transition-all
              duration-200
              hover:scale-105
              cursor-pointer
            "
          >
            <img
              src="/images/login/cross.png"
              alt="Close"
              className="h-[11px] w-[11px] object-contain"
            />
          </button>

          {/* APPLE HEADER */}
          <div className="flex items-center gap-2.5">
            <img
              src="/images/login/apple.png"
              alt="Apple"
              className="h-[22px] w-[22px] object-contain"
            />

            <h2 className="text-[20px] font-bold text-[#202938] sm:text-[22px]">
              Sign in with Apple
            </h2>
          </div>

          <p className="mt-1 text-[11px] font-medium text-[#596273]">
            Choose or enter your Apple ID account to log in to Zee Grill Burger.
          </p>

          {/* 1-CLICK INSTANT APPLE ACCOUNT */}
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                handleCustomAppleSignIn(
                  "apple.user@icloud.com",
                  "Apple User"
                )
              }
              className="
                flex
                items-center
                gap-3
                rounded-[14px]
                border
                border-[#e5e7eb]
                p-3
                text-left
                transition-all
                hover:border-black
                hover:bg-[#f8f8f8]
                cursor-pointer
              "
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[13px] font-bold text-white shrink-0">
                <img
                  src="/images/login/apple.png"
                  alt="Apple"
                  className="h-[16px] w-[16px] object-contain invert"
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[13px] font-bold text-[#202938]">
                  Apple User
                </p>

                <p className="truncate text-[11px] font-medium text-[#707886]">
                  apple.user@icloud.com
                </p>
              </div>
            </button>
          </div>

          <div className="my-4 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-[#e5e7eb]" />

            <span className="text-[10px] font-semibold text-[#a1a7b0]">
              or enter your Apple ID
            </span>

            <div className="h-px flex-1 bg-[#e5e7eb]" />
          </div>

          {/* CUSTOM APPLE NAME INPUT */}
          <div className="rounded-[14px] bg-[#f4f4f5] px-3.5 py-2.5 border border-transparent focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 transition-all duration-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
              Your Name
            </label>

            <input
              type="text"
              value={customAppleName}
              onChange={(e) =>
                setCustomAppleName(e.target.value)
              }
              placeholder="e.g. John Doe"
              className="mt-1 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
            />
          </div>

          {/* CUSTOM APPLE EMAIL INPUT */}
          <div className="mt-3 rounded-[14px] bg-[#f4f4f5] px-3.5 py-2.5 border border-transparent focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 transition-all duration-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#596273]">
              Apple ID / Email *
            </label>

            <input
              type="email"
              value={customAppleEmail}
              onChange={(e) =>
                setCustomAppleEmail(e.target.value)
              }
              placeholder="you@icloud.com"
              className="mt-1 w-full bg-transparent text-[13px] font-medium text-[#293241] outline-none placeholder:text-[#a1a9b5]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (
                customAppleEmail &&
                customAppleEmail.includes("@")
              ) {
                handleCustomAppleSignIn(
                  customAppleEmail.trim(),
                  customAppleName.trim() ||
                    customAppleEmail.split("@")[0]
                );
              }
            }}
            disabled={
              !customAppleEmail ||
              !customAppleEmail.includes("@")
            }
            className="
              mt-4
              w-full
              rounded-full
              bg-black
              py-3.5
              text-[13px]
              font-bold
              text-white
              shadow-[0_4px_16px_rgba(0,0,0,0.2)]
              transition-all
              duration-200
              hover:bg-[#1f1f1f]
              disabled:opacity-50
              cursor-pointer
            "
          >
            Continue with Apple ID
          </button>

          <p className="mt-4 text-center text-[11px] text-[#7c8490]">
            <button
              type="button"
              onClick={openLogin}
              className="font-semibold text-[#596273] hover:text-[#202938]"
            >
              &larr; Back to standard login
            </button>
          </p>
        </div>
      )}
    </div>
  );
}