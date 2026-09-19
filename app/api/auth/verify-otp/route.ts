import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and 4-digit code are required." },
        { status: 400 }
      );
    }

    const isValid = verifyOtp(email, String(code));

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired 4-digit verification code. Please try again.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful. Logging you in...",
    });
  } catch (error) {
    console.error("[verify-otp API error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
