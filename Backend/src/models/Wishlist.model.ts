import mongoose, { Schema, Model, Document } from "mongoose";
// ═══════════════════════════════════════════════════════════════════════════════
// WISHLIST MODEL
// ═══════════════════════════════════════════════════════════════════════════════

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true, versionKey: false },
);

wishlistSchema.index({ user: 1 });

export const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>(
  "Wishlist",
  wishlistSchema,
);
