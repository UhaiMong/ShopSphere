import mongoose, { Schema, Model, Document } from "mongoose";
import slugify from "slugify";

// Interface
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: mongoose.Types.ObjectId | null;
  ancestors: mongoose.Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [80, "Name must not exceed 80 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: String,
    image: String,
    icon: String,
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    // Materialized path: stores all ancestor IDs for efficient subtree queries.
    // e.g. Electronics → Mobile → Smartphones  has ancestors: [Electronics._id, Mobile._id]
    // To find all products in "Electronics" (incl sub-categories):
    //   { ancestors: electronicsId } OR { _id: electronicsId }
    ancestors: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
  },
);

// Virtual: children (populated on demand)
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Pre-save: auto-generate slug
categorySchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isNew) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (await Category.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ ancestors: 1 });

// Model
export const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  categorySchema,
);
