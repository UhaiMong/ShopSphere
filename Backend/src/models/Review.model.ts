import mongoose, { Schema, Model, Document } from "mongoose";
// REVIEW MODEL

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

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must not exceed 5"],
    },
    title: { type: String, trim: true, maxlength: 100 },
    body: {
      type: String,
      required: [true, "Review body is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [2000, "Review must not exceed 2000 characters"],
    },
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true, index: true },
    helpfulCount: { type: Number, default: 0 },
    helpfulVoters: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, versionKey: false },
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

// Post-save: recalculate product rating
reviewSchema.post("save", async function () {
  const Product = mongoose.model("Product") as any;
  await Product.recalculateRating(String(this.product));
});

reviewSchema.post("deleteOne", async function () {
  const deletedDoc = await this.model.findOne(this.getFilter());
  if (deletedDoc) {
    const Product = mongoose.model("Product") as any;
    await Product.recalculateRating(String(deletedDoc.product));
  }
});

export const Review: Model<IReview> = mongoose.model<IReview>(
  "Review",
  reviewSchema,
);
