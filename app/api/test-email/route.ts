import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") || process.env.ADMIN_EMAIL || "zainarshad110@gmail.com";

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"Ethereal Wear" <${user || "orders@etherealwear.com"}>`;

  if (!user || !pass) {
    return NextResponse.json(
      {
        success: false,
        error: "SMTP Credentials are missing in environment variables.",
        diagnostics: {
          SMTP_HOST: host,
          SMTP_PORT: port,
          SMTP_USER: user ? "Configured" : "MISSING",
          SMTP_PASS: pass ? "Configured" : "MISSING",
          SMTP_FROM: from,
        },
        instruction:
          "Please add SMTP_USER and SMTP_PASS to your .env file or Vercel Environment Variables. For Gmail: Use your Gmail address and a 16-character Google App Password (https://myaccount.google.com/apppasswords).",
      },
      { status: 400 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: "🧪 Test Email from Ethereal Wear",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-family: Georgia, serif; letter-spacing: 2px;">ETHEREAL WEAR</h1>
          </div>
          <div style="padding: 24px; color: #333;">
            <h2 style="color: #10b981;">✅ Email System is Working Perfectly!</h2>
            <p>This is a test email confirming that your SMTP server configuration is valid and active.</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0; font-size: 13px;">
              <strong>Host:</strong> ${host}<br>
              <strong>Sender:</strong> ${user}<br>
              <strong>Recipient:</strong> ${to}<br>
              <strong>Timestamp:</strong> ${new Date().toISOString()}
            </div>
            <p>From now on, order confirmation emails and status update notifications will be delivered straight to customer and admin inboxes.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${to}!`,
      messageId: info.messageId,
      diagnostics: {
        host,
        port,
        user,
        recipient: to,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test email.",
        diagnostics: {
          host,
          port,
          user,
        },
        hint:
          "If using Gmail, make sure 2-Step Verification is enabled and you generated a 16-character 'App Password' from https://myaccount.google.com/apppasswords (do not use your regular Gmail login password).",
      },
      { status: 500 }
    );
  }
}
