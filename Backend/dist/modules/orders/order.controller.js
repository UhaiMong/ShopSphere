"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrderRouter = exports.orderRouter = exports.orderService = void 0;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Order_model_1 = require("../../models/Order.model");
const Product_model_1 = require("../../models/Product.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const catchAsync_1 = require("../../utils/catchAsync");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const ApiResponse_2 = require("../../utils/ApiResponse");
const zod_1 = require("zod");
const Cart_model_1 = require("@/models/Cart.model");
// Validators
const addressSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(7),
    addressLine1: zod_1.z.string().min(5),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().min(4),
    country: zod_1.z.string().min(2).default("BD"),
});
const createOrderSchema = zod_1.z.object({
    shippingAddress: addressSchema,
    paymentMethod: zod_1.z.enum(["stripe", "sslcommerz", "paypal", "cod"]),
    notes: zod_1.z.string().max(500).optional(),
});
const updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
    ]),
    note: zod_1.z.string().max(300).optional(),
});
// Order Service
const CANCELLABLE_STATUSES = ["pending", "confirmed"];
const SHIPPING_FEE = 100; // ৳1.00 in cents; replace with real shipping logic
const TAX_RATE = 0; // Set your tax rate here
exports.orderService = {
    //  createFromCart
    async createFromCart(userId, input) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // 1. Load cart
            const cart = await Cart_model_1.Cart.findOne({ user: userId }).session(session);
            if (!cart || cart.items.length === 0) {
                throw ApiError_1.ApiError.badRequest("Your cart is empty");
            }
            // 2. Validate products and build order items
            const orderItems = [];
            let subtotal = 0;
            for (const cartItem of cart.items) {
                // Optimistic concurrency: use __v to prevent race conditions on stock
                const product = await Product_model_1.Product.findOneAndUpdate({
                    _id: cartItem.product,
                    isActive: true,
                    stock: { $gte: cartItem.quantity },
                    __v: (await Product_model_1.Product.findById(cartItem.product).session(session))
                        ?.__v,
                }, {
                    $inc: { stock: -cartItem.quantity, soldCount: cartItem.quantity },
                }, { session, new: true });
                if (!product) {
                    const prod = await Product_model_1.Product.findById(cartItem.product).session(session);
                    if (!prod || !prod.isActive) {
                        throw ApiError_1.ApiError.badRequest(`Product is no longer available`);
                    }
                    throw ApiError_1.ApiError.badRequest(`Insufficient stock for "${prod.name}". Only ${prod.stock} left.`);
                }
                const itemTotal = cartItem.priceSnapshot * cartItem.quantity;
                subtotal += itemTotal;
                orderItems.push({
                    product: product._id,
                    name: product.name,
                    image: product.thumbnail ?? product.images[0] ?? "",
                    price: cartItem.priceSnapshot,
                    quantity: cartItem.quantity,
                    variantId: cartItem.variantId,
                    variantLabel: cartItem.variantLabel,
                });
            }
            // 3. Calculate totals
            const tax = Math.round(subtotal * TAX_RATE);
            const total = subtotal + tax + SHIPPING_FEE;
            // 4. Create order
            const [order] = await Order_model_1.Order.create([
                {
                    user: userId,
                    items: orderItems,
                    shippingAddress: input.shippingAddress,
                    payment: {
                        method: input.paymentMethod,
                        status: input.paymentMethod === "cod" ? "pending" : "pending",
                    },
                    subtotal,
                    tax,
                    shippingFee: SHIPPING_FEE,
                    discount: 0,
                    total,
                    notes: input.notes,
                },
            ], { session });
            // 5. Clear cart
            cart.items = [];
            await cart.save({ session });
            await session.commitTransaction();
            return order;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    },
    // getUserOrders
    async getUserOrders(userId, query) {
        const { page, limit, skip } = (0, ApiResponse_2.parsePagination)(query);
        const filter = { user: userId };
        if (query.status)
            filter.status = query.status;
        const [orders, total] = await Promise.all([
            Order_model_1.Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Order_model_1.Order.countDocuments(filter),
        ]);
        return { orders, pagination: (0, ApiResponse_2.getPaginationMeta)(total, page, limit) };
    },
    //  getOrderById
    async getOrderById(orderId, userId) {
        const filter = { _id: orderId };
        if (userId)
            filter.user = userId; // Users can only see their own orders
        const order = await Order_model_1.Order.findOne(filter);
        if (!order)
            throw ApiError_1.ApiError.notFound("Order");
        return order;
    },
    //  cancelOrder
    async cancelOrder(orderId, userId) {
        const order = await Order_model_1.Order.findOne({ _id: orderId, user: userId });
        if (!order)
            throw ApiError_1.ApiError.notFound("Order");
        if (!CANCELLABLE_STATUSES.includes(order.status)) {
            throw ApiError_1.ApiError.badRequest(`Order cannot be cancelled. Current status: ${order.status}`);
        }
        // Restore stock
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            for (const item of order.items) {
                await Product_model_1.Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } }, { session });
            }
            order.status = "cancelled";
            order.timeline.push({
                status: "cancelled",
                timestamp: new Date(),
                note: "Cancelled by customer",
            });
            await order.save({ session });
            await session.commitTransaction();
            return order;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    },
    // updateStatus (admin)
    async updateStatus(orderId, status, note, adminId) {
        const order = await Order_model_1.Order.findById(orderId);
        if (!order)
            throw ApiError_1.ApiError.notFound("Order");
        order.status = status;
        order.timeline.push({
            status,
            timestamp: new Date(),
            note,
            updatedBy: adminId,
        });
        if (status === "delivered") {
            order.deliveredAt = new Date();
            order.payment.status = "paid"; // Mark COD as paid on delivery
        }
        await order.save();
        return order;
    },
    // getAllOrders (admin)
    async getAllOrders(query) {
        const { page, limit, skip } = (0, ApiResponse_2.parsePagination)(query);
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.userId)
            filter.user = query.userId;
        if (query.from || query.to) {
            filter.createdAt = {};
            if (query.from)
                filter.createdAt.$gte = new Date(String(query.from));
            if (query.to)
                filter.createdAt.$lte = new Date(String(query.to));
        }
        const [orders, total] = await Promise.all([
            Order_model_1.Order.find(filter)
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order_model_1.Order.countDocuments(filter),
        ]);
        return { orders, pagination: (0, ApiResponse_2.getPaginationMeta)(total, page, limit) };
    },
};
// Controller
const orderController = {
    create: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const order = await exports.orderService.createFromCart(req.user._id, req.body);
        ApiResponse_1.ApiResponse.created(res, order, "Order placed successfully");
    }),
    getUserOrders: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { orders, pagination } = await exports.orderService.getUserOrders(req.user._id, req.query);
        ApiResponse_1.ApiResponse.paginated(res, orders, pagination);
    }),
    getOne: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const order = await exports.orderService.getOrderById(req.params.id, req.user._id);
        ApiResponse_1.ApiResponse.success(res, order);
    }),
    cancel: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const order = await exports.orderService.cancelOrder(req.params.id, req.user._id);
        ApiResponse_1.ApiResponse.success(res, order, "Order cancelled successfully");
    }),
    //  Admin
    adminGetAll: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { orders, pagination } = await exports.orderService.getAllOrders(req.query);
        ApiResponse_1.ApiResponse.paginated(res, orders, pagination);
    }),
    adminGetOne: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const order = await exports.orderService.getOrderById(req.params.id);
        ApiResponse_1.ApiResponse.success(res, order);
    }),
    adminUpdateStatus: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { status, note } = req.body;
        const order = await exports.orderService.updateStatus(req.params.id, status, note, req.user._id);
        ApiResponse_1.ApiResponse.success(res, order, `Order status updated to ${status}`);
    }),
};
// Router
exports.orderRouter = (0, express_1.Router)();
// User routes
exports.orderRouter.use(auth_middleware_1.protect);
exports.orderRouter.post("/", (0, validate_middleware_1.validate)(createOrderSchema), orderController.create);
exports.orderRouter.get("/", orderController.getUserOrders);
exports.orderRouter.get("/:id", orderController.getOne);
exports.orderRouter.patch("/:id/cancel", orderController.cancel);
// Admin routes
const adminRouter = (0, express_1.Router)();
exports.adminOrderRouter = adminRouter;
adminRouter.use(auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "superadmin"));
adminRouter.get("/", orderController.adminGetAll);
adminRouter.get("/:id", orderController.adminGetOne);
adminRouter.patch("/:id/status", (0, validate_middleware_1.validate)(updateOrderStatusSchema), orderController.adminUpdateStatus);
//# sourceMappingURL=order.controller.js.map