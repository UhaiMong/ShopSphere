import mongoose, { Schema, Model, Document } from 'mongoose';

// Interfaces

export interface IMedia extends Document {
  title: string;
  alt: string;
  imgURL: string;
  fileSize: number;
  publicId: string;
  isActive: boolean;
  category: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Media Schema
const mediaSchema = new Schema<IMedia>({
  title: {
    type: String,
    required: [true, 'Product image title is required'],
    trim: true,
    maxlength: [200, 'Product image title must not exceed 200 characters'],
  },
  alt: {
    type: String,
    maxlength: [200, 'Image alt must not exceed 200 characters'],
  },
  imgURL: { type: String, default: '' },
  publicId: {
    type: String,
  },
  fileSize: { type: Number },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true,
  },
  isActive: { type: Boolean, default: true },
});

// Indexes
mediaSchema.index({ title: 'text' });
mediaSchema.index({ category: 1 });

// Model
export const Media: Model<IMedia> = mongoose.model<IMedia>('Media', mediaSchema);
