import { Address, User } from "./typeAuth";

// Order
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "stripe" | "sslcommerz" | "paypal" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantLabel?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: Address;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: string;
  };
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
  coupon?: { code: string; type: string; value: number };
  notes?: string;
  deliveredAt?: string;
  createdAt: string;
}
