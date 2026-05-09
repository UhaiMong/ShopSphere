import mongoose from 'mongoose';
import { OrderStatus } from '../../types';
import { z } from 'zod';
declare const createOrderSchema: z.ZodObject<{
    shippingAddress: z.ZodObject<{
        fullName: z.ZodString;
        phone: z.ZodString;
        addressLine1: z.ZodString;
        addressLine2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        phone: string;
        addressLine1: string;
        city: string;
        postalCode: string;
        country: string;
        addressLine2?: string | undefined;
        state?: string | undefined;
    }, {
        fullName: string;
        phone: string;
        addressLine1: string;
        city: string;
        postalCode: string;
        addressLine2?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
    }>;
    paymentMethod: z.ZodEnum<["stripe", "sslcommerz", "paypal", "cod"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        city: string;
        postalCode: string;
        country: string;
        addressLine2?: string | undefined;
        state?: string | undefined;
    };
    paymentMethod: "stripe" | "sslcommerz" | "paypal" | "cod";
    notes?: string | undefined;
}, {
    shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        city: string;
        postalCode: string;
        addressLine2?: string | undefined;
        state?: string | undefined;
        country?: string | undefined;
    };
    paymentMethod: "stripe" | "sslcommerz" | "paypal" | "cod";
    notes?: string | undefined;
}>;
export declare const orderService: {
    createFromCart(userId: string, input: z.infer<typeof createOrderSchema>): Promise<mongoose.Document<unknown, {}, import("../../models/Order.model").IOrder, {}, {}> & import("../../models/Order.model").IOrder & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserOrders(userId: string, query: Record<string, unknown>): Promise<{
        orders: (mongoose.FlattenMaps<import("../../models/Order.model").IOrder> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: import("../../utils/ApiResponse").PaginationMeta;
    }>;
    getOrderById(orderId: string, userId?: string): Promise<mongoose.Document<unknown, {}, import("../../models/Order.model").IOrder, {}, {}> & import("../../models/Order.model").IOrder & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancelOrder(orderId: string, userId: string): Promise<mongoose.Document<unknown, {}, import("../../models/Order.model").IOrder, {}, {}> & import("../../models/Order.model").IOrder & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus(orderId: string, status: OrderStatus, note?: string, adminId?: string): Promise<mongoose.Document<unknown, {}, import("../../models/Order.model").IOrder, {}, {}> & import("../../models/Order.model").IOrder & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllOrders(query: Record<string, unknown>): Promise<{
        orders: (mongoose.FlattenMaps<import("../../models/Order.model").IOrder> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: import("../../utils/ApiResponse").PaginationMeta;
    }>;
};
export declare const orderRouter: import("express-serve-static-core").Router;
declare const adminRouter: import("express-serve-static-core").Router;
export { adminRouter as adminOrderRouter };
//# sourceMappingURL=order.controller.d.ts.map