import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
      requestId?: string;
    }
  }
}

// JWT Payload
export interface IUserPayload {
  _id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

// Enums
export type UserRole = 'user' | 'admin' | 'superadmin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'stripe' | 'sslcommerz' | 'paypal' | 'cod';

// Address Sub-document
export interface IAddress {
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

// User Document
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  phone?: string;
  refreshTokens: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses: Types.DocumentArray<IAddress & mongoose.Document>;

  // Instance methods
  comparePassword(password: string): Promise<boolean>;
  toPublicJSON(): Partial<IUser>;
}

// Product Document
export interface IProductVariant {
  sku: string;
  color?: string;
  size?: string;
  stock: number;
  price?: number;
  images?: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category: string;
  brand?: string;
  images: string[];
  variants: IProductVariant[];
  stock: number;
  sku?: string;
  tags: string[];
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  createdAt: Date;
  updatedAt: Date;
}

//  Order Item Snapshot
export interface IOrderItem {
  product: mongoose.Types.ObjectId | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
}

// Order Timeline Event
export interface IOrderTimelineEvent {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

// Query Helpers
export interface SortQuery {
  [key: string]: 1 | -1;
}

export interface FilterQuery {
  [key: string]: unknown;
}
