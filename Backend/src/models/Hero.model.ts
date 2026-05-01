import mongoose, { Schema, Model } from 'mongoose';

// Interfaces
export interface HeroSlide {
  _id: string;
  id: string;
  title: string;
  subtitle: string;
  offer?: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  isActive: boolean;
}

// Hero Schema
const HeroSchema = new Schema<HeroSlide>(
  {
    title: {
      type: String,
      required: [true, 'Slider title is required'],
      trim: true,
      maxlength: [200, 'Slider title must not exceed 200 characters'],
    },
    subtitle: {
      type: String,
      required: [true, 'Slider sub-title is required'],
      trim: true,
      maxLength: [200, 'Sub title must not exceed 200 characters'],
    },
    offer: {
      type: String,
      maxlength: [100, 'offer message must not exceed 100 characters'],
    },
    ctaText: {
      type: String,
      maxlength: [100, 'Button text must not exceed 100 characters'],
    },
    ctaLink: {
      type: String,
      trim: true,
    },
    backgroundImage: { type: String, trim: true, required: [true, 'Image is required'] },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  },
);

// Model
export const Hero: Model<HeroSlide> = mongoose.model<HeroSlide>('Hero', HeroSchema);
