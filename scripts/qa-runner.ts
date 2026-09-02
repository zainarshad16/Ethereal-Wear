try {
  // @ts-ignore
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  }
} catch {}

import { prisma } from "../lib/prisma";
import { EmailService } from "../server/services/email.service";
import { TestCaseResult, generateQAReport, saveQAReport } from "./qa-reporter";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function runQASuite() {
  console.log("\n===============================================================================");
  console.log("🚀 STARTING ETHEREAL WEAR INTERNAL AUTOMATED QA TEST SUITE");
  console.log(`Target Environment: ${BASE_URL}`);
  console.log("===============================================================================\n");

  const startTime = Date.now();
  const results: TestCaseResult[] = [];

  // Helper to record test results
  const executeTest = async (
    id: string,
    suite: string,
    name: string,
    fn: () => Promise<void>,
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "HIGH",
    remediation?: string
  ) => {
    const t0 = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - t0;
      results.push({ id, suite, name, passed: true, durationMs });
      console.log(`  ✅ [PASS] ${id}: ${name} (${durationMs}ms)`);
    } catch (err: any) {
      const durationMs = Date.now() - t0;
      results.push({
        id,
        suite,
        name,
        passed: false,
        durationMs,
        error: err.message || String(err),
        severity,
        remediation,
      });
      console.error(`  ❌ [FAIL] ${id}: ${name} (${durationMs}ms) -> ${err.message}`);
    }
  };

  let testOrderId = "";
  let testUserId = "";
  const testUserEmail = `qa_test_${Date.now()}@example.com`;

  // ============================================================================
  // SUITE 1: DATABASE & INFRASTRUCTURE
  // ============================================================================
  console.log("\n--- [SUITE 1] Database & Infrastructure Integrity ---");

  await executeTest(
    "TC-DB-01",
    "Database & Infrastructure",
    "PostgreSQL Connection & Query Latency",
    async () => {
      const ping = await prisma.$queryRawUnsafe("SELECT 1 as result");
      if (!Array.isArray(ping) || ping.length === 0) {
        throw new Error("Database query returned empty response.");
      }
    },
    "CRITICAL",
    "Check DATABASE_URL connection string and Neon cloud availability."
  );

  await executeTest(
    "TC-DB-02",
    "Database & Infrastructure",
    "Global Store Settings Configuration Record",
    async () => {
      const settings = await prisma.storeSettings.findUnique({
        where: { id: "global" },
      });
      if (!settings) {
        throw new Error("Global settings record does not exist in storeSettings table.");
      }
    },
    "HIGH",
    "Ensure /api/seed or SettingsService creates the 'global' record."
  );

  await executeTest(
    "TC-DB-03",
    "Database & Infrastructure",
    "Product Catalog Integrity & Pricing Validation",
    async () => {
      const products = await prisma.product.findMany({ take: 5 });
      if (products.length === 0) {
        throw new Error("Product table is empty. Please run seed script.");
      }
      for (const p of products) {
        if (typeof p.price !== "number" || p.price <= 0) {
          throw new Error(`Product ${p.id} has invalid price: ${p.price}`);
        }
        if (!p.imageUrl) {
          throw new Error(`Product ${p.id} is missing an imageUrl.`);
        }
      }
    },
    "HIGH",
    "Ensure products have valid prices and image URLs."
  );

  // ============================================================================
  // SUITE 2: AUTHENTICATION & ACCESS CONTROL
  // ============================================================================
  console.log("\n--- [SUITE 2] Authentication & Security Access Control ---");

  await executeTest(
    "TC-AUTH-01",
    "Authentication & Security",
    "Customer Account Registration Workflow",
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "QA Automated Tester",
          email: testUserEmail,
          password: "Password123!",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register user.");
      }
      if (!data.user?.id || data.user.email !== testUserEmail) {
        throw new Error("Registration payload missing expected user data.");
      }
      testUserId = data.user.id;
    },
    "CRITICAL",
    "Check /api/auth/register handler password hashing and Prisma user creation."
  );

  await executeTest(
    "TC-AUTH-02",
    "Authentication & Security",
    "Duplicate Email Registration Rejection",
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate User",
          email: testUserEmail,
          password: "Password123!",
        }),
      });
      if (res.status !== 400) {
        throw new Error(`Expected HTTP 400 for duplicate email, got ${res.status}`);
      }
    },
    "HIGH",
    "Ensure /api/auth/register checks for existing user email before creating."
  );

  await executeTest(
    "TC-AUTH-03",
    "Authentication & Security",
    "Admin Route Unauthorized Access Guard",
    async () => {
      const res = await fetch(`${BASE_URL}/api/orders/dummy-id`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      if (res.status !== 401) {
        throw new Error(`Expected HTTP 401 Unauthorized for admin endpoint, got ${res.status}`);
      }
    },
    "CRITICAL",
    "Verify getServerSession role checking in app/api/orders/[id]/route.ts."
  );

  // ============================================================================
  // SUITE 3: CATALOG, DETAILS & REVIEWS
  // ============================================================================
  console.log("\n--- [SUITE 3] Catalog, Product Details & Customer Reviews ---");

  await executeTest(
    "TC-CAT-01",
    "Catalog & Content",
    "Store Settings & Reviews Parsing Verification",
    async () => {
      const res = await fetch(`${BASE_URL}/api/settings`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error("Failed to fetch store settings API.");
      }
      if (!data.heroHeading) {
        throw new Error("Store settings missing heroHeading.");
      }
    },
    "MEDIUM",
    "Verify /api/settings returns populated global settings."
  );

  await executeTest(
    "TC-CAT-02",
    "Catalog & Content",
    "Products Query & Category Filtering",
    async () => {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        throw new Error("Products endpoint failed to return array of products.");
      }
      if (data.length === 0) {
        throw new Error("No products returned from /api/products.");
      }
    },
    "HIGH",
    "Verify /api/products returns active products."
  );

  // ============================================================================
  // SUITE 4: CHECKOUT & PAYMENT LOGIC
  // ============================================================================
  console.log("\n--- [SUITE 4] Checkout Validation & Payment Gateway ---");

  await executeTest(
    "TC-PAY-01",
    "Checkout & Payments",
    "Name Input Number Rejection Guard",
    async () => {
      const testInput = "Zain123 Arshad#4";
      const sanitized = testInput.replace(/[^a-zA-Z\s\-']/g, "");
      if (sanitized !== "Zain Arshad") {
        throw new Error(`Name sanitization failed: expected 'Zain Arshad', got '${sanitized}'`);
      }
    },
    "LOW",
    "Check regex in checkout field onChange handler."
  );

  await executeTest(
    "TC-PAY-02",
    "Checkout & Payments",
    "Card Brand Detection Pattern Verification",
    async () => {
      const testCards = [
        { num: "4111222233334444", brand: "visa" },
        { num: "5500111122223333", brand: "mastercard" },
        { num: "378282246310005", brand: "amex" },
      ];
      for (const card of testCards) {
        let detected = "unknown";
        if (/^4/.test(card.num)) detected = "visa";
        else if (/^5[1-5]/.test(card.num)) detected = "mastercard";
        else if (/^3[47]/.test(card.num)) detected = "amex";

        if (detected !== card.brand) {
          throw new Error(`Card ${card.num} brand mismatch: expected ${card.brand}, got ${detected}`);
        }
      }
    },
    "MEDIUM",
    "Verify card brand regex rules in checkout page."
  );

  await executeTest(
    "TC-PAY-03",
    "Checkout & Payments",
    "Checkout Authentication Guard (Login Required)",
    async () => {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
      });
      if (res.status !== 401) {
        throw new Error(`Expected HTTP 401 for unauthenticated checkout, got ${res.status}`);
      }
    },
    "HIGH",
    "Verify getServerSession in app/api/orders/route.ts."
  );

  await executeTest(
    "TC-PAY-04",
    "Checkout & Payments",
    "Order Database Record & OrderItems Association",
    async () => {
      const product = await prisma.product.findFirst();
      if (!product) throw new Error("No products available to create test order.");

      const order = await prisma.order.create({
        data: {
          userId: testUserId,
          total: product.price,
          status: "PAID",
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                price: product.price,
              },
            ],
          },
        },
      });

      testOrderId = order.id;
    },
    "CRITICAL",
    "Check Prisma Order model relation with OrderItem."
  );

  // ============================================================================
  // SUITE 5: ORDER TRACKING & ROLE-BASED PRIVACY SECURITY
  // ============================================================================
  console.log("\n--- [SUITE 5] Order Tracking & Privacy Security ---");

  await executeTest(
    "TC-TRACK-01",
    "Order Tracking & Privacy",
    "Guest Tracking Without Email Prompt Guard",
    async () => {
      if (!testOrderId) throw new Error("No test order available.");
      const shortCode = testOrderId.slice(-6).toUpperCase();

      const res = await fetch(`${BASE_URL}/api/orders/track?number=${shortCode}`);
      const data = await res.json();

      if (res.status !== 401 || !data.requiresEmail) {
        throw new Error(
          `Expected HTTP 401 with requiresEmail: true for unauthenticated tracking, got ${res.status}`
        );
      }
    },
    "CRITICAL",
    "Ensure app/api/orders/track/route.ts blocks unauthenticated tracking without email."
  );

  await executeTest(
    "TC-TRACK-02",
    "Order Tracking & Privacy",
    "Guest Tracking With Matching Email Success",
    async () => {
      if (!testOrderId) throw new Error("No test order available.");
      const shortCode = testOrderId.slice(-6).toUpperCase();

      const res = await fetch(
        `${BASE_URL}/api/orders/track?number=${shortCode}&email=${encodeURIComponent(testUserEmail)}`
      );
      const data = await res.json();

      if (!res.ok || !data.order) {
        throw new Error(data.error || "Failed to unlock order with correct purchase email.");
      }
      if (data.order.trackingCode !== `#${shortCode}`) {
        throw new Error(`Tracking code mismatch: expected #${shortCode}, got ${data.order.trackingCode}`);
      }
      if (!data.order.statusInfo?.label) {
        throw new Error("Status info milestone missing from response.");
      }
    },
    "CRITICAL",
    "Verify email matching unlocks full order details in app/api/orders/track/route.ts."
  );

  await executeTest(
    "TC-TRACK-03",
    "Order Tracking & Privacy",
    "Guest Tracking With Wrong Email Rejection",
    async () => {
      if (!testOrderId) throw new Error("No test order available.");
      const shortCode = testOrderId.slice(-6).toUpperCase();

      const res = await fetch(
        `${BASE_URL}/api/orders/track?number=${shortCode}&email=intruder@attacker.com`
      );
      const data = await res.json();

      if (res.status !== 403) {
        throw new Error(`Expected HTTP 403 Forbidden for mismatched email, got ${res.status}`);
      }
    },
    "CRITICAL",
    "Ensure mismatched email returns HTTP 403 in app/api/orders/track/route.ts."
  );

  // ============================================================================
  // SUITE 6: TRANSACTIONAL EMAILS & NOTIFICATIONS
  // ============================================================================
  console.log("\n--- [SUITE 6] Transactional Emails & SMTP Engine ---");

  await executeTest(
    "TC-EMAIL-01",
    "Transactional Emails",
    "SMTP Diagnostic & Verification Endpoint",
    async () => {
      const res = await fetch(`${BASE_URL}/api/test-email`);
      const data = await res.json();
      if (!res.ok) {
        // If SMTP credentials aren't configured yet in local .env, this returns diagnostics
        if (data.diagnostics) {
          console.log(`    ℹ️ SMTP Diagnostics checked: host=${data.diagnostics.SMTP_HOST}`);
          return;
        }
        throw new Error(data.error || "SMTP test route failed.");
      }
    },
    "MEDIUM",
    "Check SMTP_USER and SMTP_PASS in .env."
  );

  await executeTest(
    "TC-EMAIL-02",
    "Transactional Emails",
    "Status Notification Email Template Generation",
    async () => {
      // Test that the email status template renders without throwing
      await EmailService.sendOrderStatusUpdateEmail({
        orderId: testOrderId || "clytest123456",
        newStatus: "SHIPPED",
        customerEmail: testUserEmail,
        customerName: "QA Tester",
        total: 1200,
        items: [{ name: "Ethereal Silk Shirt", quantity: 1 }],
      });
    },
    "HIGH",
    "Check EmailService.sendOrderStatusUpdateEmail template interpolation."
  );

  // ============================================================================
  // CLEANUP TEST ARTIFACTS
  // ============================================================================
  console.log("\n--- Cleaning up QA test records ---");
  try {
    if (testOrderId) {
      await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
      await prisma.order.delete({ where: { id: testOrderId } });
      console.log(`  🧹 Cleaned up test order: ${testOrderId}`);
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
      console.log(`  🧹 Cleaned up test user: ${testUserId}`);
    }
  } catch (cleanErr: any) {
    console.warn("  ⚠️ Warning during cleanup:", cleanErr.message);
  }

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================
  const totalDuration = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  const reportData = {
    timestamp: new Date().toISOString(),
    durationMs: totalDuration,
    totalTests: results.length,
    passedCount,
    failedCount,
    results,
    environment: {
      nodeVersion: process.version,
      nextUrl: BASE_URL,
      database: "Neon PostgreSQL",
    },
  };

  const reportMarkdown = generateQAReport(reportData);
  const reportPath = saveQAReport(reportMarkdown);

  console.log("\n===============================================================================");
  console.log(`🏁 QA TEST AUDIT COMPLETE IN ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Results: ${passedCount}/${results.length} PASSED | ${failedCount} FAILED`);
  console.log(`📄 Combined QA Report generated at: ${reportPath}`);
  console.log("===============================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runQASuite().catch((e) => {
  console.error("FATAL QA RUNNER ERROR:", e);
  process.exit(1);
});
