import mongoose, { Model, Document } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod, IOrderItem, IAddress } from '../types/index';
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
        type: 'percentage' | 'fixed';
        value: number;
    };
    notes?: string;
    estimatedDelivery?: Date;
    deliveredAt?: Date;
    invoiceUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: Model<IOrder>;
//# sourceMappingURL=Order.model.d.ts.map