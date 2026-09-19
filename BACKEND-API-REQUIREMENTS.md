# Backend API Requirements Document

**Project:** Porto Piri Piri (Zee Grill Burger) — Restaurant Ordering Frontend  
**Frontend Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, localStorage-as-backend  
**Current state:** All persistence in `localStorage`, all menu/config data hardcoded inline  
**Scope of this document:** Every API endpoint needed to replace static/mock/localStorage data with real backend calls. No database / microservice / implementation designs are provided — those are backend team decisions.

**Legend:**
- ✅ = confirmed from actual UI code (forms, types, handlers, buttons)
- ⚠️ = INFERENCE (placeholder UI / no handler wired yet / behaviour suggested by skeleton only)
- 🔐 = requires authenticated user context

---

## Table of Contents

- [1. Authentication (AuthModal)](#1-authentication-authmodal)
- [2. Site Config / Opening Popup](#2-site-config--opening-popup)
- [3. Menu Categories (MenuCategory / Menu)](#3-menu-categories-menucategory--menu)
- [4. Menu Items & Product Customisation (MenuSection)](#4-menu-items--product-customisation-menusection)
- [5. Favourites (Toggle + Favourites Page)](#5-favourites-toggle--favourites-page)
- [6. Cart (CartDrawer + /cart Page)](#6-cart-cartdrawer--cart-page)
- [7. Saved Addresses (/saved-addresses)](#7-saved-addresses-saved-addresses)
- [8. Checkout (/checkout)](#8-checkout-checkout)
- [9. Payment (/payment)](#9-payment-payment)
- [10. Order Confirmation (/confirmation)](#10-order-confirmation-confirmation)
- [11. Order Success (/order-success)](#11-order-success-order-success)
- [12. My Orders (/my-orders)](#12-my-orders-my-orders)
- [13. User Profile (/account/profile)](#13-user-profile-accountprofile)
- [14. Account Hub (/account) — Logout](#14-account-hub-account--logout)
- [15. Wallet (/account/wallet)](#15-wallet-accountwallet)
- [16. Loyalty Points (/account/loyalty-points)](#16-loyalty-points-accountloyalty-points)
- [17. Coupons (/account/coupons + Checkout Apply)](#17-coupons-accountcoupons--checkout-apply)
- [18. Refer & Earn (/account/refer-earn)](#18-refer--earn-accountrefer-earn)
- [19. Notifications (/account/notifications)](#19-notifications-accountnotifications)
- [20. Help & Support (/account/help-support + ContactSection)](#20-help--support-accounthelp-support--contactsection)
- [21. Delete Account (/account/delete-account)](#21-delete-account-accountdelete-account)
- [22. Navbar (Global Cart Badge + User Dropdown)](#22-navbar-global-cart-badge--user-dropdown)
- [Consolidated API Requirement Table](#consolidated-api-requirement-table)
- [Handoff A: Frontend Requirements](#handoff-a-frontend-requirements)
- [Handoff B: Request Payloads](#handoff-b-request-payloads)
- [Handoff C: Response Payloads](#handoff-c-response-payloads)

---

# 1. Authentication (AuthModal)

## 1.1 Screen / Feature
- **Screen name:** Authentication Modal (Sign In / Register / Forgot Password / Reset Password / Google Sign-in)
- **Purpose:** Allow guest users to create an account, sign in, or recover a password (via OTP email). Also supports Google OAuth (GSI) with custom fallback modal; Apple Sign-in button renders but has **NO click handler yet** ⚠️.
- **User role:** Guest (unauthenticated visitor)

## 1.2 Backend Operations Required
- Login (Read: match credentials + issue session)
- Register (Create: new user account)
- Send OTP (Create: temporary one-time passcode for password-reset flow)
- Verify OTP (Verify: validate code emailed earlier)
- Reset Password (Update: change password for an email+validated-OTP pair)
- Google OAuth callback (Create/Read: create-or-return user via Google identity) ⚠️
- Apple OAuth callback ⚠️ (UI only, no handler — may be deprioritised)
- Logout (Destroy session) — see Section 14

## 1.3 Suggested API Requirements

### 1.3.1 Login
- **Method:** `POST`
- **Suggested endpoint:** `/auth/login`
- **Purpose:** Validate email + password and return an authenticated session (token or session cookie) plus basic user profile used to hydrate Navbar / Account Hub.

### 1.3.2 Register
- **Method:** `POST`
- **Suggested endpoint:** `/auth/register`
- **Purpose:** Create a new customer account with the fields captured in the registration form. Auto-log the user in after success (frontend currently pushes a new object into `zee-grill-registered-users` then immediately runs login flow).

### 1.3.3 Send OTP
- **Method:** `POST`
- **Suggested endpoint:** `/auth/send-otp`
- **Purpose:** Generate and email a 4-digit OTP to the given email for password recovery. (Existing stub route already exists at `app/api/auth/send-otp/route.ts` — in-memory implementation only, meant to be replaced.)

### 1.3.4 Verify OTP
- **Method:** `POST`
- **Suggested endpoint:** `/auth/verify-otp`
- **Purpose:** Validate that the submitted 4-digit code matches the active (non-expired) OTP stored against the email. (Existing stub at `app/api/auth/verify-otp/route.ts`.)

### 1.3.5 Reset Password
- **Method:** `POST`
- **Suggested endpoint:** `/auth/reset-password`
- **Purpose:** After OTP validation, overwrite the user's password. (Existing stub at `app/api/auth/reset-password/route.ts`.)

### 1.3.6 Google Sign-In Callback ⚠️
- **Method:** `POST`
- **Suggested endpoint:** `/auth/google`
- **Purpose:** Accept a Google credential (GSI token or custom fallback name/email payload) and create-or-return an associated user + auth session. Currently frontend falls back to asking first name + email manually when GSI SDK unavailable; the real endpoint must accept both flows.

## 1.4 Request JSON

### Login Request ✅
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `email` | string | ✅ required | AuthModal login tab email `<input>` (L193) |
| `password` | string | ✅ required | AuthModal login tab password `<input>` (L210); min length 6 is validated on frontend |

### Register Request ✅
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+447123456789",
  "password": "password123",
  "marketingOptIn": true
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `firstName` | string | ✅ required | Register form first-name input |
| `lastName` | string | ✅ required | Register form last-name input |
| `email` | string | ✅ required | Register form email input, must include `@` |
| `phone` | string | ✅ required | Register form phone input (note: no E.164 validation on frontend) |
| `password` | string | ✅ required | Register form password; frontend enforces min 6 chars |
| `marketingOptIn` | boolean | optional | "Keep me updated with offers" checkbox (default unchecked, value not persisted in mock) |

### Send OTP Request ✅
```json
{
  "email": "user@example.com"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `email` | string | ✅ required | Forgot-password tab email input; frontend validates `@` presence |

### Verify OTP Request ✅
```json
{
  "email": "user@example.com",
  "code": "4829"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `email` | string | ✅ required | From same forgot-password session state (carried in-memory in modal) |
| `code` | string | ✅ required | 4-digit OTP input; castable to number |

### Reset Password Request ✅
```json
{
  "email": "user@example.com",
  "code": "4829",
  "newPassword": "newpass123"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `email` | string | ✅ required | Carried from forgot-password tab state |
| `code` | string | ✅ required | Verified OTP from previous step |
| `newPassword` | string | ✅ required | New password input; frontend enforces min 6 chars |

### Google Sign-In Request ⚠️
```json
{
  "provider": "google",
  "credential": "<JWT or empty>",
  "fallbackFirstName": "John",
  "fallbackLastName": "Doe",
  "fallbackEmail": "john@example.com"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `provider` | string enum `"google"` | ✅ required | Sent by frontend when Google flow runs |
| `credential` | string | optional | Real GSI `id_token` when SDK loads successfully |
| `fallbackFirstName` | string | optional | Manual first-name entered when GSI SDK unavailable (fallback modal) |
| `fallbackLastName` | string | optional | Manual last-name (fallback modal) |
| `fallbackEmail` | string | optional | Manual email (fallback modal) — required IF no credential |

## 1.5 Response JSON

### Auth (Login/Register/Google) Success Response ✅
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_01HX...",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+447123456789",
    "profilePic": "https://.../avatar.jpg",
    "role": "customer"
  }
}
```
**Separate sub-shapes (Detail / Create response) — same shape reused.**

| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `success` | boolean | OK / not-OK flag | Modal to show error/success toast |
| `token` | string | Auth token for subsequent calls | Stored in place of `localStorage.loggedInUser` |
| `user.id` | string | Stable user ID | All future "my-X" endpoints |
| `user.firstName` | string | Navbar greeting initial | Navbar `userInitial`, Account Hub display |
| `user.lastName` | string | Used to build full name | Profile editor initial values |
| `user.name` | string | Display ("John Doe") | Navbar dropdown header, Account Hub heading |
| `user.email` | string | Contact email | Profile editor, checkout prefill |
| `user.phone` | string | Contact phone | Checkout prefill |
| `user.profilePic` | string (URL / base64 data URI) | Avatar image | Navbar dropdown avatar, Account Hub avatar |
| `user.role` | string enum (backend decides set) | Possible future gating | Frontend currently stores role: `"customer"` by default |

### Send OTP / Verify OTP / Reset Password Response ✅
```json
{
  "success": true,
  "message": "A 4-digit verification code has been sent to user@example.com."
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `success` | boolean | Flag | Modal state transitions |
| `message` | string | Human-readable text | Shown in green/red inline feedback below form fields |

### Auth Error Response (generic) ✅
```json
{
  "success": false,
  "error": "Invalid email or password."
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `success` | boolean | Always false on errors | Show error styling |
| `error` | string | Error text | Shown inline in modal below form |

## 1.6 Query Parameters
None for auth — all operations use POST bodies.

## 1.7 URL Parameters
None.

## 1.8 Authentication / User Context
| Operation | Logged-in user required? | User ID? | Role? | Auth token? |
|---|---|---|---|---|
| `/auth/login` | ❌ No | ❌ No | ❌ No | ❌ No |
| `/auth/register` | ❌ No | ❌ No | ❌ No | ❌ No |
| `/auth/send-otp` | ❌ No | ❌ No | ❌ No | ❌ No |
| `/auth/verify-otp` | ❌ No | ❌ No | ❌ No | ❌ No |
| `/auth/reset-password` | ❌ No | ❌ No | ❌ No | ❌ No |
| `/auth/google` | ❌ No | ❌ No | ❌ No | ❌ No |

## 1.9 Static Data Mapping
(Auth has no "list mock data" — the mapping below is for localStorage vs API fields.)

| localStorage key / mock field | Backend/API field | UI usage |
|---|---|---|
| `localStorage.loggedInUser = userName` | `user.name` (or concatenation) | Navbar "John Doe" label |
| `zee-grill-user.profilePic` | `user.profilePic` | Navbar avatar image `<img src>` |
| `zee-grill-registered-users[0].email` | `user.email` | Login validation match |
| `zee-grill-registered-users[0].password` | handled by auth service (never return!) | Login validation match |
| hardcoded `admin@admin.com` / `admin123` | N/A — delete this backdoor | (Remove before real backend integration) |

## 1.10 API Dependency / Related Data
- User service (profile, password hashing, contact fields)
- Email / SMTP service (for OTP sending — stub in `lib/otp-store.ts` uses nodemailer with Gmail/SMTP creds from `.env.local`)
- OAuth provider (Google identity, Apple identity if Apple handler added later)

---

# 2. Site Config / Opening Popup

## 2.1 Screen / Feature
- **Screen name:** Site-wide configuration (OpeningPopup modal, Navbar location label, ContactSection, fees used in CartDrawer/Checkout/Payment, hardcoded pickup address, hardcoded categories list, opening hours).
- **Purpose:** Provide a single source of truth for restaurant name, address, phone, email, Google Maps embed target, delivery/collection open times, order-type fee schedule, bag charge, and the "Is restaurant currently open?" flag shown in the first-visit popup.
- **User role:** Guest + Customer (both read)

## 2.2 Backend Operations Required
- Read site configuration (single endpoint returning all static-but-editable values)

## 2.3 Suggested API Requirements
- **Method:** `GET`
- **Suggested endpoint:** `/config/site-settings`
- **Purpose:** Return every global config value currently hardcoded (restaurant identity, open status, fees, pickup address, opening hours, etc.). Called once at app bootstrap; consumed by Navbar dropdown label, OpeningPopup "Opens at 17:00" badge, CartDrawer/Checkout/Payment fee rows, ContactSection phone/email/address, and Google Maps iframe `src`.

## 2.4 Request JSON
None (GET).

## 2.5 Response JSON
### List/Single response (same shape — one config object) ✅/⚠️
```json
{
  "restaurant": {
    "id": "loc_glasgow_shawlands",
    "name": "Porto Piri Piri",
    "phone": "+01747413273",
    "email": "info@portopiripiri.co.uk",
    "address": "49 Kilmarnock Road, Shawlands, Glasgow G41 3YN",
    "mapsQuery": "49 Kilmarnock Road, Shawlands, Glasgow G41 3YN",
    "currencyCode": "GBP",
    "currencySymbol": "£"
  },
  "hours": {
    "deliveryOpen": "17:00",
    "deliveryClose": "23:00",
    "collectionOpen": "14:00",
    "collectionClose": "23:00",
    "weeklySchedule": [
      { "day": "Mon", "open": "11:00", "close": "23:00" }
    ],
    "supportHours": "11:00 AM - 11:00 PM Daily"
  },
  "openStatus": {
    "isOpenNow": false,
    "deliveryOpenNow": false,
    "collectionOpenNow": true,
    "statusLabel": "Opens at 17:00"
  },
  "fees": {
    "deliveryFee": 3.59,
    "serviceFee": 1.39,
    "bagCharge": 0.29,
    "freeDeliveryMinimum": 25.00,
    "minimumOrderValue": 8.00
  },
  "estimatedDelivery": {
    "minMinutes": 30,
    "maxMinutes": 45
  },
  "referral": {
    "referrerReward": 200,
    "refereeReward": 200,
    "refereeRewardCurrency": "PKR",
    "defaultCode": "PORTOLAIB"
  },
  "loyalty": {
    "pointsPerUnitSpent": 1,
    "pointsPerPound": 100,
    "pointsPerPoundLabel": "100 loyalty points = £1 wallet credit",
    "nextRewardThreshold": 500,
    "nextRewardName": "Free Fries"
  }
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `restaurant.id` | string | Multi-location support ⚠️ (currently frontend shows dropdown arrow beside "Porto Piri Piri" with no handler) | Navbar restaurant selector (if implemented) |
| `restaurant.name` | string | Navbar display | Navbar button label, OpeningPopup title |
| `restaurant.phone` | string | Display number | ContactSection "PHONE" row + Help&Support "Call Us" card |
| `restaurant.email` | string | Display email | ContactSection "EMAIL" row + Help&Support "Email Us" card |
| `restaurant.address` | string | Full postal address | ContactSection "ADDRESS" row + Pickup order summary line |
| `restaurant.mapsQuery` | string | URL-safe query for Google Maps embed | ContactSection iframe `src=google.com/maps?q=...&output=embed` |
| `restaurant.currencyCode` | string | ISO 4217 | Format prices throughout |
| `restaurant.currencySymbol` | string | `£` or `Rs.` | Prefix price labels (note: frontend mixes £ and Rs. — backend should decide + be consistent) |
| `hours.deliveryOpen` | string (HH:mm) | When delivery ordering begins | OpeningPopup "Opens at 17:00" |
| `hours.deliveryClose` | string | When delivery ordering ends | Future scheduling ⚠️ |
| `hours.collectionOpen` | string | When pickup begins | Pickup scheduling ⚠️ |
| `hours.collectionClose` | string | When pickup ends | Pickup scheduling ⚠️ |
| `hours.weeklySchedule` | array | Full week | Help&Support "Working Hours" card |
| `hours.supportHours` | string | Human readable | Help&Support Working Hours card |
| `openStatus.isOpenNow` | boolean | Global open/close | OpeningPopup logic: if closed, show modal + "browse only, order later" |
| `openStatus.deliveryOpenNow` | boolean | Delivery toggle disabled? | Checkout Delivery/Pickup tab |
| `openStatus.collectionOpenNow` | boolean | Collection toggle disabled? | Checkout Delivery/Pickup tab |
| `openStatus.statusLabel` | string | Display string | OpeningPopup pill e.g. "Opens at 17:00" |
| `fees.deliveryFee` | number | Delivery fee row | **Resolves inconsistency:** CartDrawer uses £3.99, Checkout/Payment use £3.59 |
| `fees.serviceFee` | number | Service fee row | **Resolves inconsistency:** CartDrawer £1.99 vs Checkout/Payment £1.39 |
| `fees.bagCharge` | number | Bag fee | All order summaries use £0.29 |
| `fees.freeDeliveryMinimum` | number | When deliveryFee=0 | Order summary free delivery banner (if added later) |
| `fees.minimumOrderValue` | number | Prevent checkout below | Checkout button disable logic (currently absent ⚠️) |
| `estimatedDelivery.minMinutes` | number | Lower bound | Order Success "Estimated delivery: 30-45 mins" |
| `estimatedDelivery.maxMinutes` | number | Upper bound | Order Success "Estimated delivery: 30-45 mins" |
| `referral.referrerReward` | number | Refer& earn reward text | Refer & Earn "You get Rs. 200" |
| `referral.refereeReward` | number | Friend reward text | Refer & Earn "They get Rs. 200 off first order" |
| `referral.defaultCode` | string | Fallback referral code | Refer & Earn code display `PORTOLAIB` (hardcoded now) |
| `loyalty.pointsPerUnitSpent` | number | Earning rule | Loyalty Points "Rs. 1 spent = 1 point" |
| `loyalty.pointsPerPound` | number | Conversion to wallet | Wallet section info line "100 points = £1" |
| `loyalty.nextRewardThreshold` | number | Progress bar denominator | Loyalty Points `progress = min(points/500, 100)` |
| `loyalty.nextRewardName` | string | Reward name under bar | Loyalty Points "...to earn free fries" |

## 2.6 Query Parameters
- `?locationId=<id>` (optional ⚠️) — if multi-location is ever enabled (Navbar currently renders a dropdown arrow beside restaurant name with no click handler; currently no selector UI).

## 2.7 URL Parameters
None.

## 2.8 Authentication / User Context
Not required — guests browsing the menu need to see opening hours before logging in.

## 2.9 Static Data Mapping
| Static field (current hardcode) | Backend/API field | UI usage |
|---|---|---|
| `ContactSection` address literal `49 Kilmarnock Road...` | `restaurant.address` | ContactSection ADDRESS block |
| `ContactSection` phone `+01747413273` | `restaurant.phone` | ContactSection PHONE block |
| `ContactSection` email `info@portopiripiri.co.uk` | `restaurant.email` | ContactSection EMAIL block |
| OpeningPopup `Opens at 17:00` literal | `openStatus.statusLabel` + `hours.deliveryOpen` | OpeningPopup status pill |
| `CartDrawer` delivery fee £3.99 | `fees.deliveryFee` (pick one canonical value!) | CartDrawer fee row |
| `Checkout` delivery fee £3.59 | `fees.deliveryFee` | Checkout fee row |
| `CartDrawer` service fee £1.99 | `fees.serviceFee` (pick one canonical) | CartDrawer fee row |
| `Checkout` service fee £1.39 | `fees.serviceFee` | Checkout fee row |
| `bagCharge £0.29` across files | `fees.bagCharge` | Order summary Bag Charge row |
| `/order-success` 30-45 mins literal | `estimatedDelivery.min/maxMinutes` | Order Success eta line |
| Refer&Earn `PORTOLAIB` literal | `referral.defaultCode` | Refer & Earn referral code display |
| Loyalty `500` threshold literal | `loyalty.nextRewardThreshold` | Loyalty Points progress bar width |

## 2.10 API Dependency / Related Data
- No cross-domain dependency; this is a pure CMS/read endpoint. Output may feed the Loyalty/Wallet/Refer sections directly (so changes propagate site-wide from one API call).

---

# 3. Menu Categories (MenuCategory / Menu)

## 3.1 Screen / Feature
- **Screen name:** Horizontal menu category scrollspy (MenuCategory.tsx) + categories array declaration (Menu.tsx).
- **Purpose:** 27-item horizontal tab bar. Tapping scrolls the page to the named category section; the active tab auto-highlights as user scrolls. Arrow buttons paginate the visible tab strip (4 visible on mobile, 7 on desktop via touch/swipe + arrow pagination).
- **User role:** Guest + Customer (both browse)

## 3.2 Backend Operations Required
- List all categories (ordered)

## 3.3 Suggested API Requirements
- **Method:** `GET`
- **Suggested endpoint:** `/menu/categories`
- **Purpose:** Return the full ordered list of 27 categories currently hardcoded in two duplicated arrays (`Menu.tsx:L9-L32` and `MenuCategory.tsx:L7-L30`).

## 3.4 Request JSON
None (GET).

## 3.5 Response JSON
### List response ✅
```json
{
  "categories": [
    { "id": "cat_01", "slug": "porto-kebabs", "name": "Porto Kebabs", "sortOrder": 1, "itemCount": 6 },
    { "id": "cat_02", "slug": "quesadilla",   "name": "Quesadilla",  "sortOrder": 2, "itemCount": 6 }
  ]
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `categories[].id` | string | Stable ID | Anchor link target id + Menu section `<section id=slug>` |
| `categories[].slug` | string | URL-safe | Category scroll target `href=#porto-kebabs` |
| `categories[].name` | string | Tab label | MenuCategory horizontal tab text |
| `categories[].sortOrder` | number | Sorting | Backend dictates category order; frontend must not assume alphabetical |
| `categories[].itemCount` | number | Optional pill | Not displayed currently but useful badge later ⚠️ |

## 3.6 Query Parameters
- `?include=itemCount` (optional) — backend optional, to inflate item counts.
- `?sort=sortOrder` (default) — ensure stable ordering.

## 3.7 URL Parameters
None for list. If a single-category endpoint is needed later: `/menu/categories/:slug` (not required by current UI — everything scrolls on one anchor-scrolled page).

## 3.8 Authentication / User Context
Not required — menu is public.

## 3.9 Static Data Mapping
| Static field | Backend/API field | UI usage |
|---|---|---|
| `categories[i]` literal string e.g. `"Porto Kebabs"` | `categories[].name` | Tab label in MenuCategory |
| Array index 0..26 | `categories[].sortOrder` | Tab horizontal order |
| `Menu`/`MenuCategory` literal → derived | `categories[].slug` | `document.getElementById(slug)` scroll target |

## 3.10 API Dependency / Related Data
- `/menu/items?categoryId=X` paginated endpoint (Section 4) depends on category IDs being stable.

---

# 4. Menu Items & Product Customisation (MenuSection)

## 4.1 Screen / Feature
- **Screen name:** Menu section grid (MenuSection.tsx, rendered 27 times per category inside Menu.tsx via `createItems()` mock generator) + per-card "Customise" popup.
- **Purpose:** For each category, render a grid of product cards (currently 6 mock products per category = 162 items). Each card has: image, badge (POPULAR / RECOMMENDED / none), name, description, price, heart/favourite toggle, and a "Choose" button that opens a customisation popup with quantity, an "Extra Hot Chilli Free" option row, an empty "Add-ons" header with Show More button, and a final "Add to Cart" button. The customisation controls (add-ons list, chilli toggle, Show More list) are currently **static skeletons with no handlers** ⚠️.
- **User role:** Guest + Customer (browse); Customer only for Favourite & Add-to-Cart actions.

## 4.2 Backend Operations Required
- List menu items by category ID (paginated? Not paginated currently but 27×6=162 items — if catalogue grows pagination will be needed)
- Get menu item detail (for customisation popup — currently frontend re-uses the list row, but add-ons require a detail fetch) ⚠️
- List add-ons / product options for a menu item ⚠️ (Customise popup skeleton only)

## 4.3 Suggested API Requirements

### 4.3.1 List Items by Category
- **Method:** `GET`
- **Suggested endpoint:** `/menu/items`
- **Purpose:** Return an array of products for the given categoryId (or categorySlug). Current UI renders 6 items/category; mock generator always returns exactly 6.

### 4.3.2 Get Item Detail + Options ⚠️
- **Method:** `GET`
- **Suggested endpoint:** `/menu/items/:itemId`
- **Purpose:** Fetch a single product with its option groups (add-ons, spiciness choice, etc.) and image aliases fully resolved. Needed the moment the Customise popup skeleton is wired to real add-on state.

## 4.4 Request JSON
None (GET endpoints).

## 4.5 Response JSON

### List Response (by category) ✅
```json
{
  "items": [
    {
      "id": "prod_01HX...",
      "categoryId": "cat_01",
      "name": "Porto Special Kebab",
      "description": "Juicy grilled chicken with our signature peri peri sauce, fresh salad, and warm pita bread.",
      "price": "£8.99",
      "priceNumeric": 8.99,
      "badge": "POPULAR",
      "imageUrl": "https://cdn.example.com/products/kebab1.jpg",
      "hasOptions": true,
      "spicyLevel": 2
    }
  ],
  "pagination": { "total": 6, "page": 1, "perPage": 12 }
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `items[].id` | string | Stable product ID | Add to cart, favourite by reference (currently frontend uses `.name` as identity = bug if two items share a name; backend MUST use ID) |
| `items[].categoryId` | string | Parent category | Menu section placement `<section id=cat_slug>` |
| `items[].name` | string | Item title | Product card `<h3>`, cart item title, order line title |
| `items[].description` | string | Marketing text | Card subtitle (line-clamped to 2 lines) |
| `items[].price` | string | Pre-formatted display price | Product card price badge |
| `items[].priceNumeric` | number | Arithmetic (totals, wallet debit, etc.) | Cart summary math — needed because string "£8.99" can't be summed reliably |
| `items[].badge` | enum `"POPULAR"` \| `"RECOMMENDED"` \| `null` | Corner badge on product image | Product card top-left ribbon |
| `items[].imageUrl` | string | Canonical image | Resolves the 3-image-alias mess: frontend currently has `.image`, `.imageUrl`, `.img` in different CartItem typings; backend should return one field |
| `items[].hasOptions` | boolean | Show / hide "Customise" vs direct add flow | "Choose" button opens popup vs. quick add |
| `items[].spicyLevel` | number 0..3 | Chili icon (not currently rendered) ⚠️ | Future icon row |
| `pagination` | object or null | Pagination state | Current UI hardcodes 6; pagination support optional until catalogue grows |

### Detail Response (item + option groups) ⚠️
```json
{
  "id": "prod_01HX...",
  "name": "Porto Special Kebab",
  "description": "Juicy grilled chicken with our signature peri peri sauce, fresh salad, and warm pita bread.",
  "priceNumeric": 8.99,
  "imageUrl": "https://cdn.example.com/products/kebab1.jpg",
  "optionGroups": [
    {
      "id": "og_spice",
      "title": "Extra Hot Chilli",
      "type": "single",
      "required": false,
      "options": [
        { "id": "opt_chili_none", "name": "No Chilli", "priceDelta": 0 },
        { "id": "opt_chilli",     "name": "Extra Hot Chilli", "priceDelta": 0, "badge": "Free" }
      ]
    },
    {
      "id": "og_addons",
      "title": "Add-ons",
      "type": "multi",
      "required": false,
      "options": [
        { "id": "add_cheese", "name": "Extra Cheese", "priceDelta": 0.80 },
        { "id": "add_sauce",  "name": "Extra Sauce",  "priceDelta": 0.40 }
      ]
    }
  ]
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `optionGroups[].id` | string | Identify group | Cart line item stores selected option IDs |
| `optionGroups[].title` | string | Section heading | Customise popup section header ("Extra Hot Chilli", "Add-ons") |
| `optionGroups[].type` | `single` \| `multi` | Radio vs checkbox UI | Currently Chilli row appears to be single-select; Add-ons header appears multi-select |
| `optionGroups[].required` | boolean | Client-side form validation | Prevent "Add to Cart" with no selection if required |
| `options[].id` | string | Option identifier | Submitted with cart line |
| `options[].name` | string | Row label | Add-on row text |
| `options[].priceDelta` | number | Add to base price | Running price in customise popup |
| `options[].badge` | string \| null | "Free" badge | "Extra Hot Chilli Free" — current UI has a "Free" text pill |

## 4.6 Query Parameters
| Param | Required? | Why |
|---|---|---|
| `?categoryId=<string>` or `?categorySlug=<string>` | ✅ Yes | Which category's items to return (used by each MenuSection render) |
| `?page=<int>` | optional | Future pagination of large categories |
| `?perPage=<int>` | optional | Items per page |
| `?sort=popular` or `sortOrder` | optional | Default sort matches menu category tab order |
| `?badge=POPULAR` | optional | Future "Featured" filter on home hero ⚠️ |

## 4.7 URL Parameters
- `/menu/items/:itemId` — item detail + options (detail route only, not list). `itemId` comes from the product card's `id` field when user clicks "Choose".

## 4.8 Authentication / User Context
- List / Detail: ❌ No auth required (public catalogue).
- Add to cart / Favourite: 🔐 Require logged-in user (MenuSection dispatches `open-login` event when favourites or add-to-cart are clicked without `localStorage.loggedInUser`).

## 4.9 Static Data Mapping
| mock field (createItems() output) | API field | UI usage |
|---|---|---|
| `createItems(name)[i].name` literal e.g. "Porto Special Kebab" | `items[].name` | Menu card h3 title |
| `createItems` — fixed description string | `items[].description` | Card subtitle p line-clamp 2 |
| `createItems` — `£${(6+i*1.4).toFixed(2)}` | `items[].price` string + `items[].priceNumeric` number | Price badge + totals math |
| `badge: i<2 ? "POPULAR" : "RECOMMENDED"` | `items[].badge` | Product card top-left coloured ribbon |
| `createItems` — `/images/.../${name+i}.webp` path | `items[].imageUrl` | Card `<img src>` |
| MenuSection Customise "Extra Hot Chilli Free" row literal | `optionGroups` with single chilli option `priceDelta:0, badge:"Free"` | Popup first radio row |
| MenuSection Customise "Add-ons" header + Show More button | `optionGroups[type=multi]` with `.length > 5` triggers "Show More" | Popup multi add-ons grid |
| MenuSection Customise quantity buttons (1..N) | (client state, not API) — quantity sent with add-to-cart request (see Section 6) | Qty step +/- in popup |

## 4.10 API Dependency / Related Data
- Product catalogue service (items + categories)
- Product option/variant service ⚠️ (add-ons, chilli selection)
- Image CDN / storage (imageUrl)
- (Indirect) favourites service (Section 5), cart service (Section 6), order line items (Section 10)

---

# 5. Favourites (Toggle + Favourites Page)

## 5.1 Screen / Feature
- **Screen name:** Product-card heart toggle (MenuSection) + `/account/favourites` page with 2-column card grid of saved products.
- **Purpose:** Customer can "heart" any menu product (on the card, or inside the Customise popup ⚠️); the Favourites page re-renders the same card layout for saved items and offers an "Add to Cart" shortcut per card.
- **User role:** 🔐 Customer only (guest heart click fires `open-login` event in MenuSection)

## 5.2 Backend Operations Required
- Add to favourites (Create)
- Remove from favourites (Delete)
- List my favourites (Read list)
- Check favourite status per product (for heart-filled icon on each menu card) — can be derived by client if List returns array of favourite product IDs for the user

## 5.3 Suggested API Requirements

### 5.3.1 Add / Toggle Favourite
- **Method:** `POST`
- **Suggested endpoint:** `/favourites`
- **Purpose:** Record a product as favourited by the authenticated user. Idempotent — duplicate POST should be a no-op, not 409.

### 5.3.2 Remove Favourite
- **Method:** `DELETE`
- **Suggested endpoint:** `/favourites/:productId`
- **Purpose:** Un-heart a product.

### 5.3.3 List My Favourites
- **Method:** `GET`
- **Suggested endpoint:** `/favourites`
- **Purpose:** Return the full list of favourited products for the user, with same product fields used by MenuItem cards.

## 5.4 Request JSON

### Add Favourite Request ✅
```json
{
  "productId": "prod_01HX..."
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `productId` | string | ✅ required | `item.id` from the menu product card that was clicked |

(Remove uses URL parameter only; no body.)

## 5.5 Response JSON

### List Response ✅
```json
{
  "items": [
    {
      "id": "fav_01...",
      "productId": "prod_01HX...",
      "product": {
        "id": "prod_01HX...",
        "name": "Porto Special Kebab",
        "description": "Juicy grilled chicken...",
        "price": "£8.99",
        "priceNumeric": 8.99,
        "badge": "POPULAR",
        "imageUrl": "https://cdn.example.com/products/kebab1.jpg"
      },
      "addedAt": "2026-03-18T12:20:30Z"
    }
  ]
}
```
Same product sub-shape as Section 4 (`MenuItem`) — favourites page re-uses MenuItem card rendering.

| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `items[].product.*` | same as `MenuItem` | Card render | Favourites page 2-col grid |
| `items[].addedAt` | ISO timestamp | Sorting (newest first — current mock has no sort) | Optional future sort UI |

### Create / Delete Response (common) ✅
```json
{
  "success": true,
  "favourited": true,
  "productId": "prod_01HX..."
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `success` | boolean | OK flag | Toast / site-notification dispatch |
| `favourited` | boolean | New state after mutation | Toggle heart fill in-place without re-fetching full list |

## 5.6 Query Parameters
None for list (single user's list — small, paginate if grows > 100).

## 5.7 URL Parameters
- `/favourites/:productId` — Delete favourite. `productId` from the heart-button click on a card already known to be favourited.

## 5.8 Authentication / User Context
All operations 🔐 require logged-in user, user ID, auth token. Guest clicks currently dispatch `window.open-login`; real backend should return 401 when token missing.

## 5.9 Static Data Mapping
| mock/localStorage field | API field | UI usage |
|---|---|---|
| `zee-grill-favourites` `MenuItem[]` array stored by MenuSection `toggleFavourite` | `/favourites` GET items | Favourites page grid + MenuSection heart icon fill state |
| `favourites.find(f=>f.name===item.name)` identity check (by-name = fragile!) | `items[].productId === product.id` (by-id = stable) | Heart toggle on Menu cards |

## 5.10 API Dependency / Related Data
- Product catalogue: favourites items list needs the same fields as `/menu/items/:id` — either backend joins eagerly or frontend does a second fetch; simplest to return nested `product` object as shown above.
- Favourites → cart button on Favourites page calls into the Cart service (Section 6) with `{productId, quantity:1}`.

---

# 6. Cart (CartDrawer + /cart Page)

## 6.1 Screen / Feature
- **Screen name:** Right-side CartDrawer flyout (appears on Navbar bag click or after Add-to-Cart) + `/cart` full page.
- **Purpose:** Display current cart items with per-line: image, name, qty +/- buttons, line price, remove (×). Summary shows subtotal, service fee, bag charge, delivery fee, grand total. Delivery/Pickup toggle + order notes textarea. Checkout/Continue-shopping buttons. `/cart` page additionally shows login-gate copy if no user logged in.
- **User role:** 🔐 Customer only (add-to-cart is gated in MenuSection via `open-login` event; CartDrawer displays 0 for guests)

## 6.2 Backend Operations Required
- Get cart summary (for Navbar cart badge count, used on every page)
- Get full cart (items + fees, for CartDrawer / /cart page)
- Add item to cart
- Update line item quantity
- Remove line item from cart
- Clear entire cart (after successful order placement in Section 10)
- Set order type preference (delivery vs pickup) on cart 🔗 sets fee rows
- Add cart-level notes 🔗 Order notes textarea

## 6.3 Suggested API Requirements

### 6.3.1 Get My Cart (Full)
- **Method:** `GET`
- **Suggested endpoint:** `/cart`
- **Purpose:** Return all line items + computed fees + notes + order-type preference for authenticated user's current active cart. Consumed by CartDrawer AND `/cart` page AND cart badge counter (can extract `totalQuantity` from response or use lightweight summary endpoint below).

### 6.3.2 Cart Summary (Badge Only) ⚠️ (Optional optimisation)
- **Method:** `GET`
- **Suggested endpoint:** `/cart/summary`
- **Purpose:** Lighter-weight payload just for Navbar `cartCount` badge display (every pageload). Prevents pulling full 50-item cart JSON on every route.

### 6.3.3 Add Item to Cart
- **Method:** `POST`
- **Suggested endpoint:** `/cart/items`
- **Purpose:** Append a new line, or increment qty of existing line with identical product + option selections.

### 6.3.4 Update Line Item Quantity
- **Method:** `PATCH`
- **Suggested endpoint:** `/cart/items/:lineId`
- **Purpose:** +/- buttons on a line. Also used to set qty directly from customise popup quantity picker.

### 6.3.5 Remove Line Item
- **Method:** `DELETE`
- **Suggested endpoint:** `/cart/items/:lineId`
- **Purpose:** × button on each cart line.

### 6.3.6 Clear Cart
- **Method:** `DELETE`
- **Suggested endpoint:** `/cart`
- **Purpose:** Called after successful order creation (Section 10 confirmation page).

### 6.3.7 Update Cart Metadata (order type, notes)
- **Method:** `PATCH`
- **Suggested endpoint:** `/cart`
- **Purpose:** Save delivery/collection toggle + order notes without creating a checkout record yet.

## 6.4 Request JSON

### Add Item to Cart Request ✅/⚠️
```json
{
  "productId": "prod_01HX...",
  "quantity": 2,
  "selectedOptions": [
    { "optionGroupId": "og_spice", "optionId": "opt_chilli" }
  ],
  "customNote": "No onions please"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `productId` | string | ✅ required | from Menu card or Favourites card |
| `quantity` | integer ≥ 1 | ✅ required | Customise popup qty step (default 1) |
| `selectedOptions` | array of {optionGroupId, optionId} | optional ⚠️ | Customise popup selections (currently skeleton only, so array empty until wired) |
| `customNote` | string | optional | Per-product note (no per-line note field in current UI — placeholder) |

### Update Line Qty Request ✅
```json
{
  "quantity": 3
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `quantity` | integer | ✅ required | From +/- step button press |

### Update Cart Metadata Request ✅
```json
{
  "orderType": "delivery",
  "notes": "Leave at door"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `orderType` | `"delivery"` \| `"pickup"` | ✅ required | CartDrawer Delivery / Pickup toggle radio (writes to localStorage now) |
| `notes` | string | optional | CartDrawer notes textarea ("Your order will be prepared in...") |

## 6.5 Response JSON

### Full Cart Response (GET /cart + after any mutation) ✅
```json
{
  "id": "cart_01HX...",
  "userId": "usr_01HX...",
  "orderType": "delivery",
  "notes": "Leave at door",
  "lines": [
    {
      "id": "line_01HX...",
      "productId": "prod_01HX...",
      "name": "Porto Special Kebab",
      "description": "Juicy grilled chicken...",
      "unitPrice": 8.99,
      "currency": "GBP",
      "quantity": 2,
      "lineTotal": 17.98,
      "imageUrl": "https://cdn.example.com/products/kebab1.jpg",
      "badge": "POPULAR",
      "selectedOptions": [
        { "optionGroupId": "og_spice", "optionId": "opt_chilli", "optionName": "Extra Hot Chilli", "priceDelta": 0 }
      ]
    }
  ],
  "totals": {
    "subTotal": 17.98,
    "serviceFee": 1.39,
    "bagCharge": 0.29,
    "deliveryFee": 3.59,
    "discount": 0,
    "grandTotal": 23.25
  },
  "counts": {
    "totalLines": 1,
    "totalQuantity": 2
  }
}
```
| Field | Type | Purpose | UI consumer |
|---|---|---|---|
| `id` | string | Cart stable ID | Clear / update operations |
| `userId` | string | Owner | Checkout auth |
| `orderType` | enum | Delivery/Pickup selection | CartDrawer toggle radio state, fee rows |
| `notes` | string | Cart-level note | CartDrawer notes textarea content |
| `lines[].id` | string | Line ID | PATCH / DELETE line endpoints |
| `lines[].productId` | string | Product reference | Reorder, favourites toggle |
| `lines[].name` | string | Line title | CartDrawer line h3 |
| `lines[].description` | string | Line subtitle | CartDrawer line description (currently not shown in drawer — only menu cards — but may show in /cart page) |
| `lines[].unitPrice` | number | Single-unit price | × qty math |
| `lines[].currency` | string | GBP / PKR | Price formatting |
| `lines[].quantity` | number | Quantity | +/- step input value |
| `lines[].lineTotal` | number | unit × qty + add-on deltas | Line right-column amount |
| `lines[].imageUrl` | string | Canonical image | Line `<img>` (replaces 3 aliases `.image`/`.imageUrl`/`.img`) |
| `lines[].badge` | enum | POPULAR / RECOMMENDED corner label | Small badge in cart lines (currently drawer doesn't show badge; /cart page might) |
| `lines[].selectedOptions` | array | Summarise chilli/add-on picks | Drawer line item subtext |
| `totals.subTotal` | number | Sum of lineTotals | Summary Subtotal row |
| `totals.serviceFee` | number | From site config fee | Summary Service fee row |
| `totals.bagCharge` | number | From site config fee | Summary Bag charge row |
| `totals.deliveryFee` | number | 0 if pickup else config fee | Summary Delivery fee row |
| `totals.discount` | number | Coupon / loyalty reduction | Summary Discount row (currently no UI for discount line — needed once coupons wired in Section 17) |
| `totals.grandTotal` | number | Final amount | "To Pay" big total, also payment page amount |
| `counts.totalLines` | number | Number of SKUs | Optional badge |
| `counts.totalQuantity` | number | Total item count (sum qty) | Navbar bag badge (CartDrawer badge n = this) |

### Summary-only Response (GET /cart/summary ⚠️)
```json
{
  "totalQuantity": 2,
  "grandTotal": 23.25
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `totalQuantity` | Navbar `cartCount` badge number, clamped to 99+ | Navbar bag badge |
| `grandTotal` | Quick total display (Navbar dropdown ⚠️, not currently rendered) | Future micro-summary |

### Line Mutation Response (POST /cart/items + PATCH /cart/items/:lineId) ✅
```json
{
  "success": true,
  "cart": { /* full cart shape as above */ }
}
```
Return full cart so drawer can refresh without additional GET.

### Clear Cart Response
```json
{
  "success": true
}
```

## 6.6 Query Parameters
None. Single active cart per user.

## 6.7 URL Parameters
- `/cart/items/:lineId` — Update quantity or delete. Value from `lines[].id` in current cart state.

## 6.8 Authentication / User Context
All cart operations 🔐 require logged-in user. Frontend currently shows 0 or empties cart on `auth-changed` / `user-logged-out` events; backend should return empty cart for logged-out callers (or 401 — frontend auto-gates anyway via `open-login` dispatch on MenuSection add-to-cart clicks).

## 6.9 Static Data Mapping
| mock / localStorage field | API field | UI usage |
|---|---|---|
| `zee-grill-cart` JSON array | `/cart` lines array | CartDrawer list + /cart page list |
| per-item `.name` identity `findIndex(cartItem.name===item.name)` | `lines[].productId + lines[].selectedOptions` identity | Add-increment vs. add-new line |
| `zee-grill-cart[i].quantity` (+/- handler increments in place) | `PATCH /cart/items/:lineId {quantity}` | +/- buttons in drawer |
| CartDrawer delivery/pickup radio → `localStorage.setItem("zee-grill-order-type",...)` | `PATCH /cart {orderType}` | Delivery/Pickup radio state persistence |
| CartDrawer notes → `zee-grill-order-notes` | `PATCH /cart {notes}` | Order notes textarea |
| Drawer subtotal `sum(price * qty)` | `totals.subTotal` | Summary row |
| Drawer hardcoded fees £3.99 / £1.99 / £0.29 | `totals.deliveryFee/serviceFee/bagCharge` (from site config) | Summary fee rows |

## 6.10 API Dependency / Related Data
- Site config endpoint (Section 2) to determine fee values — backend is responsible for applying fees, because frontend values are currently inconsistent across screens.
- Product catalogue to resolve `imageUrl`, `unitPrice`, `badge` values when adding a line.
- Orders service: when Confirmation submits, it reads cart → creates order → clears cart.
- Coupon service can mutate `totals.discount` once coupon applied (Section 17).

---

# 7. Saved Addresses (/saved-addresses)

## 7.1 Screen / Feature
- **Screen name:** Saved Addresses CRUD page.
- **Purpose:** Customer manages multiple delivery addresses (Home / Work / Other labels). List page with Add (+) floating button; add-form (inline or modal) captures contact name, phone, full address text, label/type, house number/name, floor (optional), road/street. Remove per row. Also checkouts "Saved Addresses" tab reads and lets user pick one.
- **User role:** 🔐 Customer only (page has no login gate currently — backend must enforce it)

## 7.2 Backend Operations Required
- List my saved addresses (Read list)
- Create a new saved address
- Delete a saved address
- Update a saved address ⚠️ (no edit button in current UI — only create+delete, but likely wanted soon)
- Set default address ⚠️ (no UI currently; checkout uses most-recent or first)

## 7.3 Suggested API Requirements

### 7.3.1 List
- **Method:** `GET` `/addresses`
- **Purpose:** Full list of user's saved addresses, sorted by createdAt or explicit default first.

### 7.3.2 Create
- **Method:** `POST` `/addresses`
- **Purpose:** Add new delivery address.

### 7.3.3 Delete
- **Method:** `DELETE` `/addresses/:addressId`
- **Purpose:** Remove.

### 7.3.4 Update ⚠️
- **Method:** `PATCH` `/addresses/:addressId`
- **Purpose:** Edit existing.

## 7.4 Request JSON

### Create / Update Request ✅
```json
{
  "contactName": "John Doe",
  "contactPhone": "+447123456789",
  "address": "12B Oak Street, Flat 4, Glasgow G41",
  "type": "Home",
  "house": "12B",
  "floor": "2nd",
  "road": "Oak Street"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `contactName` | string | ✅ required | "Contact Name" input |
| `contactPhone` | string | ✅ required | "Contact Phone" input |
| `address` | string | ✅ required | Full address textarea |
| `type` | enum `"Home"`\|`"Work"`\|`"Other"` (or custom string) | ✅ required | `<select>` dropdown, default "Home" |
| `house` | string | ✅ required | "House Number/Name" input |
| `floor` | string | optional | "Floor (optional)" input |
| `road` | string | ✅ required | "Road/Street" input |

## 7.5 Response JSON

### List Response ✅
```json
{
  "addresses": [
    {
      "id": "addr_01HX...",
      "contactName": "John Doe",
      "contactPhone": "+447123456789",
      "address": "12B Oak Street, Flat 4, Glasgow G41",
      "type": "Home",
      "house": "12B",
      "floor": "2nd",
      "road": "Oak Street",
      "isDefault": true,
      "createdAt": "2026-03-15T10:10:00Z"
    }
  ]
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | Address ID | Delete button target |
| `contactName` | Recipient name | Address card header |
| `contactPhone` | Phone | Address card subtitle / courier call |
| `address` | Full delivery line | Address card main body, checkout delivery address summary |
| `type` | Label pill | Coloured Home/Work/Other pill |
| `house`, `floor`, `road` | Breakdown fields | Edit form repopulation ⚠️ |
| `isDefault` | default flag | Checkout auto-select first address |
| `createdAt` | Sort order | Newest first display (optional sort UI) |

### Create / Update Response
```json
{
  "success": true,
  "address": { /* single address shape */ }
}
```
### Delete Response
```json
{ "success": true }
```

## 7.6 Query Parameters
None.

## 7.7 URL Parameters
- `/addresses/:addressId` — Delete / Update. Value from address card row.

## 7.8 Authentication / User Context
All 🔐 require user ID + token — addresses are private per-user.

## 7.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `zee-grill-saved-addresses` array (SavedAddresses.tsx writes here) | `/addresses` GET list | List page cards |
| legacy key `savedAddress` (single object, also synced on delete) | no API equivalent — ignore legacy key | Backwards compat for users who saved before multi-address |
| `SavedAddress.id = Date.now().toString()` | `id` (UUID/ULID from backend) | Delete by-id |

## 7.10 API Dependency / Related Data
- Checkout page (Section 8) needs the list + ability to attach a specific address ID to the order.
- Profile page: contact name/phone can prefill from user profile, but addresses are a separate collection.

---

# 8. Checkout (/checkout)

## 8.1 Screen / Feature
- **Screen name:** Checkout page (`/checkout`). Multi-step form currently on one page: Delivery vs Pickup tab switch (top), ASAP vs Schedule time selection, customer info form (first/last/phone, street/floor/postcode/company fields for delivery path), saved-address selector (reads from address list), order instructions textarea, delivery notes textarea, coupon apply input+button (no handler yet), cutlery Yes/No toggle, and a right-hand order summary sidebar with items list + fees + proceed-to-payment button.
- **User role:** 🔐 Customer only (has login gate — no gate code actually visible on snippet but route is typically behind login in this app convention)

## 8.2 Backend Operations Required
- Start / Update checkout session (POST or PATCH a checkout resource that combines cart, selected address, pickup flag, time, notes, coupon, cutlery)
- Apply coupon to checkout (already listed in Section 17; duplicated here for completeness)
- Remove coupon from checkout
- Get full checkout state (prefill on return visit, resume abandoned checkout) ⚠️

## 8.3 Suggested API Requirements

### 8.3.1 Create / Update Checkout Session
- **Method:** `POST` (create) / `PATCH` (update)
- **Suggested endpoint:** `/checkouts` (POST) or `/checkouts/:checkoutId` (PATCH)
- **Purpose:** Capture all checkout form fields + link them to the cart. This is the data the Payment page reads next via `localStorage.zee-grill-checkout-info` today.

### 8.3.2 Get Checkout Session ⚠️
- **Method:** `GET` `/checkouts/:checkoutId`
- **Purpose:** Resume / refresh after back navigation.

### 8.3.3 Apply Coupon (see Section 17)
- Coupled to checkout: coupon discount only matters once we have a checkout grand-total to reduce.

## 8.4 Request JSON

### Checkout Create/Update Request ✅
```json
{
  "cartId": "cart_01HX...",
  "orderType": "delivery",
  "orderTime": "schedule",
  "scheduledFor": "2026-03-20T19:30:00Z",
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+447123456789",
    "email": "john@example.com"
  },
  "deliveryAddress": {
    "savedAddressId": "addr_01HX...",
    "street": "12B Oak Street",
    "floor": "2nd",
    "postcode": "G41 3YN",
    "company": "Acme Ltd"
  },
  "pickupRestaurantId": "loc_glasgow_shawlands",
  "orderInstructions": "No onions, extra sauce on the side please.",
  "deliveryNotes": "Ring doorbell twice.",
  "cutlery": "Yes",
  "couponCode": "WELCOME15"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `cartId` | string | ✅ required | Currently derived from authenticated user (one active cart); backend should accept explicit ID if multiple possible |
| `orderType` | `"delivery"` \| `"pickup"` | ✅ required | Top tab switch (Delivery / Pickup) |
| `orderTime` | `"asap"` \| `"schedule"` | ✅ required | ASAP vs Schedule radio |
| `scheduledFor` | ISO datetime | required when `orderTime=schedule` | Date/time picker on schedule path (currently basic time input) |
| `customer.firstName` | string | ✅ required | Form input |
| `customer.lastName` | string | ✅ required | Form input |
| `customer.phone` | string | ✅ required | Form input |
| `customer.email` | string | optional | Not rendered in checkout snippet but usually prefilled from auth context |
| `deliveryAddress.savedAddressId` | string | optional ✅ | If user picks from Saved Addresses tab (string UUID) |
| `deliveryAddress.street` | string | required when orderType=delivery & no saved address picked | Manual Street field |
| `deliveryAddress.floor` | string | optional | Manual Floor field |
| `deliveryAddress.postcode` | string | required when delivery | Manual Postcode field |
| `deliveryAddress.company` | string | optional | Company field |
| `pickupRestaurantId` | string | required when orderType=pickup | If multi-location; defaults to Shawlands location ID from site config |
| `orderInstructions` | string (≤500 chars) | optional | "Add order instructions (optional)" textarea — frontend caps 500 |
| `deliveryNotes` | string (≤500 chars) | optional | Delivery notes textarea — frontend caps 500 |
| `cutlery` | `"Yes"` \| `"No"` | ✅ required | Toggle at bottom |
| `couponCode` | string | optional | Coupon apply input (currently no backend hook — frontend only validates text length) |

## 8.5 Response JSON

### Checkout Detail Response (GET / create / update — same shape) ✅/⚠️
```json
{
  "id": "chkt_01HX...",
  "status": "draft",
  "orderType": "delivery",
  "orderTime": "schedule",
  "scheduledFor": "2026-03-20T19:30:00Z",
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+447123456789"
  },
  "deliveryAddress": {
    "id": "addr_01HX...",
    "contactName": "John Doe",
    "contactPhone": "+447123456789",
    "address": "12B Oak Street, Flat 4, Glasgow G41 3YN",
    "type": "Home"
  },
  "orderSummary": {
    "lines": [ /* same shape as Cart lines[] */ ],
    "subTotal": 17.98,
    "serviceFee": 1.39,
    "bagCharge": 0.29,
    "deliveryFee": 3.59,
    "couponDiscount": 2.70,
    "grandTotal": 20.55,
    "appliedCoupon": {
      "code": "WELCOME15",
      "discount": 2.70,
      "description": "15% off on your first order"
    }
  },
  "orderInstructions": "No onions, extra sauce on the side please.",
  "deliveryNotes": "Ring doorbell twice.",
  "cutlery": "Yes",
  "expiresAt": "2026-03-18T12:40:00Z"
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | Checkout ID | Passed to Payment page → Confirmation → eventual Order create |
| `status` | `draft` \| `coupon_applied` etc | Debug / flow control |
| `customer.*` | Prefilled fields | Form inputs re-hydrate |
| `deliveryAddress.*` | Saved or manual address | Delivery address summary card |
| `orderSummary.lines` | Item lines | Sidebar items list with qty, line totals |
| `orderSummary.subTotal` | Sum of lines | Subtotal row |
| `orderSummary.serviceFee` | fee | Service fee row |
| `orderSummary.bagCharge` | fee | Bag charge row |
| `orderSummary.deliveryFee` | fee (0 if pickup) | Delivery fee row |
| `orderSummary.couponDiscount` | negative amount | Coupon discount line (currently missing UI row — needs to be added once coupon apply works) |
| `orderSummary.grandTotal` | final | "To Pay" total, passed to Payment |
| `orderSummary.appliedCoupon.*` | coupon meta | "Coupon applied WELCOME15 -£2.70" info pill |
| `orderInstructions`, `deliveryNotes` | textareas | Persisted value |
| `cutlery` | toggle | Toggle initial state |
| `expiresAt` | Abandoned checkout timeout | If user comes back after, refresh cart prices |

## 8.6 Query Parameters
None typically; `?resumeToken=...` optional for email resume links ⚠️.

## 8.7 URL Parameters
- `/checkouts/:checkoutId` — Get / Update. Value returned from POST create; saved on client.

## 8.8 Authentication / User Context
All 🔐 require authenticated user (checkouts contain PII + tied to specific cart).

## 8.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `zee-grill-checkout-info` localStorage object (written at Proceed to Payment click) | `/checkouts/:id` state | Payment page reads same fields |
| `zee-grill-checkout-completed` (boolean flag) | `status !== "draft"` | Stops users re-entering same checkout twice |
| Checkout firstName/lastName/phone form fields | `customer.*` | Checkout Info tab |
| street + postcode + floor + company | `deliveryAddress.*` | Address manual-entry form |
| `cutlery` toggle at bottom | `cutlery` ("Yes"/"No") | Carried through to `order.cutlery` later |
| hardcoded pickup address literal "49 Kilmarnock Rd..." | site config `restaurant.address` + `pickupRestaurantId` | Pickup tab order summary "Pickup from:" line |

## 8.10 API Dependency / Related Data
- Cart service: line items + fees base
- Saved Addresses service: `savedAddressId` resolution
- Site config: fees + restaurant address (pickup) + open hours for schedule dropdown
- Coupons service (Section 17): validate/apply coupon, return discount amount
- Orders/Payment next steps depend on checkout ID flowing forward

---

# 9. Payment (/payment)

## 9.1 Screen / Feature
- **Screen name:** Payment page (`/payment`). Displays read-only summary of customer + delivery info from checkout, shows order summary lines, lets user pick Payment Method (Cash / Card), captures card details (4 fields) + "Save card for future" checkbox when method=card, and has a "Confirm Payment" submit button.
- **User role:** 🔐 Customer only.

## 9.2 Backend Operations Required
- Create payment intent / charge (card) OR mark order as "pay on delivery" (cash)
- Save payment method (card — with PCI-compliant tokenisation, never raw PAN)
- List saved payment methods ⚠️ (no UI yet; but "Save card for future" checkbox exists, implying list needed later)
- Process saved card selection ⚠️

## 9.3 Suggested API Requirements

### 9.3.1 Submit Payment
- **Method:** `POST`
- **Suggested endpoint:** `/payments`
- **Purpose:** Attach payment to a checkout; return either an immediate charge-result (success/failure) OR a redirect URL (if 3DS / hosted page). Also stores cash method as zero-amount paid or "pay-on-delivery" flag.

### 9.3.2 Save Payment Method ⚠️
- **Method:** `POST` `/payment-methods`
- **Purpose:** PCI-tokenised card (never PAN + CVV raw). Triggered by saveCard checkbox on successful payment.

### 9.3.3 List Saved Payment Methods ⚠️
- **Method:** `GET` `/payment-methods`
- **Purpose:** Future payment page "Use saved card •••• 4242" UI.

## 9.4 Request JSON

### Submit Payment Request ✅/⚠️
```json
{
  "checkoutId": "chkt_01HX...",
  "method": "card",
  "card": {
    "token": "tok_visa_4242",
    "last4": "4242",
    "brand": "visa",
    "expiryMonth": 12,
    "expiryYear": 2029,
    "holderName": "John Doe"
  },
  "saveCard": true,
  "savedPaymentMethodId": null
}
```
**Cash alternative:**
```json
{
  "checkoutId": "chkt_01HX...",
  "method": "cash"
}
```

| Field | Type | Required | UI Source |
|---|---|---|---|
| `checkoutId` | string | ✅ required | Passed from Checkout page state |
| `method` | `"card"` \| `"cash"` | ✅ required | Top Payment Method radio (Cash is "Pay with cash on delivery") |
| `card.token` | string (PCI token) | ✅ required when method=card | **Must NOT be raw card number.** Generated client-side via payment SDK (Stripe/Adyen) or, if backend insists on token-from-server, frontend sends raw fields only over HTTPS to backend token exchange — never to your API DB. Currently frontend renders 4 clear fields; backend MUST implement PCI-compliant tokenisation before go-live |
| `card.last4` | string | optional (backend can derive) | Saved-card mask display later |
| `card.brand` | string enum | optional | Card brand icon |
| `card.expiryMonth` / `expiryYear` | numbers | optional (backend can derive from token) | Card expiry date field `MM/YYYY` split |
| `card.holderName` | string | required when method=card | "Name on card" input |
| `saveCard` | boolean | optional, default false | Save card checkbox below card fields |
| `savedPaymentMethodId` | string | optional ⚠️ | If user picks saved card (no UI yet) |

> ⚠️ **PCI note for backend team:** Card number, CVV, and (to a lesser extent) expiry captured in the clear in this frontend must never be stored as-is in any database. Route them exclusively through a tokeniser first. The request fields above describe data currently present in form inputs; backend architecture must enforce token-only downstream storage.

## 9.5 Response JSON

### Payment Submit Success Response ✅
```json
{
  "success": true,
  "paymentId": "pay_01HX...",
  "status": "succeeded",
  "transactionId": "ch_3Nxxxxx",
  "amount": 20.55,
  "currency": "GBP",
  "method": "card",
  "requiresAction": false,
  "actionUrl": null,
  "savedPaymentMethodId": "pm_01HX..."
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `success` | flag | Branch to order-confirm vs. inline error |
| `paymentId` | Our internal ID | Link to order record |
| `status` | `succeeded` / `failed` / `requires_action` / `pending_cash` | Error display |
| `transactionId` | PSP reference | Receipt / audit / refund later |
| `amount` | Actual amount charged (should match checkout grandTotal) | Confirmation page "Paid £..." line |
| `currency` | ISO 4217 | Formatting |
| `method` | Echo back | Summary line |
| `requiresAction` | 3DS / redirect needed | Forward user to `actionUrl` |
| `actionUrl` | 3DS hosted page | Redirect handler |
| `savedPaymentMethodId` | Newly saved method | "Card •••• 4242 saved" toast |

### Payment Error Response
```json
{
  "success": false,
  "error": "Your card was declined.",
  "code": "card_declined"
}
```

### Saved Payment Methods List Response ⚠️
```json
{
  "methods": [
    {
      "id": "pm_01HX...",
      "brand": "visa",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2029,
      "holderName": "John Doe",
      "isDefault": true
    }
  ]
}
```

## 9.6 Query Parameters
None for submit; `?provider=stripe` optional for PSP routing.

## 9.7 URL Parameters
None typically. Optional `/payments/:paymentId` for status poll after actionUrl redirect ⚠️.

## 9.8 Authentication / User Context
All 🔐. Payment contains cardholder PII + connects to user's payment methods / cart / checkout.

## 9.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `zee-grill-payment-method` localStorage (current `card` vs `cash`) | `method` | Radio initial state on return |
| `zee-grill-save-card` boolean | `saveCard` in request | Checkbox initial state |
| Card number raw 19-char formatted input | → tokenised → `card.token` | Card number input (**never store raw**) |
| Name on card input | `card.holderName` | Field |
| Expiry MM/YYYY formatted input (7 chars) | `card.expiryMonth` + `expiryYear` (split on server or client) | Expiry field |
| CVV 4-char input | → consumed by tokeniser only, NOT stored | CVV field |

## 9.10 API Dependency / Related Data
- Payment Service Provider (Stripe/Adyen/etc.) for tokenisation, 3DS, charges.
- Checkout service (resolve grandTotal + validate checkout not expired).
- Orders service: after success, confirmation page creates order from checkout + payment IDs.
- Saved payment methods (store vault; never PAN in own DB).

---

# 10. Order Confirmation (/confirmation)

## 10.1 Screen / Feature
- **Screen name:** Order Confirmation review page (`/confirmation`). Displays non-editable review of: restaurant / pickup address or delivery address, items list, fee breakdown, cutlery choice, estimated time, and a "Terms & Conditions" checkbox + "Complete Order" CTA.
- **Purpose:** Final review; clicking **Complete Order** is the moment the **Order record is actually created** and cart is cleared (today it's a write to `zee-grill-orders`, plus `zee-grill-last-order`, clears cart, sets `zee-grill-order-completed`, navigates to `/order-success`).
- **User role:** 🔐 Customer only.

## 10.2 Backend Operations Required
- Get confirmation view (read: assemble full preview from checkout + payment IDs)
- Place order (Create: converts checkout + payment into an Order, sets status=Preparing, decrements stock if applicable, clears cart, triggers loyalty/referral rewards)

## 10.3 Suggested API Requirements

### 10.3.1 Preview Confirmation ⚠️
- **Method:** `GET` `/orders/preview?checkoutId=chkt_01HX...&paymentId=pay_01HX...`
- **Purpose:** Hydrate the Confirmation page view from backend instead of reading 5+ localStorage keys. Frontend currently assembles from cart, checkout-info, payment-method, saved-addresses, site-config literals — a preview endpoint is cleaner.

### 10.3.2 Place Order
- **Method:** `POST` `/orders`
- **Purpose:** Create the order. This is the "single source of truth" write; return a canonical order ID and status.

## 10.4 Request JSON

### Place Order Request ✅
```json
{
  "checkoutId": "chkt_01HX...",
  "paymentId": "pay_01HX...",
  "termsAccepted": true,
  "referralCodeUsed": "PORTOLAIB"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `checkoutId` | string | ✅ required | Carried in session |
| `paymentId` | string | ✅ required | Carried from payment success response |
| `termsAccepted` | boolean | ✅ required | Terms checkbox at bottom ("I agree to the Terms and Conditions") |
| `referralCodeUsed` | string | optional ⚠️ | If user enters referral code during signup/order flow (no field in confirmation today; Refer & Earn description says friend uses code on first order — backend must decide where it's applied) |

## 10.5 Response JSON

### Place Order (Create) Response ✅
```json
{
  "success": true,
  "order": {
    "id": "PPP-24848",
    "friendlyId": "PPP-24848",
    "status": "Preparing",
    "createdAt": "2026-03-18T17:25:00Z",
    "dateLabel": "Mar 18, 2026",
    "timeLabel": "17:25",
    "estimatedDelivery": { "minMinutes": 30, "maxMinutes": 45 },
    "grandTotal": 20.55,
    "currency": "GBP",
    "cutlery": "Yes",
    "orderType": "delivery"
  },
  "cartCleared": true,
  "redirectUrl": "/order-success"
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `success` | flag | Branch |
| `order.id` | Stable UUID | Backend internal |
| `order.friendlyId` | `PPP-XXXXX` human-readable | Order Success page big heading, My Orders first column "ORDER PPP-XXXXX", confirmation email |
| `order.status` | `Preparing` \| `Out for Delivery` \| `Delivered` \| `Cancelled` | Status badge + 4-step progress tracker |
| `order.createdAt` | ISO timestamp | Derive date/time labels |
| `order.dateLabel` | Human date (e.g. `Mar 18, 2026`) | My Orders order card `{date} {time}` row |
| `order.timeLabel` | Human time (17:25) | Same |
| `estimatedDelivery.min/maxMinutes` | ETA | Order Success "Arriving in 30-45 mins", My Orders active order ETA |
| `grandTotal` | Paid amount | Success page total |
| `currency` | Formatting | Prefix |
| `cutlery` | Echo | Receipt |
| `orderType` | delivery/pickup | Success page "Delivery to..." or "Pickup from..." sentence |
| `cartCleared` | true | Frontend can skip manual localStorage wipe |
| `redirectUrl` | Next route | After success toast, navigate |

### Preview Confirmation Response ⚠️
Return same detailed shape as My Orders Detail (Section 12 detail). Omitted here for brevity.

## 10.6 Query Parameters
- `/orders/preview?checkoutId=X&paymentId=Y` — both required for preview route.

## 10.7 URL Parameters
None for Place Order (`POST /orders`). Future: `/orders/:orderId` for detail (used in Section 12).

## 10.8 Authentication / User Context
Place Order 🔐 requires user + token. Preview 🔐 as well (contains PII of the order).

## 10.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| confirmation generates `id=PPP-${10000+rand*90000}` dynamically, but order-success uses hardcoded `"PPP-24848"` (known inconsistency) | `order.friendlyId = "PPP-XXXXX"` from backend | Unify these two conflicting sources of order ID |
| write to `zee-grill-orders[]` array | `POST /orders` | Creates single order |
| `localStorage.removeItem("zee-grill-cart")` in handler | `cartCleared:true` in response | Confirmation clears cart badge count to 0 |
| `total` computed from sum + fees literals on confirmation page | `order.grandTotal` from backend | Ensures backend-calculated total (with any discount applied) wins over client math |
| `status:"Preparing"` hardcoded | `order.status` | My Orders first item should be top of list with status=Preparing + progress steps=1/4 done |

## 10.10 API Dependency / Related Data
- Checkout service (resolves items, address, cutlery, instructions)
- Payment service (confirms payment captured or cash recorded)
- Cart service (clear)
- Loyalty service: after success, credit `addLoyaltyPoints(250, orderId)` or similar rule-based amount
- Referral service: if new user's first order + referral code attached, credit both users
- Notifications service: send order-created email/SMS, push order status updates (Section 19)
- Delivery tracking status workflow (Preparing → Out for Delivery → Delivered / Cancelled — My Orders consumes these states)

---

# 11. Order Success (/order-success)

## 11.1 Screen / Feature
- **Screen name:** Success page (`/order-success`)
- **Purpose:** Post-order confirmation landing. Displays big green check, order friendly ID, status ("Confirmed"), estimated time (30-45 min hardcoded today), amount, and CTA "Track Order" → navigates to My Orders and/or "Back to Menu".
- **User role:** 🔐 Customer only.

## 11.2 Backend Operations Required
- Get just-placed order summary (Read detail of the last successful order). Frontend currently reads last order from `zee-grill-last-order` localStorage or hardcoded fallback `"PPP-24848"`.

## 11.3 Suggested API Requirements
- **Method:** `GET`
- **Suggested endpoint:** `/orders/last` (or `/orders/:orderId` if URL param is populated from redirect)
- **Purpose:** Get minimal success payload for order-success page.

## 11.4 Request JSON
None (GET).

## 11.5 Response JSON
### Detail Response (minimal) ✅
```json
{
  "friendlyId": "PPP-24848",
  "status": "Confirmed",
  "estimatedDelivery": { "minMinutes": 30, "maxMinutes": 45 },
  "orderType": "delivery",
  "grandTotal": 20.55,
  "currency": "GBP"
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `friendlyId` | `Order #PPP-24848` heading | Success main headline |
| `status` | "Confirmed" or "Preparing" badge | Status badge |
| `estimatedDelivery.*` | ETA minutes | "Arriving in 30-45 minutes" subheading |
| `orderType` | Delivery or Pickup | Tailors sub-copy: "Delivery to your address" vs "Your order will be ready for pickup" |
| `grandTotal` | amount paid | Summary amount line |
| `currency` | Formatting | Prefix |

## 11.6 Query Parameters
None for `/orders/last`. If using `/orders/:orderId?summary=true` the `summary=true` param can strip lines/address down to above shape.

## 11.7 URL Parameters
If routed as `/order-success?orderId=PPP-XXXXX` then URL param = `orderId`. Frontend currently doesn't pass a query param; it just reads last-order from storage. Backend can support both patterns.

## 11.8 Authentication / User Context
🔐 Yes — only order owner can view it.

## 11.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `const orderNumber = "PPP-24848"` literal | `friendlyId` | Success heading **(backend fixes this bug — confirmation creates dynamic ID but success ignores it)** |
| hardcoded `30-45 min` literal | `estimatedDelivery.*` | ETA line |
| `"Confirmed"` literal status | `status` | Badge text |

## 11.10 API Dependency / Related Data
- Orders service (same source of truth as My Orders)
- Deep link to My Orders + Track Order tab via `orderId`

---

# 12. My Orders (/my-orders)

## 12.1 Screen / Feature
- **Screen name:** My Orders list + per-order detail + tracking + reorder.
- **Purpose:** List past orders with 4 filter tabs: All, Active (=status Preparing), Delivered, Cancelled. Each order card shows ID, date+time, status badge, items preview, total, and buttons: **View Details** (every status), **Track Order** (Preparing only), **Reorder** (Delivered only). Active Preparing status includes a 4-step progress UI (Confirmed ✓ → Preparing ✓ → Out for Delivery ◯ → Delivered ◯) computed from current status.
- **User role:** 🔐 Customer only.

## 12.2 Backend Operations Required
- List my orders (paginated, filterable by status, sort newest first)
- Get order detail (View Details modal or route)
- Track order (same as detail, but specifically returns current step and optional driver/rider info)
- Reorder (clones lines of a previous Delivered order → creates new cart with those lines)

## 12.3 Suggested API Requirements

### 12.3.1 List
- **Method:** `GET` `/orders`
- **Purpose:** Return orders with filter support for tab states.

### 12.3.2 Detail
- **Method:** `GET` `/orders/:orderId`
- **Purpose:** Full detail used by View Details modal/route.

### 12.3.3 Track ⚠️
- **Method:** `GET` `/orders/:orderId/tracking`
- **Purpose:** Specific payload for Track Order action (rider name, ETA, live location, timeline). If UI currently reuses order detail, this can simply be an augmented detail.

### 12.3.4 Reorder
- **Method:** `POST` `/orders/:orderId/reorder`
- **Purpose:** Copy lines from a previous order into user's current empty cart (append if cart already has items? backend decision), return redirect to /cart or to /checkout.

## 12.4 Request JSON

### Reorder Request ✅
```json
{
  "clearExistingCart": true
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `clearExistingCart` | boolean | optional | Backend decides default; frontend currently has no toggle — assume true for simplicity |

(All other operations are GET/use URL params.)

## 12.5 Response JSON

### List Response (cards shape) ✅
```json
{
  "orders": [
    {
      "id": "ord_01HX...",
      "friendlyId": "PPP-24848",
      "date": "Mar 18, 2026",
      "time": "17:25",
      "status": "Preparing",
      "orderType": "delivery",
      "itemsPreview": [
        { "name": "Porto Special Kebab", "quantity": 2, "imageUrl": "https://.../kebab1.jpg" }
      ],
      "hiddenItemsCount": 0,
      "total": 20.55,
      "currency": "GBP",
      "cutlery": "Yes",
      "progressSteps": [
        { "key": "confirmed",        "label": "Confirmed",         "done": true  },
        { "key": "preparing",        "label": "Preparing",         "done": true  },
        { "key": "out_for_delivery", "label": "Out for Delivery",  "done": false },
        { "key": "delivered",        "label": "Delivered",         "done": false }
      ],
      "canTrack": true,
      "canReorder": false
    }
  ],
  "pagination": { "total": 4, "page": 1, "perPage": 20 }
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | Stable order ID | View Details / Track / Reorder endpoints URL param |
| `friendlyId` | `PPP-XXXXX` | Card header "ORDER PPP-XXXXX" |
| `date`, `time` | String labels | Card sub-header date+time |
| `status` | `Preparing` \| `Delivered` \| `Cancelled` | Badge colour + filter tab matching |
| `orderType` | delivery/pickup | Optional type pill |
| `itemsPreview[]` | ≤3 items (or all, small orders) | Card item mini-list — name qty(×n) thumbnail |
| `hiddenItemsCount` | items not shown in preview | "+3 more items" pill |
| `total` | Grand total | Card right-side amount |
| `currency` | Prefix | Formatting |
| `cutlery` | Yes/No | Mini detail line |
| `progressSteps[]` | 4 items with done flags | Active-order horizontal stepper (only rendered for status = Preparing; others show badge only) |
| `canTrack` | Show/hide Track Order button | `true` if status = Preparing |
| `canReorder` | Show/hide Reorder button | `true` if status = Delivered |

### Detail Response (View Details) ✅
```json
{
  "id": "ord_01HX...",
  "friendlyId": "PPP-24848",
  "createdAt": "2026-03-18T17:25:00Z",
  "date": "Mar 18, 2026",
  "time": "17:25",
  "status": "Preparing",
  "orderType": "delivery",
  "customer": { "firstName":"John", "lastName":"Doe", "phone":"+447123456789", "email":"john@example.com" },
  "address": {
    "id": "addr_01HX...",
    "contactName": "John Doe",
    "address": "12B Oak Street, Flat 4, Glasgow G41 3YN",
    "type": "Home"
  },
  "lines": [
    {
      "id": "line_01...",
      "name": "Porto Special Kebab",
      "quantity": 2,
      "unitPrice": 8.99,
      "lineTotal": 17.98,
      "imageUrl": "https://cdn.example.com/products/kebab1.jpg",
      "selectedOptions": [ { "optionGroupName":"Extra Hot Chilli", "optionName":"Extra Hot Chilli" } ]
    }
  ],
  "totals": {
    "subTotal": 17.98,
    "serviceFee": 1.39,
    "bagCharge": 0.29,
    "deliveryFee": 3.59,
    "discount": 2.70,
    "grandTotal": 20.55
  },
  "payment": {
    "method": "card",
    "amount": 20.55,
    "transactionId": "ch_3Nxxxx",
    "status": "succeeded"
  },
  "orderInstructions": "No onions, extra sauce.",
  "deliveryNotes": "Ring doorbell twice.",
  "cutlery": "Yes",
  "progressSteps": [ /* same as list */ ],
  "tracking": {
    "estimatedArrival": "2026-03-18T18:00:00Z",
    "rider": { "name": "Ahmed Khan", "phone": "+92 300 0000000", "photoUrl": "https://..." },
    "timeline": [
      { "label":"Order Placed",       "time":"17:25", "done":true },
      { "label":"Being Prepared",     "time":"17:27", "done":true },
      { "label":"Out for Delivery",   "time":"---",   "done":false },
      { "label":"Delivered",          "time":"---",   "done":false }
    ]
  }
}
```
### Reorder Response ✅
```json
{
  "success": true,
  "cartId": "cart_01HX...",
  "itemsAdded": 2,
  "redirectUrl": "/cart"
}
```

## 12.6 Query Parameters
| Param | Required? | Why |
|---|---|---|
| `?status=<Preparing\|Delivered\|Cancelled\|All>` | ✅ Yes | Drives 4 filter tabs. Tab "Active" = backend `status=Preparing` |
| `?page=<int>` | optional | Paginate list |
| `?perPage=<int>` | optional | Items per page (mock has 4 hardcoded fallback orders) |
| `?sort=newest` | optional default | Newest on top |

## 12.7 URL Parameters
- `/orders/:orderId` — Detail / Tracking / Reorder. Value from list card `id`.

## 12.8 Authentication / User Context
All 🔐. List/detail must be filtered to authenticated user only (never allow IDOR into another user's order by friendlyId-guessing).

## 12.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `zee-grill-orders[]` array (confirmation pushes here) | `/orders` list | My Orders list |
| fallback object `fallbackOrders:OrderCard[]` (4 hardcoded orders if storage empty) | `/orders` list (seeded demo backend can return these) | List initial state |
| mock `status: "Preparing"` top index | `progressSteps` with done flags | 4-stepper display |
| `View Details` onClick (currently UI no handler — opens nothing!) | `/orders/:orderId` detail payload | Populate modal/route content |
| `Track Order` on Preparing (currently no handler) | `/orders/:orderId/tracking` or same detail augmented | Rider info / timeline |
| `Reorder` on Delivered (currently no handler) | `POST /orders/:orderId/reorder` | Add lines back to cart |

## 12.10 API Dependency / Related Data
- User service (ownership)
- Products (resolve images, names)
- Addresses (deliver-to info)
- Payments (method displayed)
- Loyalty (orderId referenced as trigger for points credit, wallet section shows transaction.orderId)
- Rider/delivery service (tracking, ETA)
- Cart service (reorder = clone to cart)

---

# 13. User Profile (/account/profile)

## 13.1 Screen / Feature
- **Screen name:** Profile edit page (`/account/profile`).
- **Purpose:** Shows avatar (uploadable — JPEG/PNG up to 4MB, read via FileReader to base64 data-URL locally), first name, last name, email, phone inputs; optional "Change password" section (current password, new password — min 6 chars, confirm password match), Save Changes button.
- **User role:** 🔐 Customer only.

## 13.2 Backend Operations Required
- Get my profile
- Update profile (basic fields + avatar)
- Change password (separate mutation)

## 13.3 Suggested API Requirements
### 13.3.1 Get Profile
- `GET /users/me`
### 13.3.2 Update Profile
- `PATCH /users/me`
### 13.3.3 Change Password
- `POST /users/me/password`

## 13.4 Request JSON

### Update Profile Request ✅
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447123456789",
  "email": "john@example.com",
  "profilePic": "data:image/jpeg;base64,/9j/4AA..."
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `firstName` | string | ✅ required | Input field |
| `lastName` | string | ✅ required | Input field |
| `phone` | string | ✅ required | Input field |
| `email` | string | ✅ required | Input field (may be immutable if tied to auth identity; backend decides, UI assumes editable) |
| `profilePic` | string (data URI) OR multipart upload | optional | File input; frontend currently converts via FileReader → base64 data URL. Backend can accept base64 OR multipart/form-data file (`profilePicFile`) — backend decides upload strategy (CDN URL returned) |

### Change Password Request ✅
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `currentPassword` | string | ✅ required | "Current Password" input |
| `newPassword` | string | ✅ required, min 6 chars | "New Password" input |

## 13.5 Response JSON

### GET / PATCH Profile Response ✅
```json
{
  "id": "usr_01HX...",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+447123456789",
  "profilePic": "https://cdn.example.com/avatars/usr_01HX.jpg"
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | Stable user ID | Every user-scoped endpoint |
| `firstName` / `lastName` / `email` / `phone` | Form repopulate | Profile editor fields |
| `name` | Display concatenation | Navbar dropdown, account heading |
| `profilePic` | CDN URL (or data URL fallback returned if backend stores base64) | Avatar `<img src>` |

### Change Password Response
```json
{ "success": true, "message": "Password updated successfully." }
```
### Error Response
```json
{ "success": false, "error": "Current password is incorrect." }
```

## 13.6 Query Parameters
None.

## 13.7 URL Parameters
None. Single user `/me` scope from token.

## 13.8 Authentication / User Context
All 🔐 — change password specifically should also re-validate token or require stronger re-auth (frontend currently just asks current-password text field; no OTP step).

## 13.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `zee-grill-user` object stored in Profile Save handler | `GET /users/me` on mount + `PATCH /users/me` on Save | Form initial values + Navbar hydration on `profile-updated` event |
| `localStorage.loggedInUser` = full name string | `name` concatenation | Navbar user label |
| avatar FileReader → base64 stored locally | `profilePic` (returned as CDN URL) | Avoid massive base64 strings in localStorage long-term |

## 13.10 API Dependency / Related Data
- Auth identity service (if email=username, email changes may require separate email-change confirmation flow)
- File/object storage for avatar uploads
- Order history / saved addresses / other user-owned data all reference user.id — unchanged by profile edits.

---

# 14. Account Hub (/account) — Logout

## 14.1 Screen / Feature
- **Screen name:** `/account` landing hub. Displays avatar, name, loyalty points pill, wallet balance pill, shortcut cards (Profile, My Orders, Saved Addresses, Payment Methods, Favourites, Wallet, Loyalty Points, Coupons, Refer & Earn, Notifications, Help & Support, Delete Account accordion with nested 8 sublinks), and Logout in header/top-right.
- **Purpose:** Central navigation. Only mutation present here is **Logout**. All other links navigate to subpages.
- **User role:** 🔐 Customer only.

## 14.2 Backend Operations Required
- Account summary (GET: aggregate name, avatar, loyalty points current, wallet balance current, referral code, notifications unread count — used on top banner)
- Logout (POST; invalidate refresh token if token auth; revoke session if session cookie auth)

## 14.3 Suggested API Requirements
### 14.3.1 Account Hub Summary
- `GET /users/me/summary` — single call instead of 4 parallel calls to wallet/loyalty/notifications/me on every /account load.
### 14.3.2 Logout
- `POST /auth/logout`

## 14.4 Request JSON

### Logout Request
```json
{ /* empty or include refresh token */ }
```
No UI fields — just a button. Backend may look at refresh token in cookie/header.

## 14.5 Response JSON

### Summary Response ✅
```json
{
  "user": {
    "id": "usr_01HX...",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "profilePic": "https://cdn.example.com/avatars/usr_01HX.jpg"
  },
  "loyaltyPoints": 320,
  "walletBalance": 3.20,
  "currency": "GBP",
  "referralCode": "PORTOLAIB",
  "unreadNotifications": 1
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `user.*` | Same as profile | Hub header |
| `loyaltyPoints` | Points count pill | Hub header points badge |
| `walletBalance` | £ value | Hub header wallet badge |
| `currency` | Prefix | Format balance |
| `referralCode` | User's own code | Refer&Earn page if user doesn't have custom code yet |
| `unreadNotifications` | Integer > 0 | Red dot badge on Notifications shortcut card ⚠️ (no UI dot yet, but useful pattern) |

### Logout Response
```json
{ "success": true }
```
After logout, frontend: clears local user state, dispatches `auth-changed` + `user-logged-out` events, and redirects to `/`. (This is currently handled in localStorage-clear code; backend should complement it by invalidating server-side sessions.)

## 14.6 Query Parameters / URL Parameters
None.

## 14.8 Authentication / User Context
Both 🔐 require token. Logout is only valid while logged in.

## 14.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `zee-grill-user` (avatar,name,email) | `user.*` in summary | Hub header display |
| `zee-grill-loyalty-points` number from storage | `loyaltyPoints` | Hub header pill |
| `zee-grill-loyalty-points/100` math | `walletBalance` | Hub header pill |
| referrals list count "Your Referrals (0)" literal on Refer page | not present in hub; Refer & Earn page reads it separately | Section 18 |
| Notifications `read:false` count in notifications[] mock | `unreadNotifications` | Hub red badge count |

## 14.10 API Dependency / Related Data
- Aggregate endpoint touches: user, loyalty, wallet, referral, notifications — backend decides whether to fan-out internally or client issues parallel GETs. Either works; summary endpoint is just an optimisation suggestion.

---

# 15. Wallet (/account/wallet)

## 15.1 Screen / Feature
- **Screen name:** Wallet page (`/account/wallet`)
- **Purpose:** Show wallet balance (£), equivalent loyalty points (100 pts = £1), and transactions list. Transactions are type "earned" only; each has id, type, points, amount, orderId, date string. The page also exposes a dev helper comment `addLoyaltyPoints(250, "1234")` = real loyalty credit logic on order completion.
- **User role:** 🔐 Customer only.

## 15.2 Backend Operations Required
- Get wallet balance + current points (same call)
- List wallet transactions (paginated)
- (Optional future) Top up wallet ⚠️ — no top-up button in UI today

## 15.3 Suggested API Requirements
- `GET /wallet` — balance
- `GET /wallet/transactions` — transaction list

## 15.4 Request JSON
None (GETs).

## 15.5 Response JSON

### Wallet Balance Response ✅
```json
{
  "balance": 3.20,
  "currency": "GBP",
  "loyaltyPoints": 320,
  "pointsPerPound": 100
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `balance` | £ amount | Big `£3.20` heading |
| `currency` | Prefix | Formatting |
| `loyaltyPoints` | Points | "Loyalty Points 320 Points" inner card row |
| `pointsPerPound` | conversion | Info text "100 loyalty points = £1 wallet credit" |

### Transactions List Response ✅
```json
{
  "transactions": [
    {
      "id": "txn_01HX...",
      "type": "earned",
      "points": 250,
      "amount": 2.50,
      "orderId": "PPP-24848",
      "orderFriendlyId": "PPP-24848",
      "date": "Mar 18, 2026 17:26"
    }
  ],
  "pagination": { "total": 1, "page": 1, "perPage": 20 }
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | Stable transaction ID | React key |
| `type` | Currently always `"earned"`; future `"spent"`, `"refund"`, `"referral"` possible | Left-side label (hardcoded "Loyalty Reward Earned" for earned type) |
| `points` | +N pts | Right column green +250 pts line |
| `amount` | +£N | Right column green main amount |
| `orderFriendlyId` | `"Order #PPP-24848"` subtitle | Line under title if present |
| `date` | Human timestamp | Bottom date row |

## 15.6 Query Parameters
| Param | Why |
|---|---|
| `?page=` / `?perPage=` | Pagination of long history |
| `?type=earned` (optional) | Filter by type (future-proof) |

## 15.7 URL Parameters
None. (Future `/wallet/transactions/:id` receipt if needed.)

## 15.8 Authentication / User Context
🔐 user-only.

## 15.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `zee-grill-loyalty-points` (number stored) | `GET /wallet` balance `loyaltyPoints` + derived `balance = pts/100` | Wallet card |
| `zee-grill-wallet-transactions` JSON array (`WalletTransaction[]`) | `/wallet/transactions.transactions[]` | Transactions list |
| WalletTxn.orderId `PPP-XXXX` stored raw | `orderFriendlyId` display field | List subtitle "Order #PPP-24848" |

## 15.10 API Dependency / Related Data
- Loyalty service (points = input source to wallet)
- Orders (orderId reference, displayed back to user)
- Checkout / Payment: wallet balance could be redeemable as partial payment in future (no UI yet for "Pay with wallet" in payment page)

---

# 16. Loyalty Points (/account/loyalty-points)

## 16.1 Screen / Feature
- **Screen name:** Loyalty Points page (`/account/loyalty-points`)
- **Purpose:** Hero card shows current points and progress toward "500 points → Free Fries" reward (0-100% progress bar). Static list of Available Rewards below: Free Fries (500), Free Drink (300), 10% Off Order (1000), Free Burger (1500). Redeem buttons are all **disabled** in mock UI.
- **User role:** 🔐 Customer only.

## 16.2 Backend Operations Required
- Get loyalty summary (balance, tier threshold, next reward, earning rule text)
- List redeemable rewards catalog (currently 4 hardcoded)
- Redeem reward ⚠️ (once buttons are enabled)

## 16.3 Suggested API Requirements
- `GET /loyalty/summary` — balance + next reward progress
- `GET /loyalty/rewards` — rewards catalog list
- `POST /loyalty/rewards/:rewardId/redeem` — redeem (returns coupon code or applies to user account)

## 16.4 Request JSON

### Redeem Request ⚠️
```json
{
  "applyTo": "coupon_code"
}
```
("applyTo" = backend design decision: create coupon, apply to next order, add item to cart, etc.)

## 16.5 Response JSON

### Summary Response ✅
```json
{
  "points": 320,
  "pointsPerUnitSpent": 1,
  "pointsCurrencyLabel": "Rs. 1 spent = 1 point",
  "pointsPerPound": 100,
  "pointsPerPoundLabel": "100 points = £1 wallet credit",
  "nextReward": {
    "id": "rw_free_fries",
    "name": "Free Fries",
    "cost": 500,
    "progressPct": 64
  }
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `points` | Big hero number | Hero card heading 320 |
| `pointsPerUnitSpent` + label | Earning rules | "Rs. 1 spent = 1 point" line |
| `pointsPerPound` + label | Wallet conversion | Info line in hero |
| `nextReward.*` | Name + cost + % | Progress bar width `progressPct%`, label "320 / 500 to earn free fries" |

### Rewards Catalog List Response ✅
```json
{
  "rewards": [
    { "id": "rw_free_drink",  "name": "Free Drink",        "cost": 300,  "redeemable": true  },
    { "id": "rw_free_fries",  "name": "Free Fries",        "cost": 500,  "redeemable": false },
    { "id": "rw_10pct_off",   "name": "10% Off Order",     "cost": 1000, "redeemable": false },
    { "id": "rw_free_burger", "name": "Free Burger",       "cost": 1500, "redeemable": false }
  ]
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | Reward ID | Redeem URL param |
| `name` | Row title | Reward name |
| `cost` | Cost pts | "500 points" under name |
| `redeemable` | User has enough points? | Enable/disable Redeem button (currently **all disabled** in mock — backend must drive this field correctly, cost=300 should be enabled for user with 320 pts) |

### Redeem Response ⚠️
```json
{
  "success": true,
  "couponCode": "FREEFRIES-24HX",
  "message": "Free Fries coupon added to your coupons."
}
```

## 16.6 Query Parameters
- None for summary. List rewards `?sort=cost` optional (already cheapest-first in mock).

## 16.7 URL Parameters
- `/loyalty/rewards/:rewardId/redeem` — from list row `id`.

## 16.8 Authentication / User Context
All 🔐.

## 16.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `Number(localStorage["zee-grill-loyalty-points"])` | `points` in summary | Hero big-number |
| `progress = min((points/500)*100, 100)` literal | `nextReward.progressPct` (backend calculates) | Width style on progress bar div |
| `[Free Fries 500, Free Drink 300, 10% Off 1000, Free Burger 1500]` inline array | `/loyalty/rewards` catalog | Available rewards list |
| All `disabled` attributes set to `true` on Redeem buttons | `redeemable = points >= reward.cost` | Button enabled state (**mock bug now: 300-pt reward shown disabled for user with 320 pts**) |

## 16.10 API Dependency / Related Data
- Wallet service (points → wallet £ conversion matches 100:1)
- Coupons service (redeem = add coupon to user's coupons)
- Orders service to earn points after successful payment (rule: Rs. 1 spent = 1 point currently hardcoded in earning text)

---

# 17. Coupons (/account/coupons + Checkout Apply)

## 17.1 Screen / Feature
- **Screen name:** Coupons subpage (add code, list added coupons, remove individual) + coupon apply field inside Checkout sidebar.
- **Purpose:** Coupons page has "Add Coupon" form, static hint "Available codes: WELCOME15, FREEDEL", and lists coupons the user has added/validated. Checkout has a separate Apply field (dead button right now). Coupon card shows title, description, expiry date, the code, a "% off" or "FREE DELIVERY" graphic on left, and remove × button.
- **User role:** 🔐 Customer only.

## 17.2 Backend Operations Required
- Validate and add coupon to user's wallet (Create)
- List my coupons (Read list, filter expired/used/available)
- Remove coupon from user (Delete — called "Remove" on × button)
- Apply coupon to current checkout (mutates checkout totals) — used by checkout page
- Remove applied coupon from checkout

## 17.3 Suggested API Requirements
### 17.3.1 Add / Validate to My Coupons
- `POST /coupons/validate` (checks validity + returns coupon meta) → then
- `POST /users/me/coupons` (attaches to user)
- Or combined single endpoint: `POST /coupons/redeem`
### 17.3.2 List My Coupons
- `GET /users/me/coupons`
### 17.3.3 Remove My Coupon
- `DELETE /users/me/coupons/:userCouponId`
### 17.3.4 Apply to Checkout
- `POST /checkouts/:checkoutId/apply-coupon`
- `DELETE /checkouts/:checkoutId/applied-coupon`

## 17.4 Request JSON

### Add / Redeem Coupon to My Coupons Request ✅
```json
{
  "code": "WELCOME15"
}
```
| Field | Type | Required | UI Source |
|---|---|---|---|
| `code` | string (uppercase, trimmed) | ✅ required | "Enter coupon code" input on Coupons page (auto-uppercases) |

### Apply Coupon to Checkout ✅/⚠️
```json
{
  "code": "WELCOME15"
}
```
(Same shape, different endpoint, returns discount amount + updated grandTotal.)

## 17.5 Response JSON

### My Coupons List Response ✅
```json
{
  "coupons": [
    {
      "id": "ucpn_01HX...",
      "title": "Welcome 15% Off",
      "code": "WELCOME15",
      "description": "15% off on your first order",
      "discountType": "percent",
      "discountValue": 15,
      "expiresAt": "2026-12-31T23:59:59Z",
      "expLabel": "Expires 31 Dec 2026",
      "status": "active",
      "graphicValue": "15%",
      "graphicSuffix": "OFF"
    },
    {
      "id": "ucpn_02HX...",
      "title": "Free Delivery",
      "code": "FREEDEL",
      "description": "Free delivery on orders above £10.00",
      "discountType": "free_delivery",
      "discountValue": 0,
      "minOrderValue": 10.00,
      "expiresAt": "2026-11-15T23:59:59Z",
      "expLabel": "Expires 15 Nov 2026",
      "status": "active",
      "graphicValue": "FREE",
      "graphicSuffix": "DELIVERY"
    }
  ]
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | User-coupon ID | Remove button target |
| `title` | Coupon card h2 title | Card header |
| `code` | Displayed in mono box | "Coupon Code" display |
| `description` | Sub-paragraph | Desc under title |
| `discountType` | `percent` \| `fixed` \| `free_delivery` | Decide left graphic |
| `discountValue` | 15 for 15%, 3.99 for £3.99 off | Math + graphic label |
| `minOrderValue` | Min subtotal threshold | Validation at apply time |
| `expLabel` | Human expiry | Rounded-full right-bottom pill |
| `status` | `active` \| `used` \| `expired` | Drive green check "Coupon added successfully" if active |
| `graphicValue` | `"15%"` or `"FREE"` | Left-side big graphic |
| `graphicSuffix` | `"OFF"` or `"DELIVERY"` | Small uppercase label under graphic |

### Validate / Add Response
```json
{
  "success": true,
  "coupon": { /* single coupon shape */ }
}
```
### Validate Error Response
```json
{ "success": false, "error": "Invalid coupon code" }
```
(Also used for "This coupon is already added" — currently duplicates blocked client-side.)

### Checkout Apply Coupon Response ⚠️
```json
{
  "success": true,
  "applied": {
    "code": "WELCOME15",
    "discountAmount": 2.70,
    "description": "15% off on your first order"
  },
  "newGrandTotal": 20.55
}
```

## 17.6 Query Parameters
- `?status=active` / `expired` / `used` — optional filter tabs on Coupons page (currently no tabs, but helpful for pagination of long history)
- `?page=` / `?perPage=` optional pagination.

## 17.7 URL Parameters
- `/users/me/coupons/:userCouponId` — Remove. Value from list row.
- `/checkouts/:checkoutId/apply-coupon` — Apply; checkoutId from session.

## 17.8 Authentication / User Context
All 🔐. Coupons are user-scoped.

## 17.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `availableCoupons[]` inline 2 items (`WELCOME15`, `FREEDEL`) with title/code/desc/exp | `/coupons/validate` or `/coupons/redeem` backend validates against master catalog + returns populated shape | Coupons page "Available codes" hint text (this list should also be a GET `/coupons/available` endpoint so marketing can add codes without frontend deploys) |
| `addedCoupons[]` React state on Coupons page | `/users/me/coupons` GET list | Card grid display |
| Checkout page coupon input with dead Apply button | `/checkouts/:checkoutId/apply-coupon` | Sidebar "Coupon (WELCOME15) - £2.70" discount line + grand total recalc |

## 17.10 API Dependency / Related Data
- Coupon / promotion engine service (validates expiry, per-user limits, stacking rules — frontend currently allows adding multiple without stacking logic)
- Checkout service (apply → mutate totals)
- Refer&Earn: first-order referrals could auto-create a coupon on referee account
- Loyalty redeem → create coupon (Section 16 Redeem response returns `couponCode`)

---

# 18. Refer & Earn (/account/refer-earn)

## 18.1 Screen / Feature
- **Screen name:** Refer & Earn page (`/account/refer-earn`)
- **Purpose:** Display user's referral code (hardcoded `PORTOLAIB` today), copy-to-clipboard button, 3 share method buttons (WhatsApp / SMS / Email — no backend calls, only `navigator.share` or intents would open them client-side), How-It-Works 3-step static card, and "Your Referrals (0)" section (hardcoded count 0, no list — empty state only).
- **User role:** 🔐 Customer only.

## 18.2 Backend Operations Required
- Get my referral summary (code, stats: referrals count, amount earned, pending rewards)
- List my referrals history ⚠️ (when count > 0, UI will need a list)
- Generate referral share deep-link ⚠️

## 18.3 Suggested API Requirements
- `GET /referrals/me` — summary + stats
- `GET /referrals/me/history` — list

## 18.4 Request JSON
None (GETs).

## 18.5 Response JSON

### Summary Response ✅
```json
{
  "referralCode": "PORTOLAIB",
  "shareUrl": "https://portopiripiri.co.uk/signup?ref=PORTOLAIB",
  "stats": {
    "referralsCount": 0,
    "totalEarned": 0.00,
    "currency": "PKR",
    "rewardAmount": 200,
    "refereeRewardAmount": 200
  },
  "rewardDescription": "Share your unique code with friends. They get Rs. 200 off on their first order, and you get Rs. 200 too!"
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `referralCode` | User's unique referral code | Big centered mono display `PORTOLAIB` |
| `shareUrl` | Deep link | SMS/Email/WhatsApp share message body content (frontend constructs manually today) |
| `stats.referralsCount` | Count | "Your Referrals (N)" header label |
| `stats.totalEarned` | Amount earned so far | Future balance line (not yet rendered) |
| `stats.currency` | PKR today / GBP decision | Prefix |
| `stats.rewardAmount` | Rs. 200 (referrer) | Hero banner copy |
| `stats.refereeRewardAmount` | Rs. 200 (friend) | Hero banner copy |
| `rewardDescription` | Marketing copy | Paragraph under heading |

### Referrals History List Response ⚠️
(UI only shows "No referrals yet" today; backend should still prepare list.)
```json
{
  "referrals": [
    {
      "id": "ref_01HX...",
      "referredUserName": "Sarah Smith",
      "referredUserEmailHash": "ab12...",
      "status": "completed",
      "rewardEarned": 200,
      "currency": "PKR",
      "completedAt": "2026-03-10T14:20:00Z",
      "orderId": "PPP-24120"
    }
  ]
}
```

## 18.6 Query Parameters
- History list: `?page=`, `?perPage=` optional.

## 18.7 URL Parameters
None.

## 18.8 Authentication / User Context
🔐 user-only — referral code is private per user.

## 18.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `const code = "PORTOLAIB"` literal | `referralCode` | Page big display |
| "Refer a friend..." hero copy (hardcoded) | `rewardDescription` + amounts | Hero sub-paragraph |
| "Your Referrals (0)" hardcoded count | `stats.referralsCount` | Section heading N |
| Share method buttons (WhatsApp/SMS/Email) | Pure client behaviour — use `shareUrl` as message body | No backend; endpoints optional only for analytics track-click |

## 18.10 API Dependency / Related Data
- User auth service (each new signup carries referral code, backend must capture referrer link)
- Wallet / Loyalty service: when referee's first order is paid, both parties get credited Rs. 200 (referrer to wallet; referee as first-order coupon or wallet credit)
- Campaign config: reward amounts per-country/currency could come from Site Config Section 2 `referral.referrerReward` etc.

---

# 19. Notifications (/account/notifications)

## 19.1 Screen / Feature
- **Screen name:** Notifications page (`/account/notifications`)
- **Purpose:** List of notification cards (type info / promo today; type colour differs). Unread cards have a light peach background + red dot next to title. "Mark all read" button top-right (no handler in mock). Each card has bell icon, title, message, relative time.
- **User role:** 🔐 Customer only.

## 19.2 Backend Operations Required
- List my notifications (paginated)
- Mark single notification as read (or implicitly on open)
- Mark all as read (explicit button in UI — needs handler)

## 19.3 Suggested API Requirements
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `POST /notifications/mark-all-read` (or `PATCH /notifications/read-all`)

## 19.4 Request JSON

### Mark Single Read ✅/⚠️
```json
{ /* empty — uses URL param */ }
```
### Mark All Read ✅/⚠️
```json
{ /* empty */ }
```

## 19.5 Response JSON

### List Response ✅
```json
{
  "notifications": [
    {
      "id": "notif_01HX...",
      "title": "Welcome to Porto Piri Piri!",
      "message": "Thank you for joining us. Use code WELCOME15 for 15% off your first order.",
      "timeLabel": "Today, 10:30 AM",
      "createdAt": "2026-03-18T10:30:00Z",
      "read": false,
      "type": "info",
      "action": { "type": "deep_link", "url": "/account/coupons" }
    },
    {
      "id": "notif_02HX...",
      "title": "New Menu Items Available",
      "message": "Try our new spicy peri peri burgers and loaded fries!",
      "timeLabel": "Yesterday",
      "createdAt": "2026-03-17T19:00:00Z",
      "read": true,
      "type": "promo",
      "action": { "type": "deep_link", "url": "/#menu" }
    }
  ],
  "unreadCount": 1,
  "pagination": { "total": 2, "page": 1, "perPage": 30 }
}
```
| Field | Purpose | UI consumer |
|---|---|---|
| `id` | React key + mark-read URL param | Row identity |
| `title` | Bold card title | Card title |
| `message` | Body paragraph | Card message |
| `timeLabel` | Relative / absolute time | Bottom date |
| `createdAt` | ISO timestamp | Server-side relative formatter |
| `read` | Boolean | Row background tint, red-dot next to title |
| `type` | `info` \| `promo` \| `order` \| `delivery` | Icon color (info = blue, promo = gold); mock only uses info + promo |
| `action` | Optional deep-link | Tapping notification navigates (no tap handler wired today ⚠️) |
| `unreadCount` | Count | Badge in Account Hub + navbar future bell badge |

### Mark (All) Read Responses
```json
{ "success": true, "unreadCount": 0 }
```

## 19.6 Query Parameters
- `?read=` / `?unread=true` (filter)
- `?type=order` (filter by category — if added UI later)
- `?page=`, `?perPage=` pagination.

## 19.7 URL Parameters
- `/notifications/:id/read` — single mark read, `id` from list row.

## 19.8 Authentication / User Context
All 🔐.

## 19.9 Static Data Mapping
| mock field | API field | UI usage |
|---|---|---|
| `notifications[]` inline 2 items on Notifications page | `GET /notifications` list | Page list render |
|