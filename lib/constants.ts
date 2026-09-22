export const STORAGE_KEYS = {
  USER: "zee-grill-user",
  REGISTERED_USERS: "zee-grill-registered-users",
  LOGGED_IN_USER: "loggedInUser",
  ACCESS_TOKEN: "zee-grill-access-token",
  REFRESH_TOKEN: "zee-grill-refresh-token",
  TOKEN_EXPIRES_AT: "zee-grill-token-expires-at",
  CART: "zee-grill-cart",
  FAVOURITES: "zee-grill-favourites",
  WALLET_BALANCE: "zee-grill-wallet-balance",
  LOYALTY_POINTS: "zee-grill-loyalty-points",
  LP_HISTORY: "zee-grill-lp-history",
  NOTIFICATIONS: "zee-grill-notifications",
  APPLIED_COUPON: "zee-grill-applied-coupon",
  SAVED_ADDRESSES: "zee-grill-saved-addresses",
  ORDERS: "zee-grill-orders",
  LAST_ORDER: "zee-grill-last-order",
  ORDER_COMPLETED: "zee-grill-order-completed",
} as const;

export const EVENTS = {
  AUTH_CHANGED: "auth-changed",
  PROFILE_UPDATED: "profile-updated",
  USER_LOGGED_IN: "user-logged-in",
  USER_LOGGED_OUT: "user-logged-out",
  CART_UPDATED: "cart-updated",
  OPEN_CART: "open-cart",
  OPEN_LOGIN: "open-login",
  FAVOURITES_UPDATED: "favorites-updated",
  WALLET_UPDATED: "wallet-updated",
  LOYALTY_POINTS_UPDATED: "loyalty-points-updated",
  NOTIFICATIONS_UPDATED: "notifications-updated",
  SITE_NOTIFICATION: "site-notification",
  SHOW_NOTIFICATION: "show-notification",
} as const;

export const MENU_CATEGORIES = [
  "Porto Kebabs",
  "Quesadilla",
  "Sides",
  "Drinks",
  "Burrito",
  "Platters",
  "Dips",
  "Kids Meal",
  "Rice",
  "Burgers",
  "Tandoori Dishes",
  "Biryani Dishes",
  "Hoogies",
  "Bread",
  "Chips With Starters",
  "Thrill Of Grill",
  "Korma Dishes",
  "Street Bites",
  "European Dishes",
  "Wraps",
  "Special Wings",
] as const;

export const SIZE_PRICES: Record<"Small" | "Medium" | "Large", number> = {
  Small: 0,
  Medium: 1,
  Large: 2,
};

export const EXTRA_HOT_CHILLI_PRICE = 0.5;

export const POINTS_PER_POUND = 10;
export const DUMMY_SEED_POINTS = 500;

export const LOYALTY_EARN_MIN_SPEND = 50;
export const LOYALTY_EARN_POINTS_PER_TIER = 10;
export const LOYALTY_EARN_TIER_AMOUNT = 50;

export const TIP_OPTIONS = [5, 10, 15] as const;

export const DELIVERY_FEE = 3.99;
export const SERVICE_FEE = 1.99;
export const BAG_CHARGE = 0.29;

export const CURRENCY_SYMBOL = "£";

export const PLACEHOLDER_IMAGE = "/images/menupictures/product-placeholder.svg";

export const AVAILABLE_COUPONS = [
  {
    title: "10% Off",
    code: "SAVE10",
    desc: "10% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
    discountType: "percentage" as const,
    discountValue: 10,
    minOrder: 5,
  },
  {
    title: "10% Off",
    code: "ZEEGRILL10",
    desc: "10% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
    discountType: "percentage" as const,
    discountValue: 10,
    minOrder: 5,
  },
  {
    title: "10% Off",
    code: "WELCOME10",
    desc: "10% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
    discountType: "percentage" as const,
    discountValue: 10,
    minOrder: 5,
  },
  {
    title: "15% Off",
    code: "SAVE15",
    desc: "15% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
    discountType: "percentage" as const,
    discountValue: 15,
    minOrder: 5,
  },
  {
    title: "15% Off",
    code: "ZEEGRILL15",
    desc: "15% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
    discountType: "percentage" as const,
    discountValue: 15,
    minOrder: 5,
  },
  {
    title: "15% Off",
    code: "WELCOME15",
    desc: "15% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
    discountType: "percentage" as const,
    discountValue: 15,
    minOrder: 5,
  },
  {
    title: "20% Off",
    code: "SAVE20",
    desc: "20% off on your order (min £5, excl. tip & wallet)",
    exp: "Expires 31 Dec 2026",
    discountType: "percentage" as const,
    discountValue: 20,
    minOrder: 5,
  },
] as const;
