export type BadgeType = "POPULAR" | "RECOMMENDED";

export type SizeType = "Small" | "Medium" | "Large";

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  badge: BadgeType;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  size?: SizeType;
  extraHotChilli?: boolean;
  imageUrl?: string;
  img?: string;
}

export interface OrderCard {
  id: string;
  date: string;
  time: string;
  items: CartItem[];
  total: number;
  status: "Preparing" | "Delivered" | "Cancelled" | "Picked up";
  orderType?: "delivery" | "pickup" | "collection";
  cutlery?: string;
  subtotal?: number;
  deliveryFee?: number;
  serviceFee?: number;
  bagCharges?: number;
  tip?: number;
  walletAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
}

export interface Coupon {
  title: string;
  code: string;
  desc: string;
  exp: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  minOrder?: number;
}

export interface ConversionRecord {
  id: string;
  points: number;
  amount: number;
  date: string;
}

export type OrderType = "delivery" | "collection" | "pickup";
