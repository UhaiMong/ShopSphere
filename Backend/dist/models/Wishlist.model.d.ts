import mongoose, { Model, Document } from 'mongoose';
export interface IWishlist extends Document {
    user: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
    updatedAt: Date;
}
export declare const Wishlist: Model<IWishlist>;
//# sourceMappingURL=Wishlist.model.d.ts.map