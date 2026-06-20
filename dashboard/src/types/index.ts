//  API
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

// =======Auth=========
export type UserRole = "user" | "admin" | "superadmin";
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

// ============Dashboard Analytics=============
export interface DashboardStats {
  revenue: { today: number; week: number; month: number; growth: number };
  orders: { today: number; week: number; month: number; pending: number };
  users: { total: number; newToday: number; newMonth: number };
  products: { total: number; lowStock: number; outOfStock: number };
}
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}
export interface TopProduct {
  _id: string;
  name: string;
  thumbnail?: string;
  soldCount: number;
  revenue: number;
  stock: number;
}
export interface OrderStatusCount {
  status: string;
  count: number;
}

// ==============Category=========
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string[];
  icon?: string;
  parent?: string | null;
  ancestors: string[];
  isActive: boolean;
  hasVariants: boolean;
  variantAttributes: ("size" | "color")[];

  sortOrder: number;
  createdAt: string;
}

// ==============Product==============
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
  price: number;
  comparePrice?: number;
  category: Category | string;
  brand?: string;
  images: string[];
  thumbnail?: string;
  variants: ProductVariant[];
  stock: number;
  sku?: string;
  tags: string[];
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  createdAt: string;
}

// ============ Order================
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "stripe" | "sslcommerz" | "paypal" | "cod";
export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}
export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}
export interface Order {
  _id: string;
  orderNumber: string;
  user: AdminUser | string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    country: string;
    postalCode: string;
  };
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
  notes?: string;
  createdAt: string;
}

// ===========User=========
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  addresses?: unknown[];
}

export interface Media {
  _id: string;
  title: string;
  alt: string;
  imgURL: string[] | string;
  publicId: string;
  category: string;
  fileSize: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==============Hero==============

export interface Hero {
  _id: string;
  id: string;
  title: string;
  subtitle: string;
  offer?: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  isActive: boolean;
}

// ===========Filters===========
export interface TableFilters {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  role?: string;
  from?: string;
  to?: string;
}
