import mongoose, { Model, Document } from 'mongoose';
export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    rating: number;
    title?: string;
    body: string;
    images?: string[];
    isVerifiedPurchase: boolean;
    isApproved: boolean;
    helpfulCount: number;
    helpfulVoters: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: Model<IReview>;
//# sourceMappingURL=Review.model.d.ts.map