# Ethereal Wear — QA Test Playbook & Specification

This document provides the exhaustive specification of all test cases implemented in the automated internal QA engine (`scripts/qa-runner.ts`). Any AI agent, developer, or IDE can execute these tests to validate the complete platform.

---

## 1. Database & Infrastructure Suite (`TC-DB`)

| Test ID | Name | Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-DB-01** | Database Pool Health | Verify PostgreSQL database responds to ping query within 1500ms. | Response `1` received, active connection pool. |
| **TC-DB-02** | Store Settings Schema | Verify `StoreSettings` record with ID `global` exists with valid configuration. | Record found with hero banner and category collections. |
| **TC-DB-03** | Product Table Integrity | Verify product records have valid numeric prices, image URLs, and stock levels. | All active products have price > 0, valid category, and valid image strings. |

---

## 2. Authentication, Session & Access Control (`TC-AUTH`)

| Test ID | Name | Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Customer Registration | Register a new user with valid name, email, and password. | HTTP 201 Created with user object (password excluded). |
| **TC-AUTH-02** | Duplicate Prevention | Attempt to register with an already existing email. | HTTP 400 Bad Request with `"Email already exists"` error message. |
| **TC-AUTH-03** | Admin Route Protection | Attempt to call admin endpoints (`PATCH /api/orders/[id]`, `/api/admin/profile`) without an active Admin session. | HTTP 401 Unauthorized returned. |
| **TC-AUTH-04** | Password Reset Token | Request password reset token for registered account. | Token generated with future expiration date. |

---

## 3. Catalog, Product Details & Reviews (`TC-CAT`)

| Test ID | Name | Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-CAT-01** | Homepage Endpoint | Load homepage and verify Hero Banner, Categories, New Arrivals, and Reviews exist. | HTTP 200 with all core sections populated. |
| **TC-CAT-02** | Review Aspect Parsing | Verify review images (base64 data URIs and external URLs) are categorized as `image` and not dumped as raw text comments. | Review objects have `image` populated properly with constrained sizing. |
| **TC-CAT-03** | Products Catalog API | Query `/api/products` with category filtering. | HTTP 200 returning filtered product array. |
| **TC-CAT-04** | Single Product Detail | Query `/api/products/[id]` for an existing item. | HTTP 200 returning name, price, stock, and sizes. |

---

## 4. Checkout Validation & Payment Gateway (`TC-PAY`)

| Test ID | Name | Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-PAY-01** | Name Field Number Rejection | Ensure customer name fields strictly reject numeric characters. | Regex check passes; invalid names with numbers are blocked. |
| **TC-PAY-02** | Card Format & Brand Detection | Validate 16-digit card grouping and brand matching (Visa `^4`, MC `^5[1-5]`, Amex `^3[47]`). | Card groups into 4-digit blocks and correct brand icon is selected. |
| **TC-PAY-03** | Order Creation API | Submit a valid checkout payload with shipping details and items to `/api/orders`. | HTTP 200 returning `orderId` and `transactionId`. |
| **TC-PAY-04** | Inventory Reduction | Verify stock count is decremented by purchased quantity upon order placement. | Product stock decreases accurately. |

---

## 5. Order Tracking & Privacy Security (`TC-TRACK`)

| Test ID | Name | Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-TRACK-01** | Admin Order Lookup | Admin searches ANY order by short code (`#25Y6WW`) or ID. | Full order details returned including customer, items, and status stepper. |
| **TC-TRACK-02** | Customer Own Order Lookup | Customer tracks an order placed by their own account. | HTTP 200 with order milestone and package contents. |
| **TC-TRACK-03** | Customer Order Privacy Guard | Customer attempts to track an order belonging to a DIFFERENT account. | HTTP 403 Forbidden with error: `"Incorrect Order, please check your order id and email."` |
| **TC-TRACK-04** | Guest Tracking Without Email | Unauthenticated user searches order without providing email. | HTTP 401 with `requiresEmail: true` prompt. |
| **TC-TRACK-05** | Guest Tracking With Matching Email | Unauthenticated user searches order providing correct purchase email. | HTTP 200 with unlocked order details. |
| **TC-TRACK-06** | Guest Tracking With Wrong Email | Unauthenticated user searches order providing incorrect email. | HTTP 403 Forbidden with verification error. |

---

## 6. Transactional Email System (`TC-EMAIL`)

| Test ID | Name | Objective | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-EMAIL-01** | SMTP Transport Verification | Test connection to Gmail SMTP / configured mail provider via `/api/test-email`. | HTTP 200 returning `success: true` and active connection. |
| **TC-EMAIL-02** | Order Receipt Email Template | Verify order receipt contains itemized table, total, shipping address, and tracking ID. | Generated HTML includes all required receipt metadata. |
| **TC-EMAIL-03** | Order Status Email Template | Verify status update email contains prominent tracking badge (`#25Y6WW`), 1-click tracking button, and current milestone. | Generated HTML contains active tracking URL and milestone details. |

---

## How to Run the Automated Suite

```bash
npm run test:qa
```
Output: Generates a consolidated Markdown report at `QA_TEST_REPORT.md` with pass/fail counts, stack traces, and remediation plans.
