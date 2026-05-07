import { IProduct } from '../../models/Product.model';
import { PaginationMeta } from '../../utils/ApiResponse';
import { CreateProductInput, UpdateProductInput, ProductQuery } from './product.validator';
export declare const productService: {
    getAll(query: ProductQuery): Promise<{
        products: IProduct[];
        pagination: PaginationMeta;
    }>;
    getById(idOrSlug: string): Promise<IProduct>;
    getFeatured(limit?: number): Promise<IProduct[]>;
    getRelated(productId: string, limit?: number): Promise<IProduct[]>;
    create(data: CreateProductInput, imageUrls: string[]): Promise<IProduct>;
    update(id: string, data: UpdateProductInput, incomingImages?: string[]): Promise<IProduct>;
    updateStock(id: string, quantity: number): Promise<IProduct>;
    softDelete(id: string): Promise<void>;
    deleteImage(productId: string, imageUrl: string): Promise<IProduct>;
};
//# sourceMappingURL=product.service.d.ts.map