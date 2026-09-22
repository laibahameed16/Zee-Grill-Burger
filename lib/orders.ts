import { STORAGE_KEYS, EVENTS } from "./constants";
import { safeLocalStorage } from "./storage";
import { dispatchCustomEvent, generateId } from "./utils";
import type { OrderCard, CartItem } from "./types";

export const getLastOrder = <T = OrderCard | Record<string, any> | null>(): T => {
  return safeLocalStorage.get<T>(STORAGE_KEYS.LAST_ORDER, null as unknown as T);
};

export const setLastOrder = (order: OrderCard | Record<string, any>): void => {
  safeLocalStorage.set(STORAGE_KEYS.LAST_ORDER, order);
};

export const getOrderCompletedFlag = (): boolean => {
  return safeLocalStorage.getBoolean(STORAGE_KEYS.ORDER_COMPLETED, false);
};

export const setOrderCompletedFlag = (value: boolean): void => {
  safeLocalStorage.setBoolean(STORAGE_KEYS.ORDER_COMPLETED, value);
};

export const FALLBACK_ORDERS: OrderCard[] = [
  {
    id: "PPP-1028",
    date: "Aug 25, 2026",
    time: "6:10 PM",
    items: [
      {
        name: "Piri Piri Wrap Meal",
        description: "Delicious wrap with grilled chicken and sauces",
        price: "£7.95",
        badge: "POPULAR",
        quantity: 2,
        image: "/images/menupictures/product-placeholder.svg",
      },
      {
        name: "Neffis Milkshake",
        description: "Creamy and refreshing milkshake",
        price: "£5.25",
        badge: "RECOMMENDED",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 27.38,
    status: "Preparing",
    orderType: "delivery",
    cutlery: "Yes",
  },
  {
    id: "PPP-1026",
    date: "Aug 24, 2026",
    time: "4:30 PM",
    items: [
      {
        name: "Beef Burger Menu",
        description: "Juicy beef burger with fries and drink",
        price: "£12.95",
        badge: "POPULAR",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 12.95,
    status: "Picked up",
    orderType: "pickup",
    cutlery: "No",
  },
  {
    id: "PPP-1024",
    date: "Aug 24, 2026",
    time: "7:45 PM",
    items: [
      {
        name: "Piri Piri Wing Platter",
        description: "Flame-grilled wings with signature sauce",
        price: "£29.83",
        badge: "RECOMMENDED",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 29.83,
    status: "Delivered",
    orderType: "delivery",
    cutlery: "No",
  },
  {
    id: "PPP-1022",
    date: "Aug 22, 2026",
    time: "1:15 PM",
    items: [
      {
        name: "Piri Piri Wrap Meal",
        description: "Delicious wrap with grilled chicken and sauces",
        price: "£14.84",
        badge: "POPULAR",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 14.84,
    status: "Delivered",
    orderType: "delivery",
    cutlery: "Yes",
  },
  {
    id: "PPP-1019",
    date: "Aug 20, 2026",
    time: "8:00 PM",
    items: [
      {
        name: "Piri Piri Wing Platter",
        description: "Flame-grilled wings with signature sauce",
        price: "£21.93",
        badge: "RECOMMENDED",
        quantity: 1,
        image: "/images/menupictures/product-placeholder.svg",
      },
    ],
    total: 21.93,
    status: "Cancelled",
    orderType: "delivery",
    cutlery: "No",
  },
];

const SEED_ORDERS: OrderCard[] = [
  {
    id: "PPP-1028",
    date: "Aug 25, 2026",
    time: "6:10 PM",
    items: [
      {
        name: "Piri Piri Wrap Meal",
        description: "Delicious wrap with grilled chicken and sauces",
        price: "£7.95",
        badge: "POPULAR",
        image: "/images/menupictures/product-placeholder.svg",
        quantity: 2,
        size: "Medium",
      },
      {
        name: "Neffis Milkshake",
        description: "Creamy and refreshing milkshake",
        price: "£5.25",
        badge: "RECOMMENDED",
        image: "/images/menupictures/product-placeholder.svg",
        quantity: 1,
      },
    ],
    total: 27.38,
    status: "Preparing",
    orderType: "delivery",
    cutlery: "Yes",
    subtotal: 21.15,
    deliveryFee: 3.99,
    serviceFee: 1.99,
    bagCharges: 0.29,
    tip: 0,
    walletAmount: 0,
  },
  {
    id: "PPP-1026",
    date: "Aug 24, 2026",
    time: "4:30 PM",
    items: [
      {
        name: "Beef Burger Menu",
        description: "Juicy beef burger with fries and drink",
        price: "£12.95",
        badge: "POPULAR",
        image: "/images/menupictures/product-placeholder.svg",
        quantity: 1,
        size: "Medium",
      },
    ],
    total: 12.95,
    status: "Picked up",
    orderType: "pickup",
    cutlery: "No",
    subtotal: 12.95,
    deliveryFee: 0,
    serviceFee: 0,
    bagCharges: 0.29,
    tip: 0,
    walletAmount: 0,
  },
  {
    id: "PPP-1024",
    date: "Aug 22, 2026",
    time: "7:45 PM",
    items: [
      {
        name: "Chicken Biryani",
        description: "Aromatic basmati rice with spiced chicken",
        price: "£11.50",
        badge: "RECOMMENDED",
        image: "/images/menupictures/product-placeholder.svg",
        quantity: 1,
        size: "Large",
      },
    ],
    total: 16.28,
    status: "Delivered",
    orderType: "delivery",
    cutlery: "Yes",
    subtotal: 13.5,
    deliveryFee: 0.5,
    serviceFee: 1.99,
    bagCharges: 0.29,
    tip: 0,
    walletAmount: 0,
  },
];

const seedOrdersIfEmpty = (): void => {
  const raw = safeLocalStorage.getString(STORAGE_KEYS.ORDERS, "__UNSET__");
  if (raw === "__UNSET__") {
    safeLocalStorage.set(STORAGE_KEYS.ORDERS, SEED_ORDERS);
  }
};

export const getOrders = (): OrderCard[] => {
  seedOrdersIfEmpty();
  return safeLocalStorage.get<OrderCard[]>(STORAGE_KEYS.ORDERS, [...SEED_ORDERS]);
};

export const saveOrders = (orders: OrderCard[]): void => {
  safeLocalStorage.set(STORAGE_KEYS.ORDERS, orders);
};

export const getOrderById = (orderId: string): OrderCard | undefined => {
  return getOrders().find((o) => o.id === orderId);
};

export const placeOrder = (params: {
  items: CartItem[];
  total: number;
  status?: OrderCard["status"];
  orderType?: OrderCard["orderType"];
  cutlery?: string;
  subtotal?: number;
  deliveryFee?: number;
  serviceFee?: number;
  bagCharges?: number;
  tip?: number;
  walletAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
}): OrderCard => {
  const now = new Date();
  const newOrder: OrderCard = {
    id: generateId("ZGB-"),
    date: now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    items: params.items,
    total: params.total,
    status: params.status ?? "Preparing",
    orderType: params.orderType ?? "delivery",
    cutlery: params.cutlery,
    subtotal: params.subtotal,
    deliveryFee: params.deliveryFee,
    serviceFee: params.serviceFee,
    bagCharges: params.bagCharges,
    tip: params.tip,
    walletAmount: params.walletAmount,
    couponCode: params.couponCode,
    couponDiscount: params.couponDiscount,
  };

  const orders = getOrders();
  saveOrders([newOrder, ...orders]);
  return newOrder;
};

export const updateOrderStatus = (
  orderId: string,
  status: OrderCard["status"]
): boolean => {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return false;
  orders[idx].status = status;
  saveOrders(orders);
  return true;
};
