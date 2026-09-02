import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// Reusable Transporter Singleton
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  // If using Gmail, service: "gmail" provides best serverless compatibility
  if (host.includes("gmail") || (user && user.endsWith("@gmail.com"))) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

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

interface OrderItemDetail {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  size?: string;
}

interface SendOrderEmailsParams {
  orderId: string;
  total: number;
  items: OrderItemDetail[];
  shippingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
}

export class EmailService {
  private static getFromAddress(): string {
    return (
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      `"Ethereal Wear" <${process.env.SMTP_USER || "orders@etherealwear.com"}>`
    );
  }

  /**
   * Send Order Confirmation to Customer & New Order Alert to Admins
   */
  static async sendOrderPlacedEmails(params: SendOrderEmailsParams) {
    const { orderId, total, items, shippingDetails } = params;
    const formattedOrderId = orderId.slice(-8).toUpperCase();
    const customerName = `${shippingDetails.firstName} ${shippingDetails.lastName}`.trim();
    const customerEmail = shippingDetails.email;

    // 1. Generate Luxury HTML Template for Customer
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; color: #1a1a1a; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; }
          .header { background-color: #000000; color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { font-family: Georgia, serif; font-size: 26px; letter-spacing: 4px; margin: 0; font-weight: normal; }
          .header p { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a0a0a0; margin: 8px 0 0; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
          .subtitle { font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 24px; }
          .order-box { background-color: #fafafa; border: 1px solid #ededed; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; }
          .order-box-item { font-size: 12px; color: #777777; text-transform: uppercase; letter-spacing: 1px; }
          .order-box-val { font-size: 15px; font-weight: 700; color: #111111; margin-top: 4px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .items-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; }
          .items-table td { padding: 14px 0; border-bottom: 1px solid #f2f2f2; font-size: 14px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #444444; }
          .summary-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 12px 0 0; border-top: 2px solid #111111; margin-top: 8px; color: #000000; }
          .address-card { background-color: #fafafa; border-radius: 8px; padding: 16px 20px; font-size: 13px; line-height: 1.6; color: #444444; margin-top: 24px; }
          .footer { background-color: #f7f7f7; padding: 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eaeaea; }
          .footer a { color: #111111; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ETHEREAL WEAR</h1>
            <p>Order Confirmation</p>
          </div>
          <div class="content">
            <div class="greeting">Thank you for your order, ${customerName}!</div>
            <div class="subtitle">We have received your order <strong>#${formattedOrderId}</strong> and our atelier has begun preparing it for shipment.</div>
            
            <div style="margin-bottom: 24px;">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map(
                      (item) => `
                    <tr>
                      <td style="font-weight: 500; color: #111111;">
                        ${item.name} ${item.size ? `<span style="font-size: 11px; color: #888888;">(Size: ${item.size})</span>` : ""}
                      </td>
                      <td style="text-align: center; color: #555555;">${item.quantity}</td>
                      <td style="text-align: right; font-weight: 600;">Rs.${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              <div style="max-width: 260px; margin-left: auto;">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>Rs.${total.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span style="color: #10b981; font-weight: 600;">FREE EXPRESS</span>
                </div>
                <div class="summary-total">
                  <span>Total Paid</span>
                  <span>Rs.${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="address-card">
              <strong style="color: #111111; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; display: block; margin-bottom: 6px;">Shipping Destination</strong>
              ${shippingDetails.address}<br>
              ${shippingDetails.city}, ${shippingDetails.country} ${shippingDetails.zipCode}
            </div>
          </div>
          <div class="footer">
            Need help with your order? Reply directly to this email or visit <a href="${process.env.NEXTAUTH_URL || "https://ethereal-wear-g5lh.vercel.app"}">Ethereal Wear</a>.
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. Generate Admin Alert HTML Template
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; color: #18181b; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; }
          .header { background-color: #18181b; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { font-size: 20px; margin: 0; font-weight: 700; letter-spacing: 1px; }
          .badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-top: 8px; text-transform: uppercase; }
          .content { padding: 28px; font-size: 14px; }
          .info-grid { background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .info-row:last-child { margin-bottom: 0; }
          .btn { display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 NEW ORDER RECEIVED</h1>
            <div class="badge">Payment Confirmed • Rs.${total.toFixed(2)}</div>
          </div>
          <div class="content">
            <p style="margin-top: 0; font-size: 15px;">A new order <strong>#${formattedOrderId}</strong> has just been placed by <strong>${customerName}</strong>.</p>
            
            <div class="info-grid">
              <div class="info-row">
                <span style="color: #71717a;">Customer:</span>
                <strong>${customerName} (${customerEmail})</strong>
              </div>
              <div class="info-row">
                <span style="color: #71717a;">Destination:</span>
                <strong>${shippingDetails.city}, ${shippingDetails.country}</strong>
              </div>
              <div class="info-row">
                <span style="color: #71717a;">Items Count:</span>
                <strong>${items.reduce((acc, i) => acc + i.quantity, 0)} item(s)</strong>
              </div>
              <div class="info-row">
                <span style="color: #71717a;">Total Amount:</span>
                <strong style="color: #059669;">Rs.${total.toFixed(2)}</strong>
              </div>
            </div>

            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 10px;">Ordered Products</h3>
            <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.8;">
              ${items
                .map(
                  (item) => `
                <li><strong>${item.name}</strong> ${item.size ? `(Size: ${item.size})` : ""} × ${item.quantity} — <em>Rs.${(item.price * item.quantity).toFixed(2)}</em></li>
              `
                )
                .join("")}
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || "https://ethereal-wear-g5lh.vercel.app"}/admin/orders" class="btn" style="color: #ffffff;">View in Admin Dashboard</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Find Admin Emails
    let adminEmails = ["admin@ethereal.com", "zainarshad110@gmail.com"];
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });
      const dbAdmins = adminUsers.map((u) => u.email).filter(Boolean) as string[];
      if (dbAdmins.length > 0) {
        adminEmails = Array.from(new Set([...adminEmails, ...dbAdmins]));
      }
    } catch (e) {
      console.warn("Could not query admin emails from database, using defaults.");
    }

    if (process.env.ADMIN_EMAIL) {
      adminEmails.push(process.env.ADMIN_EMAIL);
    }

    const transporter = getTransporter();

    // If SMTP credentials configured -> Send via Nodemailer
    if (transporter) {
      try {
        // Send to Customer
        await transporter.sendMail({
          from: this.getFromAddress(),
          to: customerEmail,
          subject: `Order Confirmation #${formattedOrderId} — Ethereal Wear`,
          html: customerHtml,
        });
        console.log(`[EmailService] Customer confirmation sent to ${customerEmail}`);

        // Send to Admins
        await transporter.sendMail({
          from: this.getFromAddress(),
          to: adminEmails.join(", "),
          subject: `[New Order] #${formattedOrderId} placed by ${customerName} (Rs.${total.toFixed(2)})`,
          html: adminHtml,
        });
        console.log(`[EmailService] Admin notification sent to ${adminEmails.join(", ")}`);
      } catch (err: any) {
        console.error("[EmailService] Failed to dispatch order emails via SMTP:", err.message);
      }
    } else {
      // Safe fallback logging when SMTP env variables are pending
      console.log(`\n================= 📧 EMAIL SIMULATION (ORDER #${formattedOrderId}) =================`);
      console.log(`[To Customer]: ${customerEmail} | Subject: Order Confirmation #${formattedOrderId}`);
      console.log(`[To Admins]: ${adminEmails.join(", ")} | Subject: [New Order] #${formattedOrderId}`);
      console.log(`Total: Rs.${total.toFixed(2)} | Items: ${items.length}`);
      console.log(`========================================================================\n`);
    }
  }

  /**
   * Send Order Status Update Email to Customer (e.g. IN PROGRESS, SHIPPED, DELIVERED)
   */
  static async sendOrderStatusUpdateEmail(params: {
    orderId: string;
    newStatus: string;
    customerEmail: string;
    customerName: string;
    total: number;
    items?: Array<{ name: string; quantity: number }>;
  }) {
    const { orderId, newStatus, customerEmail, customerName, total } = params;
    const formattedOrderId = orderId.slice(-8).toUpperCase();

    const statusDisplayMap: Record<string, { title: string; color: string; message: string }> = {
      PAID: {
        title: "Payment Confirmed & In Preparation",
        color: "#3b82f6",
        message: "Your payment has been successfully verified. Our team is handcrafting and packaging your order.",
      },
      SHIPPED: {
        title: "Order Shipped (In Transit)",
        color: "#8b5cf6",
        message: "Great news! Your package has been dispatched and is currently on its way to your delivery address.",
      },
      DELIVERED: {
        title: "Order Delivered",
        color: "#10b981",
        message: "Your order has been delivered! We hope you love your new Ethereal Wear pieces. If you have any feedback, please reach out to us.",
      },
      PENDING: {
        title: "Order Pending",
        color: "#f59e0b",
        message: "Your order status has been updated to pending review.",
      },
    };

    const statusInfo = statusDisplayMap[newStatus.toUpperCase()] || {
      title: `Status: ${newStatus}`,
      color: "#18181b",
      message: `Your order status has been updated to ${newStatus}.`,
    };

    const statusHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; color: #1a1a1a; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; }
          .header { background-color: #000000; color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { font-family: Georgia, serif; font-size: 26px; letter-spacing: 4px; margin: 0; font-weight: normal; }
          .content { padding: 32px 28px; }
          .status-badge { display: inline-block; background-color: ${statusInfo.color}; color: #ffffff; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
          .message-box { background-color: #fafafa; border-left: 4px solid ${statusInfo.color}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 14px; line-height: 1.6; color: #333333; }
          .footer { background-color: #f7f7f7; padding: 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eaeaea; }
          .footer a { color: #111111; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ETHEREAL WEAR</h1>
          </div>
          <div class="content">
            <span class="status-badge">${statusInfo.title}</span>
            <h2 style="margin: 0 0 12px; font-size: 20px;">Order #${formattedOrderId} Update</h2>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Hello ${customerName || "Valued Customer"},</p>
            
            <div class="message-box">
              ${statusInfo.message}
            </div>

            <div style="background-color: #fafafa; border: 1px solid #ededed; border-radius: 8px; padding: 14px 18px; font-size: 13px; display: flex; justify-content: space-between;">
              <span>Order Reference: <strong>#${formattedOrderId}</strong></span>
              <span>Total: <strong>Rs.${total.toFixed(2)}</strong></span>
            </div>
          </div>
          <div class="footer">
            Have questions about your delivery? Reply directly to this email or visit <a href="${process.env.NEXTAUTH_URL || "https://ethereal-wear-g5lh.vercel.app"}">Ethereal Wear</a>.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: this.getFromAddress(),
          to: customerEmail,
          subject: `Update on Order #${formattedOrderId}: ${statusInfo.title} — Ethereal Wear`,
          html: statusHtml,
        });
        console.log(`[EmailService] Status update email (${newStatus}) sent to ${customerEmail}`);
      } catch (err: any) {
        console.error("[EmailService] Failed to dispatch status email via SMTP:", err.message);
      }
    } else {
      console.log(`\n================= 📧 EMAIL SIMULATION (STATUS UPDATE) =================`);
      console.log(`[To Customer]: ${customerEmail} | Status: ${newStatus}`);
      console.log(`Subject: Update on Order #${formattedOrderId}: ${statusInfo.title}`);
      console.log(`=======================================================================\n`);
    }
  }
}
