import mongoose, { Schema, Model, Document } from "mongoose";

// CART MODEL

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

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, max: 100 },
    variantId: String,
    variantLabel: String,
    priceSnapshot: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
    couponCode: String,
    expiresAt: Date,
  },
  { timestamps: true, versionKey: false },
);

// TTL index — automatically deletes expired guest carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export const Cart: Model<ICart> = mongoose.model<ICart>("Cart", cartSchema);
