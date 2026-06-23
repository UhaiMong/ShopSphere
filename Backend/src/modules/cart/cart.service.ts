import { Product } from '../../models/Product.model';
import { ApiError } from '../../utils/ApiError';
import { z } from 'zod';
import { Cart } from '../../models/Cart.model';
import type { addItemSchema } from './cart.validator';
// Cart Service
export const cartService = {
  async getCart(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name images thumbnail price stock isActive slug variants',
    });

    if (!cart) return { items: [], subtotal: 0, itemCount: 0 };

    // Filter out inactive/deleted products and calculate totals
    const validItems = cart.items.filter((item) => item.product && (item.product as any).isActive);

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const subtotal = validItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
    const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: validItems, subtotal, itemCount };
  },

  async addItem(userId: string, data: z.infer<typeof addItemSchema>) {
    const { productId, quantity, variantId } = data;

    // Validate product exists and has stock
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) throw ApiError.notFound('Product');

    // Check stock (variant-level if applicable)
    if (variantId) {
      const variant = product.variants.find((v) => String(v._id) === variantId);
      if (!variant) throw ApiError.notFound('Product variant');
      if (variant.stock < quantity) {
        throw ApiError.badRequest(`Only ${variant.stock} item(s) available for this variant`);
      }
    } else {
      if (product.stock < quantity) {
        throw ApiError.badRequest(`Only ${product.stock} item(s) in stock`);
      }
    }

    const priceSnapshot = product.price;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already in cart
    const existingIdx = cart.items.findIndex(
      (i) => String(i.product) === productId && (i.variantId ?? '') === (variantId ?? ''),
    );

    if (existingIdx >= 0) {
      const existingItem = cart.items[existingIdx];
      if (!existingItem) throw ApiError.notFound('Cart item');
      const newQty = existingItem.quantity + quantity;
      const maxStock = variantId
        ? (product.variants.find((v) => String(v._id) === variantId)?.stock ?? 0)
        : product.stock;
      if (newQty > maxStock) {
        throw ApiError.badRequest(`Cannot add more than ${maxStock} of this item`);
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        product: product._id as any,
        quantity,
        variantId,
        priceSnapshot,
      } as any);
    }

    await cart.save();
    return cartService.getCart(userId);
  },

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw ApiError.notFound('Cart');

    const item = cart.items.find((i) => String(i._id) === itemId);
    if (!item) throw ApiError.notFound('Cart item');

    // Validate stock
    const product = await Product.findById(item.product);
    if (!product) throw ApiError.notFound('Product');

    const maxStock = item.variantId
      ? (product.variants.find((v) => String(v._id) === item.variantId)?.stock ?? 0)
      : product.stock;

    if (quantity > maxStock) {
      throw ApiError.badRequest(`Only ${maxStock} item(s) available`);
    }

    item.quantity = quantity;
    await cart.save();
    return cartService.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw ApiError.notFound('Cart');

    cart.items = cart.items.filter((i) => String(i._id) !== itemId) as any;
    await cart.save();
    return cartService.getCart(userId);
  },

  async clearCart(userId: string) {
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [], couponCode: undefined } });
  },
};
