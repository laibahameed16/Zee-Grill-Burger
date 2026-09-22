import { AVAILABLE_COUPONS } from "./constants";
import type { Coupon } from "./types";

export const getAllCoupons = (): Coupon[] => {
  return [...AVAILABLE_COUPONS];
};

export const validateCoupon = (
  code: string,
  subtotal = 0
): {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
} => {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return { valid: false, error: "Please enter a coupon code" };
  }

  const coupon = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);

  if (!coupon) {
    return {
      valid: false,
      error: `Invalid coupon code. Try: ${AVAILABLE_COUPONS.map((c) => c.code).join(", ")}`,
    };
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      valid: false,
      coupon,
      error: `Minimum order of £${coupon.minOrder.toFixed(2)} required for this coupon`,
    };
  }

  let discount = 0;
  const discountType = coupon.discountType;
  const discountValue = coupon.discountValue;

  if (discountType && discountValue !== undefined) {
    if (discountType === "percentage") {
      discount = (subtotal * discountValue) / 100;
    } else if (discountType === "fixed") {
      discount = discountValue;
    }
  }

  return { valid: true, coupon, discount };
};

export const isCouponValid = (code: string): boolean => {
  const cleanCode = code.trim().toUpperCase();
  return AVAILABLE_COUPONS.some((c) => c.code === cleanCode);
};

export const getCouponSuggestions = (): string[] => {
  return AVAILABLE_COUPONS.map((c) => c.code);
};
