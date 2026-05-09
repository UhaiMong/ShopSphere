"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const product_service_1 = require("./product.service");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.productController = {
    // GET /products
    getAll: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { products, pagination } = await product_service_1.productService.getAll(req.query);
        ApiResponse_1.ApiResponse.paginated(res, products, pagination);
    }),
    // GET /products/featured
    getFeatured: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const limit = Number(req.query.limit) || 8;
        const products = await product_service_1.productService.getFeatured(limit);
        ApiResponse_1.ApiResponse.success(res, products);
    }),
    // GET /products/:idOrSlug
    getOne: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const product = await product_service_1.productService.getById(req.params.idOrSlug);
        ApiResponse_1.ApiResponse.success(res, product);
    }),
    // GET /products/:id/related
    getRelated: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const products = await product_service_1.productService.getRelated(req.params.id);
        ApiResponse_1.ApiResponse.success(res, products);
    }),
    // POST /products  (admin)
    create: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { images = [], ...rest } = req.body;
        const product = await product_service_1.productService.create(rest, images);
        ApiResponse_1.ApiResponse.created(res, product, 'Product created successfully');
    }),
    // PUT /products/:id  (admin)
    update: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { images = [], ...rest } = req.body;
        const product = await product_service_1.productService.update(req.params.id, rest, images);
        ApiResponse_1.ApiResponse.success(res, product, 'Product updated successfully');
    }),
    // PATCH /products/:id/stock  (admin)
    updateStock: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { quantity } = req.body;
        const product = await product_service_1.productService.updateStock(req.params.id, quantity);
        ApiResponse_1.ApiResponse.success(res, product, 'Stock updated successfully');
    }),
    // DELETE /products/:id  (admin)
    remove: (0, catchAsync_1.catchAsync)(async (req, res) => {
        await product_service_1.productService.softDelete(req.params.id);
        ApiResponse_1.ApiResponse.success(res, null, 'Product deleted successfully');
    }),
    // DELETE /products/:id/images  (admin)
    deleteImage: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { imageUrl } = req.body;
        const product = await product_service_1.productService.deleteImage(req.params.id, imageUrl);
        ApiResponse_1.ApiResponse.success(res, product, 'Image removed');
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
//# sourceMappingURL=product.controller.js.map