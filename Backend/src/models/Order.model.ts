import mongoose, { Schema, Model, Document } from "mongoose";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  IOrderItem,
  IAddress,
} from "../types/index";

// Interfaces
export interface IOrderTimelineEvent {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IAddress;
  status: OrderStatus;
  timeline: IOrderTimelineEvent[];
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    gateway?: string;
    transactionId?: string;
    gatewayOrderId?: string;
    paidAt?: Date;
    refundedAt?: Date;
    refundId?: string;
  };
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
  coupon?: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
  };
  notes?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

//  Sub-Schemas
const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantId: String,
    variantLabel: String,
  },
  { _id: false },
);

const addressSnapshotSchema = new Schema(
  {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false },
);

const timelineSchema = new Schema<IOrderTimelineEvent>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: String,
  },
  { _id: false },
);

// Order Schema
const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: { type: addressSnapshotSchema, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    timeline: { type: [timelineSchema], default: [] },
    payment: {
      method: {
        type: String,
        enum: ["stripe", "sslcommerz", "paypal", "cod"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      gateway: String,
      transactionId: String,
      gatewayOrderId: String,
      paidAt: Date,
      refundedAt: Date,
      refundId: String,
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: {
      code: String,
      type: { type: String, enum: ["percentage", "fixed"] },
      value: Number,
    },
    notes: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    invoiceUrl: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Pre-save: auto-generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await Order.countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `SS-${year}-${String(count + 1).padStart(5, "0")}`;

    // Add initial timeline event
    this.timeline.push({ status: "pending", timestamp: new Date() });
  }
  next();
});

//  Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ orderNumber: 1 });

// Model
export const Order: Model<IOrder> = mongoose.model<IOrder>(
  "Order",
  orderSchema,
);
