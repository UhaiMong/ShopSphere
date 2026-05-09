"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const Product_model_1 = require("../../models/Product.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const catchAsync_1 = require("../../utils/catchAsync");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const zod_1 = require("zod");
const Cart_model_1 = require("../../models/Cart.model");
// Validators
const addItemSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: zod_1.z.number().int().min(1).max(100).default(1),
    variantId: zod_1.z.string().optional(),
});
const updateItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1).max(100),
});
// Cart Service
const cartService = {
    async getCart(userId) {
        const cart = await Cart_model_1.Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name images thumbnail price stock isActive slug variants',
        });
        if (!cart)
            return { items: [], subtotal: 0, itemCount: 0 };
        // Filter out inactive/deleted products and calculate totals
        const validItems = cart.items.filter((item) => item.product && item.product.isActive);
        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
        }
        const subtotal = validItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
        const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
        return { items: validItems, subtotal, itemCount };
    },
    async addItem(userId, data) {
        const { productId, quantity, variantId } = data;
        // Validate product exists and has stock
        const product = await Product_model_1.Product.findOne({ _id: productId, isActive: true });
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
        // Check stock (variant-level if applicable)
        if (variantId) {
            const variant = product.variants.find((v) => String(v._id) === variantId);
            if (!variant)
                throw ApiError_1.ApiError.notFound('Product variant');
            if (variant.stock < quantity) {
                throw ApiError_1.ApiError.badRequest(`Only ${variant.stock} item(s) available for this variant`);
            }
        }
        else {
            if (product.stock < quantity) {
                throw ApiError_1.ApiError.badRequest(`Only ${product.stock} item(s) in stock`);
            }
        }
        const priceSnapshot = product.price;
        let cart = await Cart_model_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart_model_1.Cart({ user: userId, items: [] });
        }
        // Check if item already in cart
        const existingIdx = cart.items.findIndex((i) => String(i.product) === productId && (i.variantId ?? '') === (variantId ?? ''));
        if (existingIdx >= 0) {
            const newQty = cart.items[existingIdx].quantity + quantity;
            const maxStock = variantId
                ? (product.variants.find((v) => String(v._id) === variantId)?.stock ?? 0)
                : product.stock;
            if (newQty > maxStock) {
                throw ApiError_1.ApiError.badRequest(`Cannot add more than ${maxStock} of this item`);
            }
            cart.items[existingIdx].quantity = newQty;
        }
        else {
            cart.items.push({
                product: product._id,
                quantity,
                variantId,
                priceSnapshot,
            });
        }
        await cart.save();
        return cartService.getCart(userId);
    },
    async updateItem(userId, itemId, quantity) {
        const cart = await Cart_model_1.Cart.findOne({ user: userId });
        if (!cart)
            throw ApiError_1.ApiError.notFound('Cart');
        const item = cart.items.find((i) => String(i._id) === itemId);
        if (!item)
            throw ApiError_1.ApiError.notFound('Cart item');
        // Validate stock
        const product = await Product_model_1.Product.findById(item.product);
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
        const maxStock = item.variantId
            ? (product.variants.find((v) => String(v._id) === item.variantId)?.stock ?? 0)
            : product.stock;
        if (quantity > maxStock) {
            throw ApiError_1.ApiError.badRequest(`Only ${maxStock} item(s) available`);
        }
        item.quantity = quantity;
        await cart.save();
        return cartService.getCart(userId);
    },
    async removeItem(userId, itemId) {
        const cart = await Cart_model_1.Cart.findOne({ user: userId });
        if (!cart)
            throw ApiError_1.ApiError.notFound('Cart');
        cart.items = cart.items.filter((i) => String(i._id) !== itemId);
        await cart.save();
        return cartService.getCart(userId);
    },
    async clearCart(userId) {
        await Cart_model_1.Cart.findOneAndUpdate({ user: userId }, { $set: { items: [], couponCode: undefined } });
    },
};
//  Controller
const cartController = {
    getCart: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const cart = await cartService.getCart(req.user._id);
        ApiResponse_1.ApiResponse.success(res, cart);
    }),
    addItem: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const cart = await cartService.addItem(req.user._id, req.body);
        ApiResponse_1.ApiResponse.success(res, cart, 'Item added to cart');
    }),
    updateItem: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { quantity } = req.body;
        const cart = await cartService.updateItem(req.user._id, req.params.itemId, quantity);
        ApiResponse_1.ApiResponse.success(res, cart, 'Cart updated');
    }),
    removeItem: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const cart = await cartService.removeItem(req.user._id, req.params.itemId);
        ApiResponse_1.ApiResponse.success(res, cart, 'Item removed');
    }),
    clearCart: (0, catchAsync_1.catchAsync)(async (req, res) => {
        await cartService.clearCart(req.user._id);
        ApiResponse_1.ApiResponse.success(res, null, 'Cart cleared');
    }),
};
// Router
exports.cartRouter = (0, express_1.Router)();
exports.cartRouter.use(auth_middleware_1.protect); // All cart routes require auth
exports.cartRouter.get('/', cartController.getCart);
exports.cartRouter.post('/items', (0, validate_middleware_1.validate)(addItemSchema), cartController.addItem);
exports.cartRouter.patch('/items/:itemId', (0, validate_middleware_1.validate)(updateItemSchema), cartController.updateItem);
exports.cartRouter.delete('/items/:itemId', cartController.removeItem);
exports.cartRouter.delete('/', cartController.clearCart);
//# sourceMappingURL=cart.controller.js.map