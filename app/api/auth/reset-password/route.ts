import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const isValid = verifyOtp(email, String(code));

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired verification code. Please check your email and try again.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("[reset-password API error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
