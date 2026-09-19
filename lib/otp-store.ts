import nodemailer from "nodemailer";

interface OtpEntry {
  code: string;
  expiresAt: number;
}

// Global OTP store to persist across API route re-invocations in development/runtime
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpEntry>;
};

export const otpStore: Map<string, OtpEntry> =
  globalForOtp.otpStore || new Map<string, OtpEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.otpStore = otpStore;
}

// Generate 4-digit code
export function generateOtp(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  // 4-digit random number between 1000 and 9999
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedEmail, { code, expiresAt });
  return code;
}

// Verify 4-digit code
export function verifyOtp(email: string, code: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = otpStore.get(normalizedEmail);

  if (!entry) {
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (entry.code === code.trim()) {
    // Delete OTP once used
    otpStore.delete(normalizedEmail);
    return true;
  }

  return false;
}

// Nodemailer transport setup
function getTransporter() {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, "");

  if (gmailUser && gmailAppPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPass,
      },
    });
  }

  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

// Send OTP email
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  const fromEmail =
    process.env.SMTP_FROM || process.env.GMAIL_USER || "no-reply@zeegrillburger.com";

  if (!transporter) {
    console.log("--------------------------------------------------");
    console.log(`[ZEE GRILL AUTH] 4-digit OTP Code for ${email}: ${code}`);
    console.log("ALERT: Real email cannot be sent because GMAIL_APP_PASSWORD is not configured in .env.local!");
    console.log("--------------------------------------------------");
    return {
      sent: false,
      error:
        "Sender email credentials missing. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local so emails can be delivered to real inboxes.",
    };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #292929; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Zee Grill &amp; Burger</h1>
        <p style="color: #ff542d; margin: 5px 0 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Login Verification Code</p>
      </div>
      
      <div style="padding: 30px 24px; text-align: center; color: #333333;">
        <p style="font-size: 15px; margin-bottom: 20px;">Hello,</p>
        <p style="font-size: 14px; color: #666666; margin-bottom: 25px;">
          You requested a 4-digit verification code to log in to your Zee Grill account. Use the code below:
        </p>

        <div style="display: inline-block; background-color: #fff4f0; border: 2px dashed #ff542d; border-radius: 10px; padding: 14px 28px; margin: 10px 0 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ff542d; font-family: monospace;">
            ${code}
          </span>
        </div>

        <p style="font-size: 12px; color: #888888; margin-top: 15px;">
          This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
        </p>
        <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #999999; font-size: 11px; margin: 0;">
          &copy; ${new Date().getFullYear()} Zee Grill Burger. All rights reserved.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Zee Grill Burger" <${fromEmail}>`,
      to: email,
      subject: `Your Zee Grill Login Code: ${code}`,
      text: `Your Zee Grill 4-digit verification code is: ${code}. It expires in 10 minutes.`,
      html: htmlContent,
    });
    return { sent: true };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("[ZEE GRILL AUTH] Failed to send email via SMTP:", errMessage);
    return {
      sent: false,
      error: `Email delivery failed: ${errMessage}. Please verify your Gmail App Password.`,
    };
  }
}
