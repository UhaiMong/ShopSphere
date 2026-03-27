import { Product } from "./typeProduct";

// Cart
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
