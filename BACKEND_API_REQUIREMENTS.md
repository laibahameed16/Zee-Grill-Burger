# Backend API Requirements Document

**Project:** Zee Grill Burger / Porto Piri Piri (customer-facing Next.js frontend)  
**Purpose:** Describe every backend capability the existing UI needs.  
**Scope:** Analysis only. Endpoint names, service boundaries, and implementation are suggestions. The backend developer makes final architecture decisions.

**Frontend source of truth:** `zee-grill-burger` (App Router). Data today lives mainly in `localStorage` and static constants. A generic HTTP client already exists (`lib/apiClient.ts`) with `Authorization: Bearer <accessToken>` when `requiresAuth` is true. Login/register currently **do not** call that client or persist tokens.

**User role in this UI:** Customer / guest only. There is no admin dashboard, kitchen board, or staff role in this frontend. A hardcoded demo login (`udaisnaeem@gmail.com`) exists in the auth modal; it is **not** a real permission model.

**Legend used below:**

- **Explicit:** Present in UI, types, forms, buttons, or mock objects.
- **Inference:** Needed for a real backend even if the UI currently fakes it (clearly marked).

---

## Global conventions (how the frontend is already prepared)

### Suggested API envelope

The client (`lib/apiClient.ts`) already reads:

```json
{
  "error": "string",
  "message": "string"
}
```

On HTTP **401** the client clears tokens and fires logout events.

**Inference — possible backend requirement:** Successful responses may wrap data, but the UI does not currently parse a standard wrapper. Backend may return either raw resources or `{ "success": true, "data": ... }` as long as the frontend is updated later.

### Auth tokens the frontend already stores

| Storage key | Field | Usage |
|---|---|---|
| `zee-grill-access-token` | `accessToken` | Bearer header |
| `zee-grill-refresh-token` | `refreshToken` | Stored; **no refresh-token API call exists in UI** |
| `zee-grill-token-expires-at` | `expiresAt` (number, epoch ms) | `isTokenValid()` |

### Pricing constants currently hardcoded in the frontend

These are **not** fetched from an API today. If they remain frontend-only, checkout totals can drift from the server. **Inference:** expose via config/order quote API.

| Constant | Value | File |
|---|---|---|
| Size Small extra | `0` | `lib/constants.ts` `SIZE_PRICES` |
| Size Medium extra | `1` | same |
| Size Large extra | `2` | same |
| Extra hot chilli | `0.5` | `EXTRA_HOT_CHILLI_PRICE` |
| Delivery fee | `3.99` | `DELIVERY_FEE` |
| Service fee | `1.99` | `SERVICE_FEE` |
| Bag charge | `0.29` | `BAG_CHARGE` |
| Loyalty: points per £ | `10` | `POINTS_PER_POUND` |
| Loyalty earn min spend | `50` | `LOYALTY_EARN_MIN_SPEND` |
| Loyalty points per tier | `10` | `LOYALTY_EARN_POINTS_PER_TIER` |
| Loyalty tier amount | `50` | `LOYALTY_EARN_TIER_AMOUNT` |
| Free delivery threshold (banner only) | `20` | `SITE_CONFIG.delivery.freeDeliveryThreshold` |
| Tip presets | `5, 10, 15` | `TIP_OPTIONS` |

### Currency

UI displays `£` (`CURRENCY_SYMBOL`). Amounts in mock orders are numbers (e.g. `27.38`). Menu item `price` is a **string** like `"£3.95"`.

### Pagination / sort

**No screen implements pagination, infinite scroll, or server-side sort.** Do not invent `page`/`limit` unless you add them later.

---

# 1. Auth (Login / Register / Forgot password)

## 1.1 Screen / Feature

**Screen:** Auth modal (`components/home/AuthModal.tsx`)  
**Purpose:** Login, register, forgot/reset password, Google/Apple sign-in (mock fallback).  
**Role:** Guest (unauthenticated customer).

## 1.2 Backend operations required

| Operation | UI action |
|---|---|
| Login | Email + password, “Login” |
| Register | Create account form |
| Send OTP / reset code | Forgot password → “Send Verification Code” / “Resend code” |
| Reset password | Code + new password + confirm |
| Social login | Google / Apple buttons |
| Logout | Account page “Logout” (client currently only clears local storage) |

Existing Next.js placeholder routes (should be replaced or proxied by real backend):

- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp` (defined but **UI never calls it**; reset uses `reset-password`)
- `POST /api/auth/reset-password`

---

### Login

**Method:** `POST`  
**Suggested endpoint:** `/auth/login`  
**Purpose:** Authenticate email/password and return user + tokens.

**Request JSON:**

```json
{
  "email": "johndoe@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string | required | Login form “E-mail *” (UI lowercases/trims) |
| `password` | string | required | Login form “Password *” |
| `rememberMe` | boolean | optional | “Remember me” checkbox exists but is **not sent** anywhere today. **Inference** if you persist sessions. |

**Response JSON (needed by UI after login):**

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresAt": 1774550000000,
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "phone": "+447911123456",
    "profilePic": "",
    "name": "John Doe"
  }
}
```

| Field | Type | Purpose | UI usage |
|---|---|---|---|
| `accessToken` | string | Auth | Stored; Bearer header (`lib/auth.ts`) |
| `refreshToken` | string | Refresh | Stored; unused by a call today |
| `expiresAt` | number | Expiry | `isTokenValid()` |
| `user.firstName` | string | Profile | Navbar, account, checkout, profile |
| `user.lastName` | string | Profile | Profile, checkout |
| `user.email` | string | Identity | Profile, checkout |
| `user.phone` | string | Contact | Profile, checkout |
| `user.profilePic` | string (URL or data URL today) | Avatar | Navbar, account, profile |
| `user.name` | string | Display name | `loggedInUser` / “Welcome back” |

**Auth:** Public.  
**Query/URL params:** none.

---

### Register

**Method:** `POST`  
**Suggested endpoint:** `/auth/register`  
**Purpose:** Create customer account and log them in.

**Request JSON:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447911123456",
  "email": "johndoe@example.com",
  "password": "secret123",
  "referenceCode": "PORTOLAIB",
  "marketingOptIn": true
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `firstName` | string | required | Register “Firstname *” |
| `lastName` | string | required | Register “Lastname *” |
| `phone` | string | required | Register “Phone *”. UI validates `^\+447\d{9}$` after stripping spaces/`()`/`-`. Placeholder shows `447911123456` without `+`. |
| `email` | string | required | Register “E-mail *” |
| `password` | string | required | Min length 6 |
| `referenceCode` | string | optional | “Reference Code (Optional)” |
| `marketingOptIn` | boolean | optional | “I would like to receive news and promotional offers…” checkbox. Stored as `regAgreeTerms` but **not saved** on the mock user object. **Inference.** |

UI also states agreement to Terms of Use / Privacy Promise (not a payload field).

**Response:** Same shape as login (user + tokens). UI immediately calls `performLogin`.

---

### Send password reset code (OTP)

**Method:** `POST`  
**Suggested endpoint:** `/auth/send-otp` (already used by UI as `/api/auth/send-otp`)  
**Purpose:** Email a 4-digit code valid 10 minutes.

**Request JSON:**

```json
{
  "email": "johndoe@example.com"
}
```

**Response JSON (explicit from current route):**

```json
{
  "success": true,
  "message": "A 4-digit verification code has been sent to johndoe@example.com."
}
```

Error: `{ "success": false, "error": "..." }`

**Auth:** Public.

---

### Reset password

**Method:** `POST`  
**Suggested endpoint:** `/auth/reset-password` (UI: `/api/auth/reset-password`)  
**Purpose:** Verify code and set new password.

**Request JSON:**

```json
{
  "email": "johndoe@example.com",
  "code": "1234",
  "newPassword": "newsecret"
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `email` | string | required | Forgot-password email (held in `otpEmail`) |
| `code` | string | required | “Password code” |
| `newPassword` | string | required | “New password” (min 6). Confirm password is client-only. |

**Response:** `{ "success": true, "message": "Password reset successful." }`  
UI then logs the user in locally. **Inference:** return tokens + user like login.

---

### Verify OTP (placeholder only)

**Method:** `POST`  
**Suggested endpoint:** `/auth/verify-otp`  
**Purpose:** Validate code without changing password.  
**Note:** Route exists; **AuthModal never calls it.** Optional for backend.

**Request:** `{ "email": "johndoe@example.com", "code": "1234" }`

---

### Google / Apple social login

**Explicit UI:** Google GIS token flow fetches Google userinfo, then `performLogin` locally. Fallback mock accounts: `google.user@gmail.com`, `apple.user@icloud.com`. Custom name+email forms also log in without verification.

**Inference — possible backend requirement:**

**Method:** `POST`  
**Suggested endpoint:** `/auth/social`  

```json
{
  "provider": "google",
  "idToken": "..."
}
```

or `{ "provider": "apple", "idToken": "..." }`

Response: same as login.

---

### Logout

**Method:** `POST`  
**Suggested endpoint:** `/auth/logout`  
**Purpose:** Invalidate refresh token.  
**Request:** none (token in header).  
**Response:** `{ "success": true }`  
**Auth:** Logged-in user.  
**Note:** UI currently only clears local storage (`logoutUser()`). Logout API is **inference**.

---

# 2. Home / Menu

## 2.1 Screen / Feature

**Screens:** Home (`app/page.tsx`), Menu (`components/home/Menu.tsx`, `MenuSection.tsx`, `MenuCategory.tsx`)  
**Purpose:** Browse categories, search items, customise (size, extra hot chilli, qty), add to cart, favourite.  
**Role:** Guest can browse/search. **Add to cart and favourite require login** (opens AuthModal).

Menu items are generated by `createMenuItems()` — 6 fake items per category. Categories are static in `lib/menu.ts` / `lib/constants.ts`.

## 2.2 Operations

### List menu (categories + items)

**Method:** `GET`  
**Suggested endpoint:** `/menu`  
**Purpose:** Return categories and items the menu UI renders.

**Query parameters:**

| Param | Why |
|---|---|
| `search` | Home search box “Search menu…” filters by item `name` or `description` (client-side today). Optional server-side search. |
| `category` | Category tabs (`MENU_CATEGORIES`). Optional if API returns all sections. |

**No pagination in UI.**

**List response example:**

```json
{
  "categories": [
    {
      "name": "Porto Kebabs",
      "slug": "porto-kebabs",
      "items": [
        {
          "id": "item-1",
          "name": "Porto Kebabs Item 1",
          "description": "Delicious freshly prepared food made with quality ingredients.",
          "price": "£3.95",
          "priceAmount": 3.95,
          "badge": "POPULAR",
          "image": "/images/menupictures/product-placeholder.svg"
        }
      ]
    }
  ]
}
```

| Field | Type | Purpose | UI |
|---|---|---|---|
| `categories[].name` | string | Section title | `MenuSection` title, category chips |
| `categories[].slug` | string | Anchor id | `getMenuSectionId` → `menu-porto-kebabs` (**inference** if you stop deriving from name) |
| `items[].id` | string | Stable identity | **Inference.** UI currently keys/favourites/cart-matches by **`name`**. Strongly recommended. |
| `items[].name` | string | Title | Card, customise modal, cart, favourites |
| `items[].description` | string | Body + search | Card, search |
| `items[].price` | string | Display price | Cards (`£3.95`) |
| `items[].priceAmount` | number | Math | **Inference.** UI parses the string. |
| `items[].badge` | `"POPULAR" \| "RECOMMENDED"` | Badge | Menu card |
| `items[].image` | string (URL) | Photo | Card, modal, cart |

**Auth:** Public.

### Get menu item details

No dedicated product page. Customise modal uses the same list object.

**Method:** `GET`  
**Suggested endpoint:** `/menu/:itemId`  
**URL param:** `itemId` — **inference** (UI has no product URL).  
**Response:** same item object as list. **Optional** if list payload is complete.

### Search

Covered by `GET /menu?search=burger` (client currently filters locally).

---

# 3. Cart

## 3.1 Screen / Feature

**Screens:** Cart drawer (`components/cart/CartDrawer.tsx`), Cart page (`app/cart/page.tsx`), checkout/payment/confirmation also read cart.  
**Purpose:** Quantity change, remove, tip, optional wallet apply (cart page), proceed toward checkout.  
**Role:** Logged-in customer (navbar hides cart count when logged out).

**Explicit today:** Cart is **100% `localStorage`** (`zee-grill-cart`). No cart API is called.

**Inference:** Server cart is optional. **Place order must still receive line items.** If cart stays client-side, skip cart CRUD APIs.

Suggested cart item identity today: `name` + `size` + `extraHotChilli`.

## 3.2 If you implement a server cart (inference)

| Op | Method | Endpoint |
|---|---|---|
| Get cart | GET | `/cart` |
| Add item | POST | `/cart/items` |
| Update qty | PATCH | `/cart/items/:lineId` |
| Remove | DELETE | `/cart/items/:lineId` |
| Clear | DELETE | `/cart` |

**Add request:**

```json
{
  "name": "Porto Kebabs Item 1",
  "description": "Delicious freshly prepared food...",
  "price": "£3.95",
  "badge": "POPULAR",
  "image": "/images/menupictures/product-placeholder.svg",
  "quantity": 1,
  "size": "Medium",
  "extraHotChilli": false
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `name` | string | required | Selected menu item |
| `description` | string | required (in type) | Menu item |
| `price` | string | required | Menu item base price string |
| `badge` | string | required by `MenuItem` type | Menu item |
| `image` | string | required | Menu item (`image` / `imageUrl` / `img` fallbacks) |
| `quantity` | number | required | Customise modal qty |
| `size` | `"Small" \| "Medium" \| "Large"` | optional | Size picker; default Medium |
| `extraHotChilli` | boolean | optional | Extra hot chilli toggle; +£0.50 |

**Auth:** Logged-in user.

---

# 4. Checkout

## 4.1 Screen / Feature

**Screen:** `app/checkout/page.tsx`  
**Purpose:** Delivery vs pickup, ASAP vs schedule, contact + address, cutlery, coupon, tip, wallet amount, persist checkout info, go to payment (or confirmation if total is £0).  
**Role:** Customer (form works without an explicit login gate in `handleProceedToPayment`; add-to-cart already required login).

Checkout is saved to `zee-grill-checkout-info` locally, then payment/confirmation read it.

## 4.2 Operations

### List saved addresses (for picker)

See Addresses section. Checkout loads `getSavedAddresses()` plus a legacy `savedAddress` object.

### Apply / validate coupon

**Method:** `POST`  
**Suggested endpoint:** `/coupons/validate`  
**Purpose:** Validate code against bill and return discount.

**Request JSON:**

```json
{
  "code": "SAVE10",
  "subtotal": 21.15
}
```

UI currently validates against `totalBillBeforeCouponAndWallet` (subtotal + fees + tip, not wallet). Coupon blocked when wallet covers the full bill.

| Field | Type | Required | Source |
|---|---|---|---|
| `code` | string | required | Coupon input (uppercased) |
| `subtotal` | number | required for min-order check | Computed cart/fees total used by `validateCoupon` |

**Response:**

```json
{
  "valid": true,
  "coupon": {
    "title": "10% Off",
    "code": "SAVE10",
    "desc": "10% off on your order (min £5, excl. tip & wallet)",
    "exp": "Expires 31 Dec 2026",
    "discountType": "percentage",
    "discountValue": 10,
    "minOrder": 5
  },
  "discount": 2.12
}
```

Error path UI shows: `{ "valid": false, "error": "Invalid coupon code..." }`

### Persist checkout session (inference)

UI uses localStorage. Optional:

**Method:** `PUT`  
**Suggested endpoint:** `/checkout/session`

```json
{
  "orderType": "delivery",
  "orderTime": "asap",
  "time": "17:00",
  "scheduledDate": "2026-09-22",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447911123456",
  "street": "12 High Street",
  "floor": "2nd floor",
  "postcode": "G41 3YN",
  "company": "",
  "orderInstructions": "",
  "deliveryNotes": "",
  "cutlery": false,
  "tip": 5,
  "walletAmount": 2,
  "couponCode": "SAVE10",
  "couponDiscount": 2.12,
  "selectedAddressId": "addr-123"
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `orderType` | `"delivery" \| "pickup"` | required | Toggle. Type also has `"collection"` in `lib/types.ts` but checkout uses pickup. |
| `orderTime` | `"asap" \| "schedule"` | required | Toggle |
| `time` | string | if schedule | Clock picker (default `"17:00"`) |
| `scheduledDate` | string (YYYY-MM-DD) | if schedule | Date input |
| `firstName` / `lastName` / `phone` | string | required | Contact form; phone `+447` UK mobile |
| `street` / `postcode` | string | required if delivery | Address form |
| `floor` / `company` / `orderInstructions` / `deliveryNotes` | string | optional | Form |
| `cutlery` | boolean | optional | Cutlery toggle (stored as `"Yes"`/`"No"` on order) |
| `tip` | number | optional | Preset 5/10/15 or custom |
| `walletAmount` | number | optional | Wallet apply / custom amount |
| `couponCode` / `couponDiscount` | string / number | optional | After apply |
| `selectedAddressId` | string | optional | Saved address card |

**Auth:** Logged-in user **inference**.

---

# 5. Payment

## 5.1 Screen / Feature

**Screen:** `app/payment/page.tsx`  
**Purpose:** Choose cash or card, enter card fields, save-card flag, confirm and go to `/confirmation`.  
**Role:** Customer.

**Explicit:** No payment gateway call. Card fields are validated for non-empty only. `saveCard` is a boolean in localStorage (`zee-grill-save-card`). Payment method stored as `"cash" | "card"`.

## 5.2 Operations

### Confirm payment method / charge (inference for card)

**Method:** `POST`  
**Suggested endpoint:** `/payments` or `/orders/payment-intent`

**Request JSON (fields the UI has):**

```json
{
  "method": "card",
  "cardNumber": "4242424242424242",
  "nameOnCard": "John Doe",
  "expiryDate": "12/28",
  "cvv": "123",
  "saveCard": true
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `method` | `"cash" \| "card"` | required | Payment method selector |
| `cardNumber` | string | required if card | Card form |
| `nameOnCard` | string | required if card | Card form |
| `expiryDate` | string | required if card | Card form |
| `cvv` | string | required if card | Card form |
| `saveCard` | boolean | optional | “Save card” checkbox |

**PCI note for backend (not UI design):** Do not store raw PAN/CVV. Prefer a PSP token. The UI currently sends raw fields only in local flow.

**Cash request:** `{ "method": "cash" }`

**Response UI needs:** success flag so it can navigate. Today it always navigates to `/confirmation`.

```json
{
  "ok": true,
  "method": "card",
  "paymentStatus": "pending"
}
```

`paymentStatus` is **inference** (not displayed on payment page).

**Auth:** Logged-in user **inference**.  
**Query/URL params:** none.

---

# 6. Order confirmation & place order

## 6.1 Screen / Feature

**Screens:** `app/confirmation/page.tsx`, `app/order-success/page.tsx`  
**Purpose:** Review totals, agree to T&Cs, **complete order** (this is the actual `placeOrder()`), then show order number + ETA.  
**Role:** Customer.

## 6.2 Create order

**Method:** `POST`  
**Suggested endpoint:** `/orders`  
**Purpose:** Create the order from cart + checkout + payment method.

**Request JSON (fields UI actually writes into `placeOrder` + last-order extras):**

```json
{
  "items": [
    {
      "name": "Piri Piri Wrap Meal",
      "description": "Delicious wrap with grilled chicken and sauces",
      "price": "£7.95",
      "badge": "POPULAR",
      "image": "/images/menupictures/product-placeholder.svg",
      "quantity": 2,
      "size": "Medium",
      "extraHotChilli": false
    }
  ],
  "subtotal": 21.15,
  "deliveryFee": 3.99,
  "serviceFee": 1.99,
  "bagCharges": 0.29,
  "tip": 0,
  "walletAmount": 0,
  "couponCode": "SAVE10",
  "couponDiscount": 2.12,
  "total": 24.31,
  "status": "Preparing",
  "cutlery": "No",
  "orderType": "delivery",
  "paymentMethod": "cash",
  "address": "12 High Street, 2nd floor, G41 3YN",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447911123456",
  "agreedToTerms": true
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `items` | array | required | Cart |
| `items[].name` etc. | see cart | required | Cart line |
| `subtotal` | number | sent | Computed |
| `deliveryFee` | number | sent | `3.99` or `0` if pickup |
| `serviceFee` | number | sent | `1.99` |
| `bagCharges` | number | sent | `0.29` |
| `tip` | number | sent | Checkout |
| `walletAmount` | number | sent | Checkout |
| `couponCode` | string | optional | Checkout |
| `couponDiscount` | number | optional | Checkout |
| `total` | number | sent | Checkout total (confirmation prefers stored `checkoutInfo.total`) |
| `status` | string | UI always sends `"Preparing"` | Hardcoded |
| `cutlery` | string | `"Yes"` / `"No"` | Checkout boolean |
| `orderType` | `"delivery" \| "pickup"` | sent | Checkout |
| `paymentMethod` | `"cash" \| "card"` | **should send** | `zee-grill-payment-method`. **Not** in `placeOrder()` params today — **inference** to persist. |
| `address` | string | **inference** | Built on confirmation; stored on last-order only |
| `firstName` `lastName` `phone` | string | **inference** | Checkout info; not in `placeOrder()` today |
| `agreedToTerms` | boolean | required in UI | Checkbox; order blocked if false |

Side effects the UI currently performs locally after place:

- Deduct wallet (`deductFromWallet`)
- Earn loyalty (`earnPointsFromSpend` if subtotal ≥ 50)
- Clear cart
- Persistent notifications (order / loyalty / wallet / pickup)

**Create/update response (OrderCard + extras confirmation stores):**

```json
{
  "id": "ZGB-1727000000-ab12cd",
  "date": "Sep 22, 2026",
  "time": "2:15 PM",
  "items": [],
  "total": 24.31,
  "status": "Preparing",
  "orderType": "delivery",
  "cutlery": "No",
  "subtotal": 21.15,
  "deliveryFee": 3.99,
  "serviceFee": 1.99,
  "bagCharges": 0.29,
  "tip": 0,
  "walletAmount": 0,
  "couponCode": "SAVE10",
  "couponDiscount": 2.12,
  "loyaltyPointsEarned": 0,
  "loyaltyPointsRemaining": 500,
  "walletBalanceAfterOrder": 0,
  "estimatedTime": "30–45 mins"
}
```

| Field | Type | Purpose | UI |
|---|---|---|---|
| `id` | string | Order number | Order success, My Orders, notifications. Mock IDs like `PPP-1028`; `placeOrder` uses `ZGB-` prefix. |
| `date` | string | Display date | My Orders (`en-US` short month) |
| `time` | string | Display time | My Orders |
| `items` | CartItem[] | Lines | My Orders expand, confirmation summary |
| `total` | number | Grand total | Cards, confirmation |
| `status` | `"Preparing" \| "Delivered" \| "Cancelled" \| "Picked up"` | Badge / filters | My Orders |
| `orderType` | `"delivery" \| "pickup" \| "collection"` | Pickup vs delivery | Filters, success copy |
| `cutlery` | string | Detail | Order expand |
| fee fields | number | Breakdown | Confirmation / order detail |
| `loyaltyPointsEarned` | number | Post-order | last-order only |
| `estimatedTime` | string | ETA | Order success uses `SITE_CONFIG.delivery.estimatedTime` (`"30–45 mins"`). Pickup toast says 20–30 minutes. |

**Auth:** Logged-in user **inference**.  
**URL params:** none on create.

### Get order (success page)

Success page reads `getLastOrder().id` and checkout `orderType`.

**Method:** `GET`  
**Suggested endpoint:** `/orders/:orderId`  
**URL param:** `orderId` from create response / last order.

---

# 7. My Orders

## 7.1 Screen / Feature

**Screen:** `app/my-orders/page.tsx`  
**Purpose:** List past/current orders; filter; expand details.  
**Role:** Customer. Page does not hard-block guests; it shows `FALLBACK_ORDERS` seed data.

**Filters (client-side today):** `All | Active | Pickup | Delivered | Cancelled`

- Active → `status === "Preparing"`
- Pickup → `status === "Picked up"` **or** `orderType === "pickup"`
- Delivered / Cancelled → match `status`

**FAQ text** says cancel within 5 minutes from My Orders. **There is no Cancel button in the page.** Status `"Cancelled"` is display-only on seed data.

## 7.2 Operations

### List orders

**Method:** `GET`  
**Suggested endpoint:** `/orders`  
**Purpose:** User’s order history.

**Query parameters (optional; UI currently filters locally):**

| Param | Why |
|---|---|
| `status` | `Preparing` / `Delivered` / `Cancelled` / `Picked up` |
| `filter` | UI tab: `All` / `Active` / `Pickup` / `Delivered` / `Cancelled` |
| `orderType` | `pickup` for Pickup tab |

**No pagination in UI.**

**List response:** array of `OrderCard` (see create response). List cards use:

- `id`, `date`, `time`, `status`, `total`
- `items[0]` as primary (name, image, description, qty)
- remaining `items` as extra lines
- `orderType`, `cutlery` in expanded view

### Get order details

Expand uses the same object already in the list. Separate GET is optional.

**Method:** `GET`  
**Suggested endpoint:** `/orders/:orderId`  
**URL param:** `order.id` from list.

### Cancel order (FAQ only — inference)

**Method:** `PATCH`  
**Suggested endpoint:** `/orders/:orderId/cancel`  
**Request:** `{ "status": "Cancelled" }`  
**Not implemented in UI.**

### Status change (kitchen) — not in this frontend

UI only **reads** status. Updates would come from backend/staff elsewhere.

---

# 8. Profile

## 8.1 Screen / Feature

**Screen:** `app/account/profile/page.tsx`  
**Purpose:** View/update photo, name, email, phone, optional new password.  
**Role:** Logged-in customer.

## 8.2 Operations

### Get profile

**Method:** `GET`  
**Suggested endpoint:** `/users/me`  
**Purpose:** Prefill form.

**Response:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "phone": "+447911123456",
  "profilePic": "https://cdn.example.com/u/1.jpg",
  "name": "John Doe"
}
```

### Update profile

**Method:** `PUT` or `PATCH`  
**Suggested endpoint:** `/users/me`

**Request JSON:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "phone": "+447911123456",
  "newPassword": "optionalNewPass"
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `firstName` | string | required | Form |
| `lastName` | string | required | Form |
| `email` | string | required | Form |
| `phone` | string | required | `^\+447\d{9}$` |
| `newPassword` | string | optional | “New password (optional)”, min 6 if present |

**Upload photo:** file input `image/*`, max **4MB**, JPG/PNG/GIF. Today stored as **base64 data URL** in `profilePic`.

**Method:** `POST`  
**Suggested endpoint:** `/users/me/avatar`  
**Body:** `multipart/form-data` file (inference; UI currently does not POST).  
**Response:** `{ "profilePic": "https://..." }`

**Update response:** same as get profile.

**Auth:** Logged-in user (token + user context).

---

# 9. Account hub & logout

**Screen:** `app/account/page.tsx`  
**Purpose:** Navigation hub; show `userName` + `profilePic`.  
**Operations:** `GET /users/me` (reuse), logout (see Auth).

---

# 10. Saved addresses

## 10.1 Screen / Feature

**Screen:** `app/saved-addresses/page.tsx`  
**Purpose:** Create and delete delivery addresses. No edit or set-default UI on this page.  
**Role:** Customer.

**Important:** Two address shapes exist.

**A. Page UI (`SavedAddress`):**

- `id`, `contactName`, `contactPhone`, `address`, `type` (`Home`/`Work`/`Other`), `house`, `floor`, `road`, `postcode?`, `company?`, `createdAt?`

**B. Library (`lib/addresses.ts` `Address`) — unused by the page, used by checkout loader:**

- `id`, `label`, `fullName`, `phone`, `addressLine1`, `addressLine2?`, `city`, `postcode`, `instructions?`, `isDefault?`

Checkout also maps `house`, `road`, `contactName`, `contactPhone`, `address`, `type`. Backend should support **the page+checkout fields**, not only the unused `Address` interface.

**Create validation (explicit):**

- Required: name, phone, address, house, road, postcode
- Phone: `^\+447\d{9}$`
- Postcode: UK regex on page
- Address string must contain a UK place keyword (uk, glasgow, london, etc.)

## 10.2 Operations

### List

**Method:** `GET`  
**Suggested endpoint:** `/addresses`  
**Auth:** Logged-in user.

**List response:**

```json
[
  {
    "id": "addr-1727-abc",
    "contactName": "John Doe",
    "contactPhone": "+447911123456",
    "address": "Shawlands, Glasgow",
    "type": "Home",
    "house": "49",
    "floor": "",
    "road": "Kilmarnock Road",
    "postcode": "G41 3YN",
    "company": "",
    "createdAt": 1727000000000
  }
]
```

### Create

**Method:** `POST`  
**Suggested endpoint:** `/addresses`

**Request:** same fields as above except `id`/`createdAt` (server may assign).

### Delete

**Method:** `DELETE`  
**Suggested endpoint:** `/addresses/:addressId`  
**URL param:** `id` of the card the user deletes.

### Update / set default

`lib/addresses.ts` has `updateAddress` and `setDefaultAddress` but **the Saved Addresses page has no Edit / Default buttons**. Treat as unused unless checkout needs `isDefault` (`getDefaultAddress` exists). **Inference if you want default address on checkout.**

---

# 11. Wallet

## 11.1 Screen / Feature

**Screen:** `app/account/wallet/page.tsx`  
**Purpose:** Show balance and conversion history (credits from loyalty). No top-up, no withdraw.  
**Role:** Logged-in customer.

Checkout/cart also **read** balance and **apply** an amount toward the bill.

## 11.2 Operations

### Get wallet

**Method:** `GET`  
**Suggested endpoint:** `/wallet`  

```json
{
  "balance": 12.5
}
```

| Field | Type | UI |
|---|---|---|
| `balance` | number | Large “Available Balance”, checkout wallet section |

### List wallet history

Wallet page lists **loyalty conversion records** (`getConversionHistory`), not generic ledger entries. Label is always “Loyalty Reward”.

**Method:** `GET`  
**Suggested endpoint:** `/wallet/transactions` or reuse `/loyalty/conversions`

```json
[
  {
    "id": "lp-1727000000",
    "points": 50,
    "amount": 5,
    "date": "22 Sep 2026, 14:15"
  }
]
```

### Deduct wallet (on place order)

Handled inside `POST /orders` via `walletAmount`. Standalone deduct is **inference**.

**Auth:** Logged-in user.

---

# 12. Loyalty points

## 12.1 Screen / Feature

**Screen:** `app/account/loyalty-points/page.tsx`  
**Purpose:** Show points, convertible amount, convert points → wallet (manual or max available).  
**Role:** Logged-in customer.

Seed: `DUMMY_SEED_POINTS = 500` if unset.

Rules in UI:

- 10 points = £1
- Earn 10 points per £50 of **subtotal** on order, only if spend ≥ £50
- Convert: user enters points or uses all multiples of 10

## 12.2 Operations

### Get loyalty balance

**Method:** `GET`  
**Suggested endpoint:** `/loyalty`

```json
{
  "points": 500,
  "pointsPerPound": 10,
  "walletReadyAmount": 50,
  "pointsAvailableForWallet": 500,
  "pointsToNextPound": 0
}
```

UI can compute the last three from `points` + `POINTS_PER_POUND`. Extra fields are convenience.

### Convert to wallet

**Method:** `POST`  
**Suggested endpoint:** `/loyalty/convert`

**Request:**

```json
{
  "points": 50
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `points` | number | required | Manual input, or all `pointsAvailableForWallet` if empty |

**Response:**

```json
{
  "success": true,
  "pointsConverted": 50,
  "amount": 5,
  "pointsRemaining": 450,
  "walletBalance": 17.5,
  "conversion": {
    "id": "lp-1727000000",
    "points": 50,
    "amount": 5,
    "date": "22/09/2026, 14:15:00"
  }
}
```

### Conversion history

Same records as wallet history (`id`, `points`, `amount`, `date`).

### Earn points

Triggered on place order (subtotal). Not a separate UI button. Include in `POST /orders` response (`loyaltyPointsEarned`).

**Auth:** Logged-in user.

---

# 13. Coupons

## 13.1 Screen / Feature

**Screen:** `app/account/coupons/page.tsx`  
**Purpose:** List static offers; verify a typed code; copy code. “Verify” does **not** persist a personal coupon list — it only toasts/notifies.  
**Role:** Customer (no login check on the page).

Static list: `AVAILABLE_COUPONS` in `lib/constants.ts`.

## 13.2 Operations

### List coupons

**Method:** `GET`  
**Suggested endpoint:** `/coupons`

**List response:**

```json
[
  {
    "title": "10% Off",
    "code": "SAVE10",
    "desc": "10% off on your order (min £5, excl. tip & wallet)",
    "exp": "Expires 31 Dec 2026",
    "discountType": "percentage",
    "discountValue": 10,
    "minOrder": 5
  }
]
```

| Field | UI |
|---|---|
| `title` | Offer heading |
| `code` | Code + copy button (key) |
| `desc` | Description |
| `exp` | Expiry line |
| `discountType` / `discountValue` / `minOrder` | Checkout validation (not all shown on coupon cards) |

### Verify code (account page)

Same as checkout validate (`POST /coupons/validate`) with `{ "code": "SAVE10" }`. Min-order check uses `0` on this page (existence check only).

---

# 14. Favourites

## 14.1 Screen / Feature

**Screens:** Heart on menu (`MenuSection`), list (`app/account/favourites/page.tsx`)  
**Purpose:** Toggle favourite; list saved items; add to cart.  
**Role:** Logged-in customer.

Identity: **item `name`** (no menu id).

## 14.2 Operations

### List

**Method:** `GET`  
**Suggested endpoint:** `/favourites`  
**Response:** array of `MenuItem`.

### Add / toggle

**Method:** `POST`  
**Suggested endpoint:** `/favourites`

```json
{
  "name": "Porto Kebabs Item 1",
  "description": "...",
  "price": "£3.95",
  "badge": "POPULAR",
  "image": "/images/menupictures/product-placeholder.svg"
}
```

**Response:** `{ "added": true }` or `{ "added": false }` (matches `toggleFavourite`).

### Remove

**Method:** `DELETE`  
**Suggested endpoint:** `/favourites/:itemName`  
**URL param:** `item.name` (encoded). Better: `/favourites/:itemId` if menu has ids (**inference**).

Favourites page has **no unfavourite button**; remove only via menu heart.

**Auth:** Logged-in user.

---

# 15. Notifications

## 15.1 Screen / Feature

**Screen:** `app/account/notifications/page.tsx`  
**Purpose:** List persistent notifications; mark one read; read all; clear all. Unread badge on Navbar.  
**Role:** Logged-in customer (not gated in code).

Types: `"order" | "loyalty" | "wallet" | "coupon" | "info" | "promo"`

Created locally on: order placed, coupon applied, loyalty convert, coupon verify.

Toasts (`showNotification`) are **client-only** — no API.

## 15.2 Operations

### List

**Method:** `GET`  
**Suggested endpoint:** `/notifications`

```json
[
  {
    "id": "notif-1727-ab",
    "title": "Order Confirmed! 🎉",
    "message": "Your order #ZGB-1 has been placed...",
    "time": "22 Sep 2026, 14:15",
    "type": "order",
    "read": false
  }
]
```

Navbar needs unread count: `GET /notifications/unread-count` **inference**, or count `read === false` client-side.

### Mark one read

**Method:** `PATCH`  
**Suggested endpoint:** `/notifications/:notificationId`  
**Request:** `{ "read": true }`  
**URL param:** `notification.id`

### Mark all read

**Method:** `POST`  
**Suggested endpoint:** `/notifications/read-all`  
**Request:** none

### Clear all

**Method:** `DELETE`  
**Suggested endpoint:** `/notifications`  
**Request:** none

**Auth:** Logged-in user.

---

# 16. Refer & Earn

## 16.1 Screen / Feature

**Screen:** `app/account/refer-earn/page.tsx`  
**Purpose:** Show referral code, copy, share WhatsApp/SMS/email, empty “Your Referrals (0)”.  
**Role:** Customer.

Code source: `authUser.referenceCode` or `referralCode` (**not set on AuthUser type**) else `SITE_CONFIG.referral.defaultCode` = `PORTOLAIB`.

Share URL: `https://zeegrillburger.com` (static). Share is device deep-links, not API.

## 16.2 Operations

### Get my referral code + stats

**Method:** `GET`  
**Suggested endpoint:** `/referrals/me`

```json
{
  "code": "PORTOLAIB",
  "shareUrl": "https://zeegrillburger.com",
  "referralCount": 0,
  "referrals": []
}
```

| Field | UI |
|---|---|
| `code` | Big code + copy |
| `shareUrl` | WhatsApp/email body |
| `referralCount` | Heading “Your Referrals (0)” |
| `referrals` | Empty state today; list **inference** if you populate later |

### Apply referral on register

`referenceCode` on `POST /auth/register` (already listed). Reward-to-wallet is **copy on the screen**, not implemented in code.

**Auth:** Logged-in for GET; register is public.

---

# 17. Help & Support

## 17.1 Screen / Feature

**Screen:** `app/account/help-support/page.tsx`  
**Purpose:** Contact cards, support form, FAQs.  
**Role:** Anyone.

FAQs from `SITE_CONFIG.faqs` (static). Contact phone on this page (`+92 300 1234567`) **differs** from `SITE_CONFIG.contact.phone` (`+441747413273`) — backend should not guess; use whatever product decides.

## 17.2 Operations

### Submit support message

**Method:** `POST`  
**Suggested endpoint:** `/support/messages`

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Where is my order?",
  "message": "I placed an order 40 minutes ago."
}
```

All four fields required by the form.

**Response:** `{ "success": true, "message": "Your message has been sent..." }`  
Today simulated with `setTimeout`.

### List FAQs (optional)

**Method:** `GET`  
**Suggested endpoint:** `/support/faqs`

```json
[
  { "q": "How do I track my order?", "a": "Once your order is placed..." }
]
```

Static in frontend today.

**Auth:** Form is public (no login check).

---

# 18. Delete account

## 18.1 Screen / Feature

**Screen:** `app/account/delete-account/page.tsx`  
**Purpose:** Two-step confirm; type `DELETE`; enter password; then `logoutUser()`.  
**Role:** Logged-in customer.

UI claims deletion of profile, addresses, favourites, orders, loyalty, wallet, coupons — **not actually deleted from any server**.

## 18.2 Operations

**Method:** `DELETE`  
**Suggested endpoint:** `/users/me`

**Request:**

```json
{
  "password": "secret123",
  "confirmation": "DELETE"
}
```

| Field | Type | Required | Source |
|---|---|---|---|
| `password` | string | required | Password input |
| `confirmation` | string | client-only | Must equal `DELETE` (case-insensitive in UI) |

**Response:** `{ "success": true }` then frontend logs out.

**Auth:** Logged-in user.

---

# 19. Site / CMS-style content (mostly static)

These screens **do not call APIs**. List only if you want them CMS-driven (**inference**).

| UI | Data | File |
|---|---|---|
| Top bar / hero / footer | Brand, banners, social, hours | `SITE_CONFIG`, `HeroSection`, `Footer`, `TopBar` |
| Contact + map | Address, phone, email, embed URL | `ContactSection` |
| Opening popup | Opening hours text | `OpeningPopup` |
| Navbar locations | `Glasgow`, `City Centre`, `Scotland` | `SITE_CONFIG.locations` — **UI state only**, not sent to APIs |
| Free delivery banner | £20 threshold | `SITE_CONFIG.delivery` |

**Optional:** `GET /site-config` returning `SiteConfig`.

---

# 9 (per-screen). Static data mapping

## Menu (`createMenuItems`)

| Static field | API field | UI usage |
|---|---|---|
| `item.name` | `name` | Title, favourite key, cart merge key |
| `item.description` | `description` | Card, search |
| `item.price` | `price` (string with £) | Display + parse to number |
| `item.badge` | `badge` | POPULAR / RECOMMENDED |
| `item.image` | `image` | Photo |

## Order (`OrderCard` / `FALLBACK_ORDERS` / `SEED_ORDERS`)

| Static field | API field | UI usage |
|---|---|---|
| `id` | `id` | Order number |
| `date` | `date` | List subtitle |
| `time` | `time` | List subtitle |
| `items` | `items` | Thumbnails, names, qty |
| `items[].name` | `items[].name` | Primary line |
| `items[].description` | `items[].description` | Secondary text |
| `items[].price` | `items[].price` | Line price |
| `items[].badge` | `items[].badge` | Not heavily shown on order cards |
| `items[].quantity` | `items[].quantity` | Qty |
| `items[].image` | `items[].image` | Thumbnail |
| `items[].size` | `items[].size` | Seed only |
| `total` | `total` | Amount |
| `status` | `status` | Badge + filters |
| `orderType` | `orderType` | Pickup vs delivery |
| `cutlery` | `cutlery` | Detail |
| `subtotal` | `subtotal` | Confirmation / seed |
| `deliveryFee` | `deliveryFee` | Fees |
| `serviceFee` | `serviceFee` | Fees |
| `bagCharges` | `bagCharges` | Fees |
| `tip` | `tip` | Fees |
| `walletAmount` | `walletAmount` | Wallet applied |
| `couponCode` | `couponCode` | Applied code |
| `couponDiscount` | `couponDiscount` | Discount |

## Coupon (`AVAILABLE_COUPONS`)

| Static field | API field | UI usage |
|---|---|---|
| `title` | `title` | Card title |
| `code` | `code` | Code + verify + checkout |
| `desc` | `desc` | Description |
| `exp` | `exp` | Expiry text |
| `discountType` | `discountType` | `percentage` / `fixed` |
| `discountValue` | `discountValue` | % or £ |
| `minOrder` | `minOrder` | Min basket |

## User (`AuthUser` / `RegisteredUser`)

| Static field | API field | UI usage |
|---|---|---|
| `firstName` | `firstName` | Profile, checkout, register |
| `lastName` | `lastName` | Profile, checkout, register |
| `email` | `email` | Login, profile |
| `phone` | `phone` | Profile, checkout |
| `profilePic` | `profilePic` | Avatar |
| `name` | `name` | Display / navbar |
| `password` | **never return** | Login, profile update, delete |
| `referenceCode` | `referenceCode` | Register + refer page |
| `createdAt` | `createdAt` | Stored on register mock; not displayed |

## Address (page)

| Static field | API field | UI usage |
|---|---|---|
| `id` | `id` | Delete, checkout select |
| `contactName` | `contactName` | Card, checkout name split |
| `contactPhone` | `contactPhone` | Card, checkout phone |
| `address` | `address` | Card, extra line on checkout |
| `type` | `type` | Home/Work/Other |
| `house` | `house` | Form + street compose |
| `floor` | `floor` | Form |
| `road` | `road` | Form + street compose |
| `postcode` | `postcode` | Form + checkout |
| `company` | `company` | Form |
| `createdAt` | `createdAt` | Stored, not prominently shown |

## Loyalty conversion

| Static field | API field | UI usage |
|---|---|---|
| `id` | `id` | React key |
| `points` | `points` | “50 Points” |
| `amount` | `amount` | “+£5.00” |
| `date` | `date` | Timestamp line |

## Notification

| Static field | API field | UI usage |
|---|---|---|
| `id` | `id` | Mark read |
| `title` | `title` | Heading |
| `message` | `message` | Body |
| `time` | `time` | Timestamp |
| `type` | `type` | Icon/colour |
| `read` | `read` | Unread styling + badge |

---

# 10. API dependency / related data

Do **not** treat this as microservice design. These are UI data couplings:

**Order UI** needs:

- Cart/menu line snapshot (name, price, image, size, chilli, qty)
- Fees (delivery, service, bag)
- Coupon (code + discount)
- Wallet deduction + remaining balance
- Loyalty earn result
- Customer name/phone
- Delivery address **or** restaurant address for pickup (`SITE_CONFIG.address.full`)
- Payment method (cash/card)
- Order status for My Orders / success

**Checkout UI** needs:

- Cart
- Saved addresses
- Wallet balance
- Coupon validation
- Logged-in profile (prefill name/phone)

**Loyalty convert UI** needs:

- Loyalty balance
- Wallet balance (updated after convert)
- Notification create

**Register UI** needs:

- Optional referral code belonging to another user

**Favourites UI** needs:

- Menu item snapshot (or live menu by id)

**Navbar** needs:

- Auth user (name, photo)
- Cart count
- Unread notification count

**Payment UI** needs:

- Checkout session totals
- Cart lines
- (Inference) payment processor

---

# 11. Complete API requirement table

| Screen | Operation | Method | Suggested endpoint | Request fields | Response fields |
|---|---|---|---|---|---|
| Auth modal | Login | POST | `/auth/login` | email, password | accessToken, refreshToken, expiresAt, user |
| Auth modal | Register | POST | `/auth/register` | firstName, lastName, phone, email, password, referenceCode?, marketingOptIn? | same as login |
| Auth modal | Send OTP | POST | `/auth/send-otp` | email | success, message |
| Auth modal | Reset password | POST | `/auth/reset-password` | email, code, newPassword | success, message |
| Auth modal | Verify OTP | POST | `/auth/verify-otp` | email, code | success (unused by UI) |
| Auth modal | Social login | POST | `/auth/social` | provider, token | same as login (inference) |
| Account | Logout | POST | `/auth/logout` | — | success (inference) |
| Home/Menu | List menu | GET | `/menu` | query: search?, category? | categories[], items[] |
| Home/Menu | Item detail | GET | `/menu/:itemId` | itemId | item (inference) |
| Cart | Get/add/update/remove | GET/POST/PATCH/DELETE | `/cart` | cart line fields | cart items (inference; local today) |
| Checkout | Validate coupon | POST | `/coupons/validate` | code, subtotal | valid, coupon, discount, error |
| Checkout | Save session | PUT | `/checkout/session` | checkout form fields | session (inference) |
| Payment | Pay / save method | POST | `/payments` | method, card fields?, saveCard? | ok, paymentStatus (inference) |
| Confirmation | Place order | POST | `/orders` | items, totals, fees, tip, wallet, coupon, cutlery, orderType, payment/address inference | OrderCard + loyalty/wallet extras |
| Order success | Get order | GET | `/orders/:orderId` | orderId | id, orderType, status, estimatedTime |
| My Orders | List orders | GET | `/orders` | query: status?, filter? | OrderCard[] |
| My Orders | Order detail | GET | `/orders/:orderId` | orderId | OrderCard |
| My Orders | Cancel | PATCH | `/orders/:orderId/cancel` | status | order (FAQ only; no button) |
| Profile | Get profile | GET | `/users/me` | — | firstName, lastName, email, phone, profilePic, name |
| Profile | Update profile | PUT | `/users/me` | firstName, lastName, email, phone, newPassword? | profile |
| Profile | Upload photo | POST | `/users/me/avatar` | file | profilePic |
| Addresses | List | GET | `/addresses` | — | SavedAddress[] |
| Addresses | Create | POST | `/addresses` | contactName, contactPhone, address, type, house, floor, road, postcode, company | SavedAddress |
| Addresses | Delete | DELETE | `/addresses/:addressId` | addressId | success |
| Wallet | Get balance | GET | `/wallet` | — | balance |
| Wallet / Loyalty | Conversion history | GET | `/wallet/transactions` | — | id, points, amount, date[] |
| Loyalty | Get points | GET | `/loyalty` | — | points, convertible amounts |
| Loyalty | Convert | POST | `/loyalty/convert` | points | success, amount, remaining, wallet, conversion |
| Coupons | List | GET | `/coupons` | — | Coupon[] |
| Favourites | List | GET | `/favourites` | — | MenuItem[] |
| Favourites | Toggle add | POST | `/favourites` | MenuItem | added |
| Favourites | Remove | DELETE | `/favourites/:itemName` | name/id | success |
| Notifications | List | GET | `/notifications` | — | PersistentNotification[] |
| Notifications | Mark read | PATCH | `/notifications/:id` | read | notification |
| Notifications | Read all | POST | `/notifications/read-all` | — | success |
| Notifications | Clear all | DELETE | `/notifications` | — | success |
| Refer & Earn | My referral | GET | `/referrals/me` | — | code, shareUrl, referralCount, referrals |
| Help | Send message | POST | `/support/messages` | name, email, subject, message | success |
| Help | FAQs | GET | `/support/faqs` | — | {q,a}[] (optional) |
| Delete account | Delete user | DELETE | `/users/me` | password, confirmation | success |
| Site | Config | GET | `/site-config` | — | SiteConfig (optional) |

---

# 12. Backend developer handoff

## A. Frontend Requirements

What this UI needs from a backend:

1. **Customer auth** with email/password, password reset via emailed 4-digit code, and (ideally) Google/Apple. Return **Bearer access token** matching `lib/apiClient.ts`. Persist user profile fields listed above.
2. **Menu catalogue** grouped by the existing category names, with name, description, £ price string (or numeric + symbol), badge, image. Search by name/description.
3. **Order placement** that accepts cart lines (including size and extra hot chilli), delivery vs pickup, schedule vs ASAP, contact, UK address, cutlery, tip, wallet spend, coupon, cash vs card, T&C agreement. Persist **status** the My Orders filters understand: `Preparing`, `Delivered`, `Cancelled`, `Picked up`.
4. **Order history** for the logged-in user with the `OrderCard` fields.
5. **Profile CRUD** + image upload (max 4MB image) + optional password change. UK `+447` mobile.
6. **Addresses** matching the Saved Addresses form (not only the unused `lib/addresses.ts` shape).
7. **Wallet balance** and **loyalty points** with convert-to-wallet (10 points = £1) and earn-on-order (£50 tiers).
8. **Coupon catalogue** + validate-by-code with percentage/fixed and min order.
9. **Favourites** keyed at least by item name (id preferred).
10. **In-app notifications** list + read + clear.
11. **Referral code** per user and register-time `referenceCode`.
12. **Support contact form**.
13. **Account deletion** with password confirmation.
14. **Cart** may remain client-side; **order create must still receive items**. Server cart is optional.
15. **Do not assume pagination** — the UI has none.
16. **Only customer role** exists in this frontend.
17. Recalculate **money on the server**. Frontend totals use hardcoded fees and client coupon math.

## B. Request Payloads

```json
POST /auth/login
{ "email": "johndoe@example.com", "password": "secret123" }
```

```json
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447911123456",
  "email": "johndoe@example.com",
  "password": "secret123",
  "referenceCode": "PORTOLAIB",
  "marketingOptIn": true
}
```

```json
POST /auth/send-otp
{ "email": "johndoe@example.com" }
```

```json
POST /auth/reset-password
{ "email": "johndoe@example.com", "code": "1234", "newPassword": "newsecret" }
```

```json
POST /auth/verify-otp
{ "email": "johndoe@example.com", "code": "1234" }
```

```json
POST /auth/social
{ "provider": "google", "idToken": "..." }
```

```json
POST /cart/items
{
  "name": "Porto Kebabs Item 1",
  "description": "Delicious freshly prepared food made with quality ingredients.",
  "price": "£3.95",
  "badge": "POPULAR",
  "image": "/images/menupictures/product-placeholder.svg",
  "quantity": 1,
  "size": "Medium",
  "extraHotChilli": false
}
```

```json
POST /coupons/validate
{ "code": "SAVE10", "subtotal": 21.15 }
```

```json
PUT /checkout/session
{
  "orderType": "delivery",
  "orderTime": "schedule",
  "time": "17:00",
  "scheduledDate": "2026-09-22",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447911123456",
  "street": "49 Kilmarnock Road",
  "floor": "",
  "postcode": "G41 3YN",
  "company": "",
  "orderInstructions": "",
  "deliveryNotes": "Leave at door",
  "cutlery": true,
  "tip": 5,
  "walletAmount": 2,
  "couponCode": "SAVE10",
  "couponDiscount": 2.12,
  "selectedAddressId": "addr-123"
}
```

```json
POST /payments
{
  "method": "card",
  "cardNumber": "4242424242424242",
  "nameOnCard": "John Doe",
  "expiryDate": "12/28",
  "cvv": "123",
  "saveCard": true
}
```

```json
POST /orders
{
  "items": [
    {
      "name": "Piri Piri Wrap Meal",
      "description": "Delicious wrap with grilled chicken and sauces",
      "price": "£7.95",
      "badge": "POPULAR",
      "image": "/images/menupictures/product-placeholder.svg",
      "quantity": 2,
      "size": "Medium",
      "extraHotChilli": false
    }
  ],
  "subtotal": 21.15,
  "deliveryFee": 3.99,
  "serviceFee": 1.99,
  "bagCharges": 0.29,
  "tip": 5,
  "walletAmount": 2,
  "couponCode": "SAVE10",
  "couponDiscount": 2.12,
  "total": 27.31,
  "status": "Preparing",
  "cutlery": "Yes",
  "orderType": "delivery",
  "paymentMethod": "cash",
  "address": "49 Kilmarnock Road, G41 3YN",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447911123456",
  "agreedToTerms": true
}
```

```json
PUT /users/me
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "phone": "+447911123456",
  "newPassword": "optionalNewPass"
}
```

```json
POST /addresses
{
  "contactName": "John Doe",
  "contactPhone": "+447911123456",
  "address": "Shawlands, Glasgow",
  "type": "Home",
  "house": "49",
  "floor": "",
  "road": "Kilmarnock Road",
  "postcode": "G41 3YN",
  "company": ""
}
```

```json
POST /loyalty/convert
{ "points": 50 }
```

```json
POST /favourites
{
  "name": "Porto Kebabs Item 1",
  "description": "Delicious freshly prepared food made with quality ingredients.",
  "price": "£3.95",
  "badge": "POPULAR",
  "image": "/images/menupictures/product-placeholder.svg"
}
```

```json
PATCH /notifications/:notificationId
{ "read": true }
```

```json
POST /support/messages
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Where is my order?",
  "message": "I placed an order 40 minutes ago."
}
```

```json
DELETE /users/me
{ "password": "secret123", "confirmation": "DELETE" }
```

## C. Response Payloads

```json
POST /auth/login (and register / social)
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresAt": 1774550000000,
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "phone": "+447911123456",
    "profilePic": "",
    "name": "John Doe"
  }
}
```

```json
POST /auth/send-otp
{
  "success": true,
  "message": "A 4-digit verification code has been sent to johndoe@example.com."
}
```

```json
GET /menu
{
  "categories": [
    {
      "name": "Burgers",
      "items": [
        {
          "name": "Burgers Item 1",
          "description": "Delicious freshly prepared food made with quality ingredients.",
          "price": "£3.95",
          "badge": "POPULAR",
          "image": "/images/menupictures/product-placeholder.svg"
        }
      ]
    }
  ]
}
```

```json
POST /coupons/validate
{
  "valid": true,
  "coupon": {
    "title": "10% Off",
    "code": "SAVE10",
    "desc": "10% off on your order (min £5, excl. tip & wallet)",
    "exp": "Expires 31 Dec 2026",
    "discountType": "percentage",
    "discountValue": 10,
    "minOrder": 5
  },
  "discount": 2.12
}
```

```json
GET /orders  (list)  /  POST /orders  (create)
{
  "id": "PPP-1028",
  "date": "Aug 25, 2026",
  "time": "6:10 PM",
  "items": [
    {
      "name": "Piri Piri Wrap Meal",
      "description": "Delicious wrap with grilled chicken and sauces",
      "price": "£7.95",
      "badge": "POPULAR",
      "quantity": 2,
      "image": "/images/menupictures/product-placeholder.svg",
      "size": "Medium"
    }
  ],
  "total": 27.38,
  "status": "Preparing",
  "orderType": "delivery",
  "cutlery": "Yes",
  "subtotal": 21.15,
  "deliveryFee": 3.99,
  "serviceFee": 1.99,
  "bagCharges": 0.29,
  "tip": 0,
  "walletAmount": 0,
  "couponCode": "",
  "couponDiscount": 0
}
```

```json
GET /users/me
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "phone": "+447911123456",
  "profilePic": "",
  "name": "John Doe"
}
```

```json
GET /addresses
[
  {
    "id": "addr-1",
    "contactName": "John Doe",
    "contactPhone": "+447911123456",
    "address": "Shawlands, Glasgow",
    "type": "Home",
    "house": "49",
    "floor": "",
    "road": "Kilmarnock Road",
    "postcode": "G41 3YN",
    "company": "",
    "createdAt": 1727000000000
  }
]
```

```json
GET /wallet
{ "balance": 12.5 }
```

```json
GET /loyalty
{
  "points": 500,
  "walletReadyAmount": 50,
  "pointsAvailableForWallet": 500,
  "pointsToNextPound": 0
}
```

```json
POST /loyalty/convert
{
  "success": true,
  "pointsConverted": 50,
  "amount": 5,
  "pointsRemaining": 450,
  "walletBalance": 17.5,
  "conversion": {
    "id": "lp-1",
    "points": 50,
    "amount": 5,
    "date": "22 Sep 2026, 14:15"
  }
}
```

```json
GET /coupons
[
  {
    "title": "15% Off",
    "code": "SAVE15",
    "desc": "15% off on your order (min £5, excl. tip & wallet)",
    "exp": "Expires 31 Dec 2026",
    "discountType": "percentage",
    "discountValue": 15,
    "minOrder": 5
  }
]
```

```json
GET /favourites
[
  {
    "name": "Burgers Item 1",
    "description": "Delicious freshly prepared food made with quality ingredients.",
    "price": "£3.95",
    "badge": "POPULAR",
    "image": "/images/menupictures/product-placeholder.svg"
  }
]
```

```json
GET /notifications
[
  {
    "id": "notif-1",
    "title": "Order Confirmed! 🎉",
    "message": "Your order #PPP-1028 has been placed successfully...",
    "time": "22 Sep 2026, 14:15",
    "type": "order",
    "read": false
  }
]
```

```json
GET /referrals/me
{
  "code": "PORTOLAIB",
  "shareUrl": "https://zeegrillburger.com",
  "referralCount": 0,
  "referrals": []
}
```

```json
POST /support/messages
{
  "success": true,
  "message": "Your message has been sent. We'll get back to you soon!"
}
```

---

## Out of scope for this document

Not specified here (backend owner decides):

- Database schemas / MongoDB models
- Microservice vs monolith
- Payment provider, email provider, OTP store
- Kitchen/admin APIs
- Business rules beyond what the UI already encodes (fees, UK phone, coupon min order, loyalty tiers)

---

*Generated from the existing Zee Grill Burger frontend (static/mock `localStorage` + `AVAILABLE_COUPONS` + generated menu). Frontend code was not modified.*
