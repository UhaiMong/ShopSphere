// Filters
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
