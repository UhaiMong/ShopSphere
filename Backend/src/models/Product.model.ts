import mongoose, { Schema, Model, Document } from 'mongoose';
import slugify from 'slugify';

// Interfaces
export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  color?: string;
  size?: string;
  stock: number;
  price?: number;
  images?: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category: mongoose.Types.ObjectId;
  brand?: string;
  images: string[];
  thumbnail?: string;
  variants: IProductVariant[];
  stock: number;
  sku?: string;
  tags: string[];
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Variant Sub-Schema
const variantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true, trim: true },
    color: String,
    size: String,
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, min: 0 },
    images: [String],
  },
  { _id: true },
);

// Product Schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name must not exceed 200 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description must not exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description must not exceed 300 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (this: IProduct, v: number) {
          return !v || v > this.price;
        },
        message: 'Compare price must be greater than the selling price',
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    brand: { type: String, trim: true },
    images: { type: [String], default: [] },
    thumbnail: String,
    variants: { type: [variantSchema], default: [] },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: { type: String, trim: true, sparse: true },
    tags: { type: [String], default: [], index: true },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    soldCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: '__v',
    toJSON: { virtuals: true },
  },
);

// Virtual: discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Virtual: inStock
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Pre-save: auto-slug + thumbnail
productSchema.pre('save', async function (next) {
  // Slug generation
  if (this.isModified('name') || this.isNew) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Product.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  // Auto-set thumbnail from first image
  if (this.isModified('images') && this.images.length > 0) {
    const thumbnail = this.images[0];
    if (thumbnail) {
      this.thumbnail = thumbnail;
    }
  }

  next();
});

//  Static: recalculate avgRating
productSchema.statics.recalculateRating = async function (productId: string) {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await this.findByIdAndUpdate(productId, { avgRating: 0, reviewCount: 0 });
  }
};

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, avgRating: -1 });
productSchema.index({ isActive: 1, soldCount: -1 });
productSchema.index({ isActive: 1, createdAt: -1 });

// Model
export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
