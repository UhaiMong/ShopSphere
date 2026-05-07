import mongoose, { Model, Document } from 'mongoose';
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
export declare const Category: Model<ICategory>;
//# sourceMappingURL=Category.model.d.ts.map