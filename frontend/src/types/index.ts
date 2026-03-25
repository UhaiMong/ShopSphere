// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = "user" | "admin" | "superadmin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Address {
  _id?: string;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: string | null;
  ancestors: string[];
  isActive: boolean;
  sortOrder: number;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface ProductVariant {
  _id: string;
  sku: string;
  color?: string;
  size?: string;
  stock: number;
  price?: number;
  images?: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number; // cents
  comparePrice?: number; // cents
  category: Category | string;
  brand?: string;
  images: string[];
  thumbnail?: string;
  variants: ProductVariant[];
  stock: number;
  tags: string[];
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  discountPercentage?: number;
  inStock?: boolean;
  createdAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  priceSnapshot: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────
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

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  product: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
  sort?: "price_asc" | "price_desc" | "rating" | "newest" | "popular";
  tags?: string;
}
