import mongoose, { Model, Document } from 'mongoose';
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
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    soldCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Product: Model<IProduct>;
//# sourceMappingURL=Product.model.d.ts.map