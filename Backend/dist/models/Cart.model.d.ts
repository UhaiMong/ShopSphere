import mongoose, { Model, Document } from "mongoose";
export interface ICartItem {
    product: mongoose.Types.ObjectId;
    _id: string;
    quantity: number;
    variantId?: string;
    variantLabel?: string;
    priceSnapshot: number;
}
export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    couponCode?: string;
    expiresAt?: Date;
    updatedAt: Date;
}
export declare const Cart: Model<ICart>;
//# sourceMappingURL=Cart.model.d.ts.map