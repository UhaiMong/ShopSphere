import { Router, Request, Response } from "express";
import { Product } from "../../models/Product.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { catchAsync } from "../../utils/catchAsync";
import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { z } from "zod";
import { Cart } from "@/models/Cart.model";

// Validators
const addItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  quantity: z.number().int().min(1).max(100).default(1),
  variantId: z.string().optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(100),
});

// Cart Service
const cartService = {
  async getCart(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name images thumbnail price stock isActive slug variants",
    });

    if (!cart) return { items: [], subtotal: 0, itemCount: 0 };

    // Filter out inactive/deleted products and calculate totals
    const validItems = cart.items.filter(
      (item) => item.product && (item.product as any).isActive,
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    );
    const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: validItems, subtotal, itemCount };
  },

  async addItem(userId: string, data: z.infer<typeof addItemSchema>) {
    const { productId, quantity, variantId } = data;

    // Validate product exists and has stock
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) throw ApiError.notFound("Product");

    // Check stock (variant-level if applicable)
    if (variantId) {
      const variant = product.variants.find((v) => String(v._id) === variantId);
      if (!variant) throw ApiError.notFound("Product variant");
      if (variant.stock < quantity) {
        throw ApiError.badRequest(
          `Only ${variant.stock} item(s) available for this variant`,
        );
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
      (i) =>
        String(i.product) === productId &&
        (i.variantId ?? "") === (variantId ?? ""),
    );

    if (existingIdx >= 0) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      const maxStock = variantId
        ? (product.variants.find((v) => String(v._id) === variantId)?.stock ??
          0)
        : product.stock;
      if (newQty > maxStock) {
        throw ApiError.badRequest(
          `Cannot add more than ${maxStock} of this item`,
        );
      }
      cart.items[existingIdx].quantity = newQty;
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
    if (!cart) throw ApiError.notFound("Cart");

    const item = cart.items.find((i) => String(i._id) === itemId);
    if (!item) throw ApiError.notFound("Cart item");

    // Validate stock
    const product = await Product.findById(item.product);
    if (!product) throw ApiError.notFound("Product");

    const maxStock = item.variantId
      ? (product.variants.find((v) => String(v._id) === item.variantId)
          ?.stock ?? 0)
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
    if (!cart) throw ApiError.notFound("Cart");

    cart.items = cart.items.filter((i) => String(i._id) !== itemId) as any;
    await cart.save();
    return cartService.getCart(userId);
  },

  async clearCart(userId: string) {
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], couponCode: undefined } },
    );
  },
};

//  Controller
const cartController = {
  getCart: catchAsync(async (req: Request, res: Response) => {
    const cart = await cartService.getCart(req.user!._id);
    ApiResponse.success(res, cart);
  }),

  addItem: catchAsync(async (req: Request, res: Response) => {
    const cart = await cartService.addItem(req.user!._id, req.body);
    ApiResponse.success(res, cart, "Item added to cart");
  }),

  updateItem: catchAsync(async (req: Request, res: Response) => {
    const { quantity } = req.body as { quantity: number };
    const cart = await cartService.updateItem(
      req.user!._id,
      req.params.itemId,
      quantity,
    );
    ApiResponse.success(res, cart, "Cart updated");
  }),

  removeItem: catchAsync(async (req: Request, res: Response) => {
    const cart = await cartService.removeItem(req.user!._id, req.params.itemId);
    ApiResponse.success(res, cart, "Item removed");
  }),

  clearCart: catchAsync(async (req: Request, res: Response) => {
    await cartService.clearCart(req.user!._id);
    ApiResponse.success(res, null, "Cart cleared");
  }),
};

// Router
export const cartRouter = Router();

cartRouter.use(protect); // All cart routes require auth

cartRouter.get("/", cartController.getCart);
cartRouter.post("/items", validate(addItemSchema), cartController.addItem);
cartRouter.patch(
  "/items/:itemId",
  validate(updateItemSchema),
  cartController.updateItem,
);
cartRouter.delete("/items/:itemId", cartController.removeItem);
cartRouter.delete("/", cartController.clearCart);
