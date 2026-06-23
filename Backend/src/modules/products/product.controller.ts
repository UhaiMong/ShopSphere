// product.controller.ts
import type { Request, Response } from 'express';
import { productService } from './product.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';
import type { ProductQuery, CreateProductInput, UpdateProductInput } from './product.validator';
import { ApiError } from '../../utils/ApiError';

export const productController = {
  // GET /products
  getAll: catchAsync(async (req: Request, res: Response) => {
    const { products, pagination } = await productService.getAll(
      req.query as unknown as ProductQuery,
    );
    ApiResponse.paginated(res, products, pagination);
  }),

  // GET /products/featured
  getFeatured: catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 8;
    const products = await productService.getFeatured(limit);
    ApiResponse.success(res, products);
  }),

  // GET /products/:idOrSlug
  getOne: catchAsync(async (req: Request, res: Response) => {
    const productSlug = req.params.idOrSlug;
    if (!productSlug) throw ApiError.badRequest('Order Id is missing');
    const product = await productService.getById(productSlug);
    ApiResponse.success(res, product);
  }),

  // GET /products/:id/related
  getRelated: catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.id;
    if (!productId) throw ApiError.badRequest('Order Id is missing');
    const products = await productService.getRelated(productId);
    ApiResponse.success(res, products);
  }),

  // POST /products  (admin)
  create: catchAsync(async (req: Request, res: Response) => {
    const { images = [], ...rest } = req.body;
    const product = await productService.create(rest as CreateProductInput, images as string[]);
    ApiResponse.created(res, product, 'Product created successfully');
  }),

  // PUT /products/:id  (admin)
  update: catchAsync(async (req: Request, res: Response) => {
    const { images = [], ...rest } = req.body;
    const productId = req.params.id;
    if (!productId) throw ApiError.badRequest('Order Id is missing');
    const product = await productService.update(
      productId,
      rest as UpdateProductInput,
      images as string[],
    );
    ApiResponse.success(res, product, 'Product updated successfully');
  }),

  // PATCH /products/:id/stock  (admin)
  updateStock: catchAsync(async (req: Request, res: Response) => {
    const { quantity } = req.body as { quantity: number };
    const productId = req.params.id;
    if (!productId) throw ApiError.badRequest('Order Id is missing');
    const product = await productService.updateStock(productId, quantity);
    ApiResponse.success(res, product, 'Stock updated successfully');
  }),

  // DELETE /products/:id  (admin)
  remove: catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.id;
    if (!productId) throw ApiError.badRequest('Order Id is missing');
    await productService.softDelete(productId);
    ApiResponse.success(res, null, 'Product deleted successfully');
  }),

  // DELETE /products/:id/images  (admin)
  deleteImage: catchAsync(async (req: Request, res: Response) => {
    const { imageUrl } = req.body as { imageUrl: string };
    const productId = req.params.id;
    if (!productId) throw ApiError.badRequest('Order Id is missing');
    const product = await productService.deleteImage(productId, imageUrl);
    ApiResponse.success(res, product, 'Image removed');
  }),
};

/*
import { Request, Response } from 'express';
import { productService } from './product.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';
import { ProductQuery, CreateProductInput, UpdateProductInput } from './product.validator';

export const productController = {
  // GET /products
  getAll: catchAsync(async (req: Request, res: Response) => {
    const { products, pagination } = await productService.getAll(
      req.query as unknown as ProductQuery,
    );
    ApiResponse.paginated(res, products, pagination);
  }),

  // GET /products/featured
  getFeatured: catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 8;
    const products = await productService.getFeatured(limit);
    ApiResponse.success(res, products);
  }),

  // GET /products/:idOrSlug
  getOne: catchAsync(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.idOrSlug);
    ApiResponse.success(res, product);
  }),

  // GET /products/:id/related
  getRelated: catchAsync(async (req: Request, res: Response) => {
    const products = await productService.getRelated(req.params.id);
    ApiResponse.success(res, products);
  }),

  // POST /products
  create: catchAsync(async (req: Request, res: Response) => {
    const images = (req.body.images ?? []) as string[];
    const product = await productService.create(req.body as CreateProductInput, images);
    ApiResponse.created(res, product, 'Product created successfully');
  }),

  // PUT /products/:id
  update: catchAsync(async (req: Request, res: Response) => {
    const images = (req.body.images ?? []) as string[];
    const product = await productService.update(
      req.params.id,
      req.body as UpdateProductInput,
      images,
    );
    ApiResponse.success(res, product, 'Product updated successfully');
  }),

  // PATCH /products/:id/stock  (admin)
  updateStock: catchAsync(async (req: Request, res: Response) => {
    const { quantity } = req.body as { quantity: number };
    const product = await productService.updateStock(req.params.id, quantity);
    ApiResponse.success(res, product, 'Stock updated successfully');
  }),

  // DELETE /products/:id  (admin)
  remove: catchAsync(async (req: Request, res: Response) => {
    await productService.softDelete(req.params.id);
    ApiResponse.success(res, null, 'Product deleted successfully');
  }),

  // DELETE /products/:id/images  (admin)
  deleteImage: catchAsync(async (req: Request, res: Response) => {
    const { imageUrl } = req.body as { imageUrl: string };
    const product = await productService.deleteImage(req.params.id, imageUrl);
    ApiResponse.success(res, product, 'Image removed');
  }),
};
*/
