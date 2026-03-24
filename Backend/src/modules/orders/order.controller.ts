import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../../models/Order.model";
import { Product } from "../../models/Product.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { catchAsync } from "../../utils/catchAsync";
import { protect, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { parsePagination, getPaginationMeta } from "../../utils/ApiResponse";
import { OrderStatus } from "../../types";
import { z } from "zod";
import { Cart } from "@/models/Cart.model";

// Validators
const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(4),
  country: z.string().min(2).default("BD"),
});

const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["stripe", "sslcommerz", "paypal", "cod"]),
  notes: z.string().max(500).optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  note: z.string().max(300).optional(),
});

// Order Service
const CANCELLABLE_STATUSES: OrderStatus[] = ["pending", "confirmed"];

const SHIPPING_FEE = 100; // ৳1.00 in cents; replace with real shipping logic
const TAX_RATE = 0; // Set your tax rate here

export const orderService = {
  //  createFromCart
  async createFromCart(
    userId: string,
    input: z.infer<typeof createOrderSchema>,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Load cart
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart || cart.items.length === 0) {
        throw ApiError.badRequest("Your cart is empty");
      }

      // 2. Validate products and build order items
      const orderItems = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        // Optimistic concurrency: use __v to prevent race conditions on stock
        const product = await Product.findOneAndUpdate(
          {
            _id: cartItem.product,
            isActive: true,
            stock: { $gte: cartItem.quantity },
            __v: (await Product.findById(cartItem.product).session(session))
              ?.__v,
          },
          {
            $inc: { stock: -cartItem.quantity, soldCount: cartItem.quantity },
          },
          { session, new: true },
        );

        if (!product) {
          const prod = await Product.findById(cartItem.product).session(
            session,
          );
          if (!prod || !prod.isActive) {
            throw ApiError.badRequest(`Product is no longer available`);
          }
          throw ApiError.badRequest(
            `Insufficient stock for "${prod.name}". Only ${prod.stock} left.`,
          );
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
      const [order] = await Order.create(
        [
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
        ],
        { session },
      );

      // 5. Clear cart
      cart.items = [] as any;
      await cart.save({ session });

      await session.commitTransaction();
      return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },

  // getUserOrders
  async getUserOrders(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const filter: Record<string, unknown> = { user: userId };
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return { orders, pagination: getPaginationMeta(total, page, limit) };
  },

  //  getOrderById
  async getOrderById(orderId: string, userId?: string) {
    const filter: Record<string, unknown> = { _id: orderId };
    if (userId) filter.user = userId; // Users can only see their own orders

    const order = await Order.findOne(filter);
    if (!order) throw ApiError.notFound("Order");
    return order;
  },

  //  cancelOrder
  async cancelOrder(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw ApiError.notFound("Order");

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw ApiError.badRequest(
        `Order cannot be cancelled. Current status: ${order.status}`,
      );
    }

    // Restore stock
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity, soldCount: -item.quantity } },
          { session },
        );
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
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },

  // updateStatus (admin)
  async updateStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    adminId?: string,
  ) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound("Order");

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
  async getAllOrders(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query);
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.userId) filter.user = query.userId;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from)
        (filter.createdAt as any).$gte = new Date(String(query.from));
      if (query.to) (filter.createdAt as any).$lte = new Date(String(query.to));
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return { orders, pagination: getPaginationMeta(total, page, limit) };
  },
};

// Controller
const orderController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const order = await orderService.createFromCart(req.user!._id, req.body);
    ApiResponse.created(res, order, "Order placed successfully");
  }),

  getUserOrders: catchAsync(async (req: Request, res: Response) => {
    const { orders, pagination } = await orderService.getUserOrders(
      req.user!._id,
      req.query,
    );
    ApiResponse.paginated(res, orders, pagination);
  }),

  getOne: catchAsync(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.params.id, req.user!._id);
    ApiResponse.success(res, order);
  }),

  cancel: catchAsync(async (req: Request, res: Response) => {
    const order = await orderService.cancelOrder(req.params.id, req.user!._id);
    ApiResponse.success(res, order, "Order cancelled successfully");
  }),

  //  Admin
  adminGetAll: catchAsync(async (req: Request, res: Response) => {
    const { orders, pagination } = await orderService.getAllOrders(req.query);
    ApiResponse.paginated(res, orders, pagination);
  }),

  adminGetOne: catchAsync(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.params.id);
    ApiResponse.success(res, order);
  }),

  adminUpdateStatus: catchAsync(async (req: Request, res: Response) => {
    const { status, note } = req.body as z.infer<
      typeof updateOrderStatusSchema
    >;
    const order = await orderService.updateStatus(
      req.params.id,
      status,
      note,
      req.user!._id,
    );
    ApiResponse.success(res, order, `Order status updated to ${status}`);
  }),
};

// Router
export const orderRouter = Router();

// User routes
orderRouter.use(protect);
orderRouter.post("/", validate(createOrderSchema), orderController.create);
orderRouter.get("/", orderController.getUserOrders);
orderRouter.get("/:id", orderController.getOne);
orderRouter.patch("/:id/cancel", orderController.cancel);

// Admin routes
const adminRouter = Router();
adminRouter.use(protect, requireRole("admin", "superadmin"));
adminRouter.get("/", orderController.adminGetAll);
adminRouter.get("/:id", orderController.adminGetOne);
adminRouter.patch(
  "/:id/status",
  validate(updateOrderStatusSchema),
  orderController.adminUpdateStatus,
);

export { adminRouter as adminOrderRouter };
