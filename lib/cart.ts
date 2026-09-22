import { STORAGE_KEYS, EVENTS, SIZE_PRICES, EXTRA_HOT_CHILLI_PRICE } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent, getPriceNumber, getSizePrice, getExtraHotChilliPrice, getItemUnitPrice, getItemTotal, getCartSubtotal, getCartItemCount, generateId } from "./utils";
import type { CartItem, MenuItem, SizeType } from "./types";

export const getCart = (): CartItem[] => {
  return safeLocalStorage.get<CartItem[]>(STORAGE_KEYS.CART, []);
};

export const saveCart = (cart: CartItem[]): void => {
  safeLocalStorage.set(STORAGE_KEYS.CART, cart);
  dispatchCustomEvent(EVENTS.CART_UPDATED);
};

export const addToCart = (
  item: MenuItem,
  options: {
    quantity?: number;
    size?: SizeType;
    extraHotChilli?: boolean;
  } = {}
): void => {
  const { quantity = 1, size = "Medium", extraHotChilli = false } = options;
  const cart = getCart();

  const existingIndex = cart.findIndex(
    (c) =>
      c.name === item.name &&
      c.size === size &&
      c.extraHotChilli === extraHotChilli
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      ...item,
      quantity,
      size,
      extraHotChilli,
    });
  }

  saveCart(cart);
};

export const removeFromCart = (index: number): void => {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart(cart);
};

export const removeItemByName = (
  name: string,
  size?: SizeType,
  extraHotChilli?: boolean
): void => {
  const cart = getCart();
  const filtered = cart.filter(
    (c) =>
      !(c.name === name && c.size === size && c.extraHotChilli === extraHotChilli)
  );
  saveCart(filtered);
};

export const increaseQuantity = (index: number): void => {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;
  cart[index].quantity += 1;
  saveCart(cart);
};

export const decreaseQuantity = (index: number): void => {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  saveCart(cart);
};

export const clearCart = (): void => {
  saveCart([]);
};

export const getCartTotal = (): number => {
  return getCartSubtotal(getCart());
};

export const getCartCount = (): number => {
  return getCartItemCount(getCart());
};

export const getCartItemImage = (item: CartItem): string => {
  return item.image || item.imageUrl || item.img || "/images/menupictures/product-placeholder.svg";
};
