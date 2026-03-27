import { Category } from "./typeCategory";

// Product
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
