"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
//  Sub-Schemas
const orderItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantId: String,
    variantLabel: String,
}, { _id: false });
const addressSnapshotSchema = new mongoose_1.Schema({
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
}, { _id: false });
const timelineSchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: String,
}, { _id: false });
// Order Schema
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        unique: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (v) => v.length > 0,
            message: 'Order must have at least one item',
        },
    },
    shippingAddress: { type: addressSnapshotSchema, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true,
    },
    timeline: { type: [timelineSchema], default: [] },
    payment: {
        method: {
            type: String,
            enum: ['stripe', 'sslcommerz', 'paypal', 'cod'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
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
        type: { type: String, enum: ['percentage', 'fixed'] },
        value: Number,
    },
    notes: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    invoiceUrl: String,
}, {
    timestamps: true,
    versionKey: false,
});
// Pre-save: auto-generate order number
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await exports.Order.countDocuments();
        const year = new Date().getFullYear();
        this.orderNumber = `SS-${year}-${String(count + 1).padStart(5, '0')}`;
        // Add initial timeline event
        this.timeline.push({ status: 'pending', timestamp: new Date() });
    }
    next();
});
//  Indexes
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
// Model
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.model.js.map