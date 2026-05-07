import mongoose, { Model, Document } from 'mongoose';
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
export declare const Media: Model<IMedia>;
//# sourceMappingURL=Media.model.d.ts.map