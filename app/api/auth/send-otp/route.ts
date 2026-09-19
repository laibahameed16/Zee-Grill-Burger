import { NextRequest, NextResponse } from "next/server";
import { generateOtp, sendOtpEmail } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const code = generateOtp(normalizedEmail);
    const emailResult = await sendOtpEmail(normalizedEmail, code);

    if (!emailResult.sent) {
      return NextResponse.json(
        {
          success: false,
          error:
            emailResult.error ||
            "Could not send email to inbox. Please check server email credentials.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 4-digit verification code has been sent to ${normalizedEmail}.`,
    });
  } catch (error) {
    console.error("[send-otp API error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
