import { CURRENCY_SYMBOL, SIZE_PRICES, EXTRA_HOT_CHILLI_PRICE } from "./constants";
import type { CartItem, SizeType } from "./types";

export const isBrowser = (): boolean => typeof window !== "undefined";

export const getPriceNumber = (price: string | number): number => {
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  const cleaned = String(price).replace(/[^0-9.]/g, "");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

export const getBasePrice = (price: string | number): number => getPriceNumber(price);

export const getSizePrice = (size?: SizeType): number => {
  if (!size) return 0;
  return SIZE_PRICES[size] ?? 0;
};

export const getExtraHotChilliPrice = (extraHotChilli?: boolean): number => {
  return extraHotChilli ? EXTRA_HOT_CHILLI_PRICE : 0;
};

export const getItemUnitPrice = (item: CartItem): number => {
  const base = getPriceNumber(item.price);
  const sizePrice = getSizePrice(item.size);
  const chilliPrice = getExtraHotChilliPrice(item.extraHotChilli);
  return base + sizePrice + chilliPrice;
};

export const getItemTotal = (item: CartItem): number => {
  return getItemUnitPrice(item) * item.quantity;
};

export const getCartSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + getItemTotal(item), 0);
};

export const getCartItemCount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

export const formatPrice = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
};

export const parsePrice = (priceStr: string): number => {
  return getPriceNumber(priceStr);
};

export const getId = (category: string): string => {
  return `menu-${category.toLowerCase().replace(/\s+/g, "-")}`;
};

export const getButtonId = (category: string): string => {
  return `category-${category.toLowerCase().replace(/\s+/g, "-")}`;
};

export const generateId = (prefix = ""): string => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!isBrowser()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export const dispatchCustomEvent = <T = any>(eventName: string, detail?: T): void => {
  if (!isBrowser()) return;
  const event = detail !== undefined
    ? new CustomEvent(eventName, { detail })
    : new Event(eventName);
  window.dispatchEvent(event);
};
